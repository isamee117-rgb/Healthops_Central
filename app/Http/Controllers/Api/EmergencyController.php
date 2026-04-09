<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\EmergencyVisit;
use App\Models\EmergencyBill;
use App\Models\PharmacyTransaction;
use App\Models\LabTransaction;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class EmergencyController extends Controller
{
    use HmsHelpers;

    public function visits()
    {
        return response()->json($this->toCamelCollection(EmergencyVisit::all()));
    }

    public function bills()
    {
        return response()->json($this->toCamelCollection(EmergencyBill::all()));
    }

    public function createVisitTransaction(Request $request)
    {
        try {
            $request->validate([
                'mrn' => 'required|string',
                'doctorName' => 'required|string',
                'department' => 'required|string',
                'doctorFee' => 'required|numeric',
                'esi' => 'required|string',
                'modeOfArrival' => 'required|string',
            ]);

            $patient = Patient::where('mrn', $request->input('mrn'))->first();
            if (!$patient) {
                return response()->json(['error' => 'Patient not found'], 404);
            }

            $chargeIds = $request->input('chargeIds', []);
            $consultationCharges = $this->calculateChargesFromMaster('ER', $chargeIds);
            $doctorFee = $request->input('doctorFee');
            $esi = $request->input('esi');

            $patient->increment('visit_count');
            $patient->update(['last_visit_date' => Carbon::now()]);

            $erVisitCount = EmergencyVisit::where('mrn', $patient->mrn)->count() + 1;
            $visitId = $patient->mrn . '-ER-' . $erVisitCount;

            $triageCategory = 'Green';
            if (str_contains($esi, '1')) $triageCategory = 'Red';
            elseif (str_contains($esi, '2')) $triageCategory = 'Orange';
            elseif (str_contains($esi, '3')) $triageCategory = 'Yellow';

            $visit = EmergencyVisit::create([
                'visit_id' => $visitId,
                'visit_number' => $erVisitCount,
                'mrn' => $patient->mrn,
                'patient_name' => $patient->name,
                'doctor_name' => $request->input('doctorName'),
                'department' => $request->input('department'),
                'visit_type' => $request->input('visitType', 'ER Visit'),
                'consultation_date' => Carbon::now(),
                'status' => 'Active',
                'payment_status' => 'Pending',
                'esi' => $esi,
                'mode_of_arrival' => $request->input('modeOfArrival'),
                'triage_category' => $triageCategory,
                'clinical_status' => 'Waiting',
                'chief_complaint' => $request->input('chiefComplaint', ''),
                'registered_by'  => auth()->user()->name ?? null,
            ]);

            $billId = $this->nextId(EmergencyBill::class, 'bill_id', 'ER-BILL-');
            $totalAmount = $consultationCharges + $doctorFee;

            $bill = EmergencyBill::create([
                'bill_id' => $billId,
                'mrn' => $patient->mrn,
                'visit_id' => $visitId,
                'patient_name' => $patient->name,
                'consultation_charges' => $consultationCharges,
                'doctor_fee' => $doctorFee,
                'total_amount' => $totalAmount,
                'payment_status' => 'Pending',
                'history' => [],
            ]);

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => 'ER',
                'mrn' => $patient->mrn,
                'visit_id' => $visitId,
                'category' => 'Emergency Intake',
                'debit' => $totalAmount,
                'credit' => 0,
                'reference_id' => $billId,
            ]);

            $this->logActivity($patient->mrn, 'New ER Admission Visit created', 'ER', "ESI: {$esi} | Visit: {$visitId} | Bill: {$billId}");

            return response()->json([
                'visit' => $this->toCamel($visit),
                'bill' => $this->toCamel($bill),
            ], 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    // ── ER Discharge ────────────────────────────────────────────────────────

    public function getErDischargeInfo(string $visitId)
    {
        $visit = EmergencyVisit::where('visit_id', $visitId)->first();
        if (!$visit) return response()->json(['error' => 'Visit not found'], 404);
        return response()->json($this->toCamel($visit));
    }

    public function getErClearanceDues(string $visitId)
    {
        $visit = EmergencyVisit::where('visit_id', $visitId)->first();
        if (!$visit) return response()->json(['error' => 'Visit not found'], 404);

        $mrn = $visit->mrn;

        // ── ER / Hospital bills ───────────────────────────────────────────
        $erBills = EmergencyBill::where('visit_id', $visitId)->get();
        $erTotal   = 0; $erPaid = 0; $erBreakdown = [];
        foreach ($erBills as $b) {
            $total  = floatval($b->total_amount ?? 0);
            $isPaid = ($b->payment_status === 'Paid');
            $paid   = $isPaid ? $total : 0;
            $erTotal  += $total;
            $erPaid   += $paid;
            if ($b->consultation_charges > 0) {
                $erBreakdown[] = ['label' => 'Consultation Charges', 'amount' => floatval($b->consultation_charges), 'status' => $isPaid ? 'Paid' : 'Due'];
            }
            if ($b->doctor_fee > 0) {
                $erBreakdown[] = ['label' => 'Doctor Fee', 'amount' => floatval($b->doctor_fee), 'status' => $isPaid ? 'Paid' : 'Due'];
            }
        }
        $erPending  = max(0, $erTotal - $erPaid);
        $erCleared  = $erTotal <= 0 || $erPending <= 0;

        // ── Pharmacy (ER account) ─────────────────────────────────────────
        $pharBreakdown = []; $pharTotal = 0; $pharPaid = 0;
        if (class_exists(PharmacyTransaction::class)) {
            $pharTxns = PharmacyTransaction::where('billed_to', 'ER')->where('mrn', $mrn)->get();
            foreach ($pharTxns as $t) {
                $amt    = floatval($t->net_amount ?? $t->total_amount ?? 0);
                $isPaid = ($t->payment_status === 'Paid');
                $pharTotal += $amt;
                $pharPaid  += $isPaid ? $amt : 0;
                $pharBreakdown[] = ['label' => $t->bill_id ?? 'Pharmacy', 'amount' => $amt, 'status' => $isPaid ? 'Paid' : 'Due'];
            }
        }
        $pharPending  = max(0, $pharTotal - $pharPaid);
        $pharCleared  = $pharTotal <= 0 || $pharPending <= 0;

        // ── Lab (MRN based) ───────────────────────────────────────────────
        $labBreakdown = []; $labTotal = 0; $labPaid = 0;
        if (class_exists(LabTransaction::class)) {
            $labTxns = LabTransaction::where('mrn', $mrn)->get();
            foreach ($labTxns as $t) {
                $amt    = floatval($t->total_amount ?? $t->net_amount ?? 0);
                $isPaid = ($t->payment_status === 'Paid');
                $labTotal += $amt;
                $labPaid  += $isPaid ? $amt : 0;
                $labBreakdown[] = ['label' => $t->bill_id ?? 'Lab', 'amount' => $amt, 'status' => $isPaid ? 'Paid' : 'Due'];
            }
        }
        $labPending  = max(0, $labTotal - $labPaid);
        $labCleared  = $labTotal <= 0 || $labPending <= 0;

        return response()->json([
            'hospital' => [
                'cleared'   => $erCleared,
                'total'     => $erTotal,
                'paid'      => $erPaid,
                'pending'   => $erPending,
                'breakdown' => $erBreakdown,
            ],
            'pharmacy' => [
                'cleared'   => $pharCleared,
                'total'     => $pharTotal,
                'paid'      => $pharPaid,
                'pending'   => $pharPending,
                'breakdown' => $pharBreakdown,
            ],
            'lab' => [
                'cleared'   => $labCleared,
                'total'     => $labTotal,
                'paid'      => $labPaid,
                'pending'   => $labPending,
                'breakdown' => $labBreakdown,
            ],
        ]);
    }

    public function initiateErDischarge(Request $request, string $visitId)
    {
        $visit = EmergencyVisit::where('visit_id', $visitId)->first();
        if (!$visit) return response()->json(['error' => 'Visit not found'], 404);

        $di = $visit->discharge_info ?? [];
        $di['planned_discharge_date'] = $request->input('plannedDischargeDate');
        $di['planned_discharge_time'] = $request->input('plannedDischargeTime');
        $di['discharge_type']         = $request->input('dischargeType', 'Discharged');
        $di['readiness_checklist']    = $request->input('readinessChecklist', []);
        $di['initiated_at']           = Carbon::now()->toDateTimeString();

        $visit->update([
            'discharge_status' => 'pending_clearance',
            'discharge_info'   => $di,
        ]);

        $this->logActivity($visit->mrn, 'ER Discharge Initiated', 'ER', "Visit: {$visitId}");

        return response()->json(['success' => true, 'visit' => $this->toCamel($visit)]);
    }

    public function completeErDischarge(Request $request, string $visitId)
    {
        $visit = EmergencyVisit::where('visit_id', $visitId)->first();
        if (!$visit) return response()->json(['error' => 'Visit not found'], 404);

        $di = $visit->discharge_info ?? [];
        $di['discharge_date']        = $request->input('dischargeDate');
        $di['discharge_time']        = $request->input('dischargeTime');
        $di['discharge_type']        = $request->input('dischargeType', 'Discharged');
        $di['final_diagnosis']       = $request->input('finalDiagnosis', '');
        $di['condition_at_discharge']= $request->input('conditionAtDischarge', '');
        $di['follow_up_info']        = $request->input('followUpInfo', []);
        $di['special_instructions']  = $request->input('specialInstructions', '');
        $di['discharged_by']         = $request->input('dischargedBy', 'Doctor');
        $di['completed_at']          = Carbon::now()->toDateTimeString();

        $visit->update([
            'discharge_status' => 'discharged',
            'discharge_info'   => $di,
            'status'           => 'Discharged',
        ]);

        $this->logActivity($visit->mrn, 'ER Discharge Completed', 'ER', "Visit: {$visitId}");

        return response()->json([
            'success'      => true,
            'visit'        => $this->toCamel($visit),
            'dischargeInfo'=> $di,
            'totalPaid'    => 0,
        ]);
    }

    public function saveCustomOrderData(Request $request, string $visitId)
    {
        try {
            $visit = EmergencyVisit::where('visit_id', $visitId)->first();
            if (!$visit) return response()->json(['error' => 'Visit not found'], 404);
            $visit->update(['custom_order_data' => $request->input('customOrderData', [])]);
            return response()->json(['success' => true, 'customOrderData' => $visit->custom_order_data]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }
}
