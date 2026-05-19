<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PatientReturn;
use App\Models\WardReturn;
use App\Models\SupplierReturn;
use App\Models\DisposalRecord;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use Carbon\Carbon;

class ReturnsExpiryController extends Controller
{
    public function __construct()
    {
    }

    public function dashboard()
    {
        $patientReturns = PatientReturn::count();
        $patientReturnsPending = PatientReturn::where('status', 'Pending')->count();
        $wardReturns = WardReturn::count();
        $wardReturnsPending = WardReturn::where('status', 'Pending')->count();
        $supplierReturns = SupplierReturn::count();
        $supplierReturnsPending = SupplierReturn::whereIn('status', ['Draft', 'Initiated'])->count();

        $expired = MedicineBatch::where('expiry_date', '<', Carbon::now())
            ->where('current_qty', '>', 0)->get();
        $expiredCount = $expired->count();
        $expiredLoss = $expired->sum(function ($b) {
            $med = Medicine::where('medicine_id', $b->medicine_id)->first();
            return $b->current_qty * ($med->unit_price ?? 0);
        });

        $nearExpiry = MedicineBatch::where('expiry_date', '>', Carbon::now())
            ->where('expiry_date', '<', Carbon::now()->addMonths(6))
            ->where('current_qty', '>', 0)->count();

        $disposals = DisposalRecord::count();
        $disposalsPending = DisposalRecord::where('status', 'Pending')->count();

        $totalRefunds = PatientReturn::where('status', 'Approved')->sum('refund_amount');

        return response()->json([
            'patientReturns' => $patientReturns,
            'patientReturnsPending' => $patientReturnsPending,
            'wardReturns' => $wardReturns,
            'wardReturnsPending' => $wardReturnsPending,
            'supplierReturns' => $supplierReturns,
            'supplierReturnsPending' => $supplierReturnsPending,
            'expiredCount' => $expiredCount,
            'expiredLoss' => $expiredLoss,
            'nearExpiryCount' => $nearExpiry,
            'disposals' => $disposals,
            'disposalsPending' => $disposalsPending,
            'totalRefunds' => $totalRefunds,
        ]);
    }

