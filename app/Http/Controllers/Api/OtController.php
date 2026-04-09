<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Operation;
use App\Models\OtBill;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class OtController extends Controller
{
    use HmsHelpers;

    public function operations()
    {
        return response()->json($this->toCamelCollection(Operation::all()));
    }

    public function bills()
    {
        return response()->json($this->toCamelCollection(OtBill::all()));
    }

    public function createOperation(Request $request)
    {
        try {
            $request->validate([
                'mrn' => 'required|string',
                'procedure' => 'required|string',
                'surgeon' => 'required|string',
                'theater' => 'required|string',
            ]);

            $patient = Patient::where('mrn', $request->input('mrn'))->first();
            if (!$patient) {
                return response()->json(['error' => 'Patient not found'], 404);
            }

            $patient->increment('visit_count');
            $patient->update(['last_visit_date' => Carbon::now()]);

            $otCount = Operation::where('mrn', $patient->mrn)->count() + 1;
            $operationId = $patient->mrn . '-OT-' . $otCount;

            $operation = Operation::create([
                'operation_id' => $operationId,
                'operation_number' => $otCount,
                'mrn' => $patient->mrn,
                'patient_name' => $patient->name,
                'age' => $patient->age,
                'gender' => $patient->gender,
                'phone' => $patient->phone,
                'cnic' => $patient->cnic,
                'procedure' => $request->input('procedure'),
                'surgery_type' => $request->input('surgeryType', 'Elective'),
                'prev_related_surgery' => $request->input('prevRelatedSurgery', false),
                'prev_surgery_details' => $request->input('prevSurgeryDetails'),
                'start_time' => $request->input('startTime'),
                'surgery_date' => $request->input('surgeryDate'),
                'estimated_duration' => $request->input('estimatedDuration'),
                'priority' => $request->input('priority', 'Elective'),
                'booking_status' => $request->input('bookingStatus', ''),
                'status' => 'Scheduled',
                'payment_status' => 'Pending',
                'admission_source' => $request->input('admissionSource', 'Direct OT'),
                'surgeon' => $request->input('surgeon'),
                'anaesthetist' => $request->input('anaesthetist'),
                'anaesthetist_fee' => $request->input('anaesthetistFee'),
                'theater' => $request->input('theater'),
                'registered_by' => auth()->user()->name ?? null,
            ]);

            $this->logActivity($patient->mrn, "Surgery Scheduled: {$request->input('procedure')}", 'OT');

            return response()->json($this->toCamel($operation), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function getPostOp(string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }
        return response()->json([
            'operationId'         => $operation->operation_id,
            'status'              => $operation->status,
            'postopLocation'      => $operation->postop_location ?? 'Recovery Room / PACU',
            'expectedDischargeDate' => $operation->expected_discharge_date ? $operation->expected_discharge_date->format('Y-m-d') : null,
            'discharged'          => (bool) $operation->discharged,
            'postopNotes'         => $operation->postop_notes ?? [],
            'customPostopData'    => $operation->custom_postop_data ?? [],
        ]);
    }

    public function savePostOp(Request $request, string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }

        $updates = [
            'postop_notes' => $request->input('postopNotes', []),
            'postop_location' => $request->input('postopLocation', 'Recovery Room / PACU'),
            'postop_saved_by' => auth()->user()->name ?? null,
        ];
        if ($request->input('expectedDischargeDate')) {
            $updates['expected_discharge_date'] = $request->input('expectedDischargeDate');
        }

        $operation->update($updates);
        return response()->json(['success' => true]);
    }

    public function dischargePatient(Request $request, string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }

        $operation->update([
            'status' => 'Discharged',
            'discharged' => true,
            'postop_location' => 'Discharged',
            'postop_notes' => $request->input('postopNotes', $operation->postop_notes ?? []),
        ]);

        return response()->json(['success' => true]);
    }

    public function saveCustomPostopData(Request $request, string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }
        $operation->update([
            'custom_postop_data' => $request->input('customPostopData', []),
        ]);
        return response()->json(['success' => true]);
    }

    public function getIntraOp(string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }
        return response()->json([
            'operationId'       => $operation->operation_id,
            'status'            => $operation->status,
            'currentPhase'      => $operation->current_phase ?? 'Pre-Induction',
            'anesthesiaStartTime' => $operation->anesthesia_start_time,
            'intraopRecord'     => $operation->intraop_record ?? [],
            'customIntraopData' => $operation->custom_intraop_data ?? [],
        ]);
    }

    public function saveIntraOp(Request $request, string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }

        $updates = [
            'intraop_record' => $request->input('intraopRecord', []),
            'current_phase' => $request->input('currentPhase', 'Pre-Induction'),
            'intraop_saved_by' => auth()->user()->name ?? null,
        ];
        if ($request->input('anesthesiaStartTime')) {
            $updates['anesthesia_start_time'] = $request->input('anesthesiaStartTime');
        }
        if ($request->input('status') === 'In Progress' && $operation->status === 'Scheduled') {
            $updates['status'] = 'In Progress';
        }

        $operation->update($updates);
        return response()->json(['success' => true]);
    }

    public function completeIntraOp(Request $request, string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }

        $operation->update([
            'status' => 'Completed',
            'current_phase' => 'Completed',
            'intraop_record' => $request->input('intraopRecord', $operation->intraop_record ?? []),
        ]);

        return response()->json(['success' => true]);
    }

    public function getChecklist(string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }
        return response()->json([
            'operationId' => $operation->operation_id,
            'checklistStatus' => $operation->checklist_status ?? 'Not Started',
            'checklist' => $operation->checklist ?? [],
        ]);
    }

    public function saveChecklist(Request $request, string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }

        $data = $request->input('checklist', []);
        $status = $request->input('checklistStatus', 'In Progress');

        $operation->update([
            'checklist' => $data,
            'checklist_status' => $status,
            'checklist_saved_by' => auth()->user()->name ?? null,
        ]);

        return response()->json(['success' => true, 'checklistStatus' => $status]);
    }

    public function saveCustomChecklistData(Request $request, string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }
        $operation->update(['custom_checklist_data' => $request->input('customChecklistData', [])]);
        return response()->json(['success' => true, 'customChecklistData' => $operation->custom_checklist_data]);
    }

    public function saveCustomIntraopData(Request $request, string $operationId)
    {
        $operation = Operation::where('operation_id', $operationId)->first();
        if (!$operation) {
            return response()->json(['error' => 'Surgery not found'], 404);
        }
        $operation->update(['custom_intraop_data' => $request->input('customIntraopData', [])]);
        return response()->json(['success' => true, 'customIntraopData' => $operation->custom_intraop_data]);
    }

    public function createBillTransaction(Request $request)
    {
        try {
            $request->validate([
                'operationId' => 'required|string',
                'surgeonFee' => 'required|numeric',
            ]);

            $operation = Operation::where('operation_id', $request->input('operationId'))->first();
            if (!$operation) {
                return response()->json(['error' => 'Surgery not found'], 404);
            }

            $operation->update(['status' => 'Completed']);

            $chargeIds = $request->input('chargeIds', []);
            $theaterCharges = $this->calculateChargesFromMaster('OT', $chargeIds);
            $surgeonFee = $request->input('surgeonFee');
            $anaesthetistFee = $request->input('anaesthetistFee', 0);

            $billId = $this->nextId(OtBill::class, 'bill_id', 'OT-BILL-');
            $totalAmount = $theaterCharges + $surgeonFee + $anaesthetistFee;

            $bill = OtBill::create([
                'bill_id' => $billId,
                'mrn' => $operation->mrn,
                'operation_id' => $operation->operation_id,
                'patient_name' => $operation->patient_name,
                'theater_charges' => $theaterCharges,
                'surgeon_fee' => $surgeonFee,
                'anaesthetist_fee' => $anaesthetistFee ?: null,
                'total_amount' => $totalAmount,
                'payment_status' => 'Pending',
                'history' => [],
            ]);

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => 'OT',
                'mrn' => $operation->mrn,
                'visit_id' => $operation->operation_id,
                'category' => 'Surgical Procedure',
                'debit' => $totalAmount,
                'credit' => 0,
                'reference_id' => $billId,
            ]);

            return response()->json($this->toCamel($bill), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }
}
