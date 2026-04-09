<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\IpdAdmission;
use App\Models\IpdBill;
use App\Models\IpdPayment;
use App\Models\BillCorrection;
use App\Models\NursingRecord;
use App\Models\VitalEntry;
use App\Models\Bed;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class IpdController extends Controller
{
    use HmsHelpers;

    public function admissions()
    {
        return response()->json($this->toCamelCollection(IpdAdmission::all()));
    }

    public function bills()
    {
        $bills = IpdBill::all();
        $result = [];
        foreach ($bills as $bill) {
            $data = $this->toCamel($bill);
            $correctedFields = BillCorrection::where('bill_id', $bill->bill_id)
                ->select('field_name')
                ->distinct()
                ->pluck('field_name')
                ->toArray();
            $data['correctedFields'] = $correctedFields;
            $result[] = $data;
        }
        return response()->json($result);
    }

    public function nursingRecords()
    {
        return response()->json($this->toCamelCollection(NursingRecord::all()));
    }

    public function getNursingRecord($id)
    {
        $record = NursingRecord::where('record_id', $id)->first();
        if (!$record) {
            return response()->json(['error' => 'Nursing record not found'], 404);
        }

        $entries = VitalEntry::where('vital_master_id', $id)->get();
        $result = $this->toCamel($record);
        $result['entries'] = $this->toCamelCollection($entries);

        return response()->json($result);
    }

    public function createAdmissionTransaction(Request $request)
    {
        try {
            $request->validate([
                'mrn' => 'required|string',
                'doctorName' => 'required|string',
                'department' => 'required|string',
                'doctorFee' => 'required|numeric',
            ]);

            $patient = Patient::where('mrn', $request->input('mrn'))->first();
            if (!$patient) {
                return response()->json(['error' => 'Patient not found'], 404);
            }

            $chargeIds = $request->input('chargeIds', []);
            $roomCharges = $this->calculateChargesFromMaster('IPD', $chargeIds);
            $doctorFee = $request->input('doctorFee');

            $mandatoryIds = \App\Models\HospitalCharge::where('module', 'IPD')
                ->where('is_mandatory', true)
                ->pluck('charge_id')
                ->toArray();
            $allChargeIds = array_values(array_unique(array_merge($mandatoryIds, $chargeIds)));

            $patient->increment('visit_count');
            $patient->update(['last_visit_date' => Carbon::now()]);

            $ipdAdmissionCount = IpdAdmission::where('mrn', $patient->mrn)->count() + 1;
            $admissionId = $this->nextIdFromSeries(IpdAdmission::class, 'admission_id', 'admission_id', \App\Models\IpdNumberSeries::class);

            $admission = IpdAdmission::create([
                'admission_id' => $admissionId,
                'admission_number' => $ipdAdmissionCount,
                'mrn' => $patient->mrn,
                'patient_name' => $patient->name,
                'doctor_name' => $request->input('doctorName'),
                'department' => $request->input('department'),
                'admission_date' => Carbon::now(),
                'admission_source' => $request->input('admissionSource', 'Outpatient'),
                'status' => 'Active',
                'payment_status' => 'Pending',
                'admission_type' => $request->input('admissionType', 'Routine'),
                'initial_diagnosis' => $request->input('initialDiagnosis', ''),
                'estimated_stay' => $request->input('estimatedStay', ''),
                'ward' => $request->input('ward', ''),
                'floor_room' => $request->input('floorRoom', ''),
                'bed' => $request->input('bed', ''),
                'bed_id' => $request->input('bedId'),
                'registered_by' => auth()->user()->name ?? null,
            ]);

            $billId = $this->nextId(IpdBill::class, 'bill_id', 'IPD-BILL-');
            $totalAmount = $roomCharges + $doctorFee;

            $bill = IpdBill::create([
                'bill_id' => $billId,
                'mrn' => $patient->mrn,
                'admission_id' => $admissionId,
                'patient_name' => $patient->name,
                'room_charges' => $roomCharges,
                'doctor_fee' => $doctorFee,
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'payment_status' => 'Pending',
                'history' => [],
                'charge_ids' => $allChargeIds,
            ]);

            if ($request->input('bedId')) {
                $bed = Bed::where('bed_id', $request->input('bedId'))->first();
                if ($bed) {
                    $bed->update([
                        'status' => 'Occupied',
                        'assigned_patient_name' => $patient->name,
                        'assigned_patient_mrn' => $patient->mrn,
                        'admission_date' => Carbon::now(),
                    ]);
                }
            }

            $existingNursing = NursingRecord::where('admission_id', $admissionId)->first();
            if (!$existingNursing) {
                $nursingId = $this->nextId(NursingRecord::class, 'record_id', 'NRS-');
                NursingRecord::create([
                    'record_id' => $nursingId,
                    'mrn' => $patient->mrn,
                    'admission_id' => $admissionId,
                    'patient_name' => $patient->name,
                    'status' => 'Pending Initial Vitals',
                    'initial_vitals_completed' => false,
                    'discharge_vitals_completed' => false,
                ]);
                $this->logActivity($patient->mrn, 'Vital Master Record Created', 'IPD', "Ref: {$nursingId}");
            }

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => 'IPD',
                'mrn' => $patient->mrn,
                'visit_id' => (string) $admissionId,
                'category' => 'Inpatient Admission',
                'debit' => $totalAmount,
                'credit' => 0,
                'reference_id' => $billId,
            ]);

            $ward = $request->input('ward', '');
            $this->logActivity($patient->mrn, 'Inpatient Admission confirmed', 'IPD', "Ward: {$ward} | Bill: {$billId}");

            return response()->json([
                'admission' => $this->toCamel($admission),
                'bill' => $this->toCamel($bill),
            ], 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function getNursingRecordByAdmission($admissionId)
    {
        $record = NursingRecord::where('admission_id', $admissionId)->first();
        if (!$record) {
            return response()->json(['error' => 'Nursing record not found for this admission.'], 404);
        }
        $entries = VitalEntry::where('vital_master_id', $record->record_id)
            ->orderBy('recorded_at', 'desc')->get();
        $result = $this->toCamel($record);
        $result['entries'] = $this->toCamelCollection($entries);
        return response()->json($result);
    }

    public function addNursingVitalEntry($id, Request $request)
    {
        try {
            $request->validate([
                'category'    => 'required|string',
                'bpSystolic'  => 'nullable|integer',
                'bpDiastolic' => 'nullable|integer',
                'pulse'       => 'nullable|integer',
                'temperature' => 'nullable|numeric',
                'respiration' => 'nullable|integer',
                'spO2'        => 'nullable|integer',
                'weight'      => 'nullable|numeric',
                'height'      => 'nullable|numeric',
                'bloodSugar'  => 'nullable|numeric',
                'painScale'   => 'nullable|integer|min:0|max:10',
                'notes'       => 'nullable|string',
            ]);

            $master = NursingRecord::where('record_id', $id)->first();
            if (!$master) {
                return response()->json(['error' => 'Nursing master record not found.'], 404);
            }

            $category = $request->input('category');

            if ($category === 'Initial' && $master->initial_vitals_completed) {
                return response()->json(['error' => 'Initial vitals already recorded.'], 422);
            }
            if ($category === 'Discharge' && !$master->initial_vitals_completed) {
                return response()->json(['error' => 'Cannot record discharge vitals before initial assessment.'], 422);
            }
            if ($category === 'Discharge' && $master->discharge_vitals_completed) {
                return response()->json(['error' => 'Discharge vitals already recorded.'], 422);
            }

            $entryId = 'ENT-' . time();
            $now = Carbon::now();

            $entry = VitalEntry::create([
                'entry_id'       => $entryId,
                'vital_master_id'=> $id,
                'category'       => $category,
                'bp_systolic'    => $request->input('bpSystolic'),
                'bp_diastolic'   => $request->input('bpDiastolic'),
                'pulse'          => $request->input('pulse'),
                'temperature'    => $request->input('temperature'),
                'respiration'    => $request->input('respiration'),
                'sp_o2'          => $request->input('spO2'),
                'weight'         => $request->input('weight'),
                'height'         => $request->input('height'),
                'blood_sugar'    => $request->input('bloodSugar'),
                'pain_scale'     => $request->input('painScale'),
                'notes'          => $request->input('notes'),
                'recorded_by'    => 'Nurse. J. Doe',
                'recorded_at'    => $now,
            ]);

            $updateData = ['updated_at' => $now];

            if ($category === 'Initial') {
                $updateData['initial_vitals_completed'] = true;
                $updateData['status'] = 'Under Monitoring';
            } elseif ($category === 'Discharge') {
                $updateData['discharge_vitals_completed'] = true;
                $updateData['status'] = 'Assessment Completed';
            }

            $master->update($updateData);

            $this->logActivity($master->mrn, "Clinical Vital Recorded: {$category}", 'IPD', "Master Ref: {$id}");

            return response()->json($this->toCamel($entry), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function addAdditionalCharges(Request $request, $billId)
    {
        try {
            $request->validate([
                'items' => 'required|array|min:1',
                'items.*.type' => 'required|string|in:doctor_fee,hospital_charge',
            ]);

            $bill = IpdBill::where('bill_id', $billId)->first();
            if (!$bill) {
                return response()->json(['error' => 'Bill not found'], 404);
            }

            $items = $request->input('items');
            $additionalTotal = 0;
            $additionalEntries = $bill->additional_charges ?? [];

            foreach ($items as $item) {
                $amount = (float)($item['amount'] ?? 0);
                $discount = (float)($item['discount'] ?? 0);
                $qty = max(1, (int)($item['qty'] ?? 1));
                $net = max(0, ($amount * $qty) - $discount);
                $additionalTotal += $net;

                $entry = [
                    'type' => $item['type'],
                    'name' => $item['name'] ?? '',
                    'amount' => $amount,
                    'qty' => $qty,
                    'discount' => $discount,
                    'net' => $net,
                    'addedAt' => now()->toISOString(),
                ];

                if ($item['type'] === 'doctor_fee') {
                    $entry['doctorId'] = $item['doctorId'] ?? null;
                    $entry['doctorName'] = $item['doctorName'] ?? '';
                    $entry['visitType'] = $item['visitType'] ?? '';
                } else {
                    $entry['chargeId'] = $item['chargeId'] ?? null;
                    $entry['category'] = $item['category'] ?? 'Hospital Charges';
                }

                $additionalEntries[] = $entry;
            }

            $newTotal = (float)$bill->total_amount + $additionalTotal;
            $paidAmount = (float)$bill->paid_amount;
            $paymentStatus = $paidAmount >= $newTotal ? 'Paid' : ($paidAmount > 0 ? 'Partial' : 'Pending');

            $bill->update([
                'additional_charges' => $additionalEntries,
                'total_amount' => $newTotal,
                'payment_status' => $paymentStatus,
            ]);

            IpdAdmission::where('admission_id', $bill->admission_id)->update([
                'payment_status' => $paymentStatus,
            ]);

            $this->postToLedger([
                'date' => now(),
                'source' => 'IPD',
                'mrn' => $bill->mrn,
                'visit_id' => $bill->admission_id,
                'category' => 'Additional Charges',
                'debit' => $additionalTotal,
                'credit' => 0,
                'reference_id' => $bill->bill_id,
            ]);

            $this->logActivity($bill->mrn, "Additional charges of {$additionalTotal} added to bill {$bill->bill_id}", 'IPD', "Items: " . count($items));

            return response()->json([
                'bill' => $this->toCamel($bill->fresh()),
            ]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function payments($billId)
    {
        $payments = IpdPayment::where('bill_id', $billId)->orderBy('created_at', 'desc')->get();
        return response()->json($this->toCamelCollection($payments));
    }

    public function addPayment(Request $request)
    {
        try {
            $request->validate([
                'billId' => 'required|string',
                'admissionId' => 'required|string',
                'mrn' => 'required|string',
                'amount' => 'required|numeric|min:0.01',
                'paymentMode' => 'required|string',
                'chargeIds' => 'present|array',
            ]);

            $bill = IpdBill::where('bill_id', $request->input('billId'))->first();
            if (!$bill) {
                return response()->json(['error' => 'Bill not found'], 404);
            }

            $currentPaid = (float)$bill->paid_amount;
            $totalAmount = (float)$bill->total_amount;
            $payAmount = (float)$request->input('amount');

            if (($currentPaid + $payAmount) > $totalAmount + 0.01) {
                return response()->json(['error' => 'Payment exceeds outstanding balance'], 422);
            }

            $paymentId = $this->nextId(IpdPayment::class, 'payment_id', 'IPAY-');
            $receiptNumber = 'IRCT-' . str_pad(IpdPayment::count() + 1, 6, '0', STR_PAD_LEFT);

            $payment = IpdPayment::create([
                'payment_id' => $paymentId,
                'bill_id' => $request->input('billId'),
                'admission_id' => $request->input('admissionId'),
                'mrn' => $request->input('mrn'),
                'amount' => $payAmount,
                'payment_mode' => $request->input('paymentMode'),
                'receipt_number' => $receiptNumber,
                'reference' => $request->input('reference', ''),
                'charge_ids' => $request->input('chargeIds'),
                'received_by' => $request->input('receivedBy', 'Admin / Sys'),
                'notes' => $request->input('notes', ''),
            ]);

            $newPaid = $currentPaid + $payAmount;
            $status = $newPaid >= $totalAmount ? 'Paid' : 'Partial';
            $bill->update([
                'paid_amount' => $newPaid,
                'payment_status' => $status,
            ]);

            IpdAdmission::where('admission_id', $bill->admission_id)->update([
                'payment_status' => $status,
            ]);

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => 'IPD',
                'mrn' => $request->input('mrn'),
                'visit_id' => $request->input('admissionId'),
                'category' => 'Payment Received',
                'debit' => 0,
                'credit' => $payAmount,
                'reference_id' => $paymentId,
            ]);

            $this->logActivity($request->input('mrn'), "Payment {$paymentId} of {$payAmount} received", 'IPD', "Bill: {$bill->bill_id} | Mode: {$request->input('paymentMode')}");

            return response()->json([
                'payment' => $this->toCamel($payment),
                'bill' => $this->toCamel($bill->fresh()),
            ], 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }


    public function getDischargeInfo($admissionId)
    {
        $adm = IpdAdmission::where('admission_id', $admissionId)->first();
        if (!$adm) return response()->json(['error' => 'Admission not found'], 404);
        $bill = \App\Models\IpdBill::where('admission_id', $admissionId)->first();
        $info = $adm->discharge_info ?? [];
        if (!isset($info['hospital'])) $info['hospital'] = ['amount' => $bill ? (float)$bill->total_amount : 0, 'verified' => false, 'paid' => false, 'receipt' => null, 'cleared_at' => null, 'payment_method' => null, 'paid_amount' => 0];
        if (!isset($info['pharmacy'])) $info['pharmacy'] = ['amount' => 0, 'verified' => false, 'paid' => false, 'receipt' => null, 'cleared_at' => null, 'payment_method' => null, 'paid_amount' => 0];
        if (!isset($info['lab']))      $info['lab']      = ['amount' => 0, 'verified' => false, 'paid' => false, 'receipt' => null, 'cleared_at' => null, 'payment_method' => null, 'paid_amount' => 0];
        return response()->json([
            'admissionId'    => $adm->admission_id,
            'status'         => $adm->status,
            'dischargeStatus'=> $adm->discharge_status,
            'dischargeInfo'  => $info,
            'hospitalAmount' => $bill ? (float)$bill->total_amount : 0,
        ]);
    }

    public function getHospitalDues($admissionId)
    {
        $adm = IpdAdmission::where('admission_id', $admissionId)->first();
        if (!$adm) return response()->json(['error' => 'Admission not found'], 404);

        $bill = \App\Models\IpdBill::where('admission_id', $admissionId)->first();

        if (!$bill) {
            $this->autoSetHospitalCleared($adm, 0);
            return response()->json([
                'hasPendingDues' => false,
                'cleared'        => true,
                'totalAmount'    => 0,
                'paidAmount'     => 0,
                'pendingAmount'  => 0,
                'billStatus'     => null,
                'roomCharges'    => 0,
                'doctorFee'      => 0,
                'additionalTotal'=> 0,
                'message'        => 'No hospital dues on record',
            ]);
        }

        $totalAmount    = (float)$bill->total_amount;
        $paidAmount     = (float)$bill->paid_amount;
        $pendingAmount  = max(0, $totalAmount - $paidAmount);
        $hasPendingDues = $bill->payment_status === 'Pending' && $pendingAmount > 0;

        $addlCharges = $bill->additional_charges ?? [];
        $addlTotal   = array_sum(array_map(fn($c) => (float)($c['amount'] ?? $c['unitPrice'] ?? 0) * (int)($c['qty'] ?? 1), $addlCharges));

        if (!$hasPendingDues) {
            $this->autoSetHospitalCleared($adm, $totalAmount);
        }

        return response()->json([
            'hasPendingDues' => $hasPendingDues,
            'cleared'        => !$hasPendingDues,
            'totalAmount'    => $totalAmount,
            'paidAmount'     => $paidAmount,
            'pendingAmount'  => $pendingAmount,
            'billStatus'     => $bill->payment_status,
            'roomCharges'    => (float)$bill->room_charges,
            'doctorFee'      => (float)$bill->doctor_fee,
            'additionalTotal'=> $addlTotal,
            'billId'         => $bill->bill_id,
        ]);
    }

    public function getClearanceDues($admissionId)
    {
        $adm = IpdAdmission::where('admission_id', $admissionId)->first();
        if (!$adm) return response()->json(['error' => 'Admission not found'], 404);

        // ── HOSPITAL ────────────────────────────────────────────────────────
        $bill        = \App\Models\IpdBill::where('admission_id', $admissionId)->first();
        $hospTotal   = $bill ? (float)$bill->total_amount   : 0;
        $hospPaid    = $bill ? (float)$bill->paid_amount    : 0;
        $hospPending = max(0, $hospTotal - $hospPaid);
        $hospCleared = !$bill || $bill->payment_status !== 'Pending' || $hospPending == 0;

        $hospBreakdown = [];
        if ($bill) {
            if ((float)$bill->room_charges > 0)
                $hospBreakdown[] = ['label' => 'Room Charges',  'amount' => (float)$bill->room_charges];
            if ((float)$bill->doctor_fee > 0)
                $hospBreakdown[] = ['label' => 'Doctor Fee',    'amount' => (float)$bill->doctor_fee];
            foreach ($bill->additional_charges ?? [] as $ac) {
                $amt = (float)($ac['amount'] ?? $ac['unitPrice'] ?? 0) * (int)($ac['qty'] ?? 1);
                if ($amt > 0)
                    $hospBreakdown[] = ['label' => $ac['name'] ?? 'Additional Charge', 'amount' => $amt];
            }
        }

        if ($hospCleared) $this->autoSetHospitalCleared($adm, $hospTotal);

        // ── PHARMACY ────────────────────────────────────────────────────────
        $pharmTxns = \App\Models\PharmacyTransaction::where('mrn', $adm->mrn)
            ->where('billed_to', 'IPD')
            ->orderBy('created_at', 'asc')
            ->get();
        $pharmBreakdown = [];
        $pharmPending   = 0;
        $pharmPaid      = 0;
        foreach ($pharmTxns as $pt) {
            $items = is_array($pt->items) ? $pt->items : json_decode($pt->items ?? '[]', true);
            foreach ($items as $item) {
                $amt = (float)($item['total'] ?? ($item['unitPrice'] * ($item['qty'] ?? 1)));
                $pharmBreakdown[] = [
                    'label'  => ($item['name'] ?? 'Medicine') . ' × ' . ($item['qty'] ?? 1),
                    'amount' => $amt,
                    'status' => $pt->payment_status,
                ];
            }
            if ($pt->payment_status === 'Pending') $pharmPending += (float)$pt->total_amount;
            else                                    $pharmPaid    += (float)$pt->total_amount;
        }
        $pharmTotal   = $pharmPending + $pharmPaid;
        $pharmCleared = $pharmPending == 0;

        // ── LAB ─────────────────────────────────────────────────────────────
        $labTxns = \App\Models\LabTransaction::where('mrn', $adm->mrn)
            ->orderBy('created_at', 'asc')
            ->get();
        $labBreakdown = [];
        $labPending   = 0;
        $labPaid      = 0;
        foreach ($labTxns as $lt) {
            $items = is_array($lt->items) ? $lt->items : json_decode($lt->items ?? '[]', true);
            foreach ($items as $item) {
                $amt = (float)($item['total'] ?? ($item['unitPrice'] * ($item['qty'] ?? 1)));
                $labBreakdown[] = [
                    'label'  => $item['name'] ?? 'Test',
                    'amount' => $amt,
                    'status' => $lt->payment_status,
                ];
            }
            if ($lt->payment_status === 'Pending') $labPending += (float)$lt->total_amount;
            else                                    $labPaid    += (float)$lt->total_amount;
        }
        $labTotal   = $labPending + $labPaid;
        $labCleared = $labPending == 0;

        return response()->json([
            'hospital' => [
                'cleared'   => $hospCleared,
                'total'     => $hospTotal,
                'paid'      => $hospPaid,
                'pending'   => $hospPending,
                'breakdown' => $hospBreakdown,
            ],
            'pharmacy' => [
                'cleared'   => $pharmCleared,
                'total'     => $pharmTotal,
                'paid'      => $pharmPaid,
                'pending'   => $pharmPending,
                'breakdown' => $pharmBreakdown,
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

    private function autoSetHospitalCleared($adm, $totalAmount)
    {
        $info = $adm->discharge_info ?? [];
        if (!isset($info['hospital'])) $info['hospital'] = [];
        if (empty($info['hospital']['paid'])) {
            $info['hospital']['paid']        = true;
            $info['hospital']['paid_amount'] = $totalAmount;
            $info['hospital']['cleared_at']  = now()->format('d-M-Y h:i A');
            $info['hospital']['cleared_by']  = 'Auto (Billing Verified)';
            $adm->update(['discharge_info' => $info]);
        }
    }

    public function initiateDischarge(Request $request, $admissionId)
    {
        $adm = IpdAdmission::where('admission_id', $admissionId)->first();
        if (!$adm) return response()->json(['error' => 'Admission not found'], 404);
        $bill = \App\Models\IpdBill::where('admission_id', $admissionId)->first();
        $hospAmt = $bill ? (float)$bill->total_amount : 0;
        $info = [
            'planned_discharge_date' => $request->input('plannedDischargeDate'),
            'planned_discharge_time' => $request->input('plannedDischargeTime'),
            'discharge_type'         => $request->input('dischargeType', 'Routine'),
            'readiness_checklist'    => $request->input('readinessChecklist', []),
            'hospital' => ['amount' => $hospAmt, 'verified' => false, 'paid' => false, 'receipt' => null, 'cleared_at' => null, 'payment_method' => null, 'paid_amount' => 0],
            'pharmacy' => ['amount' => (float)$request->input('pharmacyAmount', 0), 'verified' => false, 'paid' => false, 'receipt' => null, 'cleared_at' => null, 'payment_method' => null, 'paid_amount' => 0],
            'lab'      => ['amount' => (float)$request->input('labAmount', 0), 'verified' => false, 'paid' => false, 'receipt' => null, 'cleared_at' => null, 'payment_method' => null, 'paid_amount' => 0],
        ];
        $adm->update([
            'status'           => 'Discharge Requested',
            'discharge_status' => 'pending_clearance',
            'discharge_info'   => $info,
        ]);
        return response()->json(['success' => true, 'dischargeInfo' => $info]);
    }

    public function verifyDept(Request $request, $admissionId)
    {
        $adm = IpdAdmission::where('admission_id', $admissionId)->first();
        if (!$adm) return response()->json(['error' => 'Admission not found'], 404);
        $dept = $request->input('dept');
        if (!in_array($dept, ['hospital', 'pharmacy', 'lab'])) return response()->json(['error' => 'Invalid department'], 422);
        $info = $adm->discharge_info ?? [];
        if (!isset($info[$dept])) $info[$dept] = [];
        $info[$dept]['verified']    = true;
        $info[$dept]['verified_at'] = now()->format('d-M-Y h:i A');
        $info[$dept]['verified_by'] = $request->input('verifiedBy', 'Billing');
        $adm->update(['discharge_info' => $info]);
        return response()->json(['success' => true, 'dischargeInfo' => $info]);
    }

    public function payDept(Request $request, $admissionId)
    {
        $adm = IpdAdmission::where('admission_id', $admissionId)->first();
        if (!$adm) return response()->json(['error' => 'Admission not found'], 404);
        $dept = $request->input('dept');
        if (!in_array($dept, ['hospital', 'pharmacy', 'lab'])) return response()->json(['error' => 'Invalid department'], 422);
        $info = $adm->discharge_info ?? [];
        if (!isset($info[$dept])) $info[$dept] = [];
        $prefixMap = ['hospital' => 'HOSP', 'pharmacy' => 'PHRM', 'lab' => 'LAB'];
        $prefix = $prefixMap[$dept];
        $info[$dept]['paid']           = true;
        $info[$dept]['paid_amount']    = (float)$request->input('paidAmount', $info[$dept]['amount'] ?? 0);
        $info[$dept]['payment_method'] = $request->input('paymentMethod', 'Cash');
        $info[$dept]['receipt']        = $prefix . '-RCP-' . date('Y') . '-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        $info[$dept]['cleared_at']     = now()->format('d-M-Y h:i A');
        $allPaid = !empty($info['hospital']['paid']) && !empty($info['pharmacy']['paid']) && !empty($info['lab']['paid']);
        $adm->update([
            'discharge_status' => $allPaid ? 'all_cleared' : 'pending_clearance',
            'discharge_info'   => $info,
        ]);
        return response()->json(['success' => true, 'allCleared' => $allPaid, 'dischargeInfo' => $info]);
    }

    public function completeDischarge(Request $request, $admissionId)
    {
        $adm = IpdAdmission::where('admission_id', $admissionId)->first();
        if (!$adm) return response()->json(['error' => 'Admission not found'], 404);
        $info = $adm->discharge_info ?? [];
        $info['final_diagnosis']        = $request->input('finalDiagnosis', '');
        $info['condition_at_discharge'] = $request->input('conditionAtDischarge', '');
        $info['follow_up_info']         = $request->input('followUpInfo', []);
        $info['special_instructions']   = $request->input('specialInstructions', '');
        $info['discharge_date']         = $request->input('dischargeDate', now()->format('Y-m-d'));
        $info['discharge_time']         = $request->input('dischargeTime', now()->format('H:i'));
        $info['discharge_type']         = $request->input('dischargeType', $info['discharge_type'] ?? 'Routine');
        $info['discharged_at']          = now()->format('d-M-Y h:i A');
        $info['discharged_by']          = $request->input('dischargedBy', 'Doctor');
        if ($adm->bed_id) {
            \App\Models\Bed::where('bed_id', $adm->bed_id)->update(['status' => 'Available']);
        }
        $adm->update([
            'status'           => 'Discharged',
            'discharge_status' => 'discharged',
            'discharge_info'   => $info,
        ]);
        $totalPaid = ($info['hospital']['paid_amount'] ?? 0) + ($info['pharmacy']['paid_amount'] ?? 0) + ($info['lab']['paid_amount'] ?? 0);
        return response()->json([
            'success'          => true,
            'dischargeInfo'    => $info,
            'totalPaid'        => $totalPaid,
            'patientName'      => $adm->patient_name,
            'admissionId'      => $adm->admission_id,
            'dischargeDate'    => $info['discharge_date'],
        ]);
    }

    public function correctionLog($billId)
    {
        $corrections = BillCorrection::where('bill_id', $billId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($this->toCamelCollection($corrections));
    }

    public function saveCorrections(Request $request, $billId)
    {
        try {
            $request->validate([
                'corrections' => 'required|array|min:1',
                'corrections.*.section' => 'required|string',
                'corrections.*.fieldName' => 'required|string',
                'corrections.*.oldValue' => 'present',
                'corrections.*.newValue' => 'present',
                'reason' => 'nullable|string',
                'doctorFee' => 'nullable|numeric|min:0',
                'roomCharges' => 'nullable|numeric|min:0',
            ]);

            $bill = IpdBill::where('bill_id', $billId)->first();
            if (!$bill) {
                return response()->json(['error' => 'Bill not found'], 404);
            }

            $corrections = $request->input('corrections');
            $reason = $request->input('reason', '');
            $saved = [];

            foreach ($corrections as $c) {
                $oldVal = is_array($c['oldValue']) ? json_encode($c['oldValue']) : (string)$c['oldValue'];
                $newVal = is_array($c['newValue']) ? json_encode($c['newValue']) : (string)$c['newValue'];

                if ($oldVal === $newVal) continue;

                $correctionId = $this->nextId(BillCorrection::class, 'correction_id', 'COR-');

                $record = BillCorrection::create([
                    'correction_id' => $correctionId,
                    'bill_id' => $billId,
                    'visit_id' => $bill->admission_id,
                    'mrn' => $bill->mrn,
                    'section' => $c['section'],
                    'field_name' => $c['fieldName'],
                    'old_value' => $oldVal,
                    'new_value' => $newVal,
                    'corrected_by' => $request->input('correctedBy', 'Admin'),
                    'reason' => $reason,
                ]);
                $saved[] = $record;
            }

            $doctorFee = $request->input('doctorFee');
            $roomCharges = $request->input('roomCharges');
            $additionalCharges = $request->input('additionalCharges');
            $removeChargeIds = $request->input('removeChargeIds', []);

            $updates = [];
            if ($doctorFee !== null) $updates['doctor_fee'] = (float)$doctorFee;
            if ($roomCharges !== null) $updates['room_charges'] = (float)$roomCharges;
            if ($additionalCharges !== null) $updates['additional_charges'] = $additionalCharges;

            if (!empty($removeChargeIds)) {
                $currentChargeIds = $bill->charge_ids ?? [];
                $remainingChargeIds = array_values(array_diff($currentChargeIds, $removeChargeIds));
                $updates['charge_ids'] = $remainingChargeIds;
            }

            $oldTotal = (float)$bill->total_amount;

            if (!empty($updates)) {
                $bill->update($updates);
                $bill->refresh();

                $chargeIdsTotal = 0;
                $remainingCids = $bill->charge_ids ?? [];
                if (!empty($remainingCids)) {
                    $chargeIdsTotal = (float)\App\Models\HospitalCharge::whereIn('charge_id', $remainingCids)->sum('amount');
                }
                $newTotal = (float)$bill->doctor_fee + (float)$bill->room_charges + $chargeIdsTotal;
                $addl = $bill->additional_charges ?? [];
                foreach ($addl as $ac) {
                    $newTotal += (float)($ac['net'] ?? 0);
                }

                $paidAmount = (float)$bill->paid_amount;

                if ($paidAmount > $newTotal && $newTotal < $oldTotal) {
                    $refundAmount = $paidAmount - $newTotal;
                    $paidAmount = $newTotal;
                    $bill->update(['paid_amount' => $paidAmount]);

                    $this->postToLedger([
                        'date' => Carbon::now(),
                        'source' => 'IPD',
                        'mrn' => $bill->mrn,
                        'visit_id' => $bill->admission_id,
                        'category' => 'Bill Correction Adjustment',
                        'debit' => $refundAmount,
                        'credit' => 0,
                        'reference_id' => $billId,
                    ]);
                }

                $paymentStatus = $paidAmount >= $newTotal ? 'Paid' : ($paidAmount > 0 ? 'Partial' : 'Pending');

                $bill->update([
                    'total_amount' => $newTotal,
                    'payment_status' => $paymentStatus,
                ]);

                IpdAdmission::where('admission_id', $bill->admission_id)->update([
                    'payment_status' => $paymentStatus,
                ]);
            }

            $this->logActivity($bill->mrn, "Bill correction applied to {$billId}", 'IPD', "Corrections: " . count($saved));

            $freshBill = $bill->fresh();
            $billData = $this->toCamel($freshBill);
            $correctedFields = BillCorrection::where('bill_id', $billId)
                ->select('field_name')
                ->distinct()
                ->pluck('field_name')
                ->toArray();
            $billData['correctedFields'] = $correctedFields;

            return response()->json([
                'bill' => $billData,
                'corrections' => $this->toCamelCollection(collect($saved)),
            ]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function saveCustomOrderData(Request $request, string $admissionId)
    {
        try {
            $adm = IpdAdmission::where('admission_id', $admissionId)->first();
            if (!$adm) return response()->json(['error' => 'Admission not found'], 404);
            $adm->update(['custom_order_data' => $request->input('customOrderData', [])]);
            return response()->json(['success' => true, 'customOrderData' => $adm->custom_order_data]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }
}