    public function patientReturns(Request $request)
    {
        $query = PatientReturn::orderBy('created_at', 'desc');
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('return_id', 'LIKE', "%{$s}%")
                  ->orWhere('patient_name', 'LIKE', "%{$s}%")
                  ->orWhere('mrn', 'LIKE', "%{$s}%")
                  ->orWhere('medicine_name', 'LIKE', "%{$s}%");
            });
        }
        return response()->json($query->get());
    }

    public function processPatientReturn(Request $request)
    {
        $validated = $request->validate([
            'returnId' => 'required|string',
            'condition' => 'required|string',
            'refundMethod' => 'required|string',
            'refundAmount' => 'required|numeric',
        ]);

        $return = PatientReturn::where('return_id', $validated['returnId'])->first();
        if (!$return) return response()->json(['error' => 'Return not found'], 404);

        $canRestock = $validated['condition'] === 'Unopened' && $this->expiryMonthsRemaining($return->expiry_date) >= 6;

        $return->update([
            'condition' => $validated['condition'],
            'can_restock' => $canRestock,
            'refund_method' => $validated['refundMethod'],
            'refund_amount' => $validated['refundAmount'],
            'status' => 'Approved',
            'processed_by' => 'Pharmacist Ahmed',
            'processed_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Return processed. Refund of PKR ' . number_format($validated['refundAmount']) . ' approved via ' . $validated['refundMethod'] . '.',
            'canRestock' => $canRestock,
        ]);
    }

    public function createPatientReturn(Request $request)
    {
        $validated = $request->validate([
            'patientName' => 'required|string',
            'mrn' => 'required|string',
            'orderId' => 'nullable|string',
            'medicineName' => 'required|string',
            'batchNumber' => 'nullable|string',
            'expiryDate' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
            'patientNotes' => 'nullable|string',
            'originalAmount' => 'required|numeric',
        ]);

        $seq = PatientReturn::count() + 1;
        $returnId = 'RTN-' . str_pad($seq, 3, '0', STR_PAD_LEFT);

        $daysSincePurchase = 3;
        $refundAmount = $daysSincePurchase <= 7 ? $validated['originalAmount'] : $validated['originalAmount'] * 0.8;

        $return = PatientReturn::create([
            'return_id' => $returnId,
            'return_date' => Carbon::today(),
            'patient_name' => $validated['patientName'],
            'mrn' => $validated['mrn'],
            'order_id' => $validated['orderId'],
            'purchase_date' => Carbon::today()->subDays($daysSincePurchase),
            'medicine_name' => $validated['medicineName'],
            'batch_number' => $validated['batchNumber'],
            'expiry_date' => $validated['expiryDate'],
            'quantity' => $validated['quantity'],
            'reason' => $validated['reason'],
            'patient_notes' => $validated['patientNotes'],
            'original_amount' => $validated['originalAmount'],
            'refund_amount' => $refundAmount,
            'status' => 'Pending',
        ]);

        return response()->json(['success' => true, 'returnId' => $returnId, 'message' => 'Patient return created']);
    }

    public function wardReturns(Request $request)
    {
        $query = WardReturn::orderBy('created_at', 'desc');
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->get());
    }

    public function processWardReturn(Request $request)
    {
        $validated = $request->validate([
            'returnId' => 'required|string',
            'action' => 'required|string',
        ]);

        $wr = WardReturn::where('return_id', $validated['returnId'])->first();
        if (!$wr) return response()->json(['error' => 'Ward return not found'], 404);

        $newStatus = $validated['action'] === 'receive' ? 'Received' : 'Processed';
        $wr->update([
            'status' => $newStatus,
            'received_by' => $validated['action'] === 'receive' ? 'Pharmacist Ahmed' : $wr->received_by,
            'processed_by' => $validated['action'] === 'process' ? 'Pharmacist Ahmed' : $wr->processed_by,
        ]);

        return response()->json([
            'success' => true,
            'message' => $validated['action'] === 'receive'
                ? 'Ward return received. Verify items and process.'
                : 'Ward return processed. Stock and billing updated.',
        ]);
    }

    public function supplierReturns(Request $request)
    {
        $query = SupplierReturn::orderBy('created_at', 'desc');
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->get());
    }

    public function createSupplierReturn(Request $request)
    {
        $validated = $request->validate([
            'supplierId' => 'required|string',
            'supplierName' => 'required|string',
            'poReference' => 'nullable|string',
            'reason' => 'required|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
        ]);

        $seq = SupplierReturn::count() + 1;
        $rtvId = 'RTV-' . str_pad($seq, 3, '0', STR_PAD_LEFT);

        $totalCredit = collect($validated['items'])->sum('credit');

        $rtv = SupplierReturn::create([
            'rtv_id' => $rtvId,
            'supplier_id' => $validated['supplierId'],
            'supplier_name' => $validated['supplierName'],
            'po_reference' => $validated['poReference'],
            'return_date' => Carbon::today(),
            'items' => $validated['items'],
            'items_count' => count($validated['items']),
            'reason' => $validated['reason'],
            'notes' => $validated['notes'],
            'total_credit' => $totalCredit,
            'status' => 'Draft',
            'created_by' => 'Pharmacist Ahmed',
        ]);

        return response()->json(['success' => true, 'rtvId' => $rtvId, 'message' => 'RTV created']);
    }

    public function submitRtv(Request $request)
    {
        $validated = $request->validate(['rtvId' => 'required|string']);
        $rtv = SupplierReturn::where('rtv_id', $validated['rtvId'])->first();
        if (!$rtv) return response()->json(['error' => 'RTV not found'], 404);

        $rtv->update(['status' => 'Initiated']);
        return response()->json(['success' => true, 'message' => 'RTV submitted to supplier']);
    }

    public function updateRtvStatus(Request $request)
    {
        $validated = $request->validate([
            'rtvId' => 'required|string',
            'status' => 'required|string',
        ]);
        $rtv = SupplierReturn::where('rtv_id', $validated['rtvId'])->first();
        if (!$rtv) return response()->json(['error' => 'RTV not found'], 404);

        $rtv->update(['status' => $validated['status']]);
        return response()->json(['success' => true, 'message' => 'RTV status updated to ' . $validated['status']]);
    }

    public function expiredStock()
    {
        $expired = MedicineBatch::where('expiry_date', '<', Carbon::now())
            ->where('current_qty', '>', 0)
            ->orderBy('expiry_date')
            ->get();

        $items = $expired->map(function ($batch) {
            $med = Medicine::where('medicine_id', $batch->medicine_id)->first();
            $daysExpired = (int) Carbon::parse($batch->expiry_date)->diffInDays(Carbon::now());
            return [
                'medicineId' => $batch->medicine_id,
                'medicineName' => $med->name ?? $batch->medicine_id,
                'batchNumber' => $batch->batch_number,
                'batchId' => $batch->batch_id ?? '',
                'expiryDate' => Carbon::parse($batch->expiry_date)->format('d-M-Y'),
                'daysExpired' => $daysExpired,
                'qty' => $batch->current_qty,
                'unit' => $med->stock_unit ?? 'strips',
                'purchaseValue' => $batch->current_qty * ($med->unit_price ?? 0),
                'disposalStatus' => 'Pending',
            ];
        });

        return response()->json([
            'items' => $items->values(),
            'totalCount' => $items->count(),
            'totalLoss' => $items->sum('purchaseValue'),
        ]);
    }

    public function nearExpiry()
    {
        $batches = MedicineBatch::where('expiry_date', '>', Carbon::now())
            ->where('expiry_date', '<', Carbon::now()->addMonths(6))
            ->where('current_qty', '>', 0)
            ->orderBy('expiry_date')
            ->get();

        $items = $batches->map(function ($batch) {
            $med = Medicine::where('medicine_id', $batch->medicine_id)->first();
            $daysRemaining = (int) Carbon::now()->diffInDays(Carbon::parse($batch->expiry_date));
            $avgDailyUsage = ($med->current_stock ?? 0) > 0 ? max(1, intval(($med->current_stock ?? 0) / 30)) : 1;
            $willConsume = ($batch->current_qty / $avgDailyUsage) <= $daysRemaining;

            $recommendation = 'Use First';
            if (!$willConsume && $daysRemaining > 90) $recommendation = 'Return/Discount';
            elseif (!$willConsume && $daysRemaining <= 90) $recommendation = 'Discount Sale';
            elseif ($daysRemaining <= 30) $recommendation = 'Accept Loss';

            return [
                'medicineId' => $batch->medicine_id,
                'medicineName' => $med->name ?? $batch->medicine_id,
                'batchNumber' => $batch->batch_number,
                'expiryDate' => Carbon::parse($batch->expiry_date)->format('d-M-Y'),
                'expiryMonth' => Carbon::parse($batch->expiry_date)->format('M Y'),
                'daysRemaining' => $daysRemaining,
                'qty' => $batch->current_qty,
                'unit' => $med->stock_unit ?? 'strips',
                'estimatedUsage' => $willConsume ? 'Will consume' : 'Excess',
                'recommendation' => $recommendation,
            ];
        });

        return response()->json($items->values());
    }

    public function disposals(Request $request)
    {
        $query = DisposalRecord::orderBy('created_at', 'desc');
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->get());
    }

    public function createDisposal(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'disposalMethod' => 'required|string',
            'disposalFacility' => 'nullable|string',
            'certificateNumber' => 'nullable|string',
            'witness1' => 'nullable|string',
            'witness2' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $seq = DisposalRecord::count() + 1;
        $disposalId = 'DSP-' . date('Y') . '-' . str_pad($seq, 3, '0', STR_PAD_LEFT);
        $totalLoss = collect($validated['items'])->sum('purchaseValue');

        $disposal = DisposalRecord::create([
            'disposal_id' => $disposalId,
            'items' => $validated['items'],
            'items_count' => count($validated['items']),
            'total_loss' => $totalLoss,
            'disposal_method' => $validated['disposalMethod'],
            'disposal_facility' => $validated['disposalFacility'],
            'certificate_number' => $validated['certificateNumber'],
            'disposal_date' => Carbon::today(),
            'witness_1' => $validated['witness1'],
            'witness_2' => $validated['witness2'],
            'disposed_by' => 'Pharmacist Ahmed',
            'authorized_by' => 'Pharmacy Manager',
            'status' => 'Completed',
            'notes' => $validated['notes'],
        ]);

        return response()->json([
            'success' => true,
            'disposalId' => $disposalId,
            'message' => 'Disposal record created. Loss of PKR ' . number_format($totalLoss) . ' recorded.',
        ]);
    }

    private function expiryMonthsRemaining($expiryStr)
    {
        if (!$expiryStr) return 0;
        try {
            $expDate = Carbon::parse($expiryStr);
            return max(0, (int) Carbon::now()->diffInMonths($expDate));
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function DEAD_seedIfEmpty()
    {
        if (PatientReturn::count() > 0) return;

        $patientReturns = [
            [
                'return_id' => 'RTN-001', 'return_date' => Carbon::today()->subDays(1),
                'patient_name' => 'Ahmed Ali', 'mrn' => 'MRN-2026-0001',
                'order_id' => 'RX-2026-0125', 'purchase_date' => Carbon::today()->subDays(6),
                'medicine_name' => 'Panadol 500mg', 'medicine_id' => 'MED-1',
                'batch_number' => 'B2024-05', 'expiry_date' => 'Dec 2025',
                'quantity' => 1, 'unit' => 'strip', 'reason' => 'Medicine not needed',
                'patient_notes' => 'Doctor changed prescription',
                'condition' => 'Unopened', 'original_amount' => 50, 'refund_amount' => 50,
                'status' => 'Pending',
            ],
            [
                'return_id' => 'RTN-002', 'return_date' => Carbon::today()->subDays(2),
                'patient_name' => 'Sara Khan', 'mrn' => 'MRN-2026-0002',
                'order_id' => 'RX-2026-0089', 'purchase_date' => Carbon::today()->subDays(3),
                'medicine_name' => 'Augmentin 625mg', 'medicine_id' => 'MED-2',
                'batch_number' => 'B2025-02', 'expiry_date' => 'Aug 2026',
                'quantity' => 1, 'unit' => 'strip', 'reason' => 'Wrong medicine dispensed',
                'patient_notes' => 'Pharmacy error - wrong strength dispensed',
                'condition' => 'Unopened', 'original_amount' => 270, 'refund_amount' => 270,
                'status' => 'Approved', 'refund_method' => 'Cash Refund',
                'processed_by' => 'Pharmacist Ahmed', 'processed_at' => Carbon::today()->subDays(1),
            ],
            [
                'return_id' => 'RTN-003', 'return_date' => Carbon::today()->subDays(3),
                'patient_name' => 'Usman Ali', 'mrn' => 'MRN-2026-0003',
                'order_id' => 'RX-2026-0078', 'purchase_date' => Carbon::today()->subDays(5),
                'medicine_name' => 'Risek 20mg', 'medicine_id' => 'MED-7',
                'batch_number' => 'B2024-11', 'expiry_date' => 'May 2026',
                'quantity' => 2, 'unit' => 'strips', 'reason' => 'Patient condition improved',
                'patient_notes' => 'Symptoms resolved after 3 days',
                'condition' => 'Opened', 'original_amount' => 130, 'refund_amount' => 0,
                'status' => 'Rejected', 'processed_by' => 'Pharmacist Ahmed',
                'processed_at' => Carbon::today()->subDays(2),
            ],
            [
                'return_id' => 'RTN-004', 'return_date' => Carbon::today(),
                'patient_name' => 'Fatima Bibi', 'mrn' => 'MRN-2026-0004',
                'order_id' => 'RX-2026-0104', 'purchase_date' => Carbon::today()->subDays(2),
                'medicine_name' => 'Losartan 50mg', 'medicine_id' => 'MED-6',
                'batch_number' => 'B2024-10', 'expiry_date' => 'Jun 2026',
                'quantity' => 1, 'unit' => 'strip', 'reason' => 'Adverse reaction',
                'patient_notes' => 'Patient developed cough - switched to ARB',
                'condition' => 'Unopened', 'original_amount' => 85, 'refund_amount' => 85,
                'status' => 'Pending',
            ],
            [
                'return_id' => 'RTN-005', 'return_date' => Carbon::today(),
                'patient_name' => 'Bilal Ahmed', 'mrn' => 'MRN-2026-0005',
                'order_id' => 'RX-2026-0119', 'purchase_date' => Carbon::today()->subDays(1),
                'medicine_name' => 'Flagyl 400mg', 'medicine_id' => 'MED-10',
                'batch_number' => 'B2024-04', 'expiry_date' => 'Mar 2026',
                'quantity' => 1, 'unit' => 'strip', 'reason' => 'Duplicate dispensing',
                'patient_notes' => 'Already had this medicine from morning visit',
                'condition' => 'Unopened', 'original_amount' => 120, 'refund_amount' => 120,
                'status' => 'Pending',
            ],
        ];

        foreach ($patientReturns as $pr) {
            PatientReturn::create($pr);
        }

        $wardReturns = [
            [
                'return_id' => 'WR-001', 'ward_name' => 'Ward A', 'return_date' => Carbon::today()->subDays(1),
                'items' => [
                    ['name' => 'Panadol 500mg', 'batch' => 'B2025-01', 'qty' => 3, 'unit' => 'strips', 'value' => 150, 'condition' => 'Good'],
                    ['name' => 'Augmentin 625mg', 'batch' => 'B2025-02', 'qty' => 2, 'unit' => 'strips', 'value' => 540, 'condition' => 'Good'],
                    ['name' => 'Risek 20mg', 'batch' => 'B2024-11', 'qty' => 3, 'unit' => 'strips', 'value' => 195, 'condition' => 'Good'],
                ],
                'items_count' => 8, 'total_value' => 2500, 'status' => 'Received',
                'received_by' => 'Pharmacist Ahmed',
            ],
            [
                'return_id' => 'WR-002', 'ward_name' => 'ICU', 'return_date' => Carbon::today()->subDays(2),
                'items' => [
                    ['name' => 'NovoRapid Insulin', 'batch' => 'B2025-05', 'qty' => 2, 'unit' => 'vials', 'value' => 2400, 'condition' => 'Good'],
                    ['name' => 'Ceftriaxone 1g', 'batch' => 'B2025-03', 'qty' => 3, 'unit' => 'vials', 'value' => 800, 'condition' => 'Good'],
                ],
                'items_count' => 5, 'total_value' => 3200, 'status' => 'Pending',
            ],
            [
                'return_id' => 'WR-003', 'ward_name' => 'Ward B', 'return_date' => Carbon::today(),
                'items' => [
                    ['name' => 'Panadol 500mg', 'batch' => 'B2025-01', 'qty' => 5, 'unit' => 'strips', 'value' => 250, 'condition' => 'Good'],
                    ['name' => 'Flagyl 400mg', 'batch' => 'B2024-04', 'qty' => 2, 'unit' => 'strips', 'value' => 240, 'condition' => 'Good'],
                    ['name' => 'Zithromax 500mg', 'batch' => 'B2024-05', 'qty' => 1, 'unit' => 'strip', 'value' => 145, 'condition' => 'Good'],
                    ['name' => 'Losartan 50mg', 'batch' => 'B2024-10', 'qty' => 3, 'unit' => 'strips', 'value' => 255, 'condition' => 'Good'],
                ],
                'items_count' => 11, 'total_value' => 890, 'status' => 'Pending',
            ],
        ];

        foreach ($wardReturns as $wr) {
            WardReturn::create($wr);
        }

        $supplierReturns = [
            [
                'rtv_id' => 'RTV-001', 'supplier_id' => 'SUP-1', 'supplier_name' => 'ABC Pharmaceuticals Ltd.',
                'po_reference' => 'PO-2026-040', 'return_date' => Carbon::today()->subDays(1),
                'items' => [
                    ['name' => 'Augmentin 625mg', 'batch' => 'B2025-12', 'qty' => 50, 'unit' => 'strips', 'reason' => 'Short expiry', 'credit' => 12500],
                ],
                'items_count' => 1, 'reason' => 'Short expiry', 'total_credit' => 12500,
                'status' => 'Initiated', 'created_by' => 'Pharmacist Ahmed',
            ],
            [
                'rtv_id' => 'RTV-002', 'supplier_id' => 'SUP-4', 'supplier_name' => 'HealthCare Distributors',
                'po_reference' => 'PO-2026-038', 'return_date' => Carbon::today()->subDays(4),
                'items' => [
                    ['name' => 'Panadol 500mg', 'batch' => 'B2025-10', 'qty' => 30, 'unit' => 'strips', 'reason' => 'Damaged', 'credit' => 1350],
                ],
                'items_count' => 1, 'reason' => 'Damaged on arrival', 'total_credit' => 1350,
                'status' => 'Shipped', 'created_by' => 'Pharmacist Ahmed',
            ],
            [
                'rtv_id' => 'RTV-003', 'supplier_id' => 'SUP-5', 'supplier_name' => 'MedLine Traders',
                'po_reference' => 'PO-2026-035', 'return_date' => Carbon::today()->subDays(7),
                'items' => [
                    ['name' => 'Metformin 850mg', 'batch' => 'B2024-08', 'qty' => 20, 'unit' => 'strips', 'reason' => 'Product recall', 'credit' => 1600],
                    ['name' => 'Glucophage XR 500mg', 'batch' => 'B2024-09', 'qty' => 15, 'unit' => 'strips', 'reason' => 'Product recall', 'credit' => 1200],
                ],
                'items_count' => 2, 'reason' => 'Product recall', 'total_credit' => 2800,
                'status' => 'Credit Received', 'created_by' => 'Pharmacist Ahmed',
            ],
        ];

        foreach ($supplierReturns as $sr) {
            SupplierReturn::create($sr);
        }

        DisposalRecord::create([
            'disposal_id' => 'DSP-2026-001',
            'items' => [
                ['name' => 'Ciprofloxacin 500mg', 'batch' => 'B2023-12', 'qty' => 15, 'unit' => 'strips', 'purchaseValue' => 2250],
            ],
            'items_count' => 1, 'total_loss' => 2250,
            'disposal_method' => 'Waste Management Company',
            'disposal_facility' => 'SafeDispose Pvt Ltd',
            'certificate_number' => 'CERT-2026-045',
            'disposal_date' => Carbon::today()->subDays(5),
            'witness_1' => 'Pharmacist Ahmed', 'witness_2' => 'Dr. Ayesha Siddiqui',
            'disposed_by' => 'Pharmacist Ahmed', 'authorized_by' => 'Pharmacy Manager',
            'status' => 'Completed',
        ]);
    }
}
