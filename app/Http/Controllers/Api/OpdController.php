<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\OpdVisit;
use App\Models\OpdBill;
use App\Models\OpdVital;
use App\Models\OpdConsultation;
use App\Models\OpdPayment;
use App\Models\BillCorrection;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OpdController extends Controller
{
    use HmsHelpers;

    public function visits()
    {
        return response()->json($this->toCamelCollection(OpdVisit::all()));
    }

    public function bills()
    {
        $bills = OpdBill::all();
        $result = [];
        foreach ($bills as $bill) {
            $row = $this->toCamel($bill);
            $correctedFields = BillCorrection::where('bill_id', $bill->bill_id)
                ->select('field_name')
                ->distinct()
                ->pluck('field_name')
                ->toArray();
            $row['correctedFields'] = $correctedFields;
            $result[] = $row;
        }
        return response()->json($result);
    }

    public function allVitals()
    {
        return response()->json($this->toCamelCollection(OpdVital::all()));
    }

    public function vitals($visitId)
    {
        $vitals = OpdVital::where('visit_id', $visitId)->get();
        return response()->json($this->toCamelCollection($vitals));
    }

    public function consultations()
    {
        return response()->json($this->toCamelCollection(OpdConsultation::all()));
    }

    public function createVisitTransaction(Request $request)
    {
        try {
            $request->validate([
                'doctorName' => 'required|string',
                'department' => 'required|string',
                'doctorFee'  => 'required|numeric',
            ]);

            [$patient, $visit, $bill] = DB::transaction(function () use ($request) {
                // ── Resolve or create patient ─────────────────────────────────────
                if ($request->filled('mrn')) {
                    $patient = Patient::where('mrn', $request->input('mrn'))->first();
                    if (!$patient) {
                        throw new \Exception('Patient not found');
                    }
                } else {
                    $np = $request->input('newPatient', []);
                    if (empty($np['name'])) throw new \Exception('Patient name is required');
                    if (empty($np['age']))  throw new \Exception('Patient age is required');
                    if (empty($np['gender'])) throw new \Exception('Patient gender is required');
                    if (empty($np['phone'])) throw new \Exception('Patient phone is required');

                    $contactType = $np['contactType'] ?? 'SELF';
                    if ($contactType === 'SELF') {
                        $existing = Patient::where('phone', $np['phone'])->where('contact_type', 'SELF')->first();
                        if ($existing) {
                            throw new \Exception("Phone {$np['phone']} is already registered as SELF for patient {$existing->name} ({$existing->mrn}).");
                        }
                    }

                    $mrn = $this->generateYearId(Patient::class, 'mrn', 'MRN');
                    $patient = Patient::create([
                        'mrn'                    => $mrn,
                        'name'                   => $np['name'],
                        'age'                    => (int)$np['age'],
                        'gender'                 => $np['gender'],
                        'phone'                  => $np['phone'],
                        'cnic'                   => $np['cnic'] ?? '',
                        'visit_count'            => 0,
                        'is_locked'              => false,
                        'blood_group'            => $np['bloodGroup'] ?? null,
                        'address'                => $np['address'] ?? null,
                        'first_visit_date'       => Carbon::now(),
                        'last_visit_date'        => Carbon::now(),
                        'allergies'              => $np['allergies'] ?? [],
                        'contact_type'           => $contactType,
                        'guardian_name'          => $np['guardianName'] ?? null,
                        'guardian_phone'         => $np['guardianPhone'] ?? null,
                        'guardian_cnic'          => $np['guardianCnic'] ?? '',
                        'relationship_to_patient'=> $contactType === 'SELF' ? 'Self' : ($np['relationshipToPatient'] ?? null),
                        'status'                 => 'ACTIVE',
                    ]);
                    $this->logActivity($mrn, 'Registered new patient profile', 'OPD');
                }

                // ── Charges ───────────────────────────────────────────────────────
                $chargeIds = $request->input('chargeIds', []);
                $consultationCharges = $this->calculateChargesFromMaster('OPD', $chargeIds);
                $doctorFee = $request->input('doctorFee');

                $mandatoryIds = \App\Models\HospitalCharge::where('module', 'OPD')
                    ->where('is_mandatory', true)
                    ->pluck('charge_id')
                    ->toArray();
                $allChargeIds = array_values(array_unique(array_merge($mandatoryIds, $chargeIds)));

                // ── Update patient visit stats ────────────────────────────────────
                $patient->increment('visit_count');
                $patient->update(['last_visit_date' => Carbon::now()]);

                // ── Visit ─────────────────────────────────────────────────────────
                $opdVisitCount = OpdVisit::where('mrn', $patient->mrn)->count() + 1;
                $visitId = $this->nextIdFromSeries(OpdVisit::class, 'visit_id', 'visit_id', \App\Models\OpdNumberSeries::class);

                $visit = OpdVisit::create([
                    'visit_id'         => $visitId,
                    'visit_number'     => $opdVisitCount,
                    'mrn'              => $patient->mrn,
                    'patient_name'     => $patient->name,
                    'doctor_name'      => $request->input('doctorName'),
                    'department'       => $request->input('department'),
                    'visit_type'       => $request->input('visitType', 'New Consultation'),
                    'referred_by'      => $request->input('referredBy', 'Self'),
                    'consultation_date'=> Carbon::now(),
                    'status'           => 'Active',
                    'payment_status'   => 'Pending',
                    'registered_by'    => auth()->user()->name ?? null,
                ]);

                // ── Bill ──────────────────────────────────────────────────────────
                $billId = $this->nextId(OpdBill::class, 'bill_id', 'BILL-');
                $totalAmount = $consultationCharges + $doctorFee;

                $bill = OpdBill::create([
                    'bill_id'               => $billId,
                    'mrn'                   => $patient->mrn,
                    'visit_id'              => $visitId,
                    'patient_name'          => $patient->name,
                    'consultation_charges'  => $consultationCharges,
                    'doctor_fee'            => $doctorFee,
                    'total_amount'          => $totalAmount,
                    'payment_status'        => 'Pending',
                    'history'               => [],
                    'charge_ids'            => $allChargeIds,
                ]);

                $this->postToLedger([
                    'date'         => Carbon::now(),
                    'source'       => 'OPD',
                    'mrn'          => $patient->mrn,
                    'visit_id'     => $visitId,
                    'category'     => 'Consultation & Services',
                    'debit'        => $totalAmount,
                    'credit'       => 0,
                    'reference_id' => $billId,
                ]);

                $this->logActivity($patient->mrn, "New OPD Visit #{$visit->visit_number} created", 'OPD', "Visit: {$visitId} | Bill: {$billId}");

                return [$patient, $visit, $bill];
            });

            return response()->json([
                'patient' => $this->toCamel($patient),
                'visit'   => $this->toCamel($visit),
                'bill'    => $this->toCamel($bill),
            ], 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function addVital(Request $request)
    {
        try {
            $request->validate([
                'mrn' => 'required|string',
                'visitId' => 'required|string',
            ]);

            $vitalId = $this->nextId(OpdVital::class, 'vital_id', 'VTL-');

            $vital = OpdVital::create([
                'vital_id'           => $vitalId,
                'mrn'                => $request->input('mrn'),
                'visit_id'           => $request->input('visitId'),
                'temperature'        => $request->input('temperature'),
                'systolic'           => $request->input('systolic'),
                'diastolic'          => $request->input('diastolic'),
                'heart_rate'         => $request->input('heartRate'),
                'sp_o2'              => $request->input('spO2'),
                'respiratory_rate'   => $request->input('respiratoryRate'),
                'weight'             => $request->input('weight'),
                'blood_sugar'        => $request->input('bloodSugar'),
                'pain_scale'         => $request->input('painScale'),
                'notes'              => $request->input('notes'),
                'height'             => $request->input('height'),
                'temperature_c'      => $request->input('temperatureC'),
                'bmi'                => $request->input('bmi'),
                'head_circumference' => $request->input('headCircumference'),
                'waist_circumference'=> $request->input('waistCircumference'),
                'urine_output'       => $request->input('urineOutput'),
                'glasgow_coma'       => $request->input('glasgowComa'),
                'recorded_at'        => Carbon::now(),
                'recorded_by'        => $request->input('recordedBy', 'Admin / Sys'),
            ]);

            return response()->json($this->toCamel($vital), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function addConsultation(Request $request)
    {
        try {
            $request->validate([
                'visitId' => 'required|string',
                'mrn' => 'required|string',
                'doctorName' => 'required|string',
            ]);

            $consultationId = $this->nextId(OpdConsultation::class, 'consultation_id', 'CON-');

            $consultation = OpdConsultation::create([
                'consultation_id' => $consultationId,
                'visit_id' => $request->input('visitId'),
                'mrn' => $request->input('mrn'),
                'doctor_name' => $request->input('doctorName'),
                'consultation_date' => Carbon::now(),
                'symptoms' => $request->input('symptoms', []),
                'clinical_findings' => $request->input('clinicalFindings', ''),
                'provisional_diagnosis' => $request->input('provisionalDiagnosis', ''),
                'final_diagnosis' => $request->input('finalDiagnosis', ''),
                'prescriptions' => $request->input('prescriptions', []),
                'investigation_orders' => $request->input('investigationOrders', []),
                'doctor_notes' => $request->input('doctorNotes', ''),
                'custom_section_data' => $request->input('customSectionData', []),
                'outcome' => $request->input('outcome', 'In Progress'),
                'outcome_notes' => $request->input('outcomeNotes'),
            ]);

            return response()->json($this->toCamel($consultation), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function updateConsultation(Request $request, $consultationId)
    {
        try {
            $consultation = OpdConsultation::where('consultation_id', $consultationId)->first();
            if (!$consultation) {
                return response()->json(['error' => 'Consultation not found'], 404);
            }

            $fields = [
                'symptoms' => 'symptoms',
                'clinicalFindings' => 'clinical_findings',
                'provisionalDiagnosis' => 'provisional_diagnosis',
                'finalDiagnosis' => 'final_diagnosis',
                'prescriptions' => 'prescriptions',
                'investigationOrders' => 'investigation_orders',
                'doctorNotes' => 'doctor_notes',
                'customSectionData' => 'custom_section_data',
                'outcome' => 'outcome',
                'outcomeNotes' => 'outcome_notes',
            ];

            $updateData = [];
            foreach ($fields as $camel => $snake) {
                if ($request->has($camel)) {
                    $updateData[$snake] = $request->input($camel);
                }
            }

            $consultation->update($updateData);

            return response()->json($this->toCamel($consultation->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function addAdditionalCharges(Request $request, $billId)
    {
        try {
            $request->validate([
                'items' => 'required|array|min:1',
                'items.*.type' => 'required|string|in:doctor_fee,hospital_charge',
            ]);

            $bill = OpdBill::where('bill_id', $billId)->first();
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

            OpdVisit::where('visit_id', $bill->visit_id)->update([
                'payment_status' => $paymentStatus,
            ]);

            $this->postToLedger([
                'date' => now(),
                'source' => 'OPD',
                'mrn' => $bill->mrn,
                'visit_id' => $bill->visit_id,
                'category' => 'Additional Charges',
                'debit' => $additionalTotal,
                'credit' => 0,
                'reference_id' => $bill->bill_id,
            ]);

            $this->logActivity($bill->mrn, "Additional charges of {$additionalTotal} added to bill {$bill->bill_id}", 'OPD', "Items: " . count($items));

            return response()->json([
                'bill' => $this->toCamel($bill->fresh()),
            ]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function payments($billId)
    {
        $payments = OpdPayment::where('bill_id', $billId)->orderBy('created_at', 'desc')->get();
        return response()->json($this->toCamelCollection($payments));
    }

    public function addPayment(Request $request)
    {
        try {
            $request->validate([
                'billId' => 'required|string',
                'visitId' => 'required|string',
                'mrn' => 'required|string',
                'amount' => 'required|numeric|min:0.01',
                'paymentMode' => 'required|string',
                'chargeIds' => 'required|array|min:1',
            ]);

            $bill = OpdBill::where('bill_id', $request->input('billId'))->first();
            if (!$bill) {
                return response()->json(['error' => 'Bill not found'], 404);
            }

            $currentPaid = (float)$bill->paid_amount;
            $totalAmount = (float)$bill->total_amount;
            $payAmount = (float)$request->input('amount');

            if (($currentPaid + $payAmount) > $totalAmount + 0.01) {
                return response()->json(['error' => 'Payment exceeds outstanding balance'], 422);
            }

            $paymentId = $this->nextId(OpdPayment::class, 'payment_id', 'PAY-');
            $receiptNumber = 'RCT-' . str_pad(OpdPayment::count() + 1, 6, '0', STR_PAD_LEFT);

            $payment = OpdPayment::create([
                'payment_id' => $paymentId,
                'bill_id' => $request->input('billId'),
                'visit_id' => $request->input('visitId'),
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

            OpdVisit::where('visit_id', $bill->visit_id)->update([
                'payment_status' => $status,
            ]);

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => 'OPD',
                'mrn' => $request->input('mrn'),
                'visit_id' => $request->input('visitId'),
                'category' => 'Payment Received',
                'debit' => 0,
                'credit' => $payAmount,
                'reference_id' => $paymentId,
            ]);

            $this->logActivity($request->input('mrn'), "Payment {$paymentId} of {$payAmount} received", 'OPD', "Bill: {$bill->bill_id} | Mode: {$request->input('paymentMode')}");

            return response()->json([
                'payment' => $this->toCamel($payment),
                'bill' => $this->toCamel($bill->fresh()),
            ], 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
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
                'consultationCharges' => 'nullable|numeric|min:0',
            ]);

            $bill = OpdBill::where('bill_id', $billId)->first();
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
                    'visit_id' => $bill->visit_id,
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
            $consultationCharges = $request->input('consultationCharges');
            $additionalCharges = $request->input('additionalCharges');
            $removeChargeIds = $request->input('removeChargeIds', []);

            $updates = [];
            if ($doctorFee !== null) $updates['doctor_fee'] = (float)$doctorFee;
            if ($consultationCharges !== null) $updates['consultation_charges'] = (float)$consultationCharges;
            if ($additionalCharges !== null) $updates['additional_charges'] = $additionalCharges;

            if (!empty($removeChargeIds)) {
                $currentChargeIds = $bill->charge_ids ?? [];
                $remainingChargeIds = array_values(array_diff($currentChargeIds, $removeChargeIds));
                $updates['charge_ids'] = $remainingChargeIds;

                $newConsultation = 0;
                if (!empty($remainingChargeIds)) {
                    $newConsultation = \App\Models\HospitalCharge::whereIn('charge_id', $remainingChargeIds)->sum('amount');
                }
                $updates['consultation_charges'] = (float)$newConsultation;
            }

            $oldTotal = (float)$bill->total_amount;

            if (!empty($updates)) {
                $bill->update($updates);
                $bill->refresh();

                $newTotal = (float)$bill->doctor_fee + (float)$bill->consultation_charges;
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
                        'account_head' => 'OPD Revenue',
                        'description' => "Bill correction adjustment {$billId}: charges reduced from " . number_format($oldTotal, 2) . " to " . number_format($newTotal, 2),
                        'module' => 'OPD',
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

                OpdVisit::where('visit_id', $bill->visit_id)->update([
                    'payment_status' => $paymentStatus,
                ]);
            }

            $this->logActivity($bill->mrn, "Bill correction applied to {$billId}", 'OPD', "Corrections: " . count($saved));

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
}
