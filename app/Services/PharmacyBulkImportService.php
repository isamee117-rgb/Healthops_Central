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

    // ── import ───────────────────────────────────────────────────────────────

    public function import(array $rows): array
    {
        $medicineCount = 0;
        $batchCount = 0;

        \DB::transaction(function () use ($rows, &$medicineCount, &$batchCount) {
            foreach ($rows as $row) {
                $medicineId = 'MED-' . \Str::random(9);

                $medicine = \App\Models\Medicine::create([
                    'medicine_id'        => $medicineId,
                    'medicine_code'      => trim($row['medicine_code']),
                    'generic_name'       => trim($row['generic_name']),
                    'brand_name'         => trim($row['brand_name']),
                    'strength'           => trim($row['strength'] ?? ''),
                    'form'               => trim($row['form']),
                    'category'           => trim($row['category']),
                    'manufacturer'       => trim($row['manufacturer']),
                    'purchase_price'     => (float)($row['purchase_price'] ?? 0),
                    'selling_price'      => (float)($row['selling_price'] ?? 0),
                    'stock_unit'         => trim($row['stock_unit'] ?? '') ?: 'strips',
                    'min_stock'          => (int)($row['min_stock'] ?? 0),
                    'max_stock'          => (int)($row['max_stock'] ?? 0),
                    'reorder_point'      => (int)($row['reorder_point'] ?? 0),
                    'eoq'                => (int)($row['eoq'] ?? 0),
                    'storage_location'   => trim($row['storage_location'] ?? ''),
                    'storage_conditions' => trim($row['storage_conditions'] ?? ''),
                    'abc_class'          => trim($row['abc_class'] ?? '') ?: 'C',
                    'current_stock'      => 0,
                    'is_active'          => true,
                ]);

                $medicineCount++;

                if (trim($row['batch_number'] ?? '') !== '') {
                    $batchId      = 'BAT-' . \Str::random(9);
                    $qty          = (int)$row['batch_qty'];
                    $unitPrice    = (float)($row['batch_unit_price'] ?? $row['purchase_price'] ?? 0);
                    $receivedDate = trim($row['batch_received_date'] ?? '') ?: now()->format('Y-m-d');

                    \App\Models\MedicineBatch::create([
                        'batch_id'      => $batchId,
                        'batch_number'  => trim($row['batch_number']),
                        'medicine_id'   => $medicineId,
                        'received_date' => $receivedDate,
                        'expiry_date'   => trim($row['batch_expiry']),
                        'qty_received'  => $qty,
                        'current_qty'   => $qty,
                        'unit_price'    => $unitPrice,
                        'supplier'      => trim($row['batch_supplier'] ?? ''),
                        'status'        => 'Active',
                    ]);

                    \App\Models\StockTransaction::create([
                        'transaction_id' => 'TXN-' . \Str::random(9),
                        'medicine_id'    => $medicineId,
                        'batch_id'       => $batchId,
                        'type'           => 'import',
                        'quantity'       => $qty,
                        'stock_before'   => 0,
                        'stock_after'    => $qty,
                        'reason'         => 'Bulk import',
                        'performed_by'   => 'bulk-import',
                    ]);

                    $medicine->update(['current_stock' => $qty]);
                    $batchCount++;
                }
            }
        });

        return ['medicines' => $medicineCount, 'batches' => $batchCount];
    }

    // ── generateTemplate ─────────────────────────────────────────────────────

    public function generateTemplate(string $format = 'xlsx'): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = [
            'medicine_code', 'generic_name', 'brand_name', 'strength', 'form',
            'category', 'manufacturer', 'purchase_price', 'selling_price',
            'stock_unit', 'min_stock', 'max_stock', 'reorder_point', 'eoq',
            'storage_location', 'storage_conditions', 'abc_class',
            'batch_number', 'batch_expiry', 'batch_qty', 'batch_unit_price',
            'batch_supplier', 'batch_received_date',
        ];

        $samples = [
            ['MED-001','Paracetamol','Panadol','500mg','Tablet','Analgesic','GSK',
             45.00, 60.00, 'strips', 50, 500, 100, 200, 'Shelf A1', 'Room temp', 'C',
             'BT-2026-001', '2026-12-31', 200, 45.00, 'GSK Pharma', date('Y-m-d')],
            ['MED-002','Amoxicillin','Amoxil','250mg','Capsule','Antibiotic','Pfizer',
             80.00, 110.00, 'strips', 30, 300, 80, 150, 'Shelf B2', 'Room temp', 'B',
             'BT-2026-002', '2026-10-15', 100, 80.00, 'Pfizer Dist', date('Y-m-d')],
            ['MED-003','Metformin','Glucophage','500mg','Tablet','Antidiabetic','Merck',
             30.00, 45.00, 'strips', 100, 1000, 200, 400, 'Shelf A3', 'Room temp', 'A',
             '', '', '', '', '', ''],
        ];

        if ($format === 'csv') {
            return response()->streamDownload(function () use ($headers, $samples) {
                $out = fopen('php://output', 'w');
                fputcsv($out, $headers);
                foreach ($samples as $row) {
                    fputcsv($out, $row);
                }
                fclose($out);
            }, 'pharmacy_inventory_template.csv', ['Content-Type' => 'text/csv']);
        }

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Medicines');

        foreach ($headers as $colIdx => $header) {
            $cell = $sheet->getCellByColumnAndRow($colIdx + 1, 1);
            $cell->setValue($header);
            $cell->getStyle()->getFont()->setBold(true);
            $cell->getStyle()->getFill()
                 ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                 ->getStartColor()->setARGB('FF060740');
            $cell->getStyle()->getFont()->getColor()->setARGB('FFFFFFFF');
        }

        foreach ($samples as $rowIdx => $row) {
            foreach ($row as $colIdx => $value) {
                $sheet->getCellByColumnAndRow($colIdx + 1, $rowIdx + 2)->setValue($value);
            }
        }

        foreach (range(1, count($headers)) as $colIdx) {
            $sheet->getColumnDimensionByColumn($colIdx)->setAutoSize(true);
        }

        $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'pharmacy_inventory_template.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
