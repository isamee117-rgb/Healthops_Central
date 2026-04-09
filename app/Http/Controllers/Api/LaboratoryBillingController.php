<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabTransaction;
use App\Models\LabOrder;
use App\Models\LabOrderTest;
use App\Models\LabTest;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LaboratoryBillingController extends Controller
{
    use HmsHelpers;

    // ─── Pricing helpers ───────────────────────────────────────────────────────

    private function testPrice(string $testName, bool $isStat = false): float
    {
        $test = LabTest::where('test_name', $testName)->first()
            ?? LabTest::where('test_code', $testName)->first();
        if (!$test) return 500.0;
        return $isStat
            ? (float) ($test->stat_price    ?? $test->standard_price ?? 500)
            : (float) ($test->standard_price ?? 500);
    }

    private function orderTotal(string $orderId, bool $isStat = false): float
    {
        $tests = LabOrderTest::where('lab_order_id', $orderId)->get();
        if ($tests->isEmpty()) {
            $order = LabOrder::where('order_id', $orderId)->first();
            return (float) (($order->tests_count ?? 1) * 500);
        }
        $total = 0.0;
        foreach ($tests as $t) {
            $total += $this->testPrice($t->test_name, $isStat);
        }
        return round($total, 2);
    }

    private function orderItems(string $orderId, bool $isStat = false): array
    {
        $tests = LabOrderTest::where('lab_order_id', $orderId)->get();
        return $tests->map(function ($t) use ($isStat) {
            $price = $this->testPrice($t->test_name, $isStat);
            return [
                'name'      => $t->test_name,
                'qty'       => 1,
                'unitPrice' => $price,
                'total'     => $price,
            ];
        })->toArray();
    }

    /** Map LabOrder source_department to a display-friendly department label */
    private function mapDept(string $src): string
    {
        $map = [
            'IPD'       => 'IPD',
            'OPD'       => 'OPD',
            'ER'        => 'Emergency',
            'Emergency' => 'Emergency',
            'OT'        => 'OT',
            'Walk-in'   => 'Walk-in',
            'Walk_in'   => 'Walk-in',
            'WALKIN'    => 'Walk-in',
        ];
        return $map[$src] ?? $src;
    }

    /** Build a transaction-shaped array from a LabOrder + optional LabTransaction */
    private function buildTxn(LabOrder $order, ?LabTransaction $txn = null): array
    {
        $isStat  = strtoupper($order->priority ?? '') === 'STAT';
        $total   = $txn ? (float) $txn->total_amount : $this->orderTotal($order->order_id, $isStat);

        return [
            'transactionId'        => $txn ? $txn->transaction_id : $order->order_id,
            'transactionDate'      => $order->order_time,
            'patientName'          => $order->patient_name,
            'mrn'                  => $order->mrn,
            'department'           => $this->mapDept($order->source_department ?? 'Walk-in'),
            'orderId'              => $order->order_id,
            'subtotal'             => $total,
            'discount'             => 0,
            'tax'                  => 0,
            'totalAmount'          => $total,
            'paymentMode'          => $txn ? $txn->payment_mode : 'Pending',
            'paymentStatus'        => $txn ? $txn->payment_status : 'Pending',
            'billedTo'             => $txn ? $txn->billed_to : 'Patient',
            'chargePosted'         => true,
            'reconciliationStatus' => $txn ? $txn->reconciliation_status : 'Pending',
            'receiptNumber'        => $txn ? $txn->receipt_number : null,
            'billingReference'     => $txn ? $txn->billing_reference : ($order->visit_number ?? $order->order_id),
            'orderedBy'            => $order->ordered_by,
            'processedBy'          => $txn ? $txn->processed_by : ($order->collected_by ?? '-'),
        ];
    }

    // ─── Dashboard ─────────────────────────────────────────────────────────────

    public function dashboard()
    {
        $today    = Carbon::today();
        $orders   = LabOrder::all()->keyBy('order_id');
        $paidTxns = LabTransaction::where('payment_status', 'Paid')->get();

        // Paid order IDs (have a matching payment)
        $paidOrderIds = LabTransaction::where('payment_status', 'Paid')->pluck('order_id')->toArray();

        $todaySales = LabTransaction::whereDate('transaction_date', $today)
            ->where('payment_status', 'Paid')->sum('total_amount');

        // Pending = all orders that don't have a paid transaction
        $pendingTotal = 0.0;
        foreach ($orders as $orderId => $order) {
            if (!in_array($orderId, $paidOrderIds)) {
                $isStat = strtoupper($order->priority ?? '') === 'STAT';
                $pendingTotal += $this->orderTotal($orderId, $isStat);
            }
        }

        // IPD outstanding
        $ipdOrders   = LabOrder::where('source_department', 'IPD')->pluck('order_id')->toArray();
        $ipdPaidIds  = LabTransaction::where('payment_status', 'Paid')->whereIn('order_id', $ipdOrders)->pluck('order_id')->toArray();
        $ipdOutstanding = 0.0;
        foreach (array_diff($ipdOrders, $ipdPaidIds) as $id) {
            $ipdOutstanding += $this->orderTotal($id);
        }

        $panelOutstanding = LabTransaction::where('billed_to', 'Panel/Insurance')
            ->where('payment_status', '!=', 'Paid')->sum('total_amount');

        $cashSales = LabTransaction::whereDate('transaction_date', $today)
            ->where('payment_mode', 'Cash')->where('payment_status', 'Paid')->sum('total_amount');
        $cardSales = LabTransaction::whereDate('transaction_date', $today)
            ->whereIn('payment_mode', ['Card', 'Mobile'])->where('payment_status', 'Paid')->sum('total_amount');

        return response()->json([
            'todaySales'       => round($todaySales, 2),
            'pendingPayments'  => round($pendingTotal, 2),
            'outstandingIpd'   => round($ipdOutstanding, 2),
            'panelOutstanding' => round($panelOutstanding, 2),
            'cashSales'        => round($cashSales, 2),
            'cardSales'        => round($cardSales, 2),
        ]);
    }

    // ─── Revenue Breakdown ─────────────────────────────────────────────────────

    public function revenueBreakdown(Request $request)
    {
        $period = $request->query('period', 'today');
        $txnQ   = LabTransaction::where('payment_status', 'Paid');

        if ($period === 'today') {
            $txnQ->whereDate('transaction_date', Carbon::today());
        } else {
            $txnQ->whereMonth('transaction_date', Carbon::now()->month)
                 ->whereYear('transaction_date', Carbon::now()->year);
        }

        // For paid transactions, department comes from the linked LabOrder
        $txns = $txnQ->get();
        $orderIds = $txns->pluck('order_id')->filter()->unique()->toArray();
        $labOrders = LabOrder::whereIn('order_id', $orderIds)->get()->keyBy('order_id');

        // Build dept revenue
        $deptTotals = [];
        $billedTotals = [];
        foreach ($txns as $txn) {
            $order = $labOrders->get($txn->order_id);
            $dept  = $order ? $this->mapDept($order->source_department ?? '') : 'Other';
            $deptTotals[$dept] = ($deptTotals[$dept] ?? 0) + $txn->total_amount;
            $billed = $txn->billed_to ?? 'Patient';
            $billedTotals[$billed] = ($billedTotals[$billed] ?? 0) + $txn->total_amount;
        }

        // If no paid transactions yet, derive from all LabOrders for the period
        if (empty($deptTotals)) {
            $ordersQ = LabOrder::query();
            if ($period === 'today') {
                $ordersQ->whereDate('order_time', Carbon::today());
            } else {
                $ordersQ->whereMonth('order_time', Carbon::now()->month)
                        ->whereYear('order_time', Carbon::now()->year);
            }
            foreach ($ordersQ->get() as $order) {
                $dept = $this->mapDept($order->source_department ?? 'Walk-in');
                $total = $this->orderTotal($order->order_id);
                $deptTotals[$dept] = ($deptTotals[$dept] ?? 0) + $total;
                $billedTotals['Patient'] = ($billedTotals['Patient'] ?? 0) + $total;
            }
        }

        arsort($deptTotals);
        arsort($billedTotals);
        $grandTotal = array_sum($deptTotals);

        $departments = array_map(function ($dept, $total) use ($grandTotal) {
            return [
                'department' => $dept,
                'total'      => round($total, 2),
                'percentage' => $grandTotal > 0 ? round(($total / $grandTotal) * 100) : 0,
            ];
        }, array_keys($deptTotals), array_values($deptTotals));

        $paymentCategories = array_map(function ($cat, $total) use ($grandTotal) {
            return [
                'category'   => $cat,
                'total'      => round($total, 2),
                'percentage' => $grandTotal > 0 ? round(($total / $grandTotal) * 100) : 0,
            ];
        }, array_keys($billedTotals), array_values($billedTotals));

        return response()->json([
            'grandTotal'        => round($grandTotal, 2),
            'departments'       => array_values($departments),
            'paymentCategories' => array_values($paymentCategories),
        ]);
    }

    // ─── Transactions List ─────────────────────────────────────────────────────

    public function transactions(Request $request)
    {
        $query = LabOrder::orderByDesc('order_time');

        // Apply search
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_id', 'like', "%{$s}%")
                  ->orWhere('patient_name', 'like', "%{$s}%")
                  ->orWhere('mrn', 'like', "%{$s}%");
            });
        }

        // Apply department filter
        if ($request->filled('department')) {
            $dept = $request->department;
            $srcValues = array_keys(array_filter([
                'IPD'       => 'IPD',
                'OPD'       => 'OPD',
                'Emergency' => 'ER',
                'OT'        => 'OT',
                'Walk-in'   => 'Walk-in',
            ], fn($v) => $v === $dept || $v === $dept));
            // Map display dept back to source_department values
            $srcMap = ['IPD'=>['IPD'],'OPD'=>['OPD'],'Emergency'=>['ER','Emergency'],'OT'=>['OT'],'Walk-in'=>['Walk-in','Walk_in','WALKIN']];
            $sources = $srcMap[$dept] ?? [$dept];
            $query->whereIn('source_department', $sources);
        }

        $orders = $query->limit(100)->get();

        // Load matching paid transactions indexed by order_id
        $orderIds = $orders->pluck('order_id')->toArray();
        $txnMap   = LabTransaction::whereIn('order_id', $orderIds)->get()->keyBy('order_id');

        // Apply payment status filter AFTER merging
        $result = $orders->map(function ($order) use ($txnMap) {
            $txn = $txnMap->get($order->order_id);
            return $this->buildTxn($order, $txn);
        });

        if ($request->filled('paymentStatus')) {
            $result = $result->filter(fn($r) => $r['paymentStatus'] === $request->paymentStatus)->values();
        }

        return response()->json($result->values());
    }

    // ─── Transaction Detail ────────────────────────────────────────────────────

    public function transactionDetail($txnId)
    {
        // Try LabTransaction first (LTXN- prefix)
        if (str_starts_with($txnId, 'LTXN-')) {
            $txn = LabTransaction::where('transaction_id', $txnId)->first();
            if (!$txn) return response()->json(['error' => 'Transaction not found'], 404);
            $order = LabOrder::where('order_id', $txn->order_id)->first();
            $items = $order ? $this->orderItems($order->order_id) : [];
            $data  = $this->toCamel($txn);
            $data['items'] = $items;
            $data['orderedBy'] = $order->ordered_by ?? '-';
            return response()->json($data);
        }

        // Otherwise it's a LabOrder ID
        $order = LabOrder::where('order_id', $txnId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $txn   = LabTransaction::where('order_id', $txnId)->first();
        $isStat = strtoupper($order->priority ?? '') === 'STAT';
        $items = $this->orderItems($order->order_id, $isStat);
        $total = $txn ? (float)$txn->total_amount : array_sum(array_column($items, 'total'));

        return response()->json(array_merge($this->buildTxn($order, $txn), [
            'items'    => $items,
            'subtotal' => $total,
            'total'    => $total,
        ]));
    }

    // ─── Pending OPD/Walk-in ───────────────────────────────────────────────────

    public function pendingOPD()
    {
        $opdSources = ['OPD', 'Walk-in', 'Walk_in', 'WALKIN', 'ER', 'Emergency'];
        $orders     = LabOrder::whereIn('source_department', $opdSources)
                              ->orderByDesc('order_time')->get();
        $paidIds    = LabTransaction::where('payment_status', 'Paid')
                              ->pluck('order_id')->toArray();

        $items = $orders->filter(fn($o) => !in_array($o->order_id, $paidIds))
            ->map(function ($order) {
                $isStat = strtoupper($order->priority ?? '') === 'STAT';
                $days   = Carbon::parse($order->order_time)->diffInDays(Carbon::now());
                return [
                    'transactionId' => $order->order_id,
                    'patientName'   => $order->patient_name,
                    'mrn'           => $order->mrn,
                    'date'          => Carbon::parse($order->order_time)->format('d-M-Y'),
                    'orderId'       => $order->order_id,
                    'amountDue'     => $this->orderTotal($order->order_id, $isStat),
                    'daysPending'   => $days . ' day' . ($days !== 1 ? 's' : ''),
                ];
            })->values();

        return response()->json([
            'items'        => $items,
            'totalPending' => round($items->sum('amountDue'), 2),
        ]);
    }

    // ─── Pending IPD ───────────────────────────────────────────────────────────

    public function pendingIPD()
    {
        $orders  = LabOrder::where('source_department', 'IPD')->orderByDesc('order_time')->get();
        $paidIds = LabTransaction::where('payment_status', 'Paid')->pluck('order_id')->toArray();

        $items = $orders->filter(fn($o) => !in_array($o->order_id, $paidIds))
            ->map(function ($order) {
                $isStat = strtoupper($order->priority ?? '') === 'STAT';
                return [
                    'transactionId' => $order->order_id,
                    'patientName'   => $order->patient_name,
                    'mrn'           => $order->mrn,
                    'ipdNumber'     => $order->visit_number ?? $order->order_id,
                    'totalCharges'  => $this->orderTotal($order->order_id, $isStat),
                    'lastUpdated'   => Carbon::parse($order->order_time)->format('d-M-Y'),
                    'source'        => 'lab_order',
                    'orderStatus'   => $order->status,
                ];
            })->values();

        return response()->json([
            'items'        => $items,
            'totalRunning' => round($items->sum('totalCharges'), 2),
        ]);
    }

    // ─── IPD Order Detail (for View button in IPD pending table) ───────────────

    public function ipdOrderDetail($orderId)
    {
        $order = LabOrder::where('order_id', $orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $txn    = LabTransaction::where('order_id', $orderId)->first();
        $isStat = strtoupper($order->priority ?? '') === 'STAT';
        $items  = $this->orderItems($order->order_id, $isStat);
        $total  = array_sum(array_column($items, 'total')) ?: $this->orderTotal($orderId, $isStat);

        return response()->json([
            'transactionId'        => $order->order_id,
            'patientName'          => $order->patient_name,
            'mrn'                  => $order->mrn,
            'orderId'              => $order->order_id,
            'transactionDate'      => $order->order_time,
            'department'           => $this->mapDept($order->source_department ?? 'IPD'),
            'orderedBy'            => $order->ordered_by ?? '-',
            'items'                => $items,
            'subtotal'             => round($total, 2),
            'discount'             => 0,
            'tax'                  => 0,
            'totalAmount'          => round($total, 2),
            'paymentMode'          => 'IPD Account',
            'paymentStatus'        => $txn ? $txn->payment_status : 'Pending',
            'billedTo'             => 'IPD',
            'receiptNumber'        => $txn ? $txn->receipt_number : null,
            'processedBy'          => $order->collected_by ?? '-',
            'chargePosted'         => true,
            'billingReference'     => $order->visit_number ?? $order->order_id,
            'reconciliationStatus' => $txn ? $txn->reconciliation_status : 'Pending',
        ]);
    }

    // ─── Collect Payment ───────────────────────────────────────────────────────

    public function collectPayment(Request $request)
    {
        $request->validate([
            'transactionId' => 'required|string',
            'paymentMode'   => 'required|string',
        ]);

        $orderId = $request->transactionId;
        $order   = LabOrder::where('order_id', $orderId)->first();
        if (!$order) return response()->json(['error' => 'Lab order not found'], 404);

        $isStat = strtoupper($order->priority ?? '') === 'STAT';
        $total  = $this->orderTotal($orderId, $isStat);

        $txn = LabTransaction::where('order_id', $orderId)->first();

        $nextNum  = LabTransaction::count() + 1;
        $txnId    = sprintf('LTXN-%s-%04d', date('Y'), $nextNum);
        $receiptN = sprintf('LRCP-%s-%04d', date('Y'), $nextNum);

        $data = [
            'transaction_id'       => $txnId,
            'transaction_date'     => now(),
            'patient_name'         => $order->patient_name,
            'mrn'                  => $order->mrn,
            'department'           => $this->mapDept($order->source_department ?? ''),
            'order_id'             => $orderId,
            'subtotal'             => $total,
            'discount'             => 0,
            'tax'                  => 0,
            'total_amount'         => $total,
            'payment_mode'         => $request->paymentMode,
            'payment_status'       => 'Paid',
            'billed_to'            => $request->billedTo ?? 'Patient',
            'charge_posted'        => true,
            'reconciliation_status'=> 'Matched',
            'receipt_number'       => $receiptN,
            'billing_reference'    => $order->visit_number ?? $orderId,
            'ordered_by'           => $order->ordered_by,
            'processed_by'         => 'Cashier',
            'items'                => $this->orderItems($orderId, $isStat),
        ];

        if ($txn) {
            $txn->update(array_merge($data, ['transaction_id' => $txn->transaction_id]));
        } else {
            LabTransaction::create($data);
        }

        return response()->json(['success' => true, 'transactionId' => $txnId]);
    }

    // ─── Void ─────────────────────────────────────────────────────────────────

    public function voidTransaction(Request $request)
    {
        $request->validate(['transactionId' => 'required|string']);

        $txn = LabTransaction::where('transaction_id', $request->transactionId)
            ->orWhere('order_id', $request->transactionId)->first();
        if (!$txn) return response()->json(['error' => 'Transaction not found'], 404);

        $txn->update([
            'payment_status'       => 'Voided',
            'reconciliation_status'=> 'Mismatch',
            'notes'                => $request->reason ?? 'Voided by admin',
        ]);

        return response()->json(['success' => true]);
    }

    // ─── Reconcile ────────────────────────────────────────────────────────────

    public function reconcile(Request $request)
    {
        $request->validate([
            'transactionId' => 'required|string',
            'status'        => 'required|string|in:Matched,Pending,Mismatch',
        ]);

        $txn = LabTransaction::where('transaction_id', $request->transactionId)
            ->orWhere('order_id', $request->transactionId)->first();
        if (!$txn) return response()->json(['error' => 'Transaction not found'], 404);

        $txn->update(['reconciliation_status' => $request->status]);
        return response()->json(['success' => true]);
    }
}
