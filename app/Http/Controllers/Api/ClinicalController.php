<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicalOrder;
use App\Models\EmergencyVisit;
use App\Models\IpdAdmission;
use App\Models\LabOrder;
use App\Models\LabOrderTest;
use App\Models\MedicationOrder;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\ProgressNote;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClinicalController extends Controller
{
    use HmsHelpers;

    public function allOrders()
    {
        return response()->json($this->toCamelCollection(ClinicalOrder::all()));
    }

    public function investigationOrders()
    {
        $orders = ClinicalOrder::where('type', 'Investigation')
            ->orderBy('ordered_at', 'desc')
            ->get();

        $admissions = IpdAdmission::all()->keyBy('admission_id');
        $patients = Patient::all()->keyBy('mrn');

        $result = $orders->map(function ($order) use ($admissions, $patients) {
            $admission = $admissions->get($order->admission_id);
            $patient = $patients->get($order->mrn);
            $metadata = is_string($order->metadata) ? json_decode($order->metadata, true) : ($order->metadata ?? []);

            $statusMap = [
                'Active' => 'pending',
                'Ordered' => 'ordered',
                'Collected' => 'collected',
                'In Progress' => 'in-progress',
                'Completed' => 'completed',
                'Discontinued' => 'discontinued',
            ];

            return [
                'id' => $order->order_id,
                'mrn' => $order->mrn,
                'admissionId' => $order->admission_id,
                'patient' => $admission ? $admission->patient_name : ($patient ? $patient->name : $order->mrn),
                'bed' => $admission ? (($admission->ward ?? '') . ' / ' . ($admission->bed ?? '')) : '',
                'type' => ($metadata['investigationType'] ?? 'Laboratory') === 'Laboratory' ? 'lab' : 'radiology',
                'name' => $metadata['test'] ?? $order->details,
                'testCode' => $metadata['testCode'] ?? '',
                'dept' => $metadata['dept'] ?? '',
                'sampleType' => $metadata['sample'] ?? '',
                'price' => $metadata['price'] ?? '',
                'orderedBy' => $order->ordered_by,
                'priority' => strtolower($order->priority),
                'status' => $statusMap[$order->status] ?? 'pending',
                'date' => $order->ordered_at ? \Carbon\Carbon::parse($order->ordered_at)->format('d M, h:i A') : '',
                'orderedAt' => $order->ordered_at,
            ];
        });

        $grouped = $result->groupBy(function ($item) {
            return $item['mrn'] . '|' . $item['admissionId'];
        })->map(function ($items, $key) {
            $first = $items->first();
            return [
                'mrn' => $first['mrn'],
                'admissionId' => $first['admissionId'],
                'patient' => $first['patient'],
                'bed' => $first['bed'],
                'investigations' => $items->values()->toArray(),
            ];
        })->values();

        return response()->json([
            'grouped' => $grouped,
            'all' => $result->values(),
        ]);
    }

    public function orders($admissionId)
    {
        $orders = ClinicalOrder::where('admission_id', $admissionId)->get();
        return response()->json($this->toCamelCollection($orders));
    }

    public function addOrder(Request $request)
    {
        try {
            $request->validate([
                'mrn'         => 'required|string',
                'admissionId' => 'required|string',
                'type'        => 'required|string',
                'priority'    => 'required|string',
                'details'     => 'required|string',
                'orderedBy'   => 'required|string',
            ]);

            /* ── Retry loop: handles concurrent saves generating the same ID ── */
            $order = null;
            $maxAttempts = 10;
            for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
                try {
                    $order = DB::transaction(function () use ($request) {
                        $orderId = $this->nextId(ClinicalOrder::class, 'order_id', 'ORD-');
                        return ClinicalOrder::create([
                            'order_id'    => $orderId,
                            'mrn'         => $request->input('mrn'),
                            'admission_id'=> $request->input('admissionId'),
                            'type'        => $request->input('type'),
                            'priority'    => $request->input('priority'),
                            'details'     => $request->input('details'),
                            'status'      => 'Active',
                            'ordered_by'  => $request->input('orderedBy'),
                            'ordered_at'  => Carbon::now(),
                            'metadata'    => $request->input('metadata'),
                        ]);
                    });
                    break; // success — exit retry loop
                } catch (\Illuminate\Database\QueryException $e) {
                    /* Only retry on UNIQUE constraint violations */
                    if ($attempt < $maxAttempts - 1 && str_contains($e->getMessage(), 'UNIQUE')) {
                        usleep(rand(2000, 10000)); // 2–10 ms random back-off
                        continue;
                    }
                    throw $e;
                }
            }

            $this->logActivity($request->input('mrn'), "New Clinical Order: {$request->input('type')}", 'IPD', "Order Ref: {$order->order_id}");

            if ($request->input('type') === 'Medication' && $request->has('metadata')) {
                try {
                    $dept = strtoupper($request->input('department', 'IPD'));
                    $this->createMedicationOrderFromClinical($order, $dept);
                } catch (\Exception $e) {
                    \Log::warning('Failed to sync medication order: ' . $e->getMessage());
                }
            }

            return response()->json($this->toCamel($order), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    private function freqPerDay(string $freq): int
    {
        $map = ['OD' => 1, 'BD' => 2, 'TDS' => 3, 'QID' => 4, 'PRN' => 1, 'SOS' => 1];
        return $map[$freq] ?? 1;
    }

    private function parseDurationDays(?string $dur): int
    {
        if (!$dur) return 1;
        preg_match('/(\d+)/', $dur, $m);
        return isset($m[1]) ? (int) $m[1] : 1;
    }

    private function createMedicationOrderFromClinical(ClinicalOrder $order, string $department = 'IPD'): void
    {
        $md = $order->metadata ?? [];
        if (empty($md)) return;

        $isEr = ($department === 'ER');

        // Look up the admission/visit record depending on source
        $admission   = null;
        $erVisit     = null;
        if ($isEr) {
            $erVisit = EmergencyVisit::where('visit_id', $order->admission_id)->first();
        } else {
            $admission = IpdAdmission::where('admission_id', $order->admission_id)->first();
        }
        $patient = Patient::where('mrn', $order->mrn)->first();

        $medicineName = $md['medicine'] ?? $order->details;
        $dose         = (int) ($md['dose'] ?? 1);
        $unit         = $md['unit'] ?? 'tablet';
        $route        = $md['route'] ?? 'Oral';
        $frequency    = strtoupper($md['frequency'] ?? 'OD');
        $duration     = $md['duration'] ?? '1 day';
        $durationDays = $this->parseDurationDays($duration);
        $freqPerDay   = $this->freqPerDay($frequency);
        $totalQty     = $dose * $freqPerDay * $durationDays;

        $unitPrice   = 0;
        $medicineId  = $md['medicineId'] ?? null;
        $genericName = '';
        $form        = $unit;

        if ($medicineId) {
            $med = Medicine::where('medicine_id', $medicineId)->first();
            if ($med) {
                $unitPrice   = (float) $med->selling_price;
                $genericName = $med->generic_name ?? '';
                $form        = $med->form ?? $unit;
            }
        }

        $lineTotal = round($totalQty * $unitPrice, 2);
        $freqLabel = $this->freqLabel($frequency);

        // Build location / patient context per department
        if ($isEr) {
            $ward      = null;
            $bed       = null;
            $location  = 'Emergency Room';
            $diagnosis = $erVisit ? ($erVisit->chief_complaint ?? $erVisit->diagnosis ?? null) : null;
            $orderedBy = $erVisit ? ($erVisit->doctor_name ?? $order->ordered_by ?? '') : ($order->ordered_by ?? '');
            $patientName = $erVisit ? ($erVisit->patient_name ?? $order->mrn) : $order->mrn;
        } else {
            $ward      = $admission ? ($admission->ward ?? null) : null;
            $bed       = $admission ? ($admission->bed ?? null) : null;
            $location  = $ward ? 'IPD ' . $ward . ($bed ? ', ' . $bed : '') : 'IPD';
            $diagnosis = $admission ? ($admission->initial_diagnosis ?? null) : null;
            $orderedBy = $admission ? ($admission->doctor_name ?? $order->ordered_by ?? '') : ($order->ordered_by ?? '');
            $patientName = $admission ? $admission->patient_name : $order->mrn;
        }

        $patientAge    = $patient ? ($patient->age ?? null) : null;
        $patientGender = $patient ? ($patient->gender ?? null) : null;

        $newItem = [
            'medicineId' => $medicineId ?? '',
            'name'       => $medicineName,
            'generic'    => $genericName,
            'form'       => $form,
            'dose'       => $dose . ' ' . $unit,
            'frequency'  => $freqLabel,
            'duration'   => $duration,
            'route'      => $route,
            'totalQty'   => $totalQty,
            'unitPrice'  => $unitPrice,
            'total'      => $lineTotal,
            'orderId'    => $order->order_id,
        ];

        // Merge into an existing open order for today if one exists
        $existing = MedicationOrder::where('mrn', $order->mrn)
            ->where('visit_number', $order->admission_id)
            ->where('department', $department)
            ->whereIn('status', ['Pending', 'Verified'])
            ->whereDate('order_time', Carbon::today())
            ->orderByDesc('order_time')
            ->first();

        if ($existing) {
            $mergedItems = array_merge($existing->items ?? [], [$newItem]);
            $newTotal    = round(collect($mergedItems)->sum('total'), 2);
            $existing->update([
                'items'           => $mergedItems,
                'items_count'     => count($mergedItems),
                'order_value'     => $newTotal,
                'patient_payable' => $newTotal,
                'notes'           => ($existing->notes ?? '') . ', ' . $order->order_id,
            ]);
            return;
        }

        $rxId = $this->generateYearId(MedicationOrder::class, 'order_id', 'RX');

        MedicationOrder::create([
            'order_id'            => $rxId,
            'order_time'          => $order->ordered_at ?? Carbon::now(),
            'patient_name'        => $patientName,
            'mrn'                 => $order->mrn,
            'visit_number'        => $order->admission_id,
            'patient_age'         => $patientAge,
            'patient_gender'      => $patientGender,
            'patient_location'    => $location,
            'diagnosis'           => $diagnosis,
            'allergies'           => [],
            'current_medications' => [],
            'lab_values'          => [],
            'department'          => $department,
            'ward'                => $ward,
            'bed'                 => $bed,
            'priority'            => 'Routine',
            'items'               => [$newItem],
            'items_count'         => 1,
            'order_value'         => $lineTotal,
            'ordered_by'          => $orderedBy,
            'status'              => 'Pending',
            'payment_status'      => 'Pending',
            'payment_category'    => 'Cash',
            'patient_payable'     => $lineTotal,
            'panel_payable'       => 0,
            'coverage_status'     => null,
            'tat_minutes'         => 30,
            'clinical_checks'     => ['drugInteractions' => [], 'duplicateTherapy' => [], 'doseChecks' => [], 'substitutions' => []],
            'notes'               => 'Auto-generated from ' . $department . ' Clinical Order ' . $order->order_id,
        ]);
    }

    private function freqLabel(string $freq): string
    {
        $map = [
            'OD'  => 'OD (Once daily)',
            'BD'  => 'BD (Twice daily)',
            'TDS' => 'TDS (3x daily)',
            'QID' => 'QID (4x daily)',
            'PRN' => 'PRN (As needed)',
            'SOS' => 'SOS (Emergency)',
        ];
        return $map[$freq] ?? $freq;
    }

    public function discontinueOrder($orderId)
    {
        try {
            $order = ClinicalOrder::where('order_id', $orderId)->first();
            if (!$order) {
                return response()->json(['error' => 'Order not found'], 404);
            }

            $order->update(['status' => 'Discontinued']);

            return response()->json($this->toCamel($order->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'An unexpected error occurred');
        }
    }

    public function progressNotes($admissionId)
    {
        $notes = ProgressNote::where('admission_id', $admissionId)->get();
        return response()->json($this->toCamelCollection($notes));
    }

    public function addProgressNote(Request $request)
    {
        try {
            $request->validate([
                'mrn' => 'required|string',
                'admissionId' => 'required|string',
                'subjective' => 'required|string',
                'objective' => 'required|string',
                'assessment' => 'required|string',
                'plan' => 'required|string',
                'recordedBy' => 'required|string',
            ]);

            $noteId = $this->nextId(ProgressNote::class, 'note_id', 'NOTE-');

            $note = ProgressNote::create([
                'note_id' => $noteId,
                'mrn' => $request->input('mrn'),
                'admission_id' => $request->input('admissionId'),
                'subjective' => $request->input('subjective'),
                'objective' => $request->input('objective'),
                'assessment' => $request->input('assessment'),
                'plan' => $request->input('plan'),
                'recorded_by' => $request->input('recordedBy'),
                'recorded_at' => Carbon::now(),
            ]);

            $this->logActivity($request->input('mrn'), 'Progress Note Recorded', 'IPD');

            return response()->json($this->toCamel($note), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function erInvestigationOrders()
    {
        $orders = ClinicalOrder::where('type', 'Investigation')
            ->orderBy('ordered_at', 'desc')
            ->get()
            ->filter(function ($order) {
                return str_contains($order->admission_id, '-ER-');
            });

        $visits = \App\Models\EmergencyVisit::all()->keyBy('visit_id');
        $patients = Patient::all()->keyBy('mrn');

        $statusMap = [
            'Active' => 'pending', 'Ordered' => 'ordered', 'Collected' => 'collected',
            'In Progress' => 'in-progress', 'Completed' => 'completed', 'Discontinued' => 'discontinued',
        ];

        $result = $orders->map(function ($order) use ($visits, $patients, $statusMap) {
            $visit = $visits->get($order->admission_id);
            $patient = $patients->get($order->mrn);
            $metadata = is_string($order->metadata) ? json_decode($order->metadata, true) : ($order->metadata ?? []);
            return [
                'id'         => $order->order_id,
                'mrn'        => $order->mrn,
                'admissionId'=> $order->admission_id,
                'patient'    => $visit ? $visit->patient_name : ($patient ? $patient->name : $order->mrn),
                'type'       => ($metadata['investigationType'] ?? 'Laboratory') === 'Laboratory' ? 'lab' : 'radiology',
                'name'       => $metadata['test'] ?? $order->details,
                'testCode'   => $metadata['testCode'] ?? '',
                'dept'       => $metadata['dept'] ?? '',
                'sampleType' => $metadata['sample'] ?? '',
                'orderedBy'  => $order->ordered_by,
                'priority'   => strtolower($order->priority),
                'status'     => $statusMap[$order->status] ?? 'pending',
                'date'       => $order->ordered_at ? \Carbon\Carbon::parse($order->ordered_at)->format('d M, h:i A') : '',
                'orderedAt'  => $order->ordered_at,
            ];
        })->values();

        $grouped = $result->groupBy(function ($item) {
            return $item['mrn'] . '|' . $item['admissionId'];
        })->map(function ($items) {
            $first = $items->first();
            return [
                'mrn'           => $first['mrn'],
                'admissionId'   => $first['admissionId'],
                'patient'       => $first['patient'],
                'investigations'=> $items->values()->toArray(),
            ];
        })->values();

        return response()->json(['grouped' => $grouped, 'all' => $result->values()]);
    }

    public function erPassToLab(Request $request)
    {
        try {
            $request->validate(['orderIds' => 'required|array|min:1']);

            $orders = ClinicalOrder::where('type', 'Investigation')
                ->whereIn('order_id', $request->orderIds)
                ->where('status', 'Active')
                ->get();

            if ($orders->isEmpty()) {
                return response()->json(['error' => 'No eligible pending investigation orders found.'], 422);
            }

            $labOrders = $orders->filter(function ($o) {
                $meta = is_string($o->metadata) ? json_decode($o->metadata, true) : ($o->metadata ?? []);
                return ($meta['investigationType'] ?? 'Laboratory') === 'Laboratory';
            });

            if ($labOrders->isEmpty()) {
                return response()->json(['error' => 'No laboratory-type investigations found to pass.'], 422);
            }

            $visit   = \App\Models\EmergencyVisit::where('visit_id', $labOrders->first()->admission_id)->first();
            $patient = Patient::where('mrn', $labOrders->first()->mrn)->first();
            $now     = Carbon::now();

            /* ── MAX-based ID — safe against count gaps & concurrent saves ── */
            $orderId = $this->generateYearId(LabOrder::class, 'order_id', 'LAB');

            $patientName = $visit ? $visit->patient_name : ($patient ? $patient->name : $labOrders->first()->mrn);

            $labOrder = LabOrder::create([
                'order_id'           => $orderId,
                'order_time'         => $now,
                'patient_name'       => $patientName,
                'mrn'                => $labOrders->first()->mrn,
                'visit_number'       => $labOrders->first()->admission_id,
                'patient_age'        => $patient->age ?? null,
                'patient_gender'     => $patient->gender ?? null,
                'patient_location'   => 'Emergency Room',
                'diagnosis'          => 'ER Investigation Order',
                'allergies'          => [],
                'relevant_history'   => [],
                'source_department'  => 'ER',
                'ward'               => 'ER',
                'bed'                => $visit->bed_number ?? null,
                'priority'           => ucfirst($labOrders->first()->priority),
                'status'             => 'Pending',
                'sample_status'      => 'Not Collected',
                'tests_count'        => $labOrders->count(),
                'ordered_by'         => $labOrders->first()->ordered_by,
                'clinical_indication'=> 'ER Investigation',
                'clinical_notes'     => null,
                'drug_history'       => [],
                'fasting_required'   => false,
                'fasting_compliant'  => null,
                'critical_flag'      => strtolower($labOrders->first()->priority) === 'stat',
                'tat_minutes'        => 120,
            ]);

            /* MAX-based LabOrderTest IDs */
            $maxTestNum = DB::table('lab_order_tests')
                ->selectRaw("MAX(CAST(REPLACE(CAST(test_id AS CHAR), 'LT-', '') AS UNSIGNED)) as max_num")
                ->value('max_num');
            $testId = ((int)($maxTestNum ?? 0)) + 1;

            foreach ($labOrders as $clinicalOrder) {
                $meta = is_string($clinicalOrder->metadata) ? json_decode($clinicalOrder->metadata, true) : ($clinicalOrder->metadata ?? []);
                LabOrderTest::create([
                    'test_id'       => sprintf('LT-%04d', $testId++),
                    'lab_order_id'  => $orderId,
                    'test_name'     => $meta['test'] ?? $clinicalOrder->details,
                    'test_code'     => $meta['testCode'] ?? '',
                    'category'      => $meta['dept'] ?? 'General',
                    'specimen_type' => $meta['sample'] ?? 'Blood',
                    'container_type'=> 'Red Top',
                    'volume'        => '3 mL',
                    'fasting_required' => false,
                    'status'        => 'Pending',
                    'storage_temp'  => 'Room temp',
                ]);
                $clinicalOrder->update(['status' => 'Ordered']);
            }

            $this->logActivity($labOrders->first()->mrn, 'ER Investigation passed to Lab: ' . $orderId, 'ER');

            return response()->json([
                'success'    => true,
                'labOrderId' => $orderId,
                'testsCount' => $labOrders->count(),
                'message'    => $labOrders->count() . ' test(s) passed to Laboratory queue.',
            ]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'An unexpected error occurred');
        }
    }

    public function passToLab(Request $request)
    {
        try {
            $request->validate([
                'orderIds' => 'required|array|min:1',
            ]);

            $orders = ClinicalOrder::where('type', 'Investigation')
                ->whereIn('order_id', $request->orderIds)
                ->where('status', 'Active')
                ->get();

            if ($orders->isEmpty()) {
                return response()->json(['error' => 'No eligible pending investigation orders found.'], 422);
            }

            $labOrders = $orders->filter(function ($o) {
                $meta = is_string($o->metadata) ? json_decode($o->metadata, true) : ($o->metadata ?? []);
                return ($meta['investigationType'] ?? 'Laboratory') === 'Laboratory';
            });

            if ($labOrders->isEmpty()) {
                return response()->json(['error' => 'No laboratory-type investigations found to pass.'], 422);
            }

            $admission = IpdAdmission::where('admission_id', $labOrders->first()->admission_id)->first();
            $patient = Patient::where('mrn', $labOrders->first()->mrn)->first();
            $now = Carbon::now();

            /* ── MAX-based ID — safe against count gaps & concurrent saves ── */
            $orderId = $this->generateYearId(LabOrder::class, 'order_id', 'LAB');

            $patientName = $admission ? $admission->patient_name : ($patient ? $patient->name : $labOrders->first()->mrn);
            $ward = $admission->ward ?? null;
            $bed = $admission->bed ?? null;

            $labOrder = LabOrder::create([
                'order_id' => $orderId,
                'order_time' => $now,
                'patient_name' => $patientName,
                'mrn' => $labOrders->first()->mrn,
                'visit_number' => $labOrders->first()->admission_id,
                'patient_age' => $patient->age ?? null,
                'patient_gender' => $patient->gender ?? null,
                'patient_location' => $ward ? ($ward . ($bed ? ' / ' . $bed : '')) : 'IPD',
                'diagnosis' => 'IPD Investigation Order',
                'allergies' => [],
                'relevant_history' => [],
                'source_department' => 'IPD',
                'ward' => $ward,
                'bed' => $bed,
                'priority' => ucfirst($labOrders->first()->priority),
                'status' => 'Pending',
                'sample_status' => 'Not Collected',
                'tests_count' => $labOrders->count(),
                'ordered_by' => $labOrders->first()->ordered_by,
                'clinical_indication' => 'IPD Investigation',
                'clinical_notes' => null,
                'drug_history' => [],
                'fasting_required' => false,
                'fasting_compliant' => null,
                'critical_flag' => strtolower($labOrders->first()->priority) === 'stat',
                'tat_minutes' => 1440,
            ]);

            /* MAX-based LabOrderTest IDs */
            $maxTestNum = DB::table('lab_order_tests')
                ->selectRaw("MAX(CAST(REPLACE(CAST(test_id AS CHAR), 'LT-', '') AS UNSIGNED)) as max_num")
                ->value('max_num');
            $testId = ((int)($maxTestNum ?? 0)) + 1;

            foreach ($labOrders as $clinicalOrder) {
                $meta = is_string($clinicalOrder->metadata) ? json_decode($clinicalOrder->metadata, true) : ($clinicalOrder->metadata ?? []);
                LabOrderTest::create([
                    'test_id' => sprintf('LT-%04d', $testId++),
                    'lab_order_id' => $orderId,
                    'test_name' => $meta['test'] ?? $clinicalOrder->details,
                    'test_code' => $meta['testCode'] ?? '',
                    'category' => $meta['dept'] ?? 'General',
                    'specimen_type' => $meta['sample'] ?? 'Blood',
                    'container_type' => 'Red Top',
                    'volume' => '3 mL',
                    'fasting_required' => false,
                    'status' => 'Pending',
                    'storage_temp' => 'Room temp',
                ]);

                $clinicalOrder->update(['status' => 'Ordered']);
            }

            $this->logActivity($labOrders->first()->mrn, 'Investigation passed to Lab: ' . $orderId, 'IPD');

            return response()->json([
                'success' => true,
                'labOrderId' => $orderId,
                'testsCount' => $labOrders->count(),
                'message' => $labOrders->count() . ' test(s) passed to Laboratory queue.',
            ]);
        } catch (\Exception $e) {
            return $this->safeError($e, 'An unexpected error occurred');
        }
    }
}
