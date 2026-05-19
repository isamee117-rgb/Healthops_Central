<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockTransaction;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    use HmsHelpers;

    public function stats()
    {
        $total = Medicine::where('is_active', true)->count();
        $outOfStock = Medicine::where('is_active', true)->where('current_stock', 0)->count();
        $lowStock = Medicine::where('is_active', true)
            ->whereColumn('current_stock', '<', 'min_stock')
            ->where('current_stock', '>', 0)
            ->count();
        $expiringSoon = MedicineBatch::where('status', 'Active')
            ->where('current_qty', '>', 0)
            ->where('expiry_date', '<=', Carbon::now()->addMonths(3))
            ->where('expiry_date', '>', Carbon::now())
            ->distinct('medicine_id')
            ->count('medicine_id');
        $stockValue = DB::table('medicines')
            ->where('is_active', true)
            ->selectRaw('SUM(current_stock * purchase_price) as val')
            ->value('val') ?? 0;

        return response()->json([
            'totalMedicines' => $total,
            'outOfStock' => $outOfStock,
            'lowStock' => $lowStock,
            'expiringSoon' => $expiringSoon,
            'stockValue' => round($stockValue, 2),
        ]);
    }

    public function index(Request $request)
    {
        $q = Medicine::where('is_active', true);

        if ($s = $request->input('search')) {
            $q->where(function ($qb) use ($s) {
                $qb->where('generic_name', 'LIKE', "%{$s}%")
                    ->orWhere('brand_name', 'LIKE', "%{$s}%")
                    ->orWhere('medicine_code', 'LIKE', "%{$s}%")
                    ->orWhere('manufacturer', 'LIKE', "%{$s}%");
            });
        }
        if ($cat = $request->input('category')) {
            $q->where('category', $cat);
        }
        if ($form = $request->input('form')) {
            $q->where('form', $form);
        }
        if ($mfr = $request->input('manufacturer')) {
            $q->where('manufacturer', $mfr);
        }
        if ($abc = $request->input('abcClass')) {
            $q->where('abc_class', $abc);
        }
        if ($status = $request->input('stockStatus')) {
            if ($status === 'Out of Stock') {
                $q->where('current_stock', 0);
            } elseif ($status === 'Low Stock') {
                $q->whereColumn('current_stock', '<', 'min_stock')->where('current_stock', '>', 0);
            } elseif ($status === 'In Stock') {
                $q->whereColumn('current_stock', '>=', 'min_stock');
            }
        }

        $medicines = $q->orderBy('brand_name')->get();

        $result = $medicines->map(function ($m) {
            $batchCount = MedicineBatch::where('medicine_id', $m->medicine_id)
                ->where('status', 'Active')->where('current_qty', '>', 0)->count();
            $nearestExpiry = MedicineBatch::where('medicine_id', $m->medicine_id)
                ->where('status', 'Active')->where('current_qty', '>', 0)
                ->orderBy('expiry_date')->value('expiry_date');
            $hasExpiring = MedicineBatch::where('medicine_id', $m->medicine_id)
                ->where('status', 'Active')->where('current_qty', '>', 0)
                ->where('expiry_date', '<=', Carbon::now()->addMonths(3))
                ->where('expiry_date', '>', Carbon::now())
                ->exists();
            $hasExpired = MedicineBatch::where('medicine_id', $m->medicine_id)
                ->where('current_qty', '>', 0)
                ->where('expiry_date', '<', Carbon::now())
                ->exists();

            $stockStatus = 'In Stock';
            if ($m->current_stock <= 0) $stockStatus = 'Out of Stock';
            elseif ($m->current_stock < $m->min_stock) $stockStatus = 'Low Stock';

            $expiryStatus = 'Good';
            if ($hasExpired) $expiryStatus = 'Expired';
            elseif ($hasExpiring) $expiryStatus = 'Expiring Soon';

            return [
                'medicineId' => $m->medicine_id,
                'medicineCode' => $m->medicine_code,
                'name' => $m->medicine_name ?: ($m->brand_name . ' ' . ($m->strength ?: '')),
                'genericName' => $m->generic_name,
                'brandName' => $m->brand_name,
                'strength' => $m->strength,
                'form' => $m->form,
                'category' => $m->category,
                'manufacturer' => $m->manufacturer,
                'currentStock' => $m->current_stock,
                'stockUnit' => $m->stock_unit,
                'minStock' => $m->min_stock,
                'maxStock' => $m->max_stock,
                'purchasePrice' => (float)$m->purchase_price,
                'sellingPrice' => (float)$m->selling_price,
                'stockStatus' => $stockStatus,
                'expiryStatus' => $expiryStatus,
                'batchCount' => $batchCount,
                'nearestExpiry' => $nearestExpiry,
                'storageLocation' => $m->storage_location,
                'abcClass' => $m->abc_class,
            ];
        });

        return response()->json($result);
    }

    public function show($medicineId)
    {
        $m = Medicine::where('medicine_id', $medicineId)->first();
        if (!$m) return response()->json(['error' => 'Not found'], 404);

        $batches = MedicineBatch::where('medicine_id', $medicineId)
            ->where('status', 'Active')->where('current_qty', '>', 0)->get();
        $reserved = 0;
        $expiredQty = MedicineBatch::where('medicine_id', $medicineId)
            ->where('current_qty', '>', 0)
            ->where('expiry_date', '<', Carbon::now())
            ->sum('current_qty');
        $available = $m->current_stock - $reserved - $expiredQty;

        $margin = $m->purchase_price > 0
            ? round((($m->selling_price - $m->purchase_price) / $m->purchase_price) * 100, 1)
            : 0;

        $substitutes = Medicine::where('generic_name', $m->generic_name)
            ->where('medicine_id', '!=', $m->medicine_id)
            ->where('is_active', true)->get();
        $sameCategory = Medicine::where('category', $m->category)
            ->where('generic_name', '!=', $m->generic_name)
            ->where('medicine_id', '!=', $m->medicine_id)
            ->where('is_active', true)->limit(4)->get();

        return response()->json([
            'medicine' => [
                'medicineId' => $m->medicine_id,
                'medicineCode' => $m->medicine_code,
                'genericName' => $m->generic_name,
                'brandName' => $m->brand_name,
                'strength' => $m->strength,
                'form' => $m->form,
                'category' => $m->category,
                'manufacturer' => $m->manufacturer,
                'currentStock' => $m->current_stock,
                'stockUnit' => $m->stock_unit,
                'available' => max(0, $available),
                'reserved' => $reserved,
                'expiredQty' => $expiredQty,
                'stockValue' => round($m->current_stock * $m->purchase_price, 2),
                'purchasePrice' => (float)$m->purchase_price,
                'sellingPrice' => (float)$m->selling_price,
                'margin' => $margin,
                'minStock' => $m->min_stock,
                'maxStock' => $m->max_stock,
                'reorderPoint' => $m->reorder_point,
                'eoq' => $m->eoq,
                'storageLocation' => $m->storage_location,
                'storageConditions' => $m->storage_conditions,
                'abcClass' => $m->abc_class,
            ],
            'substitutes' => $substitutes->map(fn($s) => [
                'medicineId' => $s->medicine_id,
                'brandName' => $s->brand_name,
                'strength' => $s->strength,
                'sellingPrice' => (float)$s->selling_price,
                'currentStock' => $s->current_stock,
                'stockUnit' => $s->stock_unit,
                'manufacturer' => $s->manufacturer,
            ]),
            'sameCategory' => $sameCategory->map(fn($s) => [
                'medicineId' => $s->medicine_id,
                'genericName' => $s->generic_name,
                'brandName' => $s->brand_name,
                'strength' => $s->strength,
                'sellingPrice' => (float)$s->selling_price,
                'currentStock' => $s->current_stock,
                'stockUnit' => $s->stock_unit,
            ]),
        ]);
    }

    public function batches($medicineId)
    {
        $batches = MedicineBatch::where('medicine_id', $medicineId)
            ->orderBy('expiry_date')
            ->get()
            ->map(function ($b) {
                $daysToExp = Carbon::now()->diffInDays($b->expiry_date, false);
                return [
                    'batchId' => $b->batch_id,
                    'batchNumber' => $b->batch_number,
                    'receivedDate' => $b->received_date->format('Y-m-d'),
                    'expiryDate' => $b->expiry_date->format('Y-m-d'),
                    'daysToExpiry' => (int)$daysToExp,
                    'qtyReceived' => $b->qty_received,
                    'currentQty' => $b->current_qty,
                    'unitPrice' => (float)$b->unit_price,
                    'supplier' => $b->supplier,
                    'status' => $b->status,
                ];
            });

        return response()->json($batches);
    }

    public function transactions($medicineId, Request $request)
    {
        $q = StockTransaction::where('medicine_id', $medicineId)
            ->orderBy('created_at', 'desc');

        $limit = $request->input('limit', 20);
        $offset = $request->input('offset', 0);

        $transactions = $q->skip($offset)->take($limit)->get()->map(function ($t) {
            return [
                'transactionId' => $t->transaction_id,
                'type' => $t->type,
                'quantity' => $t->quantity,
                'stockBefore' => $t->stock_before,
                'stockAfter' => $t->stock_after,
                'batchId' => $t->batch_id,
                'reason' => $t->reason,
                'reference' => $t->reference,
                'notes' => $t->notes,
                'performedBy' => $t->performed_by,
                'createdAt' => $t->created_at->toIso8601String(),
            ];
        });

        return response()->json($transactions);
    }

    public function adjust(Request $request)
    {
        $request->validate([
            'medicineId' => 'required|string',
            'adjustmentType' => 'required|in:increase,decrease,set',
            'quantity' => 'required|integer|min:0',
            'reason' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $medicine = Medicine::where('medicine_id', $request->medicineId)->first();
        if (!$medicine) return response()->json(['error' => 'Medicine not found'], 404);

        $stockBefore = $medicine->current_stock;
        $type = $request->adjustmentType;
        $qty = (int)$request->quantity;

        if ($type === 'increase') {
            $newStock = $stockBefore + $qty;
        } elseif ($type === 'decrease') {
            $newStock = max(0, $stockBefore - $qty);
        } else {
            $newStock = $qty;
        }

        $medicine->update(['current_stock' => $newStock]);

        $txnId = $this->nextId(StockTransaction::class, 'transaction_id', 'STX-');
        StockTransaction::create([
            'transaction_id' => $txnId,
            'medicine_id' => $medicine->medicine_id,
            'type' => 'Adjustment (' . ucfirst($type) . ')',
            'quantity' => $type === 'decrease' ? -$qty : ($type === 'set' ? ($newStock - $stockBefore) : $qty),
            'stock_before' => $stockBefore,
            'stock_after' => $newStock,
            'reason' => $request->reason,
            'notes' => $request->notes,
            'performed_by' => 'Admin',
        ]);

        return response()->json([
            'success' => true,
            'medicineId' => $medicine->medicine_id,
            'stockBefore' => $stockBefore,
            'stockAfter' => $newStock,
            'transactionId' => $txnId,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'medicine_name' => 'required|string|max:255',
            'medicine_code' => 'nullable|string|max:50',
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'required|string|max:255',
            'medicine_type' => 'required|string|max:100',
            'category' => 'required|string|max:100',
            'salt_composition' => 'nullable|string',
            'strength' => 'nullable|string|max:100',
            'unit_of_measurement' => 'nullable|string|max:50',
            'dosage_form' => 'nullable|string|max:100',
            'form' => 'required|string|max:100',
            'hsn_code' => 'nullable|string|max:50',
            'unit_of_purchase' => 'nullable|string|max:50',
            'unit_of_sale' => 'nullable|string|max:50',
            'reorder_level' => 'nullable|integer|min:0',
            'shelf_location' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'schedule_type' => 'nullable|string|max:50',
            'requires_prescription' => 'boolean',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'tax_gst_category' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $medicineId = $this->nextId(Medicine::class, 'medicine_id', 'MED-');
        $autoCode = 'MED-' . str_pad((int)str_replace('MED-', '', $medicineId), 3, '0', STR_PAD_LEFT);
        $medicineCode = $request->medicine_code ?: $autoCode;

        $medicine = Medicine::create([
            'medicine_id' => $medicineId,
            'medicine_code' => $medicineCode,
            'medicine_name' => $request->medicine_name,
            'generic_name' => $request->generic_name,
            'brand_name' => $request->brand_name,
            'medicine_type' => $request->medicine_type,
            'category' => $request->category,
            'salt_composition' => $request->salt_composition,
            'strength' => $request->strength,
            'unit_of_measurement' => $request->unit_of_measurement,
            'dosage_form' => $request->dosage_form,
            'form' => $request->form,
            'hsn_code' => $request->hsn_code,
            'unit_of_purchase' => $request->unit_of_purchase,
            'unit_of_sale' => $request->unit_of_sale,
            'min_stock' => $request->reorder_level ?? 0,
            'reorder_point' => $request->reorder_level ?? 0,
            'max_stock' => 0,
            'current_stock' => 0,
            'eoq' => 0,
            'stock_unit' => $request->unit_of_sale ?? $request->unit_of_purchase ?? 'units',
            'shelf_location' => $request->shelf_location,
            'manufacturer' => $request->manufacturer ?? '',
            'schedule_type' => $request->schedule_type,
            'requires_prescription' => $request->requires_prescription ?? false,
            'purchase_price' => $request->purchase_price,
            'selling_price' => $request->selling_price,
            'tax_gst_category' => $request->tax_gst_category,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'medicineId' => $medicine->medicine_id,
            'medicineCode' => $medicine->medicine_code,
            'message' => 'Medicine added successfully',
        ], 201);
    }

    public function filters()
    {
        $categories = Medicine::where('is_active', true)->distinct()->pluck('category')->sort()->values();
        $forms = Medicine::where('is_active', true)->distinct()->pluck('form')->sort()->values();
        $manufacturers = Medicine::where('is_active', true)->distinct()->pluck('manufacturer')->sort()->values();

        return response()->json([
            'categories' => $categories,
            'forms' => $forms,
            'manufacturers' => $manufacturers,
        ]);
    }
}
