<?php

namespace App\Traits;

use App\Models\FinanceLedger;
use App\Models\PatientActivity;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

trait HmsHelpers
{
    protected function safeError(\Exception $e, string $fallback = 'An unexpected error occurred', int $status = 500)
    {
        if ($e instanceof \Illuminate\Validation\ValidationException) {
            return response()->json(['errors' => $e->errors(), 'message' => 'Validation failed'], 422);
        }

        $msg = $e->getMessage();
        // Hide raw SQL/system errors from the user
        if (str_contains($msg, 'SQLSTATE') || str_contains($msg, 'Column') || str_contains($msg, 'Syntax error')) {
            \Illuminate\Support\Facades\Log::error($msg);
            $msg = $fallback;
        }

        return response()->json(['error' => $msg], $status);
    }

    protected function postToLedger(array $data): FinanceLedger
    {
        $nextNum = $this->extractNextNumber(FinanceLedger::class, 'ledger_id', 'LDR-');
        return FinanceLedger::create(array_merge($data, [
            'ledger_id' => "LDR-{$nextNum}",
            'posted_at' => Carbon::now(),
        ]));
    }

    protected function logActivity(string $mrn, string $action, string $module, ?string $details = null): PatientActivity
    {
        $nextNum = $this->extractNextNumber(PatientActivity::class, 'activity_id', 'ACT-');
        return PatientActivity::create([
            'activity_id' => "ACT-{$nextNum}",
            'mrn' => $mrn,
            'timestamp' => Carbon::now(),
            'action' => $action,
            'user' => 'Admin / Sys',
            'module' => $module,
            'details' => $details,
        ]);
    }

    protected function extractNextNumber(string $modelClass, string $field, string $prefix): int
    {
        if ($prefix === '') {
            $max = $modelClass::max($field);
        } else {
            $max = $modelClass::selectRaw("MAX(CAST(REPLACE(CAST({$field} AS CHAR), ?, '') AS UNSIGNED)) as max_num", [$prefix])->value('max_num');
        }
        return ((int) ($max ?? 0)) + 1;
    }

    protected function nextId(string $modelClass, string $field, string $prefix): string
    {
        $num = $this->extractNextNumber($modelClass, $field, $prefix);
        return "{$prefix}{$num}";
    }

    protected function nextIdFromSeries(string $modelClass, string $field, string $seriesKey, string $seriesModelClass = \App\Models\HrNumberSeries::class): string
    {
        $series = $seriesModelClass::where('series_key', $seriesKey)->first();

        if (!$series) {
            return $this->nextId($modelClass, $field, strtoupper($seriesKey) . '-');
        }

        $prefix  = $series->prefix;
        $padding = $series->padding;

        $maxNum = \Illuminate\Support\Facades\DB::table((new $modelClass)->getTable())
            ->where($field, 'like', $prefix . '%')
            ->selectRaw("MAX(CAST(REPLACE(CAST({$field} AS CHAR), ?, '') AS UNSIGNED)) as max_num", [$prefix])
            ->value('max_num');

        $next = max((int) ($maxNum ?? 0) + 1, $series->starting_number);

        $numStr = $padding > 0
            ? str_pad($next, $padding, '0', STR_PAD_LEFT)
            : (string) $next;

        return $prefix . $numStr;
    }

    protected function generateYearId(string $modelClass, string $field, string $prefix): string
    {
        $year = date('Y');
        $fullPrefix = "{$prefix}-{$year}-";
        $prefixLen = strlen($fullPrefix);

        $max = DB::table((new $modelClass)->getTable())
            ->where($field, 'like', "{$fullPrefix}%")
            ->selectRaw("MAX(CAST(SUBSTR(CAST({$field} AS CHAR), ?) AS UNSIGNED)) as max_num", [$prefixLen + 1])
            ->value('max_num');

        $nextNum = ((int) ($max ?? 0)) + 1;
        return $fullPrefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
    }

    protected function toCamel($data)
    {
        if ($data instanceof \Illuminate\Database\Eloquent\Model) {
            $data = $data->toArray();
        }

        if ($data instanceof \Illuminate\Support\Collection) {
            return $data->map(fn($item) => $this->toCamel($item))->values()->all();
        }

        if (!is_array($data)) {
            return $data;
        }

        if (array_is_list($data)) {
            return array_map(fn($item) => $this->toCamel($item), $data);
        }

        $result = [];
        foreach ($data as $key => $value) {
            $camelKey = Str::camel($key);
            if ($camelKey === 'createdAt' && $key === 'created_at' && !array_key_exists('created_at', array_flip(array_keys($data)))) {
                continue;
            }
            $result[$camelKey] = is_array($value) ? $this->toCamel($value) : $value;
        }
        return $result;
    }

    protected function toCamelCollection($items)
    {
        if ($items instanceof \Illuminate\Database\Eloquent\Collection || $items instanceof \Illuminate\Support\Collection) {
            return $items->map(fn($item) => $this->toCamel($item))->values()->all();
        }
        return array_map(fn($item) => $this->toCamel($item), $items);
    }

    protected function calculateChargesFromMaster(string $module, array $selectedChargeIds): float
    {
        $charges = \App\Models\HospitalCharge::where('module', $module)
            ->where(function ($q) use ($selectedChargeIds) {
                $q->where('is_mandatory', true)
                  ->orWhereIn('charge_id', $selectedChargeIds);
            })
            ->get();

        return $charges->sum('amount');
    }
}
