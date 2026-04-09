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

    public function __construct()
    {
        $this->seedIfEmpty();
    }

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

    private function seedIfEmpty()
    {
        if (Medicine::count() > 0) return;

        $medicines = [
            ['MED-1', 'MED-001', 'Paracetamol', 'Panadol', '500mg', 'Tablet', 'Analgesic', 'GSK', 250, 50, 300, 75, 150, 'strips', 45, 50, 'Shelf A3, Bin 12-15', 'Room temperature, dry place', 'A'],
            ['MED-2', 'MED-002', 'Co-amoxiclav', 'Augmentin', '625mg', 'Tablet', 'Antibiotic', 'GSK', 120, 30, 200, 50, 100, 'strips', 220, 270, 'Shelf B1, Bin 3-5', 'Below 25°C', 'A'],
            ['MED-3', 'MED-003', 'Cetirizine', 'Rigix', '10mg', 'Tablet', 'Antihistamine', 'Getz Pharma', 500, 100, 600, 150, 200, 'strips', 25, 30, 'Shelf C2, Bin 8', 'Room temperature', 'B'],
            ['MED-4', 'MED-004', 'Ibuprofen', 'Brufen', '400mg', 'Tablet', 'Analgesic', 'Abbott', 80, 50, 200, 75, 100, 'strips', 30, 35, 'Shelf A3, Bin 16-18', 'Room temperature', 'A'],
            ['MED-5', 'MED-005', 'Aspirin', 'Ascard', '75mg', 'Tablet', 'Cardiovascular', 'Atco', 45, 60, 400, 80, 150, 'strips', 20, 25, 'Shelf D1, Bin 2', 'Room temperature, dry place', 'B'],
            ['MED-6', 'MED-006', 'Calcium + Vitamin D', 'Cac-1000 Plus', '500mg', 'Tablet', 'Supplement', 'GSK', 300, 50, 400, 75, 150, 'bottles', 180, 200, 'Shelf E2, Bin 5-7', 'Room temperature', 'B'],
            ['MED-7', 'MED-007', 'Omeprazole', 'Risek', '20mg', 'Capsule', 'Gastrointestinal', 'Getz Pharma', 180, 40, 250, 60, 100, 'strips', 55, 65, 'Shelf B2, Bin 10', 'Below 25°C, dry place', 'A'],
            ['MED-8', 'MED-008', 'Metformin', 'Glucophage', '500mg', 'Tablet', 'Antidiabetic', 'Merck', 200, 50, 300, 75, 120, 'strips', 35, 42, 'Shelf D3, Bin 1-3', 'Room temperature', 'A'],
            ['MED-9', 'MED-009', 'Amlodipine', 'Norvasc', '5mg', 'Tablet', 'Cardiovascular', 'Pfizer', 150, 40, 250, 60, 100, 'strips', 60, 72, 'Shelf D1, Bin 5-6', 'Room temperature', 'B'],
            ['MED-10', 'MED-010', 'Amoxicillin', 'Amoxil', '500mg', 'Capsule', 'Antibiotic', 'GSK', 0, 30, 200, 50, 100, 'strips', 40, 48, 'Shelf B1, Bin 7', 'Below 25°C', 'A'],
            ['MED-11', 'MED-011', 'Azithromycin', 'Zithromax', '500mg', 'Tablet', 'Antibiotic', 'Pfizer', 90, 25, 150, 40, 80, 'strips', 120, 145, 'Shelf B2, Bin 1-2', 'Room temperature', 'A'],
            ['MED-12', 'MED-012', 'Losartan', 'Cozaar', '50mg', 'Tablet', 'Cardiovascular', 'Merck', 110, 30, 200, 50, 100, 'strips', 48, 58, 'Shelf D2, Bin 3-4', 'Room temperature, dry place', 'B'],
            ['MED-13', 'MED-013', 'Ciprofloxacin', 'Ciproxin', '500mg', 'Tablet', 'Antibiotic', 'Bayer', 60, 30, 200, 50, 80, 'strips', 75, 90, 'Shelf B3, Bin 2', 'Below 30°C', 'B'],
            ['MED-14', 'MED-014', 'Ranitidine', 'Zantac', '150mg', 'Tablet', 'Gastrointestinal', 'GSK', 20, 40, 200, 60, 100, 'strips', 28, 35, 'Shelf B2, Bin 8', 'Room temperature', 'C'],
            ['MED-15', 'MED-015', 'Diclofenac', 'Voltaren', '50mg', 'Tablet', 'Analgesic', 'Novartis', 170, 50, 250, 75, 120, 'strips', 32, 40, 'Shelf A4, Bin 1-3', 'Room temperature', 'B'],
            ['MED-16', 'MED-016', 'Paracetamol', 'Calpol', '500mg', 'Tablet', 'Analgesic', 'GSK', 150, 40, 250, 60, 100, 'strips', 42, 48, 'Shelf A3, Bin 20', 'Room temperature', 'B'],
            ['MED-17', 'MED-017', 'Paracetamol', 'Paracip', '500mg', 'Tablet', 'Analgesic', 'Cipla', 200, 40, 250, 60, 100, 'strips', 35, 40, 'Shelf A3, Bin 22', 'Room temperature', 'C'],
            ['MED-18', 'MED-018', 'Cefixime', 'Cefiget', '200mg', 'Capsule', 'Antibiotic', 'Getz Pharma', 85, 20, 150, 30, 60, 'strips', 95, 115, 'Shelf B1, Bin 12', 'Below 25°C', 'B'],
            ['MED-19', 'MED-019', 'Montelukast', 'Singulair', '10mg', 'Tablet', 'Respiratory', 'Merck', 140, 30, 200, 50, 80, 'strips', 68, 82, 'Shelf C1, Bin 5', 'Room temperature', 'B'],
            ['MED-20', 'MED-020', 'Salbutamol', 'Ventolin', '100mcg', 'Inhaler', 'Respiratory', 'GSK', 35, 20, 100, 30, 50, 'pieces', 280, 340, 'Shelf C1, Bin 10-12', 'Below 30°C, avoid sunlight', 'A'],
        ];

        foreach ($medicines as $med) {
            Medicine::create([
                'medicine_id' => $med[0], 'medicine_code' => $med[1],
                'generic_name' => $med[2], 'brand_name' => $med[3],
                'strength' => $med[4], 'form' => $med[5],
                'category' => $med[6], 'manufacturer' => $med[7],
                'current_stock' => $med[8], 'min_stock' => $med[9],
                'max_stock' => $med[10], 'reorder_point' => $med[11],
                'eoq' => $med[12], 'stock_unit' => $med[13],
                'purchase_price' => $med[14], 'selling_price' => $med[15],
                'storage_location' => $med[16], 'storage_conditions' => $med[17],
                'abc_class' => $med[18],
            ]);
        }

        $batchData = [
            ['BATCH-1', 'B2024-05', 'MED-1', '2024-01-15', '2025-12-31', 100, 80, 45, 'PharmaCo Ltd'],
            ['BATCH-2', 'B2024-08', 'MED-1', '2024-04-10', '2026-03-31', 150, 120, 45, 'PharmaCo Ltd'],
            ['BATCH-3', 'B2025-01', 'MED-1', '2025-01-05', '2026-12-31', 100, 50, 47, 'PharmaCo Ltd'],
            ['BATCH-4', 'B2024-03', 'MED-2', '2024-03-01', '2025-09-30', 80, 40, 218, 'MediSupply'],
            ['BATCH-5', 'B2025-02', 'MED-2', '2025-02-01', '2026-08-31', 100, 80, 220, 'MediSupply'],
            ['BATCH-6', 'B2024-06', 'MED-3', '2024-06-15', '2026-06-30', 300, 250, 25, 'HealthCare Dist.'],
            ['BATCH-7', 'B2025-01', 'MED-3', '2025-01-10', '2027-01-31', 300, 250, 25, 'HealthCare Dist.'],
            ['BATCH-8', 'B2024-09', 'MED-4', '2024-09-01', '2026-02-28', 100, 80, 30, 'PharmaCo Ltd'],
            ['BATCH-9', 'B2024-07', 'MED-5', '2024-07-15', '2026-01-31', 200, 45, 20, 'MedLine Traders'],
            ['BATCH-10', 'B2025-03', 'MED-6', '2025-03-01', '2027-03-31', 300, 300, 180, 'HealthCare Dist.'],
            ['BATCH-11', 'B2024-11', 'MED-7', '2024-11-01', '2026-05-31', 200, 180, 55, 'PharmaCo Ltd'],
            ['BATCH-12', 'B2025-01', 'MED-8', '2025-01-15', '2027-01-31', 200, 200, 35, 'MediSupply'],
            ['BATCH-13', 'B2024-10', 'MED-9', '2024-10-01', '2026-10-31', 150, 150, 60, 'PharmaCo Ltd'],
            ['BATCH-14', 'B2024-05', 'MED-11', '2024-05-01', '2026-04-30', 100, 90, 120, 'MediSupply'],
            ['BATCH-15', 'B2024-08', 'MED-12', '2024-08-01', '2026-08-31', 120, 110, 48, 'MedLine Traders'],
            ['BATCH-16', 'B2024-12', 'MED-14', '2024-12-01', '2026-03-15', 100, 20, 28, 'PharmaCo Ltd'],
            ['BATCH-17', 'B2025-02', 'MED-15', '2025-02-15', '2027-02-28', 200, 170, 32, 'HealthCare Dist.'],
            ['BATCH-18', 'B2024-04', 'MED-20', '2024-04-01', '2026-04-30', 50, 35, 280, 'MediSupply'],
        ];

        foreach ($batchData as $b) {
            MedicineBatch::create([
                'batch_id' => $b[0], 'batch_number' => $b[1],
                'medicine_id' => $b[2], 'received_date' => $b[3],
                'expiry_date' => $b[4], 'qty_received' => $b[5],
                'current_qty' => $b[6], 'unit_price' => $b[7],
                'supplier' => $b[8],
            ]);
        }

        $txns = [
            ['STX-1', 'MED-1', 'BATCH-3', 'Stock In (Purchase)', 100, 150, 250, null, 'PO-2026-045', 'Received from PharmaCo Ltd', 'Pharmacy Manager'],
            ['STX-2', 'MED-1', 'BATCH-1', 'Stock Out (Dispensed)', -2, 252, 250, null, 'RX-2026-0125', 'Dispensed to Ahmed Ali', 'Pharmacist Ahmed'],
            ['STX-3', 'MED-2', 'BATCH-5', 'Stock In (Purchase)', 100, 20, 120, null, 'PO-2026-038', 'Received from MediSupply', 'Pharmacy Manager'],
            ['STX-4', 'MED-4', null, 'Adjustment (Decrease)', -20, 100, 80, 'Physical Count Correction', null, 'Quarterly stock count variance', 'Admin'],
            ['STX-5', 'MED-5', 'BATCH-9', 'Stock Out (Dispensed)', -5, 50, 45, null, 'RX-2026-0130', 'Dispensed to Fatima Khan', 'Pharmacist Sarah'],
            ['STX-6', 'MED-7', 'BATCH-11', 'Stock Out (Dispensed)', -20, 200, 180, null, 'RX-2026-0118', 'Dispensed - IPD Ward A', 'Pharmacist Ahmed'],
        ];

        $now = Carbon::now();
        foreach ($txns as $i => $t) {
            StockTransaction::create([
                'transaction_id' => $t[0], 'medicine_id' => $t[1],
                'batch_id' => $t[2], 'type' => $t[3],
                'quantity' => $t[4], 'stock_before' => $t[5],
                'stock_after' => $t[6], 'reason' => $t[7],
                'reference' => $t[8], 'notes' => $t[9],
                'performed_by' => $t[10],
                'created_at' => $now->copy()->subHours($i * 3),
                'updated_at' => $now->copy()->subHours($i * 3),
            ]);
        }
    }
}
