<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockTransaction;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\GoodsReceivedNote;
use App\Models\GrnItem;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockAlertController extends Controller
{
    use HmsHelpers;

    public function __construct()
    {
        $this->seedSuppliersIfEmpty();
    }

    public function dashboard()
    {
        $now = Carbon::now();
        $threeMonths = $now->copy()->addMonths(3);

        $outOfStockCount = Medicine::where('is_active', true)->where('current_stock', 0)->count();
        $lowStockCount = Medicine::where('is_active', true)
            ->whereColumn('current_stock', '<', 'min_stock')
            ->where('current_stock', '>', 0)->count();
        $expiringSoonCount = MedicineBatch::where('status', 'Active')
            ->where('current_qty', '>', 0)
            ->where('expiry_date', '<=', $threeMonths)
            ->where('expiry_date', '>', $now)
            ->distinct('medicine_id')->count('medicine_id');
        $expiredCount = MedicineBatch::where('current_qty', '>', 0)
            ->where('expiry_date', '<', $now)
            ->distinct('medicine_id')->count('medicine_id');
        $reorderCount = Medicine::where('is_active', true)
            ->whereColumn('current_stock', '<=', 'reorder_point')
            ->where('current_stock', '>', 0)->count();

        $outOfStockLoss = Medicine::where('is_active', true)->where('current_stock', 0)
            ->selectRaw('SUM(selling_price * min_stock) as loss')->value('loss') ?? 0;
        $expiredLoss = DB::table('medicine_batches')
            ->join('medicines', 'medicine_batches.medicine_id', '=', 'medicines.medicine_id')
            ->where('medicine_batches.current_qty', '>', 0)
            ->where('medicine_batches.expiry_date', '<', $now)
            ->selectRaw('SUM(medicine_batches.current_qty * medicines.purchase_price) as loss')
            ->value('loss') ?? 0;
        $expiringSoonLoss = DB::table('medicine_batches')
            ->join('medicines', 'medicine_batches.medicine_id', '=', 'medicines.medicine_id')
            ->where('medicine_batches.status', 'Active')
            ->where('medicine_batches.current_qty', '>', 0)
            ->where('medicine_batches.expiry_date', '<=', $threeMonths)
            ->where('medicine_batches.expiry_date', '>', $now)
            ->selectRaw('SUM(medicine_batches.current_qty * medicines.purchase_price) as loss')
            ->value('loss') ?? 0;

        $pendingPOs = PurchaseOrder::where('status', 'Pending')->count();
        $pendingPOValue = PurchaseOrder::where('status', 'Pending')->sum('total');

        return response()->json([
            'outOfStockCount' => $outOfStockCount,
            'lowStockCount' => $lowStockCount,
            'expiringSoonCount' => $expiringSoonCount,
            'expiredCount' => $expiredCount,
            'reorderCount' => $reorderCount,
            'estimatedLostRevenue' => round($outOfStockLoss, 0),
            'expiredLoss' => round($expiredLoss, 0),
            'expiringSoonLoss' => round($expiringSoonLoss, 0),
            'pendingPOs' => $pendingPOs,
            'pendingPOValue' => round($pendingPOValue, 0),
        ]);
    }

    public function outOfStock()
    {
        $medicines = Medicine::where('is_active', true)->where('current_stock', 0)
            ->orderBy('brand_name')->get();

        $result = $medicines->map(function ($m) {
            $lastTxn = StockTransaction::where('medicine_id', $m->medicine_id)
                ->where('quantity', '<', 0)->orderBy('created_at', 'desc')->first();
            $lastStockout = $lastTxn ? Carbon::parse($lastTxn->created_at)->diffForHumans() : 'Unknown';

            $avgDaily = max(1, round($m->min_stock / 7));
            $pendingPO = PurchaseOrderItem::where('medicine_id', $m->medicine_id)
                ->whereHas('purchaseOrder', fn($q) => $q->where('status', 'Pending'))
                ->sum('quantity');

            $priority = $avgDaily > 20 ? 'URGENT' : ($avgDaily > 10 ? 'HIGH' : 'MEDIUM');

            return [
                'medicineId' => $m->medicine_id,
                'medicineName' => $m->brand_name . ' ' . $m->strength,
                'genericName' => $m->generic_name,
                'form' => $m->form,
                'stockUnit' => $m->stock_unit,
                'lastStockout' => $lastStockout,
                'pendingOrders' => $pendingPO,
                'avgDailyUsage' => $avgDaily . ' ' . $m->stock_unit . '/day',
                'priority' => $priority,
                'sellingPrice' => (float)$m->selling_price,
                'purchasePrice' => (float)$m->purchase_price,
                'reorderQty' => $m->eoq,
            ];
        });

        $totalLoss = $medicines->sum(fn($m) => $m->selling_price * $m->min_stock);

        return response()->json([
            'items' => $result,
            'totalCount' => $medicines->count(),
            'estimatedLostRevenue' => round($totalLoss, 0),
        ]);
    }

    public function lowStock()
    {
        $medicines = Medicine::where('is_active', true)
            ->whereColumn('current_stock', '<', 'min_stock')
            ->where('current_stock', '>', 0)
            ->orderByRaw('current_stock::float / NULLIF(min_stock, 0) ASC')
            ->get();

        $result = $medicines->map(function ($m) {
            $avgDaily = max(1, round($m->min_stock / 7));
            $daysUntilOut = $avgDaily > 0 ? round($m->current_stock / $avgDaily) : 999;
            $reorderQty = max($m->eoq, $m->max_stock - $m->current_stock);

            return [
                'medicineId' => $m->medicine_id,
                'medicineName' => $m->brand_name . ' ' . $m->strength,
                'genericName' => $m->generic_name,
                'currentStock' => $m->current_stock,
                'minLevel' => $m->min_stock,
                'stockUnit' => $m->stock_unit,
                'daysUntilOut' => $daysUntilOut . ' days',
                'reorderQty' => $reorderQty . ' ' . $m->stock_unit,
                'purchasePrice' => (float)$m->purchase_price,
            ];
        });

        return response()->json([
            'items' => $result,
            'totalCount' => $medicines->count(),
        ]);
    }

    public function expiringSoon()
    {
        $now = Carbon::now();
        $threeMonths = $now->copy()->addMonths(3);

        $batches = MedicineBatch::with('medicine')
            ->where('status', 'Active')
            ->where('current_qty', '>', 0)
            ->where('expiry_date', '<=', $threeMonths)
            ->where('expiry_date', '>', $now)
            ->orderBy('expiry_date')
            ->get();

        $result = $batches->map(function ($b) use ($now) {
            $daysRemaining = (int)$now->diffInDays($b->expiry_date, false);
            $loss = $b->current_qty * ($b->medicine->purchase_price ?? 0);
            return [
                'medicineId' => $b->medicine_id,
                'medicineName' => $b->medicine->brand_name . ' ' . $b->medicine->strength,
                'genericName' => $b->medicine->generic_name,
                'batchNumber' => $b->batch_number,
                'expiryDate' => $b->expiry_date->format('d-M-Y'),
                'daysRemaining' => $daysRemaining,
                'qty' => $b->current_qty,
                'stockUnit' => $b->medicine->stock_unit,
                'estimatedLoss' => round($loss, 0),
                'purchasePrice' => (float)$b->unit_price,
            ];
        });

        $totalLoss = $result->sum('estimatedLoss');

        return response()->json([
            'items' => $result->values(),
            'totalCount' => $batches->count(),
            'potentialLoss' => round($totalLoss, 0),
        ]);
    }

    public function expired()
    {
        $now = Carbon::now();

        $batches = MedicineBatch::with('medicine')
            ->where('current_qty', '>', 0)
            ->where('expiry_date', '<', $now)
            ->orderBy('expiry_date', 'desc')
            ->get();

        $result = $batches->map(function ($b) use ($now) {
            $daysExpired = (int)$now->diffInDays($b->expiry_date);
            $loss = $b->current_qty * ($b->medicine->purchase_price ?? 0);
            return [
                'medicineId' => $b->medicine_id,
                'medicineName' => $b->medicine->brand_name . ' ' . $b->medicine->strength,
                'batchNumber' => $b->batch_number,
                'batchId' => $b->batch_id,
                'expiredDate' => $b->expiry_date->format('d-M-Y'),
                'daysExpired' => $daysExpired,
                'qty' => $b->current_qty,
                'stockUnit' => $b->medicine->stock_unit,
                'lossValue' => round($loss, 0),
            ];
        });

        $totalLoss = $result->sum('lossValue');

        return response()->json([
            'items' => $result->values(),
            'totalCount' => $batches->count(),
            'totalLoss' => round($totalLoss, 0),
        ]);
    }

    public function reorderSuggestions()
    {
        $medicines = Medicine::where('is_active', true)
            ->whereColumn('current_stock', '<=', 'reorder_point')
            ->where('current_stock', '>', 0)
            ->orderBy('brand_name')->get();

        $suppliers = Supplier::where('is_active', true)->get()->keyBy('supplier_id');
        $supplierList = $suppliers->values();

        $result = $medicines->map(function ($m) use ($supplierList) {
            $suggestedQty = max($m->eoq, $m->max_stock - $m->current_stock);
            $preferredSupplier = $supplierList->random();

            return [
                'medicineId' => $m->medicine_id,
                'medicineName' => $m->brand_name . ' ' . $m->strength,
                'genericName' => $m->generic_name,
                'currentStock' => $m->current_stock,
                'reorderPoint' => $m->reorder_point,
                'suggestedQty' => $suggestedQty . ' ' . $m->stock_unit,
                'suggestedQtyNum' => $suggestedQty,
                'preferredSupplier' => $preferredSupplier->name,
                'supplierId' => $preferredSupplier->supplier_id,
                'leadTime' => $preferredSupplier->lead_time_days . ' days',
                'stockUnit' => $m->stock_unit,
                'purchasePrice' => (float)$m->purchase_price,
                'estimatedCost' => round($suggestedQty * $m->purchase_price, 0),
            ];
        });

        $totalValue = $result->sum('estimatedCost');

        return response()->json([
            'items' => $result->values(),
            'totalCount' => $medicines->count(),
            'estimatedOrderValue' => round($totalValue, 0),
        ]);
    }

    public function suppliers()
    {
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        return response()->json($suppliers->map(fn($s) => [
            'supplierId' => $s->supplier_id,
            'name' => $s->name,
            'contactPerson' => $s->contact_person,
            'phone' => $s->phone,
            'email' => $s->email,
            'address' => $s->address,
            'paymentTerms' => $s->payment_terms,
            'leadTimeDays' => $s->lead_time_days,
        ]));
    }

    public function medicinesList()
    {
        $medicines = Medicine::where('is_active', true)->orderBy('brand_name')->get();
        return response()->json($medicines->map(fn($m) => [
            'medicineId' => $m->medicine_id,
            'name' => $m->brand_name . ' ' . $m->strength,
            'genericName' => $m->generic_name,
            'form' => $m->form,
            'currentStock' => $m->current_stock,
            'stockUnit' => $m->stock_unit,
            'purchasePrice' => (float)$m->purchase_price,
        ]));
    }

    public function purchaseOrders(Request $request)
    {
        $q = PurchaseOrder::with('supplier', 'items.medicine')->orderBy('created_at', 'desc');

        if ($status = $request->input('status')) {
            $q->where('status', $status);
        }

        $pos = $q->get()->map(function ($po) {
            return [
                'poId' => $po->po_id,
                'supplierName' => $po->supplier->name ?? 'Unknown',
                'supplierId' => $po->supplier_id,
                'poDate' => $po->po_date->format('d-M-Y'),
                'expectedDelivery' => $po->expected_delivery ? $po->expected_delivery->format('d-M-Y') : null,
                'orderType' => $po->order_type,
                'totalItems' => $po->items->count(),
                'totalQty' => $po->items->sum('quantity'),
                'total' => (float)$po->total,
                'status' => $po->status,
                'paymentMethod' => $po->payment_method,
                'createdBy' => $po->created_by,
                'createdAt' => $po->created_at->toIso8601String(),
                'items' => $po->items->map(fn($i) => [
                    'medicineId' => $i->medicine_id,
                    'medicineName' => $i->medicine ? $i->medicine->brand_name . ' ' . $i->medicine->strength : 'Unknown',
                    'currentStock' => $i->medicine ? $i->medicine->current_stock : 0,
                    'stockUnit' => $i->medicine ? $i->medicine->stock_unit : '',
                    'quantity' => $i->quantity,
                    'unitPrice' => (float)$i->unit_price,
                    'total' => (float)$i->total,
                    'receivedQty' => $i->received_qty,
                ]),
            ];
        });

        return response()->json($pos);
    }

    public function createPurchaseOrder(Request $request)
    {
        $request->validate([
            'supplierId' => 'required|string',
            'expectedDelivery' => 'nullable|date',
            'orderType' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.medicineId' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unitPrice' => 'required|numeric|min:0',
            'paymentMethod' => 'nullable|string',
            'creditDays' => 'nullable|integer',
            'advancePayment' => 'nullable|numeric',
            'deliveryInstructions' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:Pending,Completed',
        ]);

        $poId = $this->generateYearId(PurchaseOrder::class, 'po_id', 'PO');

        $subtotal = 0;
        foreach ($request->items as $item) {
            $subtotal += $item['quantity'] * $item['unitPrice'];
        }

        $po = PurchaseOrder::create([
            'po_id' => $poId,
            'supplier_id' => $request->supplierId,
            'po_date' => Carbon::today(),
            'expected_delivery' => $request->expectedDelivery ? Carbon::parse($request->expectedDelivery) : Carbon::today()->addDays(5),
            'order_type' => $request->orderType,
            'subtotal' => $subtotal,
            'tax' => 0,
            'discount' => 0,
            'total' => $subtotal,
            'payment_method' => $request->paymentMethod ?? 'Credit',
            'credit_days' => $request->creditDays ?? 30,
            'advance_payment' => $request->advancePayment ?? 0,
            'delivery_instructions' => $request->deliveryInstructions,
            'notes' => $request->notes,
            'status' => 'Pending',
            'created_by' => 'Admin',
        ]);

        foreach ($request->items as $item) {
            PurchaseOrderItem::create([
                'po_id' => $poId,
                'medicine_id' => $item['medicineId'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unitPrice'],
                'total' => $item['quantity'] * $item['unitPrice'],
            ]);
        }

        return response()->json([
            'success' => true,
            'poId' => $poId,
            'total' => $subtotal,
        ]);
    }

    public function getPurchaseOrder($poId)
    {
        $po = PurchaseOrder::with('supplier', 'items.medicine')->where('po_id', $poId)->first();
        if (!$po) return response()->json(['error' => 'Not found'], 404);

        return response()->json([
            'poId' => $po->po_id,
            'supplierId' => $po->supplier_id,
            'supplierName' => $po->supplier->name ?? 'Unknown',
            'supplierPhone' => $po->supplier->phone ?? '',
            'supplierEmail' => $po->supplier->email ?? '',
            'poDate' => $po->po_date->format('Y-m-d'),
            'expectedDelivery' => $po->expected_delivery ? $po->expected_delivery->format('Y-m-d') : '',
            'orderType' => $po->order_type,
            'subtotal' => (float)$po->subtotal,
            'tax' => (float)$po->tax,
            'discount' => (float)$po->discount,
            'total' => (float)$po->total,
            'paymentMethod' => $po->payment_method,
            'creditDays' => $po->credit_days,
            'advancePayment' => (float)$po->advance_payment,
            'deliveryInstructions' => $po->delivery_instructions,
            'notes' => $po->notes,
            'status' => $po->status,
            'createdBy' => $po->created_by,
            'items' => $po->items->map(function ($i) use ($po) {
                $grn = GoodsReceivedNote::where('po_id', $po->po_id)->first();
                $grnItem = $grn
                    ? GrnItem::where('grn_id', $grn->grn_id)->where('medicine_id', $i->medicine_id)->first()
                    : null;

                return [
                    'medicineId'      => $i->medicine_id,
                    'medicineName'    => $i->medicine ? $i->medicine->brand_name . ' ' . $i->medicine->strength : 'Unknown',
                    'currentStock'    => $i->medicine ? $i->medicine->current_stock : 0,
                    'stockUnit'       => $i->medicine ? $i->medicine->stock_unit : '',
                    'quantity'        => $i->quantity,
                    'unitPrice'       => (float)$i->unit_price,
                    'total'           => (float)$i->total,
                    'receivedQty'     => $i->received_qty,
                    'batchNumber'     => $grnItem?->batch_number ?? '',
                    'manufacturingDate' => $grnItem?->manufacturing_date?->format('Y-m-d') ?? '',
                    'expiryDate'      => $grnItem?->expiry_date?->format('Y-m-d') ?? '',
                ];
            }),
        ]);
    }

    public function createGRN(Request $request)
    {
        $request->validate([
            'poId' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.medicineId' => 'required|string',
            'items.*.receivedQty' => 'required|integer|min:0',
            'items.*.batchNumber' => 'required|string',
            'items.*.manufacturingDate' => 'nullable|date',
            'items.*.expiryDate' => 'required|date',
            'items.*.unitPrice' => 'required|numeric|min:0',
            'items.*.qualityChecks' => 'nullable|array',
            'items.*.remarks' => 'nullable|string',
        ]);

        $po = PurchaseOrder::where('po_id', $request->poId)->first();
        if (!$po) return response()->json(['error' => 'PO not found'], 404);

        $grnId = $this->generateYearId(GoodsReceivedNote::class, 'grn_id', 'GRN');
        $totalValue = 0;

        DB::beginTransaction();
        try {
            $grn = GoodsReceivedNote::create([
                'grn_id' => $grnId,
                'po_id' => $request->poId,
                'supplier_id' => $po->supplier_id,
                'received_date' => Carbon::now(),
                'total_value' => 0,
                'received_by' => 'Admin',
                'status' => 'Completed',
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                if ($item['receivedQty'] <= 0) continue;

                GrnItem::create([
                    'grn_id' => $grnId,
                    'medicine_id' => $item['medicineId'],
                    'expected_qty' => $item['expectedQty'] ?? $item['receivedQty'],
                    'received_qty' => $item['receivedQty'],
                    'batch_number' => $item['batchNumber'],
                    'manufacturing_date' => $item['manufacturingDate'] ?? null,
                    'expiry_date' => $item['expiryDate'],
                    'unit_price' => $item['unitPrice'],
                    'quality_checks' => $item['qualityChecks'] ?? [],
                    'remarks' => $item['remarks'] ?? null,
                ]);

                $medicine = Medicine::where('medicine_id', $item['medicineId'])->first();
                if ($medicine) {
                    $stockBefore = $medicine->current_stock;
                    $medicine->update(['current_stock' => $stockBefore + $item['receivedQty']]);

                    $batchId = $this->nextId(MedicineBatch::class, 'batch_id', 'BATCH-');
                    MedicineBatch::create([
                        'batch_id' => $batchId,
                        'batch_number' => $item['batchNumber'],
                        'medicine_id' => $item['medicineId'],
                        'received_date' => Carbon::today(),
                        'expiry_date' => $item['expiryDate'],
                        'qty_received' => $item['receivedQty'],
                        'current_qty' => $item['receivedQty'],
                        'unit_price' => $item['unitPrice'],
                        'supplier' => $po->supplier->name ?? 'Unknown',
                    ]);

                    $txnId = $this->nextId(StockTransaction::class, 'transaction_id', 'STX-');
                    StockTransaction::create([
                        'transaction_id' => $txnId,
                        'medicine_id' => $item['medicineId'],
                        'batch_id' => $batchId,
                        'type' => 'Stock In (GRN)',
                        'quantity' => $item['receivedQty'],
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockBefore + $item['receivedQty'],
                        'reference' => $grnId . ' / ' . $request->poId,
                        'notes' => 'Received via GRN from ' . ($po->supplier->name ?? 'Unknown'),
                        'performed_by' => 'Admin',
                    ]);

                    $totalValue += $item['receivedQty'] * $item['unitPrice'];
                }

                PurchaseOrderItem::where('po_id', $request->poId)
                    ->where('medicine_id', $item['medicineId'])
                    ->increment('received_qty', $item['receivedQty']);
            }

            $grn->update(['total_value' => $totalValue]);

            $allReceived = true;
            $poItems = PurchaseOrderItem::where('po_id', $request->poId)->get();
            foreach ($poItems as $poi) {
                if ($poi->received_qty < $poi->quantity) {
                    $allReceived = false;
                    break;
                }
            }
            $po->update(['status' => $allReceived ? 'Completed' : 'Pending']);

            DB::commit();

            return response()->json([
                'success' => true,
                'grnId' => $grnId,
                'totalValue' => round($totalValue, 2),
                'poStatus' => $allReceived ? 'Completed' : 'Partial',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function dispose(Request $request)
    {
        $request->validate([
            'batchId' => 'required|string',
        ]);

        $batch = MedicineBatch::where('batch_id', $request->batchId)->first();
        if (!$batch) return response()->json(['error' => 'Batch not found'], 404);

        $medicine = Medicine::where('medicine_id', $batch->medicine_id)->first();
        if (!$medicine) return response()->json(['error' => 'Medicine not found'], 404);

        $stockBefore = $medicine->current_stock;
        $qtyToRemove = $batch->current_qty;
        $newStock = max(0, $stockBefore - $qtyToRemove);

        $medicine->update(['current_stock' => $newStock]);
        $batch->update(['current_qty' => 0, 'status' => 'Disposed']);

        $txnId = $this->nextId(StockTransaction::class, 'transaction_id', 'STX-');
        StockTransaction::create([
            'transaction_id' => $txnId,
            'medicine_id' => $batch->medicine_id,
            'batch_id' => $batch->batch_id,
            'type' => 'Disposal (Expired)',
            'quantity' => -$qtyToRemove,
            'stock_before' => $stockBefore,
            'stock_after' => $newStock,
            'reason' => 'Expired stock disposal',
            'notes' => 'Batch ' . $batch->batch_number . ' disposed - expired on ' . $batch->expiry_date->format('d-M-Y'),
            'performed_by' => 'Admin',
        ]);

        return response()->json([
            'success' => true,
            'medicineName' => $medicine->brand_name . ' ' . $medicine->strength,
            'qtyDisposed' => $qtyToRemove,
            'newStock' => $newStock,
        ]);
    }

    private function seedSuppliersIfEmpty()
    {
        if (Supplier::count() > 0) return;

        $suppliers = [
            ['SUP-1', 'ABC Pharmaceuticals Ltd.', 'Muhammad Ilyas', '042-35761234', 'sales@abcpharma.com', '15-A Industrial Area, Lahore', '30 days credit', 2],
            ['SUP-2', 'PharmaCo Ltd', 'Ali Hassan', '042-35432100', 'orders@pharmaco.pk', '27-B Township, Lahore', '15 days credit', 3],
            ['SUP-3', 'MediSupply International', 'Sarah Ahmed', '021-34567890', 'info@medisupply.pk', '45 SITE Area, Karachi', '45 days credit', 4],
            ['SUP-4', 'HealthCare Distributors', 'Usman Tariq', '051-2345678', 'hcdist@gmail.com', '12 Blue Area, Islamabad', '30 days credit', 2],
            ['SUP-5', 'MedLine Traders', 'Fahad Khan', '042-37654321', 'medline@outlook.com', '8 Gulberg III, Lahore', '7 days credit', 1],
            ['SUP-6', 'National Drug House', 'Raza Ali', '021-36789012', 'ndh@nationaldrug.pk', '23 Saddar, Karachi', '60 days credit', 5],
        ];

        foreach ($suppliers as $s) {
            Supplier::create([
                'supplier_id' => $s[0], 'name' => $s[1],
                'contact_person' => $s[2], 'phone' => $s[3],
                'email' => $s[4], 'address' => $s[5],
                'payment_terms' => $s[6], 'lead_time_days' => $s[7],
            ]);
        }
    }
}
