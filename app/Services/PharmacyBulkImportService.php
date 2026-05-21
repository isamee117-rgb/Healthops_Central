<?php
namespace App\Services;

use App\Models\Medicine;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use League\Csv\Reader;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as XlsDate;

class PharmacyBulkImportService
{
    const MAX_ROWS = 500;
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    const REQUIRED_COLUMNS = [
        'medicine_code', 'generic_name', 'brand_name',
        'form', 'category', 'manufacturer',
        'purchase_price', 'selling_price',
    ];

    const BATCH_TRIGGER_COLUMNS = ['batch_number', 'batch_expiry', 'batch_qty'];

    // ── parse ────────────────────────────────────────────────────────────────

    public function parse(UploadedFile $file): array
    {
        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['csv', 'xlsx'])) {
            throw new \InvalidArgumentException("Unsupported file type: .{$ext}. Only .xlsx and .csv are accepted.");
        }
        return $ext === 'csv'
            ? $this->parseCsv($file->getRealPath())
            : $this->parseXlsx($file->getRealPath());
    }

    private function parseCsv(string $path): array
    {
        $reader = Reader::createFromPath($path, 'r');
        $reader->setHeaderOffset(0);

        $rows = [];
        foreach ($reader->getRecords() as $record) {
            if (count(array_filter($record, fn($v) => trim($v) !== '')) === 0) {
                continue;
            }
            $rows[] = array_map('trim', $record);
        }
        return $rows;
    }

    private function parseXlsx(string $path): array
    {
        $spreadsheet = IOFactory::load($path);
        $sheet = $spreadsheet->getActiveSheet();
        $data = $sheet->toArray(null, true, true, false);

        if (empty($data)) {
            return [];
        }

        $headers = array_map('trim', $data[0]);
        $rows = [];

        for ($i = 1; $i < count($data); $i++) {
            $raw = $data[$i];
            if (count(array_filter($raw, fn($v) => $v !== null && trim((string)$v) !== '')) === 0) {
                continue;
            }
            $row = [];
            foreach ($headers as $colIdx => $header) {
                $cell = $sheet->getCellByColumnAndRow($colIdx + 1, $i + 1);
                $value = '';
                if (in_array($header, ['batch_expiry', 'batch_received_date'])
                    && is_numeric($cell->getValue())
                    && XlsDate::isDateTime($cell)) {
                    $value = XlsDate::excelToDateTimeObject($cell->getValue())->format('Y-m-d');
                } else {
                    $value = trim((string)($raw[$colIdx] ?? ''));
                }
                $row[$header] = $value;
            }
            $rows[] = $row;
        }
        return $rows;
    }

    // ── validate ─────────────────────────────────────────────────────────────

    public function validate(array $rows): array
    {
        $errors = [];
        $seenCodes = [];

        $codes = array_filter(
            array_column($rows, 'medicine_code'),
            fn($c) => trim($c) !== ''
        );
        $existingCodes = Medicine::whereIn('medicine_code', array_unique(array_values($codes)))
            ->pluck('medicine_code')
            ->flip()
            ->all();

        foreach ($rows as $idx => $row) {
            $rowNum = $idx + 2;

            foreach (self::REQUIRED_COLUMNS as $col) {
                if (!isset($row[$col]) || trim((string)$row[$col]) === '') {
                    $errors[] = ['row' => $rowNum, 'column' => $col, 'message' => 'Required field is empty'];
                }
            }

            $code = trim($row['medicine_code'] ?? '');
            if ($code !== '') {
                if (isset($seenCodes[$code])) {
                    $errors[] = [
                        'row'     => $rowNum,
                        'column'  => 'medicine_code',
                        'message' => "Duplicate within file — {$code} appears on rows {$seenCodes[$code]} and {$rowNum}",
                    ];
                } else {
                    $seenCodes[$code] = $rowNum;
                }
            }

            if ($code !== '' && isset($existingCodes[$code])) {
                $errors[] = [
                    'row'     => $rowNum,
                    'column'  => 'medicine_code',
                    'message' => "Duplicate — {$code} already exists in database",
                ];
            }

            foreach (['purchase_price', 'selling_price'] as $numCol) {
                $val = trim($row[$numCol] ?? '');
                if ($val !== '' && (!is_numeric($val) || (float)$val < 0)) {
                    $errors[] = [
                        'row'     => $rowNum,
                        'column'  => $numCol,
                        'message' => "Must be a number >= 0 (got: {$val})",
                    ];
                }
            }

            $batchFilled = array_map(
                fn($col) => trim($row[$col] ?? '') !== '',
                self::BATCH_TRIGGER_COLUMNS
            );
            $filledCount = count(array_filter($batchFilled));
            if ($filledCount > 0 && $filledCount < 3) {
                $errors[] = [
                    'row'     => $rowNum,
                    'column'  => 'batch',
                    'message' => 'batch_number, batch_expiry, and batch_qty must all be provided together',
                ];
            }

            foreach (['batch_expiry', 'batch_received_date'] as $dateCol) {
                $val = trim($row[$dateCol] ?? '');
                if ($val === '') continue;
                try {
                    $parsed = Carbon::createFromFormat('Y-m-d', $val);
                    if (!$parsed || $parsed->format('Y-m-d') !== $val) {
                        throw new \Exception();
                    }
                } catch (\Throwable) {
                    $errors[] = [
                        'row'     => $rowNum,
                        'column'  => $dateCol,
                        'message' => "Invalid date format — use YYYY-MM-DD (got: {$val})",
                    ];
                }
            }
        }

        $withBatch = count(array_filter(
            $rows,
            fn($r) => trim($r['batch_number'] ?? '') !== ''
        ));

        return [
            'valid'   => empty($errors),
            'errors'  => $errors,
            'summary' => [
                'medicines'     => count($rows),
                'with_batch'    => $withBatch,
                'without_batch' => count($rows) - $withBatch,
            ],
            'preview' => array_slice(array_map(fn($r) => [
                'medicine_code' => $r['medicine_code'] ?? '',
                'generic_name'  => $r['generic_name'] ?? '',
                'form'          => $r['form'] ?? '',
                'category'      => $r['category'] ?? '',
                'has_batch'     => trim($r['batch_number'] ?? '') !== '',
            ], $rows), 0, 10),
        ];
    }
}
