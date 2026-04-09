<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabReagent;
use App\Models\LabReagentBatch;
use App\Models\LabStockTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LabInventoryController extends Controller
{
    public function __construct()
    {
        $this->seedIfEmpty();
    }

    public function stats()
    {
        $today = Carbon::today();
        $thirtyDays = Carbon::today()->addDays(30);

        $total = LabReagent::count();
        $outOfStock = LabReagent::where('current_stock', 0)->count();
        $lowStock = LabReagent::whereColumn('current_stock', '<', 'min_stock')
            ->where('current_stock', '>', 0)->count();
        $expiringSoon = LabReagentBatch::where('status', 'Active')
            ->where('current_qty', '>', 0)
            ->whereBetween('expiry_date', [$today, $thirtyDays])->count();

        $stockValue = 0;
        $reagents = LabReagent::all();
        foreach ($reagents as $r) {
            $stockValue += $r->current_stock * $r->unit_price;
        }

        $lowReagent = LabReagent::whereNotNull('remaining_tests')
            ->where('tests_per_kit', '>', 0)
            ->get()
            ->filter(function ($r) {
                return $r->tests_per_kit > 0 && ($r->remaining_tests / $r->tests_per_kit) < 0.2;
            })->count();

        return response()->json([
            'totalItems' => $total,
            'outOfStock' => $outOfStock,
            'lowStock' => $lowStock,
            'expiringSoon' => $expiringSoon,
            'stockValue' => $stockValue,
            'lowReagentKits' => $lowReagent,
        ]);
    }

    public function storageConditions()
    {
        $conditions = [
            'Room Temperature' => ['range' => '15-25°C', 'count' => 0, 'icon' => 'thermometer'],
            'Refrigerated' => ['range' => '2-8°C', 'count' => 0, 'icon' => 'snowflake'],
            'Frozen' => ['range' => '-20°C', 'count' => 0, 'icon' => 'cloud-snow'],
            'Ultra-Frozen' => ['range' => '-80°C', 'count' => 0, 'icon' => 'zap'],
        ];

        $reagents = LabReagent::select('storage_condition')
            ->selectRaw('count(*) as cnt')
            ->groupBy('storage_condition')
            ->pluck('cnt', 'storage_condition');

        foreach ($reagents as $cond => $cnt) {
            if (isset($conditions[$cond])) {
                $conditions[$cond]['count'] = $cnt;
            }
        }

        $result = [];
        foreach ($conditions as $name => $data) {
            $result[] = array_merge(['name' => $name], $data);
        }

        return response()->json($result);
    }

    public function filters()
    {
        $categories = LabReagent::distinct()->pluck('category')->sort()->values();
        $manufacturers = LabReagent::distinct()->pluck('manufacturer')->sort()->values();
        $storageConditions = LabReagent::distinct()->pluck('storage_condition')->sort()->values();
        $analyzers = LabReagent::whereNotNull('analyzer_name')->distinct()->pluck('analyzer_name')->sort()->values();

        return response()->json([
            'categories' => $categories,
            'manufacturers' => $manufacturers,
            'storageConditions' => $storageConditions,
            'analyzers' => $analyzers,
        ]);
    }

    public function index(Request $request)
    {
        $query = LabReagent::query();

        if ($s = $request->input('search')) {
            $query->where(function ($q) use ($s) {
                $q->where('name', 'LIKE', "%{$s}%")
                  ->orWhere('reagent_code', 'LIKE', "%{$s}%")
                  ->orWhere('manufacturer', 'LIKE', "%{$s}%")
                  ->orWhere('catalog_number', 'LIKE', "%{$s}%");
            });
        }
        if ($c = $request->input('category')) {
            $query->where('category', $c);
        }
        if ($sc = $request->input('storage')) {
            $query->where('storage_condition', $sc);
        }
        if ($st = $request->input('stockStatus')) {
            if ($st === 'Out of Stock') $query->where('current_stock', 0);
            elseif ($st === 'Low Stock') $query->whereColumn('current_stock', '<', 'min_stock')->where('current_stock', '>', 0);
            elseif ($st === 'In Stock') $query->whereColumn('current_stock', '>=', 'min_stock');
        }
        if ($a = $request->input('analyzer')) {
            $query->where('analyzer_name', $a);
        }

        $items = $query->orderBy('name')->get();

        $result = [];
        foreach ($items as $r) {
            $stockStatus = 'In Stock';
            if ($r->current_stock <= 0) $stockStatus = 'Out of Stock';
            elseif ($r->current_stock < $r->min_stock) $stockStatus = 'Low Stock';

            $nearestExpiry = LabReagentBatch::where('reagent_id', $r->reagent_id)
                ->where('status', 'Active')
                ->where('current_qty', '>', 0)
                ->orderBy('expiry_date')
                ->value('expiry_date');

            $batchCount = LabReagentBatch::where('reagent_id', $r->reagent_id)
                ->where('status', 'Active')
                ->where('current_qty', '>', 0)
                ->count();

            $expiryStatus = 'OK';
            if ($nearestExpiry) {
                $days = Carbon::today()->diffInDays(Carbon::parse($nearestExpiry), false);
                if ($days < 0) $expiryStatus = 'Expired';
                elseif ($days <= 30) $expiryStatus = 'Expiring Soon';
            }

            $reagentPct = null;
            if ($r->tests_per_kit && $r->tests_per_kit > 0) {
                $reagentPct = round(($r->remaining_tests / $r->tests_per_kit) * 100);
            }

            $result[] = [
                'reagentId' => $r->reagent_id,
                'reagentCode' => $r->reagent_code,
                'name' => $r->name,
                'category' => $r->category,
                'manufacturer' => $r->manufacturer,
                'catalogNumber' => $r->catalog_number,
                'unit' => $r->unit,
                'currentStock' => $r->current_stock,
                'minStock' => $r->min_stock,
                'maxStock' => $r->max_stock,
                'unitPrice' => $r->unit_price,
                'storageCondition' => $r->storage_condition,
                'storageTempRange' => $r->storage_temp_range,
                'storageLocation' => $r->storage_location,
                'analyzerName' => $r->analyzer_name,
                'testsPerKit' => $r->tests_per_kit,
                'remainingTests' => $r->remaining_tests,
                'reagentPct' => $reagentPct,
                'status' => $r->status,
                'autoReorder' => $r->auto_reorder,
                'stockStatus' => $stockStatus,
                'nearestExpiry' => $nearestExpiry,
                'expiryStatus' => $expiryStatus,
                'batchCount' => $batchCount,
                'stockValue' => $r->current_stock * $r->unit_price,
            ];
        }

        return response()->json($result);
    }

    public function show($reagentId)
    {
        $r = LabReagent::where('reagent_id', $reagentId)->first();
        if (!$r) return response()->json(['error' => 'Not found'], 404);

        $stockStatus = 'In Stock';
        if ($r->current_stock <= 0) $stockStatus = 'Out of Stock';
        elseif ($r->current_stock < $r->min_stock) $stockStatus = 'Low Stock';

        return response()->json([
            'reagent' => array_merge($r->toArray(), [
                'stockStatus' => $stockStatus,
                'stockValue' => $r->current_stock * $r->unit_price,
            ]),
        ]);
    }

    public function batches($reagentId)
    {
        $batches = LabReagentBatch::where('reagent_id', $reagentId)
            ->orderBy('expiry_date')
            ->get()
            ->map(function ($b) {
                $days = Carbon::today()->diffInDays(Carbon::parse($b->expiry_date), false);
                return [
                    'batchId' => $b->batch_id,
                    'lotNumber' => $b->lot_number,
                    'batchNumber' => $b->batch_number,
                    'receivedDate' => $b->received_date,
                    'expiryDate' => $b->expiry_date,
                    'openedDate' => $b->opened_date,
                    'daysToExpiry' => $days,
                    'qtyReceived' => $b->qty_received,
                    'currentQty' => $b->current_qty,
                    'unitPrice' => $b->unit_price,
                    'supplier' => $b->supplier,
                    'status' => $b->status,
                    'qcVerified' => $b->qc_verified,
                    'qcVerifiedAt' => $b->qc_verified_at,
                    'qcVerifiedBy' => $b->qc_verified_by,
                    'qcNotes' => $b->qc_notes,
                    'linkedResults' => $b->linked_results ? json_decode($b->linked_results, true) : [],
                ];
            });

        return response()->json($batches);
    }

    public function transactions($reagentId)
    {
        $txns = LabStockTransaction::where('reagent_id', $reagentId)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'type' => $t->type,
                    'quantity' => $t->quantity,
                    'balanceAfter' => $t->balance_after,
                    'reason' => $t->reason,
                    'reference' => $t->reference,
                    'performedBy' => $t->performed_by,
                    'notes' => $t->notes,
                    'createdAt' => $t->created_at,
                ];
            });

        return response()->json($txns);
    }

    public function consumption($reagentId)
    {
        $r = LabReagent::where('reagent_id', $reagentId)->first();
        if (!$r) return response()->json(['error' => 'Not found'], 404);

        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = Carbon::now()->subMonths($i);
            $usage = LabStockTransaction::where('reagent_id', $reagentId)
                ->where('type', 'Usage')
                ->whereMonth('created_at', $m->month)
                ->whereYear('created_at', $m->year)
                ->sum('quantity');
            $months[] = [
                'month' => $m->format('M Y'),
                'usage' => abs($usage),
            ];
        }

        $avgDaily = 0;
        $totalUsage = LabStockTransaction::where('reagent_id', $reagentId)
            ->where('type', 'Usage')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->sum('quantity');
        $avgDaily = round(abs($totalUsage) / 30, 1);

        $daysRemaining = $avgDaily > 0 ? round($r->current_stock / $avgDaily) : null;

        return response()->json([
            'testsPerKit' => $r->tests_per_kit,
            'remainingTests' => $r->remaining_tests,
            'remainingPct' => $r->tests_per_kit > 0 ? round(($r->remaining_tests / $r->tests_per_kit) * 100) : null,
            'avgDailyUsage' => $avgDaily,
            'daysRemaining' => $daysRemaining,
            'monthlyUsage' => $months,
        ]);
    }

    public function analyzerStatus()
    {
        $analyzers = [
            ['name' => 'Sysmex XN-1000', 'department' => 'Hematology', 'status' => 'Online', 'lastSync' => Carbon::now()->subMinutes(5)->toIso8601String()],
            ['name' => 'Cobas c311', 'department' => 'Clinical Chemistry', 'status' => 'Online', 'lastSync' => Carbon::now()->subMinutes(12)->toIso8601String()],
            ['name' => 'Vitros 5600', 'department' => 'Immunology', 'status' => 'Offline', 'lastSync' => Carbon::now()->subHours(2)->toIso8601String()],
            ['name' => 'BacT/ALERT 3D', 'department' => 'Microbiology', 'status' => 'Online', 'lastSync' => Carbon::now()->subMinutes(30)->toIso8601String()],
            ['name' => 'ABL90 FLEX', 'department' => 'Blood Gas', 'status' => 'Online', 'lastSync' => Carbon::now()->subMinutes(8)->toIso8601String()],
        ];

        foreach ($analyzers as &$a) {
            $reagents = LabReagent::where('analyzer_name', $a['name'])->get();
            $a['reagents'] = $reagents->map(function ($r) {
                $pct = $r->tests_per_kit > 0 ? round(($r->remaining_tests / $r->tests_per_kit) * 100) : 100;
                return [
                    'reagentId' => $r->reagent_id,
                    'name' => $r->name,
                    'remainingTests' => $r->remaining_tests,
                    'testsPerKit' => $r->tests_per_kit,
                    'pct' => $pct,
                    'status' => $pct < 20 ? 'Critical' : ($pct < 50 ? 'Low' : 'OK'),
                ];
            })->values();
        }

        return response()->json($analyzers);
    }

    public function adjust(Request $request)
    {
        $request->validate([
            'reagentId' => 'required|string',
            'adjustmentType' => 'required|in:increase,decrease,set',
            'quantity' => 'required|integer|min:0',
            'reason' => 'required|string',
        ]);

        $r = LabReagent::where('reagent_id', $request->reagentId)->first();
        if (!$r) return response()->json(['error' => 'Reagent not found'], 404);

        $oldStock = $r->current_stock;
        $type = $request->adjustmentType;
        $qty = $request->quantity;

        if ($type === 'increase') {
            $r->current_stock += $qty;
        } elseif ($type === 'decrease') {
            $r->current_stock = max(0, $r->current_stock - $qty);
        } else {
            $r->current_stock = $qty;
        }
        $r->save();

        $txnQty = $r->current_stock - $oldStock;
        LabStockTransaction::create([
            'reagent_id' => $r->reagent_id,
            'type' => 'Adjustment',
            'quantity' => $txnQty,
            'balance_after' => $r->current_stock,
            'reason' => $request->reason,
            'reference' => 'ADJ-' . date('Ymd-His'),
            'performed_by' => 'Lab Admin',
            'notes' => $request->notes,
        ]);

        return response()->json(['success' => true, 'newStock' => $r->current_stock]);
    }

    private function seedIfEmpty()
    {
        if (LabReagent::count() > 0) return;

        $items = [
            ['RGT-001', 'LR-0001', 'CBC Reagent Pack', 'Reagents', 'Hematology', 'Sysmex Corporation', 'XN-L-001', 'Kit', 12, 5, 25, 8, 45000, 'Refrigerated', '2-8°C', 'Fridge A-1', 'Sysmex XN-1000', 1000, 720],
            ['RGT-002', 'LR-0002', 'Hemoglobin Reagent', 'Reagents', 'Hematology', 'Sysmex Corporation', 'XN-HGB-02', 'Litre', 8, 3, 15, 5, 12000, 'Refrigerated', '2-8°C', 'Fridge A-1', 'Sysmex XN-1000', 500, 380],
            ['RGT-003', 'LR-0003', 'Clinical Chemistry Reagent Kit', 'Reagents', 'Chemistry', 'Roche Diagnostics', 'CC-311-K', 'Kit', 6, 3, 12, 4, 85000, 'Refrigerated', '2-8°C', 'Fridge B-2', 'Cobas c311', 2000, 1450],
            ['RGT-004', 'LR-0004', 'Lipid Panel Reagent', 'Reagents', 'Chemistry', 'Roche Diagnostics', 'LP-R-004', 'Kit', 4, 2, 10, 3, 35000, 'Refrigerated', '2-8°C', 'Fridge B-2', 'Cobas c311', 800, 195],
            ['RGT-005', 'LR-0005', 'Thyroid Function Reagent', 'Reagents', 'Immunology', 'Ortho Clinical', 'TFT-V56', 'Kit', 3, 2, 8, 3, 52000, 'Refrigerated', '2-8°C', 'Fridge C-1', 'Vitros 5600', 600, 410],
            ['RGT-006', 'LR-0006', 'Troponin I Reagent', 'Reagents', 'Immunology', 'Ortho Clinical', 'TROP-V56', 'Kit', 5, 2, 10, 3, 68000, 'Refrigerated', '2-8°C', 'Fridge C-1', 'Vitros 5600', 400, 280],
            ['RGT-007', 'LR-0007', 'Blood Culture Media', 'Reagents', 'Microbiology', 'bioMerieux', 'BC-3D-07', 'Bottle', 50, 20, 100, 30, 2500, 'Room Temperature', '15-25°C', 'Shelf D-3', 'BacT/ALERT 3D', null, null],
            ['RGT-008', 'LR-0008', 'ABG Cartridge Pack', 'Reagents', 'Blood Gas', 'Radiometer', 'ABL90-CP', 'Pack', 10, 4, 20, 6, 28000, 'Room Temperature', '15-25°C', 'Shelf E-1', 'ABL90 FLEX', 250, 165],
            ['RGT-009', 'LR-0009', 'Normal Control Serum L1', 'QC Materials', 'Multi-Dept', 'Bio-Rad', 'QC-L1-09', 'Vial', 15, 5, 30, 8, 8500, 'Frozen', '-20°C', 'Freezer F-1', null, null, null],
            ['RGT-010', 'LR-0010', 'Abnormal Control Serum L2', 'QC Materials', 'Multi-Dept', 'Bio-Rad', 'QC-L2-10', 'Vial', 12, 5, 30, 8, 9200, 'Frozen', '-20°C', 'Freezer F-1', null, null, null],
            ['RGT-011', 'LR-0011', 'Hematology Control (Low)', 'QC Materials', 'Hematology', 'Sysmex Corporation', 'QC-HEM-L', 'Vial', 8, 3, 15, 5, 6800, 'Refrigerated', '2-8°C', 'Fridge A-2', 'Sysmex XN-1000', null, null],
            ['RGT-012', 'LR-0012', 'Chemistry Calibrator Set', 'Calibrators', 'Chemistry', 'Roche Diagnostics', 'CAL-CC-12', 'Set', 4, 2, 8, 3, 42000, 'Refrigerated', '2-8°C', 'Fridge B-3', 'Cobas c311', null, null],
            ['RGT-013', 'LR-0013', 'ISE Calibrator', 'Calibrators', 'Chemistry', 'Roche Diagnostics', 'CAL-ISE-13', 'Pair', 6, 3, 12, 4, 15000, 'Refrigerated', '2-8°C', 'Fridge B-3', 'Cobas c311', null, null],
            ['RGT-014', 'LR-0014', 'EDTA Blood Collection Tubes', 'Consumables', 'Multi-Dept', 'BD Vacutainer', 'VAC-EDTA', 'Box (100)', 25, 10, 50, 15, 3200, 'Room Temperature', '15-25°C', 'Store G-1', null, null, null],
            ['RGT-015', 'LR-0015', 'Serum Separator Tubes (SST)', 'Consumables', 'Multi-Dept', 'BD Vacutainer', 'VAC-SST', 'Box (100)', 20, 10, 50, 15, 3800, 'Room Temperature', '15-25°C', 'Store G-1', null, null, null],
            ['RGT-016', 'LR-0016', 'Sodium Fluoride Tubes', 'Consumables', 'Chemistry', 'BD Vacutainer', 'VAC-NaF', 'Box (100)', 15, 5, 30, 8, 3500, 'Room Temperature', '15-25°C', 'Store G-1', null, null, null],
            ['RGT-017', 'LR-0017', 'Microscope Slides (Frosted)', 'Consumables', 'Multi-Dept', 'Corning', 'SLD-FR-17', 'Box (72)', 30, 10, 60, 15, 1200, 'Room Temperature', '15-25°C', 'Store G-2', null, null, null],
            ['RGT-018', 'LR-0018', 'Pipette Tips (200µL)', 'Consumables', 'Multi-Dept', 'Eppendorf', 'TIP-200', 'Box (1000)', 18, 8, 40, 12, 4500, 'Room Temperature', '15-25°C', 'Store G-3', null, null, null],
            ['RGT-019', 'LR-0019', 'Lancets (Sterile)', 'Consumables', 'Multi-Dept', 'BD Microtainer', 'LNC-ST-19', 'Box (200)', 12, 5, 25, 8, 2800, 'Room Temperature', '15-25°C', 'Store G-2', null, null, null],
            ['RGT-020', 'LR-0020', 'Gram Stain Kit', 'Stains & Chemicals', 'Microbiology', 'HiMedia Labs', 'GS-KIT-20', 'Kit', 5, 2, 10, 3, 3500, 'Room Temperature', '15-25°C', 'Shelf H-1', null, null, null],
            ['RGT-021', 'LR-0021', 'Giemsa Stain Solution', 'Stains & Chemicals', 'Hematology', 'Merck', 'GIM-SOL-21', 'Bottle (500ml)', 8, 3, 15, 5, 2200, 'Room Temperature', '15-25°C', 'Shelf H-1', null, null, null],
            ['RGT-022', 'LR-0022', 'Wrights Stain', 'Stains & Chemicals', 'Hematology', 'Merck', 'WRT-STN-22', 'Bottle (500ml)', 6, 3, 12, 4, 1800, 'Room Temperature', '15-25°C', 'Shelf H-1', null, null, null],
            ['RGT-023', 'LR-0023', 'Ziehl-Neelsen Stain Kit', 'Stains & Chemicals', 'Microbiology', 'HiMedia Labs', 'ZN-KIT-23', 'Kit', 3, 2, 8, 3, 4200, 'Room Temperature', '15-25°C', 'Shelf H-2', null, null, null],
            ['RGT-024', 'LR-0024', 'Immersion Oil', 'Stains & Chemicals', 'Multi-Dept', 'Merck', 'IMM-OIL-24', 'Bottle (100ml)', 10, 4, 20, 6, 1500, 'Room Temperature', '15-25°C', 'Shelf H-2', null, null, null],
            ['RGT-025', 'LR-0025', 'Molecular PCR Kit (COVID)', 'Reagents', 'Molecular Biology', 'Cepheid', 'GX-CV-25', 'Kit', 0, 5, 20, 8, 95000, 'Ultra-Frozen', '-80°C', 'Ultra-Freezer J-1', null, 0, 0],
            ['RGT-026', 'LR-0026', 'Urine Dipstick Strips', 'Consumables', 'Urinalysis', 'Siemens', 'URI-DIP-26', 'Bottle (100)', 22, 8, 40, 12, 4800, 'Room Temperature', '15-25°C', 'Store G-4', null, null, null],
            ['RGT-027', 'LR-0027', 'Coagulation Reagent Pack', 'Reagents', 'Hematology', 'Siemens', 'COAG-R-27', 'Kit', 3, 2, 8, 3, 55000, 'Frozen', '-20°C', 'Freezer F-2', null, 500, 120],
            ['RGT-028', 'LR-0028', 'HbA1c Reagent', 'Reagents', 'Chemistry', 'Bio-Rad', 'HBA1C-28', 'Kit', 2, 2, 6, 3, 38000, 'Refrigerated', '2-8°C', 'Fridge B-4', 'Cobas c311', 300, 45],
        ];

        foreach ($items as $i) {
            LabReagent::create([
                'reagent_id' => $i[0],
                'reagent_code' => $i[1],
                'name' => $i[2],
                'category' => $i[3],
                'sub_category' => $i[4],
                'manufacturer' => $i[5],
                'catalog_number' => $i[6],
                'unit' => $i[7],
                'current_stock' => $i[8],
                'min_stock' => $i[9],
                'max_stock' => $i[10],
                'reorder_point' => $i[11],
                'unit_price' => $i[12],
                'storage_condition' => $i[13],
                'storage_temp_range' => $i[14],
                'storage_location' => $i[15],
                'analyzer_name' => $i[16] ?? null,
                'tests_per_kit' => $i[17] ?? null,
                'remaining_tests' => $i[18] ?? null,
                'status' => $i[8] > 0 ? 'Active' : 'Out of Stock',
                'auto_reorder' => $i[8] < ($i[11] ?? 0),
            ]);
        }

        $batchId = 1;
        $suppliers = ['Lab Scientific Inc.', 'Diagnostica Stago', 'Fisher Scientific', 'VWR International', 'Sigma-Aldrich'];
        $now = Carbon::now();

        foreach ($items as $i) {
            $batchCount = ($i[3] === 'Consumables' || $i[3] === 'Stains & Chemicals') ? rand(2, 3) : rand(1, 3);
            $remaining = $i[8];

            for ($b = 0; $b < $batchCount && $remaining > 0; $b++) {
                $qty = ($b === $batchCount - 1) ? $remaining : max(1, intval($remaining / ($batchCount - $b)));
                $remaining -= $qty;

                $recDate = $now->copy()->subDays(rand(10, 120));
                $expDate = $recDate->copy()->addMonths(rand(6, 24));

                $lotNum = 'LOT-' . strtoupper(substr(md5($i[0] . $b), 0, 6));
                $batchNum = 'B-' . date('Ym', strtotime($recDate)) . '-' . sprintf('%03d', $batchId);

                $isVerified = rand(0, 3) > 0;

                LabReagentBatch::create([
                    'batch_id' => sprintf('LRB-%04d', $batchId++),
                    'reagent_id' => $i[0],
                    'lot_number' => $lotNum,
                    'batch_number' => $batchNum,
                    'received_date' => $recDate->toDateString(),
                    'expiry_date' => $expDate->toDateString(),
                    'opened_date' => rand(0, 1) ? $recDate->copy()->addDays(rand(1, 10))->toDateString() : null,
                    'qty_received' => max($qty, rand($qty, $qty + 5)),
                    'current_qty' => $qty,
                    'unit_price' => $i[12],
                    'supplier' => $suppliers[array_rand($suppliers)],
                    'status' => 'Active',
                    'qc_verified' => $isVerified,
                    'qc_verified_at' => $isVerified ? $recDate->copy()->addDays(rand(1, 3)) : null,
                    'qc_verified_by' => $isVerified ? 'QC Officer Hina' : null,
                    'qc_notes' => $isVerified ? 'QC passed within acceptable range' : null,
                ]);
            }
        }

        $txnTypes = ['Received', 'Usage', 'Adjustment', 'QC Use', 'Wastage'];
        foreach ($items as $i) {
            $balance = $i[8];
            for ($t = 0; $t < rand(5, 12); $t++) {
                $type = $txnTypes[array_rand($txnTypes)];
                $qty = ($type === 'Usage' || $type === 'Wastage' || $type === 'QC Use')
                    ? -rand(1, max(1, intval($i[8] / 5)))
                    : rand(1, max(1, intval($i[8] / 3)));
                $balance = max(0, $balance + $qty);

                LabStockTransaction::create([
                    'reagent_id' => $i[0],
                    'type' => $type,
                    'quantity' => $qty,
                    'balance_after' => $balance,
                    'reason' => $type === 'Usage' ? 'Patient testing' : ($type === 'QC Use' ? 'Daily QC run' : ($type === 'Wastage' ? 'Expired/damaged' : 'Stock replenishment')),
                    'reference' => 'TXN-' . strtoupper(substr(md5($i[0] . $t . time()), 0, 8)),
                    'performed_by' => ['Lab Tech. Sarah', 'Lab Tech. Amir', 'Lab Admin'][rand(0, 2)],
                    'created_at' => $now->copy()->subDays(rand(0, 60))->subHours(rand(0, 12)),
                ]);
            }
        }
    }
}
