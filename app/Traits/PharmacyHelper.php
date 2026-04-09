<?php

namespace App\Traits;

use App\Models\Medicine;
use App\Models\MedicineBatch;
use Carbon\Carbon;

trait PharmacyHelper
{
    protected function findMedicineByItem(array $item): ?Medicine
    {
        if (!empty($item['medicineId'])) {
            $med = Medicine::where('medicine_id', $item['medicineId'])->first();
            if ($med) return $med;
        }

        if (!empty($item['name'])) {
            $cleanName = preg_replace('/^(Tab|Cap|Syp|Inj|Syr|Drops?|Oint|Cream|Susp|Gel|Patch|Loz)\b\.?\s*/i', '', trim($item['name']));
            preg_match('/^([A-Za-z][\w\-]*(?:\s+[A-Za-z][\w\-]*)?)/u', $cleanName, $drugMatch);
            $drugName = trim(explode(' ', $drugMatch[1] ?? $cleanName)[0]);

            return Medicine::where(function ($q) use ($drugName, $cleanName) {
                $q->where('generic_name', 'LIKE', "%{$drugName}%")
                  ->orWhere('brand_name', 'LIKE', "%{$drugName}%")
                  ->orWhere('medicine_name', 'LIKE', "%{$drugName}%")
                  ->orWhere('brand_name', 'LIKE', "%{$cleanName}%");
            })->first();
        }

        return null;
    }

    protected function enrichItemWithLiveData(array $item): array
    {
        $med = $this->findMedicineByItem($item);

        $stockAvailable = 0;
        $batchInfo = null;
        $liveUnitPrice = $item['unitPrice'] ?? 0;

        $storageLocation = null;

        if ($med) {
            $stockAvailable  = $med->current_stock ?? 0;
            $liveUnitPrice   = $med->selling_price ?? $liveUnitPrice;
            $storageLocation = $med->storage_location ?? null;

            $batch = MedicineBatch::where('medicine_id', $med->medicine_id)
                ->where('current_qty', '>', 0)
                ->where('expiry_date', '>', Carbon::now())
                ->orderBy('expiry_date')
                ->first();

            if ($batch) {
                $batchInfo = [
                    'batchNumber' => $batch->batch_number,
                    'expiryDate'  => Carbon::parse($batch->expiry_date)->format('M Y'),
                    'currentQty'  => $batch->current_qty,
                ];
            }
        }

        $totalQty  = $item['totalQty'] ?? $item['qty'] ?? 0;
        $liveTotal = round($liveUnitPrice * $totalQty, 2);

        return array_merge($item, [
            'medicineId'      => $med?->medicine_id ?? ($item['medicineId'] ?? null),
            'stockAvailable'  => $stockAvailable,
            'inStock'         => $stockAvailable >= $totalQty,
            'batch'           => $batchInfo,
            'unitPrice'       => $liveUnitPrice,
            'total'           => $liveTotal,
            'livePrice'       => true,
            'storageLocation' => $storageLocation,
        ]);
    }

    protected function enrichItemsAndCalcTotal(array $items): array
    {
        $enriched = array_map(fn($item) => $this->enrichItemWithLiveData($item), $items);
        $total = round(array_sum(array_column($enriched, 'total')), 2);
        return ['items' => $enriched, 'total' => $total];
    }
}
