<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\OpdVisit;
use App\Models\OpdBill;
use App\Models\EmergencyVisit;
use App\Models\EmergencyBill;
use App\Models\IpdAdmission;
use App\Models\IpdBill;
use App\Models\Operation;
use App\Models\OtBill;
use App\Models\LabOrder;
use App\Models\LabTransaction;
use App\Models\PharmacyTransaction;
use App\Models\PanelClaim;
use App\Models\Bed;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use HmsHelpers;

    // ─── Legacy stats (kept for backward compatibility) ────────────────────────

    public function stats()
    {
        $today = Carbon::today();
        $totalPatients = Patient::count();
        $todayOpdVisits = OpdVisit::whereDate('consultation_date', $today)->count();
        $activeErCases = EmergencyVisit::where('status', 'Active')->count();
        $activeIpdAdmissions = IpdAdmission::where('status', 'Active')->count();
        $scheduledOperations = Operation::where('status', 'Scheduled')->count();

        $pendingBills = OpdBill::where('payment_status', 'Pending')->count()
            + EmergencyBill::where('payment_status', 'Pending')->count()
            + IpdBill::where('payment_status', 'Pending')->count()
            + OtBill::where('payment_status', 'Pending')->count();

        $totalRevenue = OpdBill::where('payment_status', 'Paid')->sum('total_amount')
            + EmergencyBill::where('payment_status', 'Paid')->sum('total_amount')
            + IpdBill::where('payment_status', 'Paid')->sum('total_amount')
            + OtBill::where('payment_status', 'Paid')->sum('total_amount');

        return response()->json([
            'totalPatients' => $totalPatients,
            'todayOpdVisits' => $todayOpdVisits,
            'activeErCases' => $activeErCases,
            'activeIpdAdmissions' => $activeIpdAdmissions,
            'scheduledOperations' => $scheduledOperations,
            'pendingBills' => $pendingBills,
            'totalRevenue' => $totalRevenue,
        ]);
    }

    // ─── Master data ───────────────────────────────────────────────────────────

    public function masterData()
    {
        return response()->json([
            'departments' => ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Surgery', 'Emergency', 'IPD', 'OPD'],
            'roles' => ['Doctor', 'Nurse', 'Admin', 'Staff'],
            'symptoms' => ['Fever', 'Cough', 'Chest Pain', 'Headache', 'Shortness of Breath', 'Nausea', 'Fatigue', 'Abdominal Pain'],
            'diagnoses' => ['Acute Gastritis', 'Hypertension', 'Diabetes Mellitus', 'Viral Fever', 'Stable Angina', 'Bronchitis'],
            'medicines' => ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Metformin 500mg', 'Atorvastatin 20mg', 'Omeprazole 20mg'],
            'admissionTypes' => ['Routine', 'Emergency', 'Urgent', 'Maternity'],
            'wardCategories' => ['General', 'Private', 'Semi-Private', 'ICU', 'NICU', 'Emergency'],
            'bedTypes' => ['General', 'ICU', 'Ventilator', 'Isolation', 'Post-Op'],
            'procedures' => ['Appendectomy', 'Knee Replacement', 'Cataract Surgery', 'Angioplasty', 'Cholecystectomy'],
            'theaters' => ['OT-1 (Main)', 'OT-2 (Orthopedics)', 'OT-3 (Minor)', 'OT-4 (Emergency)'],
            'chargeCategories' => ['Hospital Standard Charges', 'Facility Fees', 'Service Fees', 'Material Charges'],
            'incomeHeads' => ['Donation', 'Govt Grant', 'Pharmacy Sales', 'Other Income'],
            'expenseHeads' => ['Utility Bills', 'Salary', 'Maintenance', 'Medical Supplies', 'Other Expense'],
        ]);
    }

    // ─── Clinical Dashboard ────────────────────────────────────────────────────

    public function clinical()
    {
        $today     = Carbon::today();
        $yesterday = Carbon::yesterday();

        $opdToday     = OpdVisit::whereDate('consultation_date', $today)->count();
        $opdYesterday = OpdVisit::whereDate('consultation_date', $yesterday)->count();
        $ipdActive    = IpdAdmission::where('status', 'Active')->count();
        $ipdToday     = IpdAdmission::whereDate('admission_date', $today)->count();
        $erActive     = EmergencyVisit::where('status', 'Active')->count();
        $erToday      = EmergencyVisit::whereDate('visit_date', $today)->count();
        $labToday     = LabOrder::whereDate('order_time', $today)->count();
        $labTotal     = LabOrder::count();
        $pharmToday   = PharmacyTransaction::whereDate('transaction_date', $today)->count();
        $pharmTotal   = PharmacyTransaction::count();

        // Patient flow — last 7 days
        $flowLabels = [];
        $flowOpd    = [];
        $flowIpd    = [];
        $flowEr     = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = Carbon::today()->subDays($i);
            $flowLabels[] = $d->format('D');
            $flowOpd[]    = OpdVisit::whereDate('consultation_date', $d)->count();
            $flowIpd[]    = IpdAdmission::whereDate('admission_date', $d)->count();
            $flowEr[]     = EmergencyVisit::whereDate('visit_date', $d)->count();
        }

        // Lab orders summary
        $labPending    = LabOrder::where('status', 'Pending')->count();
        $labInProgress = LabOrder::whereIn('status', ['Collected', 'Processing', 'Verified', 'In-Progress'])->count();
        $labReady      = LabOrder::whereIn('status', ['Completed', 'Reported'])->count();

        // Pharmacy summary
        $pharmPending   = PharmacyTransaction::where('payment_status', 'Pending')->count();
        $pharmPartial   = PharmacyTransaction::where('payment_status', 'Partial')->count();
        $pharmCompleted = PharmacyTransaction::where('payment_status', 'Paid')->count();

        // Beds
        $totalBeds    = Bed::count();
        $occupiedBeds = Bed::where('status', 'Occupied')->count();
        $availBeds    = max(0, $totalBeds - $occupiedBeds);

        // Operations
        $scheduledOps  = Operation::where('status', 'Scheduled')->count();
        $inProgressOps = Operation::where('status', 'In Progress')->count();

        // Pending discharges
        $pendingDischarges = IpdAdmission::where('status', 'Discharge Requested')->count();

        // Monthly admissions for performance chart (last 14 days, every 2 days)
        $perfLabels = [];
        $perfAdmiss = [];
        for ($i = 13; $i >= 0; $i -= 2) {
            $d = Carbon::today()->subDays($i);
            $perfLabels[] = $d->format('M d');
            $perfAdmiss[] = IpdAdmission::whereDate('admission_date', $d)->count()
                + OpdVisit::whereDate('consultation_date', $d)->count();
        }

        $user = auth()->user();
        $hour = Carbon::now()->hour;
        $greeting = $hour < 12 ? 'Morning' : ($hour < 17 ? 'Afternoon' : 'Evening');

        return response()->json([
            'user' => [
                'name'     => $user?->name     ?? 'Admin',
                'role'     => $user?->role     ?? 'Administrator',
                'greeting' => $greeting,
            ],
            'quickStats' => [
                'opd'      => ['value' => $opdToday,  'change' => $opdToday - $opdYesterday,  'label' => 'OPD Today'],
                'ipd'      => ['value' => $ipdActive,  'change' => $ipdToday,                 'label' => 'Active IPD'],
                'er'       => ['value' => $erActive,   'change' => $erToday,                  'label' => 'ER Active'],
                'lab'      => ['value' => $labTotal,   'change' => $labToday,                 'label' => 'Lab Orders'],
                'pharmacy' => ['value' => $pharmTotal, 'change' => $pharmToday,               'label' => 'Pharmacy Rx'],
            ],
            'patientFlow' => [
                'labels' => $flowLabels,
                'opd'    => $flowOpd,
                'ipd'    => $flowIpd,
                'er'     => $flowEr,
            ],
            'orders' => [
                'lab' => [
                    'pending'    => $labPending,
                    'inProgress' => $labInProgress,
                    'completed'  => $labReady,
                ],
                'pharmacy' => [
                    'pending'    => $pharmPending,
                    'dispensing' => $pharmPartial,
                    'completed'  => $pharmCompleted,
                ],
                'imaging' => [
                    'pending'    => 0,
                    'inProgress' => 0,
                    'completed'  => 0,
                ],
            ],
            'beds' => [
                'total'    => $totalBeds,
                'occupied' => $occupiedBeds,
                'available'=> $availBeds,
                'pct'      => $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100) : 0,
            ],
            'operations' => [
                'scheduled'  => $scheduledOps,
                'inProgress' => $inProgressOps,
            ],
            'pendingActions' => [
                'discharges' => $pendingDischarges,
                'labReviews' => $labInProgress,
            ],
            'totals' => [
                'patients' => Patient::count(),
                'opd'      => $opdToday,
                'ipd'      => $ipdActive,
                'er'       => $erActive,
            ],
            'performance' => [
                'labels'     => $perfLabels,
                'admissions' => $perfAdmiss,
            ],
        ]);
    }

    // ─── Financial Dashboard ───────────────────────────────────────────────────

    public function financial()
    {
        $today     = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();

        // Monthly revenue by source
        $opdRevMonth   = OpdBill::where('payment_status', 'Paid')->where('updated_at', '>=', $monthStart)->sum('total_amount');
        $ipdRevMonth   = IpdBill::where('payment_status', 'Paid')->where('updated_at', '>=', $monthStart)->sum('total_amount');
        $pharmRevMonth = PharmacyTransaction::where('payment_status', 'Paid')->where('transaction_date', '>=', $monthStart)->sum('total_amount');
        $labRevMonth   = LabTransaction::where('payment_status', 'Paid')->where('transaction_date', '>=', $monthStart)->sum('total_amount');
        $erRevMonth    = EmergencyBill::where('payment_status', 'Paid')->where('updated_at', '>=', $monthStart)->sum('total_amount');
        $totalRevMonth = $opdRevMonth + $ipdRevMonth + $pharmRevMonth + $labRevMonth + $erRevMonth;

        // Today's revenue
        $opdRevToday   = OpdBill::where('payment_status', 'Paid')->whereDate('updated_at', $today)->sum('total_amount');
        $ipdRevToday   = IpdBill::where('payment_status', 'Paid')->whereDate('updated_at', $today)->sum('total_amount');
        $pharmRevToday = PharmacyTransaction::where('payment_status', 'Paid')->whereDate('transaction_date', $today)->sum('total_amount');
        $labRevToday   = LabTransaction::where('payment_status', 'Paid')->whereDate('transaction_date', $today)->sum('total_amount');
        $erRevToday    = EmergencyBill::where('payment_status', 'Paid')->whereDate('updated_at', $today)->sum('total_amount');
        $totalRevToday = $opdRevToday + $ipdRevToday + $pharmRevToday + $labRevToday + $erRevToday;

        // Revenue trend — last 14 days
        $trendLabels = [];
        $trendOpd    = [];
        $trendIpd    = [];
        $trendPharm  = [];
        $trendLab    = [];
        for ($i = 13; $i >= 0; $i--) {
            $d = Carbon::today()->subDays($i);
            $trendLabels[] = $d->format('M d');
            $trendOpd[]    = (float) OpdBill::where('payment_status', 'Paid')->whereDate('updated_at', $d)->sum('total_amount');
            $trendIpd[]    = (float) IpdBill::where('payment_status', 'Paid')->whereDate('updated_at', $d)->sum('total_amount');
            $trendPharm[]  = (float) PharmacyTransaction::where('payment_status', 'Paid')->whereDate('transaction_date', $d)->sum('total_amount');
            $trendLab[]    = (float) LabTransaction::where('payment_status', 'Paid')->whereDate('transaction_date', $d)->sum('total_amount');
        }

        // Payment methods (pharmacy has payment_mode)
        $cashAmt   = PharmacyTransaction::where('payment_status', 'Paid')->where('payment_mode', 'Cash')->where('transaction_date', '>=', $monthStart)->sum('total_amount')
                   + LabTransaction::where('payment_status', 'Paid')->where('payment_mode', 'Cash')->where('transaction_date', '>=', $monthStart)->sum('total_amount')
                   + $opdRevMonth * 0.5; // estimate: OPD/IPD bills don't store payment_mode
        $cardAmt   = PharmacyTransaction::where('payment_status', 'Paid')->where('payment_mode', 'Card')->where('transaction_date', '>=', $monthStart)->sum('total_amount')
                   + LabTransaction::where('payment_status', 'Paid')->where('payment_mode', 'Card')->where('transaction_date', '>=', $monthStart)->sum('total_amount')
                   + $opdRevMonth * 0.3;
        $mobileAmt = PharmacyTransaction::where('payment_status', 'Paid')->where('payment_mode', 'Mobile')->where('transaction_date', '>=', $monthStart)->sum('total_amount')
                   + LabTransaction::where('payment_status', 'Paid')->where('payment_mode', 'Mobile')->where('transaction_date', '>=', $monthStart)->sum('total_amount')
                   + $opdRevMonth * 0.1;
        $panelAmt  = PharmacyTransaction::where('payment_status', 'Paid')->where('payment_mode', 'Panel')->where('transaction_date', '>=', $monthStart)->sum('total_amount')
                   + $opdRevMonth * 0.1;

        // Outstanding
        $opdPendingCount  = OpdBill::where('payment_status', 'Pending')->count();
        $opdPendingAmt    = OpdBill::where('payment_status', 'Pending')->sum('total_amount');
        $ipdPendingCount  = IpdAdmission::where('status', 'Active')->count();
        $ipdPendingAmt    = IpdBill::where('payment_status', 'Pending')->sum('total_amount');
        $pharmPendingAmt  = PharmacyTransaction::where('payment_status', 'Pending')->sum('total_amount');

        // Collection status (this month)
        $totalBilled  = OpdBill::where('updated_at', '>=', $monthStart)->sum('total_amount')
                      + IpdBill::where('updated_at', '>=', $monthStart)->sum('total_amount')
                      + PharmacyTransaction::where('transaction_date', '>=', $monthStart)->sum('total_amount')
                      + LabTransaction::where('transaction_date', '>=', $monthStart)->sum('total_amount');
        $collectedPct = $totalBilled > 0 ? round(($totalRevMonth / $totalBilled) * 100) : 0;
        $pendingPct   = $totalBilled > 0 ? round((($opdPendingAmt + $ipdPendingAmt) / $totalBilled) * 100) : 0;
        $overduePct   = max(0, 100 - $collectedPct - $pendingPct);

        // Department revenue bar chart
        $deptRevenue = [
            'IPD'        => round($ipdRevMonth,   2),
            'OPD'        => round($opdRevMonth,    2),
            'Pharmacy'   => round($pharmRevMonth,  2),
            'Laboratory' => round($labRevMonth,    2),
            'Emergency'  => round($erRevMonth,     2),
        ];

        // Today's transaction count
        $todayTxns = OpdBill::whereDate('updated_at', $today)->count()
                   + IpdBill::whereDate('updated_at', $today)->count()
                   + PharmacyTransaction::whereDate('transaction_date', $today)->count()
                   + LabTransaction::whereDate('transaction_date', $today)->count();

        // Panel claims
        $panelPendingCount  = PanelClaim::where('status', 'Pending')->count();
        $panelPendingAmt    = PanelClaim::where('status', 'Pending')->sum('claim_amount');
        $panelApprovedCount = PanelClaim::where('status', 'Approved')->count();
        $panelApprovedAmt   = PanelClaim::where('status', 'Approved')->sum('claim_amount');
        $panelByCompany     = PanelClaim::where('status', 'Pending')
            ->selectRaw('company, COUNT(*) as cnt, SUM(claim_amount) as total')
            ->groupBy('company')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn($r) => ['company' => $r->company, 'count' => $r->cnt, 'amount' => round($r->total, 2)])
            ->toArray();

        // Discharge clearances
        $allCleared  = IpdAdmission::where('status', 'Discharge Requested')->count();
        $discharged  = IpdAdmission::where('status', 'Discharged')->count();

        $user = auth()->user();
        $hour = Carbon::now()->hour;
        $greeting = $hour < 12 ? 'Morning' : ($hour < 17 ? 'Afternoon' : 'Evening');

        return response()->json([
            'user' => [
                'name'     => $user?->name ?? 'Admin',
                'role'     => $user?->role ?? 'Finance',
                'greeting' => $greeting,
            ],
            'todayRevenue'  => round($totalRevToday, 2),
            'revenueCards'  => [
                'total'    => round($totalRevMonth, 2),
                'opd'      => round($opdRevMonth,   2),
                'ipd'      => round($ipdRevMonth,   2),
                'pharmacy' => round($pharmRevMonth, 2),
                'lab'      => round($labRevMonth,   2),
            ],
            'revenueTrend'  => [
                'labels'   => $trendLabels,
                'opd'      => $trendOpd,
                'ipd'      => $trendIpd,
                'pharmacy' => $trendPharm,
                'lab'      => $trendLab,
            ],
            'collection'    => [
                'totalBilled'  => round($totalBilled,   2),
                'collected'    => round($totalRevMonth,  2),
                'collectedPct' => $collectedPct,
                'pendingPct'   => $pendingPct,
                'overduePct'   => $overduePct,
            ],
            'paymentMethods'=> [
                'cash'   => round($cashAmt,   2),
                'card'   => round($cardAmt,   2),
                'mobile' => round($mobileAmt, 2),
                'panel'  => round($panelAmt,  2),
            ],
            'outstanding'   => [
                'opdCount'   => $opdPendingCount,
                'opdAmount'  => round($opdPendingAmt,   2),
                'ipdCount'   => $ipdPendingCount,
                'ipdAmount'  => round($ipdPendingAmt,   2),
                'pharmAmt'   => round($pharmPendingAmt, 2),
            ],
            'deptRevenue'   => $deptRevenue,
            'todayStats'    => [
                'transactions' => $todayTxns,
                'collected'    => round($totalRevToday, 2),
            ],
            'panelClaims'   => [
                'pendingCount'  => $panelPendingCount,
                'pendingAmount' => round($panelPendingAmt,   2),
                'approvedCount' => $panelApprovedCount,
                'approvedAmount'=> round($panelApprovedAmt,  2),
                'byCompany'     => $panelByCompany,
            ],
            'discharges'    => [
                'pendingClearance' => $allCleared,
                'discharged'       => $discharged,
            ],
        ]);
    }

    // ─── Save Dashboard Preference ─────────────────────────────────────────────

    public function savePreference(Request $request)
    {
        $request->validate(['dashboard' => 'required|in:clinical,financial']);
        session(['dashboard_preference' => $request->dashboard]);
        return response()->json(['success' => true]);
    }
}
