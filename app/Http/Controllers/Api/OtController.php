<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Operation;
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

    public function createOperation(Request $request)
    {
        try {
            $request->validate([
                'mrn'       => 'required|string',
                'procedure' => 'required|string',
                'surgeon'   => 'required|string',
                'theater'   => 'required|string',
            ]);

            $patient = Patient::where('mrn', $request->input('mrn'))->first();
            if (!$patient) {
                return response()->json(['error' => 'Patient not found'], 404);
            }

            $patient->increment('visit_count');
            $patient->update(['last_visit_date' => Carbon::now()]);

            $otCount     = Operation::where('mrn', $patient->mrn)->count() + 1;
            $operationId = $patient->mrn . '-OT-' . $otCount;

            $operation = Operation::create([
                'operation_id'       => $operationId,
                'operation_number'   => $otCount,
                'mrn'                => $patient->mrn,
                'patient_name'       => $patient->name,
                'age'                => $patient->age,
                'gender'             => $patient->gender,
                'phone'              => $patient->phone,
                'cnic'               => $patient->cnic,
                'procedure'          => $request->input('procedure'),
                'surgery_type'       => $request->input('surgeryType', 'Elective'),
                'prev_related_surgery' => false,
                'start_time'         => $request->input('startTime'),
                'surgery_date'       => $request->input('surgeryDate'),
                'estimated_duration' => $request->input('estimatedDuration', 2),
                'priority'           => $request->input('priority', 'Elective'),
                'booking_status'     => '',
                'status'             => 'Scheduled',
                'payment_status'     => 'Pending',
                'admission_source'   => $request->input('admissionSource', 'IPD'),
                'surgeon'            => $request->input('surgeon'),
                'anaesthetist'       => $request->input('anaesthetist'),
                'anaesthetist_fee'   => $request->input('anaesthetistFee'),
                'theater'            => $request->input('theater'),
                'registered_by'      => auth()->user()->name ?? null,
            ]);

            $this->logActivity($patient->mrn, "Surgery Scheduled: {$request->input('procedure')}", 'OT');

            return response()->json($this->toCamel($operation), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }
}
