<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PharmacyTransaction;
use App\Models\MedicationOrder;
use App\Models\PanelClaim;
use App\Models\CashReconciliation;
use App\Models\Medicine;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PharmacyBillingController extends Controller
{
    use HmsHelpers;

    public function __construct()
    {
    }

    public function dashboard()
    {
        $today = Carbon::today();
        $todayTxns = PharmacyTransaction::whereDate('transaction_date', $today);

        $todaySales = (clone $todayTxns)->where('payment_status', 'Paid')->sum('total_amount');
        $pendingPayments = PharmacyTransaction::where('payment_status', 'Pending')->sum('total_amount');
        $outstandingIpd = PharmacyTransaction::where('department', 'IPD')
            ->where('payment_status', '!=', 'Paid')->sum('total_amount');
        $panelOutstanding = PanelClaim::whereIn('status', ['Submitted', 'Approved'])->sum('claim_amount');
        $cashSales = (clone $todayTxns)->where('payment_mode', 'Cash')->where('payment_status', 'Paid')->sum('total_amount');
        $cardSales = (clone $todayTxns)->whereIn('payment_mode', ['Card', 'Mobile'])->where('payment_status', 'Paid')->sum('total_amount');

        $outstandingEr = MedicationOrder::where('department', 'ER')
            ->whereIn('status', ['Ready', 'Completed'])
            ->where('order_value', '>', 0)
            ->where(function ($q) {
                $q->where('payment_status', '!=', 'Paid')->orWhereNull('payment_status');
            })->sum('order_value');

        return response()->json([
            'todaySales'      => round($todaySales, 2),
            'pendingPayments' => round($pendingPayments, 2),
            'outstandingIpd'  => round($outstandingIpd, 2),
            'outstandingEr'   => round($outstandingEr, 2),
            'panelOutstanding'=> round($panelOutstanding, 2),
            'cashSales'       => round($cashSales, 2),
            'cardSales'       => round($cardSales, 2),
        ]);
    }

    public function revenueBreakdown(Request $request)
    {
        $period = $request->query('period', 'today');
        $query = PharmacyTransaction::where('payment_status', 'Paid');

        if ($period === 'today') {
            $query->whereDate('transaction_date', Carbon::today());
        } else {
            $query->whereMonth('transaction_date', Carbon::now()->month)
                  ->whereYear('transaction_date', Carbon::now()->year);
        }

        $byDept = $query->clone()
            ->selectRaw("department, SUM(total_amount) as total")
            ->groupBy('department')
            ->orderByDesc('total')
            ->get();

        $grandTotal = $byDept->sum('total');

        $departments = $byDept->map(function ($row) use ($grandTotal) {
            return [
                'department' => $row->department,
                'total' => round($row->total, 2),
                'percentage' => $grandTotal > 0 ? round(($row->total / $grandTotal) * 100) : 0,
            ];
        });

        $byPayCat = $query->clone()
            ->selectRaw("billed_to, SUM(total_amount) as total")
            ->groupBy('billed_to')
            ->orderByDesc('total')
            ->get();

        $payCategories = $byPayCat->map(function ($row) use ($grandTotal) {
            return [
                'category' => $row->billed_to,
                'total' => round($row->total, 2),
                'percentage' => $grandTotal > 0 ? round(($row->total / $grandTotal) * 100) : 0,
            ];
        });

        return response()->json([
            'grandTotal' => round($grandTotal, 2),
            'departments' => $departments,
            'paymentCategories' => $payCategories,
        ]);
    }

    public function transactions(Request $request)
    {
        $query = PharmacyTransaction::query();

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }
        if ($request->filled('paymentStatus')) {
            $query->where('payment_status', $request->paymentStatus);
        }
        if ($request->filled('reconciliation')) {
            $query->where('reconciliation_status', $request->reconciliation);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('transaction_id', 'LIKE', "%{$s}%")
                  ->orWhere('patient_name', 'LIKE', "%{$s}%")
                  ->orWhere('mrn', 'LIKE', "%{$s}%")
                  ->orWhere('order_id', 'LIKE', "%{$s}%");
            });
        }

        $txns = $query->orderByDesc('transaction_date')->limit(100)->get();

        return response()->json($this->toCamelCollection($txns));
    }

    public function transactionDetail($txnId)
    {
        $txn = PharmacyTransaction::where('transaction_id', $txnId)->first();
        if (!$txn) return response()->json(['error' => 'Transaction not found'], 404);

        return response()->json($this->toCamel($txn));
    }

    public function createTransaction(Request $request)
    {
        try {
            $items      = $request->input('items', []);
            $subtotal   = (float) $request->input('subtotal', 0);
            $discount   = (float) $request->input('discount', 0);
            $total      = (float) $request->input('total', 0);
            $payMode    = ucfirst($request->input('paymentMethod', 'Cash'));
            $isPaid     = strtolower($payMode) === 'cash';
            $custType   = $request->input('customerType', 'walkin');
            $dept       = $request->input('department', 'Walk-in');
            $mrn        = $request->input('mrn') ?: null;
            $patientName = $request->input('patientName') ?: ($custType === 'walkin' ? 'Walk-in Customer' : 'Patient');
            $orderId    = $request->input('orderId') ?: null;
            $orderedBy  = $request->input('orderedBy') ?: null;

            $txnId = $this->generateYearId(PharmacyTransaction::class, 'transaction_id', 'TXN');

            $txn = PharmacyTransaction::create([
                'transaction_id'        => $txnId,
                'transaction_date'      => Carbon::now(),
                'patient_name'          => $patientName,
                'mrn'                   => $mrn,
                'department'            => $dept,
                'order_id'              => $orderId ?? $txnId,
                'subtotal'              => round($subtotal, 2),
                'discount'              => round($discount, 2),
                'tax'                   => 0,
                'total_amount'          => round($total, 2),
                'payment_mode'          => $payMode,
                'payment_status'        => $isPaid ? 'Paid' : 'Pending',
                'billed_to'             => 'Patient',
                'charge_posted'         => true,
                'reconciliation_status' => 'Pending',
                'receipt_number'        => str_replace('TXN', 'RCP', $txnId),
                'billing_reference'     => $orderId ?? $txnId,
                'ordered_by'            => $orderedBy,
                'received_by'           => 'POS Cashier',
                'items'                 => $items,
            ]);

            return response()->json(['success' => true, 'transactionId' => $txnId], 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function pendingOPD()
    {
        $items = PharmacyTransaction::whereIn('department', ['OPD', 'Walk-in'])
            ->where('payment_status', 'Pending')
            ->orderByDesc('transaction_date')
            ->get()
            ->map(function ($txn) {
                $days = Carbon::parse($txn->transaction_date)->diffInDays(Carbon::now());
                return [
                    'transactionId' => $txn->transaction_id,
                    'patientName' => $txn->patient_name,
                    'mrn' => $txn->mrn,
                    'date' => Carbon::parse($txn->transaction_date)->format('d-M-Y'),
                    'orderId' => $txn->order_id,
                    'amountDue' => round($txn->total_amount, 2),
                    'daysPending' => $days . ' days',
                ];
            });

        return response()->json([
            'items' => $items,
            'totalPending' => round($items->sum('amountDue'), 2),
        ]);
    }

    public function pendingIPD()
    {
        // PharmacyTransaction-based IPD pending (pre-existing billing records)
        $txnItems = PharmacyTransaction::where('department', 'IPD')
            ->where('payment_status', '!=', 'Paid')
            ->orderByDesc('transaction_date')
            ->get()
            ->map(function ($txn) {
                return [
                    'transactionId' => $txn->transaction_id,
                    'patientName'   => $txn->patient_name,
                    'mrn'           => $txn->mrn,
                    'ipdNumber'     => $txn->billing_reference ?? '-',
                    'totalCharges'  => round($txn->total_amount, 2),
                    'lastUpdated'   => Carbon::parse($txn->transaction_date)->format('d-M-Y'),
                    'source'        => 'transaction',
                ];
            });

        // Dispensed IPD medication orders (status Ready or Completed, not yet billed)
        $dispensedOrders = MedicationOrder::where('department', 'IPD')
            ->whereIn('status', ['Ready', 'Completed'])
            ->where('order_value', '>', 0)
            ->where(function ($q) {
                $q->where('payment_status', '!=', 'Paid')
                  ->orWhereNull('payment_status');
            })
            ->orderByDesc('dispensed_at')
            ->get()
            ->map(function ($order) {
                return [
                    'transactionId' => $order->order_id,
                    'patientName'   => $order->patient_name,
                    'mrn'           => $order->mrn,
                    'ipdNumber'     => $order->visit_number ?? $order->order_id,
                    'totalCharges'  => round($order->order_value, 2),
                    'lastUpdated'   => $order->dispensed_at
                                        ? Carbon::parse($order->dispensed_at)->format('d-M-Y')
                                        : Carbon::parse($order->order_time)->format('d-M-Y'),
                    'source'        => 'dispensing',
                    'orderStatus'   => $order->status,
                ];
            });

        $items = $txnItems->merge($dispensedOrders)->values();

        return response()->json([
            'items'        => $items,
            'totalRunning' => round($items->sum('totalCharges'), 2),
        ]);
    }

    public function ipdOrderDetail($orderId)
    {
        $order = MedicationOrder::where('order_id', $orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $rawItems = is_array($order->items) ? $order->items : json_decode($order->items, true) ?? [];
        $items = array_map(function ($i) {
            return [
                'name'      => $i['name'] ?? '-',
                'qty'       => $i['totalQty'] ?? 0,
                'unitPrice' => round($i['unitPrice'] ?? 0, 2),
                'total'     => round($i['total'] ?? 0, 2),
            ];
        }, $rawItems);

        $total = round($order->order_value ?? 0, 2);

        return response()->json([
            'transactionId'       => $order->order_id,
            'patientName'         => $order->patient_name,
            'mrn'                 => $order->mrn,
            'orderId'             => $order->order_id,
            'transactionDate'     => $order->order_time,
            'department'          => $order->department,
            'orderedBy'           => $order->ordered_by ?? '-',
            'items'               => $items,
            'subtotal'            => $total,
            'discount'            => 0,
            'tax'                 => 0,
            'totalAmount'         => $total,
            'paymentMode'         => 'IPD Account',
            'paymentStatus'       => $order->payment_status ?? 'Pending',
            'billedTo'            => 'IPD',
            'receiptNumber'       => null,
            'receivedBy'          => $order->dispensed_by ?? '-',
            'chargePosted'        => true,
            'billingReference'    => $order->visit_number ?? $order->order_id,
            'reconciliationStatus'=> 'Pending',
        ]);
    }

    public function pendingER()
    {
        $dispensedOrders = MedicationOrder::where('department', 'ER')
            ->whereIn('status', ['Ready', 'Completed'])
            ->where('order_value', '>', 0)
            ->where(function ($q) {
                $q->where('payment_status', '!=', 'Paid')
                  ->orWhereNull('payment_status');
            })
            ->orderByDesc('dispensed_at')
            ->get()
            ->map(function ($order) {
                return [
                    'transactionId' => $order->order_id,
                    'patientName'   => $order->patient_name,
                    'mrn'           => $order->mrn,
                    'visitNumber'   => $order->visit_number ?? $order->order_id,
                    'totalCharges'  => round($order->order_value, 2),
                    'orderStatus'   => $order->status,
                    'lastUpdated'   => $order->dispensed_at
                                        ? Carbon::parse($order->dispensed_at)->format('d-M-Y H:i')
                                        : Carbon::parse($order->order_time)->format('d-M-Y H:i'),
                    'source'        => 'dispensing',
                ];
            });

        return response()->json([
            'items'        => $dispensedOrders->values(),
            'totalRunning' => round($dispensedOrders->sum('totalCharges'), 2),
        ]);
    }

    public function erOrderDetail($orderId)
    {
        $order = MedicationOrder::where('order_id', $orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $rawItems = is_array($order->items) ? $order->items : json_decode($order->items, true) ?? [];
        $items = array_map(function ($i) {
            return [
                'name'      => $i['name'] ?? '-',
                'qty'       => $i['totalQty'] ?? 0,
                'unitPrice' => round($i['unitPrice'] ?? 0, 2),
                'total'     => round($i['total'] ?? 0, 2),
            ];
        }, $rawItems);

        $total = round($order->order_value ?? 0, 2);

        return response()->json([
            'transactionId'       => $order->order_id,
            'patientName'         => $order->patient_name,
            'mrn'                 => $order->mrn,
            'orderId'             => $order->order_id,
            'transactionDate'     => $order->order_time,
            'department'          => 'ER',
            'orderedBy'           => $order->ordered_by ?? '-',
            'items'               => $items,
            'subtotal'            => $total,
            'discount'            => 0,
            'tax'                 => 0,
            'totalAmount'         => $total,
            'paymentMode'         => 'ER Account',
            'paymentStatus'       => $order->payment_status ?? 'Pending',
            'billedTo'            => 'Emergency',
            'receiptNumber'       => null,
            'receivedBy'          => $order->dispensed_by ?? '-',
            'chargePosted'        => true,
            'billingReference'    => $order->visit_number ?? $order->order_id,
            'reconciliationStatus'=> 'Pending',
        ]);
    }

    public function pendingPanel()
    {
        $claims = PanelClaim::orderByDesc('claim_date')->get()->map(function ($c) {
            return [
                'claimId' => $c->claim_id,
                'patientName' => $c->patient_name,
                'mrn' => $c->mrn,
                'company' => $c->company,
                'claimDate' => Carbon::parse($c->claim_date)->format('d-M-Y'),
                'claimAmount' => round($c->claim_amount, 2),
                'status' => $c->status,
                'policyNumber' => $c->policy_number,
            ];
        });

        $totalOutstanding = PanelClaim::whereIn('status', ['Submitted', 'Approved'])->sum('claim_amount');

        return response()->json([
            'items' => $claims,
            'totalOutstanding' => round($totalOutstanding, 2),
        ]);
    }

    public function collectPayment(Request $request)
    {
        $request->validate([
            'transactionId' => 'required|string',
            'paymentMode' => 'required|string',
        ]);

        $txn = PharmacyTransaction::where('transaction_id', $request->transactionId)->first();
        if (!$txn) return response()->json(['error' => 'Transaction not found'], 404);

        $txn->update([
            'payment_status' => 'Paid',
            'payment_mode' => $request->paymentMode,
            'reconciliation_status' => 'Matched',
        ]);

        if ($txn->mrn) {
            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => 'Pharmacy',
                'mrn' => $txn->mrn,
                'reference_id' => $txn->transaction_id,
                'category' => 'Pharmacy Payment Collected',
                'debit' => 0,
                'credit' => $txn->total_amount,
            ]);
        }

        return response()->json(['success' => true, 'transactionId' => $txn->transaction_id]);
    }

    public function voidTransaction(Request $request)
    {
        $request->validate([
            'transactionId' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $txn = PharmacyTransaction::where('transaction_id', $request->transactionId)->first();
        if (!$txn) return response()->json(['error' => 'Transaction not found'], 404);

        $txn->update([
            'payment_status' => 'Voided',
            'reconciliation_status' => 'Mismatch',
            'notes' => $request->reason ?? 'Voided by admin',
        ]);

        return response()->json(['success' => true]);
    }

    public function reconcile(Request $request)
    {
        $request->validate([
            'transactionId' => 'required|string',
            'status' => 'required|string|in:Matched,Pending,Mismatch',
        ]);

        $txn = PharmacyTransaction::where('transaction_id', $request->transactionId)->first();
        if (!$txn) return response()->json(['error' => 'Transaction not found'], 404);

        $txn->update(['reconciliation_status' => $request->status]);

        return response()->json(['success' => true]);
    }

    public function getReconciliation(Request $request)
    {
        $date = $request->query('date', Carbon::today()->format('Y-m-d'));
        $rec = CashReconciliation::whereDate('reconciliation_date', $date)->first();

        if (!$rec) {
            $todayTxns = PharmacyTransaction::whereDate('transaction_date', $date)->where('payment_status', 'Paid');
            $cashSales = (clone $todayTxns)->where('payment_mode', 'Cash')->sum('total_amount');
            $paymentsReceived = (clone $todayTxns)->where('payment_mode', '!=', 'Cash')->sum('total_amount');

            return response()->json([
                'exists' => false,
                'date' => $date,
                'shift' => 'Morning (7 AM - 3 PM)',
                'pharmacist' => 'Admin',
                'openingBalance' => 20000,
                'cashSales' => round($cashSales, 2),
                'paymentsReceived' => round($paymentsReceived, 2),
                'returnsRefunds' => 0,
                'expectedClosing' => round(20000 + $cashSales + $paymentsReceived, 2),
                'denominations' => ['5000' => 0, '1000' => 0, '500' => 0, '100' => 0, '50' => 0, '20' => 0, '10' => 0, 'coins' => 0],
                'actualCash' => 0,
                'variance' => 0,
                'varianceType' => null,
                'varianceReason' => '',
                'authorizedBy' => '',
                'bankDepositAmount' => 0,
                'remainingFloat' => 0,
                'depositedBy' => '',
                'depositSlipNo' => '',
                'status' => 'Draft',
            ]);
        }

        return response()->json(array_merge($this->toCamel($rec), ['exists' => true]));
    }

    public function saveReconciliation(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'shift' => 'required|string',
            'pharmacist' => 'required|string',
            'openingBalance' => 'required|numeric',
            'cashSales' => 'required|numeric',
            'paymentsReceived' => 'required|numeric',
            'returnsRefunds' => 'required|numeric',
            'denominations' => 'required|array',
            'actualCash' => 'required|numeric',
            'varianceReason' => 'nullable|string',
            'authorizedBy' => 'nullable|string',
            'bankDepositAmount' => 'required|numeric',
            'remainingFloat' => 'required|numeric',
            'depositedBy' => 'nullable|string',
            'depositSlipNo' => 'nullable|string',
            'status' => 'required|string|in:Draft,Submitted',
        ]);

        $expectedClosing = $request->openingBalance + $request->cashSales + $request->paymentsReceived - $request->returnsRefunds;
        $variance = $request->actualCash - $expectedClosing;
        $varianceType = $variance == 0 ? null : ($variance > 0 ? 'Over' : 'Short');

        $rec = CashReconciliation::whereDate('reconciliation_date', $request->date)->first();

        $data = [
            'reconciliation_date' => $request->date,
            'shift' => $request->shift,
            'pharmacist' => $request->pharmacist,
            'opening_balance' => $request->openingBalance,
            'cash_sales' => $request->cashSales,
            'payments_received' => $request->paymentsReceived,
            'returns_refunds' => $request->returnsRefunds,
            'expected_closing' => round($expectedClosing, 2),
            'denominations' => $request->denominations,
            'actual_cash' => $request->actualCash,
            'variance' => round($variance, 2),
            'variance_type' => $varianceType,
            'variance_reason' => $request->varianceReason,
            'authorized_by' => $request->authorizedBy,
            'bank_deposit_amount' => $request->bankDepositAmount,
            'remaining_float' => $request->remainingFloat,
            'deposited_by' => $request->depositedBy,
            'deposit_slip_no' => $request->depositSlipNo,
            'status' => $request->status,
        ];

        if ($rec) {
            $rec->update($data);
        } else {
            $data['reconciliation_id'] = $this->generateYearId(CashReconciliation::class, 'reconciliation_id', 'REC');
            $rec = CashReconciliation::create($data);
        }

        return response()->json([
            'success' => true,
            'reconciliationId' => $rec->reconciliation_id,
            'status' => $rec->status,
        ]);
    }

    private function seedIfEmpty()
    {
        if (PharmacyTransaction::count() > 0) return;

        $now = Carbon::now();
        $medicines = Medicine::limit(10)->get();
        $departments = ['OPD', 'IPD', 'Emergency', 'OT', 'Walk-in'];
        $modes = ['Cash', 'Cash', 'Cash', 'Card', 'Card', 'Mobile'];
        $statuses = ['Paid', 'Paid', 'Paid', 'Paid', 'Pending', 'Partial'];
        $billedTo = ['Patient', 'Patient', 'Patient', 'Panel/Insurance', 'Sehat Card'];
        $reconciliations = ['Matched', 'Matched', 'Matched', 'Pending', 'Mismatch'];
        $doctors = ['Dr. Ayesha Siddiqui', 'Dr. Imran Khan', 'Dr. Zainab Malik', 'Dr. Hassan Raza', 'Dr. Nadia Hussain'];
        $patients = [
            ['Ahmed Ali', 'MRN-2026-0001'],
            ['Sara Khan', 'MRN-2026-0002'],
            ['Usman Ali', 'MRN-2026-0003'],
            ['Fatima Bibi', 'MRN-2026-0004'],
            ['Bilal Ahmed', 'MRN-2026-0005'],
        ];

        $transactions = [];
        for ($i = 1; $i <= 25; $i++) {
            $patient = $patients[array_rand($patients)];
            $dept = $departments[array_rand($departments)];
            $mode = $modes[array_rand($modes)];
            $status = $i <= 15 ? 'Paid' : $statuses[array_rand($statuses)];
            $billed = $billedTo[array_rand($billedTo)];
            $recon = $status === 'Paid' ? $reconciliations[array_rand($reconciliations)] : 'Pending';

            $meds = $medicines->random(rand(1, 4));
            $items = [];
            $subtotal = 0;
            foreach ($meds as $med) {
                $qty = rand(1, 5);
                $price = $med->selling_price;
                $items[] = [
                    'name' => $med->brand_name . ' ' . $med->strength,
                    'qty' => $qty,
                    'unitPrice' => round($price, 2),
                    'total' => round($qty * $price, 2),
                ];
                $subtotal += $qty * $price;
            }

            $daysAgo = $i <= 8 ? 0 : rand(0, 14);
            $date = $now->copy()->subDays($daysAgo)->subHours(rand(0, 12))->subMinutes(rand(0, 59));

            $transactions[] = [
                'transaction_id' => sprintf('TXN-2026-%04d', $i),
                'transaction_date' => $date,
                'patient_name' => $patient[0],
                'mrn' => $patient[1],
                'department' => $dept,
                'order_id' => sprintf('RX-2026-%04d', $i),
                'subtotal' => round($subtotal, 2),
                'discount' => 0,
                'tax' => 0,
                'total_amount' => round($subtotal, 2),
                'payment_mode' => $mode,
                'payment_status' => $status,
                'billed_to' => $billed,
                'charge_posted' => $dept === 'IPD' ? (rand(0, 1) === 1) : true,
                'reconciliation_status' => $recon,
                'receipt_number' => sprintf('RCP-2026-%04d', $i),
                'billing_reference' => $dept === 'IPD' ? sprintf('IPD-2026-%03d', rand(1, 30)) : sprintf('BILL-2026-%04d', $i),
                'ordered_by' => $doctors[array_rand($doctors)],
                'received_by' => 'Cashier Sara',
                'items' => $items,
                'created_at' => $date,
                'updated_at' => $date,
            ];
        }

        foreach ($transactions as $t) {
            PharmacyTransaction::create($t);
        }

        $panelClaims = [
            ['CLM-2026-0001', 'Ahmed Ali', 'MRN-2026-0001', 'Adamjee Insurance', $now->copy()->subDays(5), 2500, 'Submitted', 'ADM-POL-11234'],
            ['CLM-2026-0002', 'Sara Khan', 'MRN-2026-0002', 'State Life Insurance', $now->copy()->subDays(7), 4200, 'Approved', 'SLI-POL-22567'],
            ['CLM-2026-0003', 'Fatima Bibi', 'MRN-2026-0004', 'EFU Insurance', $now->copy()->subDays(10), 1800, 'Rejected', 'EFU-POL-33890'],
            ['CLM-2026-0004', 'Usman Ali', 'MRN-2026-0003', 'Jubilee Insurance', $now->copy()->subDays(3), 3500, 'Submitted', 'JUB-POL-44123'],
            ['CLM-2026-0005', 'Bilal Ahmed', 'MRN-2026-0005', 'Sehat Sahulat (Govt)', $now->copy()->subDays(12), 6200, 'Approved', 'SS-POL-55456'],
        ];

        foreach ($panelClaims as $c) {
            PanelClaim::create([
                'claim_id' => $c[0],
                'patient_name' => $c[1],
                'mrn' => $c[2],
                'company' => $c[3],
                'claim_date' => $c[4],
                'claim_amount' => $c[5],
                'status' => $c[6],
                'policy_number' => $c[7],
            ]);
        }
    }
}
