<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabOrder;
use App\Models\LabOrderTest;
use App\Models\LabTest;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LaboratoryController extends Controller
{
    use HmsHelpers;

    public function __construct()
    {
    }

    public function stats()
    {
        $today = Carbon::today();
        return response()->json([
            'pending' => LabOrder::where('status', 'Pending')->count(),
            'samplePending' => LabOrder::where('sample_status', 'Not Collected')
                ->whereNotIn('status', ['Completed', 'Reported', 'Rejected', 'Cancelled'])->count(),
            'inProgress' => LabOrder::whereIn('status', ['In Progress'])->count(),
            'resultsReady' => LabOrder::whereIn('status', ['Ready', 'Verified'])->count(),
            'completedToday' => LabOrder::whereIn('status', ['Completed', 'Reported'])
                ->whereDate('updated_at', $today)->count(),
        ]);
    }

    public function index(Request $request)
    {
        $query = LabOrder::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('sampleStatus')) {
            $query->where('sample_status', $request->sampleStatus);
        }
        if ($request->filled('department')) {
            $query->where('source_department', $request->department);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('category')) {
            $cat = $request->category;
            $query->whereHas('tests', function ($q) use ($cat) {
                $q->where('category', $cat);
            });
        }
        if ($request->filled('criticalOnly') && $request->criticalOnly === 'true') {
            $query->where('critical_flag', true);
        }
        if ($request->filled('dateRange')) {
            $range = $request->dateRange;
            if ($range === 'today') {
                $query->whereDate('order_time', Carbon::today());
            } elseif ($range === 'yesterday') {
                $query->whereDate('order_time', Carbon::yesterday());
            } elseif ($range === 'week') {
                $query->where('order_time', '>=', Carbon::now()->subDays(7));
            } elseif ($range === 'month') {
                $query->where('order_time', '>=', Carbon::now()->subDays(30));
            }
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_id', 'LIKE', "%{$s}%")
                  ->orWhere('patient_name', 'LIKE', "%{$s}%")
                  ->orWhere('mrn', 'LIKE', "%{$s}%")
                  ->orWhere('ordered_by', 'LIKE', "%{$s}%");
            });
        }

        $orders = $query->with('tests')->orderByRaw("
            CASE priority
                WHEN 'STAT' THEN 1
                WHEN 'Urgent' THEN 2
                WHEN 'Routine' THEN 3
                ELSE 4
            END,
            order_time DESC
        ")->limit(100)->get();

        $result = $orders->map(function ($order) {
            $minutesAgo = (int) Carbon::parse($order->order_time)->diffInMinutes(Carbon::now());
            $tatRemaining = max(0, $order->tat_minutes - $minutesAgo);
            $tatExceeded = $minutesAgo > $order->tat_minutes && !in_array($order->status, ['Completed', 'Reported', 'Cancelled']);
            $tatPercent = $order->tat_minutes > 0 ? min(100, round(($minutesAgo / $order->tat_minutes) * 100)) : 100;

            $ageLabel = '';
            if ($minutesAgo < 60) {
                $ageLabel = $minutesAgo . ' mins ago';
            } elseif ($minutesAgo < 1440) {
                $ageLabel = floor($minutesAgo / 60) . ' hrs ago';
            } else {
                $ageLabel = floor($minutesAgo / 1440) . ' days ago';
            }

            $testNames = $order->tests->pluck('test_name')->toArray();
            $sampleTypes = $order->tests->pluck('specimen_type')->unique()->values()->toArray();
            $categories = $order->tests->pluck('category')->unique()->values()->toArray();

            return [
                'orderId' => $order->order_id,
                'orderTime' => $order->order_time,
                'ageLabel' => $ageLabel,
                'patientName' => $order->patient_name,
                'mrn' => $order->mrn,
                'visitNumber' => $order->visit_number,
                'sourceDepartment' => $order->source_department,
                'ward' => $order->ward,
                'bed' => $order->bed,
                'priority' => $order->priority,
                'testsCount' => $order->tests->count(),
                'testNames' => $testNames,
                'sampleTypes' => $sampleTypes,
                'categories' => $categories,
                'sampleStatus' => $order->sample_status,
                'orderedBy' => $order->ordered_by,
                'status' => $order->status,
                'criticalFlag' => $order->critical_flag,
                'tatRemaining' => $tatRemaining,
                'tatExceeded' => $tatExceeded,
                'tatPercent' => $tatPercent,
                'tatMinutes' => $order->tat_minutes,
            ];
        });

        return response()->json($result);
    }

    public function show($orderId)
    {
        $order = LabOrder::with('tests')->where('order_id', $orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $minutesAgo = (int) Carbon::parse($order->order_time)->diffInMinutes(Carbon::now());
        $tatRemaining = max(0, $order->tat_minutes - $minutesAgo);
        $tatExceeded = $minutesAgo > $order->tat_minutes && !in_array($order->status, ['Completed', 'Reported', 'Cancelled']);

        $tests = $order->tests->map(function ($test) {
            return [
                'testId' => $test->test_id,
                'testName' => $test->test_name,
                'testCode' => $test->test_code,
                'category' => $test->category,
                'specimenType' => $test->specimen_type,
                'containerType' => $test->container_type,
                'volume' => $test->volume,
                'fastingRequired' => $test->fasting_required,
                'status' => $test->status,
                'specialInstructions' => $test->special_instructions,
                'storageTemp' => $test->storage_temp,
                'transportMedium' => $test->transport_medium,
                'stability' => $test->stability,
                'resultData' => $test->result_data,
                'resultStatus' => $test->result_status,
                'collectedAt' => $test->collected_at,
                'resultEnteredAt' => $test->result_entered_at,
                'resultEnteredBy' => $test->result_entered_by,
                'verifiedAt' => $test->verified_at,
                'verifiedBy' => $test->verified_by,
            ];
        });

        return response()->json([
            'orderId' => $order->order_id,
            'orderTime' => $order->order_time,
            'patientName' => $order->patient_name,
            'mrn' => $order->mrn,
            'visitNumber' => $order->visit_number,
            'patientAge' => $order->patient_age,
            'patientGender' => $order->patient_gender,
            'patientLocation' => $order->patient_location,
            'diagnosis' => $order->diagnosis,
            'allergies' => $order->allergies,
            'relevantHistory' => $order->relevant_history,
            'sourceDepartment' => $order->source_department,
            'ward' => $order->ward,
            'bed' => $order->bed,
            'priority' => $order->priority,
            'status' => $order->status,
            'sampleStatus' => $order->sample_status,
            'testsCount' => $order->tests_count,
            'orderedBy' => $order->ordered_by,
            'clinicalIndication' => $order->clinical_indication,
            'clinicalNotes' => $order->clinical_notes,
            'drugHistory' => $order->drug_history,
            'fastingRequired' => $order->fasting_required,
            'fastingCompliant' => $order->fasting_compliant,
            'criticalFlag' => $order->critical_flag,
            'tatMinutes' => $order->tat_minutes,
            'tatRemaining' => $tatRemaining,
            'tatExceeded' => $tatExceeded,
            'collectedAt' => $order->collected_at,
            'collectedBy' => $order->collected_by,
            'verifiedAt' => $order->verified_at,
            'verifiedBy' => $order->verified_by,
            'reportedAt' => $order->reported_at,
            'notes' => $order->notes,
            'tests' => $tests,
        ]);
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'status' => 'required|string',
        ]);

        $order = LabOrder::where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $updates = ['status' => $request->status];

        if ($request->status === 'Collected') {
            $updates['sample_status'] = 'Collected';
            $updates['collected_at'] = Carbon::now();
            $updates['collected_by'] = $request->input('collectedBy', 'Lab Technician');
            $order->tests()->update(['status' => 'Collected', 'collected_at' => Carbon::now()]);
        }
        if ($request->status === 'Verified') {
            $updates['verified_at'] = Carbon::now();
            $updates['verified_by'] = $request->input('verifiedBy', 'Dr. Pathologist');
        }
        if ($request->status === 'Reported' || $request->status === 'Completed') {
            $updates['reported_at'] = Carbon::now();
        }
        if ($request->status === 'Rejected') {
            $updates['sample_status'] = 'Rejected';
            $updates['notes'] = $request->input('reason', 'Sample rejected');
        }
        if ($request->status === 'Cancelled') {
            $updates['cancel_reason'] = $request->input('reason', '');
        }

        $order->update($updates);

        return response()->json(['success' => true, 'orderId' => $order->order_id, 'status' => $request->status]);
    }

    public function pendingCollections()
    {
        $orders = LabOrder::with('tests')
            ->where('sample_status', 'Not Collected')
            ->whereNotIn('status', ['Completed', 'Reported', 'Cancelled', 'Rejected'])
            ->orderByRaw("CASE priority WHEN 'STAT' THEN 1 WHEN 'Urgent' THEN 2 WHEN 'Routine' THEN 3 ELSE 4 END, order_time ASC")
            ->limit(100)->get();

        return response()->json($orders->map(function ($o) {
            $waitMins = (int) Carbon::parse($o->order_time)->diffInMinutes(Carbon::now());
            $waitLabel = $waitMins < 60 ? $waitMins . ' min' : floor($waitMins / 60) . 'h ' . ($waitMins % 60) . 'm';
            $waitColor = $waitMins < 30 ? '#22c55e' : ($waitMins < 60 ? '#eab308' : '#ef4444');
            $sampleTypes = $o->tests->pluck('specimen_type')->unique()->values()->toArray();
            $containers = $o->tests->pluck('container_type')->unique()->values()->toArray();
            $location = $o->source_department === 'Walk-in' ? 'At Counter' : ($o->ward ? $o->ward . ($o->bed ? '/' . $o->bed : '') : $o->patient_location ?? $o->source_department);

            return [
                'orderId' => $o->order_id,
                'patientName' => $o->patient_name,
                'mrn' => $o->mrn,
                'patientAge' => $o->patient_age,
                'patientGender' => $o->patient_gender,
                'sourceDepartment' => $o->source_department,
                'testsCount' => $o->tests->count(),
                'testNames' => $o->tests->pluck('test_name')->toArray(),
                'sampleTypes' => $sampleTypes,
                'containers' => $containers,
                'priority' => $o->priority,
                'orderTime' => Carbon::parse($o->order_time)->format('h:i A'),
                'waitMinutes' => $waitMins,
                'waitLabel' => $waitLabel,
                'waitColor' => $waitColor,
                'location' => $location,
                'fastingRequired' => $o->fasting_required,
                'fastingCompliant' => $o->fasting_compliant,
                'allergies' => $o->allergies ?? [],
                'diagnosis' => $o->diagnosis,
                'orderedBy' => $o->ordered_by,
                'status' => $o->status,
            ];
        }));
    }

    public function todayCollections()
    {
        $orders = LabOrder::with('tests')
            ->whereDate('collected_at', Carbon::today())
            ->orderByDesc('collected_at')
            ->limit(200)->get();

        return response()->json($orders->map(function ($o) {
            return [
                'orderId' => $o->order_id,
                'patientName' => $o->patient_name,
                'mrn' => $o->mrn,
                'patientAge' => $o->patient_age,
                'patientGender' => $o->patient_gender,
                'sourceDepartment' => $o->source_department,
                'testsCount' => $o->tests->count(),
                'testNames' => $o->tests->pluck('test_name')->toArray(),
                'sampleTypes' => $o->tests->pluck('specimen_type')->unique()->values()->toArray(),
                'priority' => $o->priority,
                'collectedAt' => $o->collected_at ? Carbon::parse($o->collected_at)->format('h:i A') : null,
                'collectedBy' => $o->collected_by,
                'status' => $o->status,
                'sampleStatus' => $o->sample_status,
            ];
        }));
    }

    public function collectSample(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'collectedBy' => 'required|string',
            'venipunctureSite' => 'nullable|string',
            'attempts' => 'nullable|integer',
            'sampleQuality' => 'nullable|string',
            'patientCondition' => 'nullable|string',
            'notes' => 'nullable|string',
            'fastingVerified' => 'nullable|boolean',
            'fastingHours' => 'nullable|numeric',
            'identityVerified' => 'nullable|boolean',
        ]);

        $order = LabOrder::with('tests')->where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $now = Carbon::now();
        $order->update([
            'status' => 'In Progress',
            'sample_status' => 'Collected',
            'collected_at' => $now,
            'collected_by' => $request->collectedBy,
            'fasting_compliant' => $request->fastingVerified,
            'notes' => $request->notes,
        ]);

        $order->tests()->update([
            'status' => 'Collected',
            'collected_at' => $now,
        ]);

        return response()->json([
            'success' => true,
            'orderId' => $order->order_id,
            'patientName' => $order->patient_name,
            'testsCount' => $order->tests->count(),
            'collectedAt' => $now->format('d-M-Y h:i A'),
            'collectedBy' => $request->collectedBy,
        ]);
    }

    public function rejectSample(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'reason' => 'required|string',
            'rejectedBy' => 'nullable|string',
        ]);

        $order = LabOrder::where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $order->update([
            'status' => 'Rejected',
            'sample_status' => 'Rejected',
            'notes' => 'REJECTED: ' . $request->reason,
        ]);

        return response()->json([
            'success' => true,
            'orderId' => $order->order_id,
            'reason' => $request->reason,
        ]);
    }

    public function collectionStats()
    {
        $today = Carbon::today();
        $pending = LabOrder::where('sample_status', 'Not Collected')
            ->whereNotIn('status', ['Completed', 'Reported', 'Cancelled', 'Rejected'])->count();
        $collected = LabOrder::where('sample_status', 'Collected')->whereDate('collected_at', $today)->count();
        $statUrgent = LabOrder::whereIn('priority', ['STAT', 'Urgent'])
            ->where('sample_status', 'Not Collected')
            ->whereNotIn('status', ['Completed', 'Reported', 'Cancelled', 'Rejected'])->count();
        $rejected = LabOrder::where('sample_status', 'Rejected')->whereDate('updated_at', $today)->count();
        $avgWait = LabOrder::where('sample_status', 'Not Collected')
            ->whereNotIn('status', ['Completed', 'Reported', 'Cancelled', 'Rejected'])
            ->avg(\DB::raw("EXTRACT(EPOCH FROM (NOW() - order_time)) / 60"));

        return response()->json([
            'pending' => $pending,
            'collectedToday' => $collected,
            'statUrgent' => $statUrgent,
            'rejected' => $rejected,
            'avgWaitMinutes' => round($avgWait ?? 0),
        ]);
    }

    public function testCatalog()
    {
        $tests = \App\Models\LabTest::where('status', 'Active')
            ->orderBy('test_name')
            ->get()
            ->map(function ($t) {
                $fasting = in_array($t->fasting_required, ['Yes', '1', 1], true) || $t->fasting_required === true;
                $fastingHours = $fasting ? ($t->fasting_hours ?? 8) : 0;
                return [
                    'id' => $t->test_code,
                    'name' => $t->test_name,
                    'code' => $t->short_name,
                    'category' => $t->department,
                    'department' => $t->department,
                    'price' => (float) $t->standard_price,
                    'tat' => $t->standard_tat ?? '4 hours',
                    'specimen' => $t->sample_type ?? 'Blood',
                    'container' => $t->collection_container ?? 'Red Top (Plain)',
                    'volume' => $t->sample_volume ?? '3 mL',
                    'fasting' => $fasting,
                    'fastingHours' => $fastingHours,
                    'description' => $t->clinical_significance ?? '',
                    'indications' => $t->indications ?? '',
                    'normalRange' => '',
                    'preparation' => $fasting ? "Fast for {$fastingHours} hours before test" : 'No special preparation required',
                ];
            });

        return response()->json($tests);
    }

    public function testPackages()
    {
        $packages = \App\Models\LabTestPackage::where('status', 'Active')
            ->orderBy('display_priority', 'desc')
            ->orderBy('package_name')
            ->get()
            ->map(function ($pkg) {
                $pkgTests = $pkg->tests ?? [];
                $testCodes = collect($pkgTests)->pluck('testCode')->toArray();
                $dbTests = \App\Models\LabTest::whereIn('test_code', $testCodes)->where('status', 'Active')->get();

                $sampleTypes = $dbTests->pluck('sample_type')->unique()->filter()->implode(' + ');
                $hasFasting = $pkg->fasting_required ?? false;
                $fastingHours = $pkg->fasting_hours ?? 0;

                return [
                    'id' => $pkg->package_code,
                    'name' => $pkg->package_name,
                    'price' => (float) $pkg->package_price,
                    'originalPrice' => (float) ($pkg->individual_total ?? collect($pkgTests)->sum('price')),
                    'description' => $pkg->description ?? '',
                    'sampleTypes' => $sampleTypes ?: ($pkg->sample_summary ? implode(' + ', $pkg->sample_summary) : 'Blood'),
                    'fasting' => $hasFasting ? "{$fastingHours} hours" : 'Not required',
                    'resultsIn' => $pkg->max_tat ?? 'Same day',
                    'tests' => $testCodes,
                    'category' => collect($pkg->departments ?? [])->first() ?? 'General',
                ];
            });

        return response()->json($packages);
    }

    public function visitInvestigations(Request $request)
    {
        $visitId = $request->input('visitId');
        $module = $request->input('module', 'OPD');

        if ($module === 'OPD') {
            $consultation = \App\Models\OpdConsultation::where('visit_id', $visitId)->first();
            if (!$consultation) {
                return response()->json(['investigations' => [], 'doctor' => null]);
            }
            $investigations = collect($consultation->investigation_orders ?? [])
                ->filter(fn($inv) => ($inv['type'] ?? '') === 'Laboratory');
            return response()->json([
                'investigations' => $investigations->values(),
                'doctor' => $consultation->doctor_name ?? null,
            ]);
        }

        return response()->json(['investigations' => [], 'doctor' => null]);
    }

    public function walkInRegister(Request $request)
    {
        $request->validate([
            'patientName' => 'required|string',
            'patientAge' => 'required|integer',
            'patientGender' => 'required|string',
            'phone' => 'required|string',
            'tests' => 'required|array|min:1',
            'paymentMethod' => 'required|string',
            'totalAmount' => 'required|numeric',
        ]);

        $nextId = LabOrder::count() + 1;
        $orderId = sprintf('LAB-2026-%04d', $nextId);
        $now = Carbon::now();

        $testCatalogMap = collect($this->getTestCatalogData());

        $fastingRequired = false;
        $testsCount = 0;
        foreach ($request->tests as $t) {
            $testsCount++;
            $catalogTest = $testCatalogMap->firstWhere('id', $t['testId']);
            if ($catalogTest && ($catalogTest['fasting'] ?? false)) {
                $fastingRequired = true;
            }
        }

        $mrn = $request->input('mrn');
        if ($request->input('generateMrn') && !$mrn) {
            $year = date('Y');
            $lastMrn = \App\Models\Patient::where('mrn', 'like', "MRN-{$year}-%")->orderByDesc('id')->first();
            $seq = $lastMrn ? ((int)substr($lastMrn->mrn, -4) + 1) : 1;
            $mrn = sprintf("MRN-%s-%04d", $year, $seq);

            \App\Models\Patient::create([
                'mrn' => $mrn,
                'name' => $request->patientName,
                'age' => $request->patientAge,
                'gender' => $request->patientGender,
                'phone' => $request->phone,
                'cnic' => $request->input('cnic'),
                'status' => 'Active',
                'visit_count' => 1,
                'first_visit_date' => $now,
                'last_visit_date' => $now,
            ]);
        }

        $order = LabOrder::create([
            'order_id' => $orderId,
            'order_time' => $now,
            'patient_name' => $request->patientName,
            'mrn' => $mrn ?? 'WALK-IN',
            'visit_number' => 'WI-' . date('Ymd') . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT),
            'patient_age' => $request->patientAge,
            'patient_gender' => $request->patientGender,
            'patient_location' => 'Walk-in Lab Counter',
            'diagnosis' => $request->input('diagnosis', 'Walk-in Lab Test'),
            'allergies' => [],
            'relevant_history' => [],
            'source_department' => 'Walk-in',
            'ward' => null,
            'bed' => null,
            'priority' => 'Routine',
            'status' => $request->input('sampleCollection') === 'now' ? 'Pending' : 'Scheduled',
            'sample_status' => 'Not Collected',
            'tests_count' => $testsCount,
            'ordered_by' => $request->input('doctorName', 'Walk-in Counter'),
            'clinical_indication' => $request->input('clinicalIndication', 'Walk-in lab test'),
            'clinical_notes' => $request->input('notes'),
            'drug_history' => [],
            'fasting_required' => $fastingRequired,
            'fasting_compliant' => null,
            'critical_flag' => false,
            'tat_minutes' => 1440,
        ]);

        $testId = LabOrderTest::count() + 1;
        foreach ($request->tests as $t) {
            $catalogTest = $testCatalogMap->firstWhere('id', $t['testId']);
            LabOrderTest::create([
                'test_id' => sprintf('LT-%04d', $testId++),
                'lab_order_id' => $orderId,
                'test_name' => $t['testName'],
                'test_code' => $t['testCode'] ?? '',
                'category' => $t['category'] ?? 'General',
                'specimen_type' => $catalogTest['specimen'] ?? 'Blood',
                'container_type' => $catalogTest['container'] ?? 'Red Top',
                'volume' => $catalogTest['volume'] ?? '3 mL',
                'fasting_required' => $catalogTest['fasting'] ?? false,
                'status' => 'Pending',
                'storage_temp' => 'Room temp',
            ]);
        }

        return response()->json([
            'success' => true,
            'orderId' => $orderId,
            'patientName' => $request->patientName,
            'mrn' => $mrn ?? 'WALK-IN',
            'testsCount' => $testsCount,
            'totalAmount' => $request->totalAmount,
            'paymentMethod' => $request->paymentMethod,
            'sampleCollection' => $request->input('sampleCollection', 'now'),
            'orderTime' => $now->format('d-M-Y h:i A'),
            'fastingRequired' => $fastingRequired,
        ]);
    }

    public function resultEntryStats()
    {
        $today = Carbon::today();
        $pendingEntry = LabOrderTest::whereIn('status', ['Collected', 'In Progress'])
            ->whereNull('result_entered_at')->count();
        $enteredToday = LabOrderTest::whereDate('result_entered_at', $today)->count();
        $pendingVerification = LabOrderTest::whereNotNull('result_entered_at')
            ->whereNull('verified_at')
            ->whereIn('status', ['In Progress', 'Ready', 'Collected'])->count();
        $verifiedToday = LabOrderTest::whereDate('verified_at', $today)->count();
        $criticalResults = LabOrder::where('critical_flag', true)
            ->whereIn('status', ['In Progress', 'Ready', 'Collected'])->count();

        return response()->json([
            'pendingEntry' => $pendingEntry,
            'enteredToday' => $enteredToday,
            'pendingVerification' => $pendingVerification,
            'verifiedToday' => $verifiedToday,
            'criticalResults' => $criticalResults,
        ]);
    }

    public function samplesForResults(Request $request)
    {
        $query = LabOrder::with('tests')
            ->whereIn('sample_status', ['Collected'])
            ->whereNotIn('status', ['Completed', 'Reported', 'Cancelled', 'Rejected']);

        if ($request->filled('resultStatus')) {
            $rs = $request->resultStatus;
            if ($rs === 'Pending') {
                $query->whereDoesntHave('tests', function ($q) {
                    $q->whereNotNull('result_entered_at');
                });
            } elseif ($rs === 'Entered') {
                $query->whereHas('tests', function ($q) {
                    $q->whereNotNull('result_entered_at');
                })->whereDoesntHave('tests', function ($q) {
                    $q->whereNotNull('verified_at');
                });
            } elseif ($rs === 'Verified') {
                $query->where('status', 'Verified');
            }
        }
        if ($request->filled('department')) {
            $query->where('source_department', $request->department);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('category')) {
            $cat = $request->category;
            $query->whereHas('tests', function ($q) use ($cat) {
                $q->where('category', $cat);
            });
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_id', 'LIKE', "%{$s}%")
                  ->orWhere('patient_name', 'LIKE', "%{$s}%")
                  ->orWhere('mrn', 'LIKE', "%{$s}%");
            });
        }

        $orders = $query->orderByRaw("
            CASE priority WHEN 'STAT' THEN 1 WHEN 'Urgent' THEN 2 WHEN 'Routine' THEN 3 ELSE 4 END,
            order_time ASC
        ")->limit(100)->get();

        return response()->json($orders->map(function ($o) {
            $minutesAgo = (int) Carbon::parse($o->order_time)->diffInMinutes(Carbon::now());
            $tatRemaining = max(0, $o->tat_minutes - $minutesAgo);
            $tatExceeded = $minutesAgo > $o->tat_minutes;

            $testsWithResults = $o->tests->filter(fn($t) => $t->result_entered_at !== null)->count();
            $testsVerified = $o->tests->filter(fn($t) => $t->verified_at !== null)->count();
            $totalTests = $o->tests->count();

            $resultStatus = 'Pending';
            if ($testsVerified === $totalTests && $totalTests > 0) $resultStatus = 'Verified';
            elseif ($testsWithResults > 0) $resultStatus = 'Entered';

            $analyzerStatus = null;
            foreach ($o->tests as $t) {
                if ($t->result_data && is_array($t->result_data) && isset($t->result_data['analyzer'])) {
                    $analyzerStatus = 'Auto-imported';
                    break;
                }
            }

            $collectionTime = $o->collected_at ? Carbon::parse($o->collected_at)->format('h:i A') : null;

            return [
                'orderId' => $o->order_id,
                'patientName' => $o->patient_name,
                'mrn' => $o->mrn,
                'patientAge' => $o->patient_age,
                'patientGender' => $o->patient_gender,
                'sourceDepartment' => $o->source_department,
                'priority' => $o->priority,
                'status' => $o->status,
                'criticalFlag' => $o->critical_flag,
                'testsCount' => $totalTests,
                'testsWithResults' => $testsWithResults,
                'testsVerified' => $testsVerified,
                'testNames' => $o->tests->pluck('test_name')->toArray(),
                'sampleTypes' => $o->tests->pluck('specimen_type')->unique()->values()->toArray(),
                'categories' => $o->tests->pluck('category')->unique()->values()->toArray(),
                'collectionTime' => $collectionTime,
                'tatRemaining' => $tatRemaining,
                'tatExceeded' => $tatExceeded,
                'tatMinutes' => $o->tat_minutes,
                'resultStatus' => $resultStatus,
                'analyzerStatus' => $analyzerStatus,
                'orderedBy' => $o->ordered_by,
            ];
        }));
    }

    public function testParameters($testCode)
    {
        $decoded = urldecode($testCode);
        $params = $this->resolveTestParameters($decoded, $decoded);

        if (!empty($params)) {
            return response()->json($params);
        }

        return response()->json(['error' => 'No parameters defined for test code: ' . $decoded], 404);
    }

    public function enterResults(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'testId' => 'required|string',
            'results' => 'required|array',
            'enteredBy' => 'nullable|string',
            'comment' => 'nullable|string',
        ]);

        $test = LabOrderTest::where('test_id', $request->testId)
            ->where('lab_order_id', $request->orderId)->first();
        if (!$test) return response()->json(['error' => 'Test not found'], 404);

        $now = Carbon::now();
        $paramDefs = $this->resolveTestParameters($test->test_code, $test->test_name);

        $order = LabOrder::where('order_id', $request->orderId)->first();
        $patientGender = strtolower($order->patient_gender ?? '');

        $flaggedResults = [];
        $hasCritical = false;
        foreach ($request->results as $r) {
            $paramName = $r['parameter'] ?? '';
            $value = $r['value'] ?? '';
            $flag = 'Normal';

            $paramDef = collect($paramDefs)->firstWhere('parameter', $paramName);
            if ($paramDef && is_numeric($value)) {
                $val = floatval($value);

                $low = $paramDef['low'] ?? null;
                $high = $paramDef['high'] ?? null;
                if (!empty($paramDef['hasGenderRanges'])) {
                    if ($patientGender === 'male') {
                        $low = $paramDef['lowMale'] ?? $low;
                        $high = $paramDef['highMale'] ?? $high;
                    } elseif ($patientGender === 'female') {
                        $low = $paramDef['lowFemale'] ?? $low;
                        $high = $paramDef['highFemale'] ?? $high;
                    }
                }

                $critLow = $paramDef['criticalLow'] ?? null;
                $critHigh = $paramDef['criticalHigh'] ?? null;

                if ($critLow !== null && $val <= $critLow) {
                    $flag = 'Critical Low';
                    $hasCritical = true;
                } elseif ($critHigh !== null && $val >= $critHigh) {
                    $flag = 'Critical High';
                    $hasCritical = true;
                } elseif ($low !== null && $val < $low) {
                    $flag = 'Low';
                } elseif ($high !== null && $val > $high) {
                    $flag = 'High';
                }
            }

            $refRange = $r['refRange'] ?? ($paramDef['refRange'] ?? '');
            if ($paramDef && !empty($paramDef['hasGenderRanges'])) {
                if ($patientGender === 'male') $refRange = $paramDef['rangeMale'] ?? $refRange;
                elseif ($patientGender === 'female') $refRange = $paramDef['rangeFemale'] ?? $refRange;
            }

            $flaggedResults[] = [
                'parameter' => $paramName,
                'value' => $value,
                'unit' => $r['unit'] ?? ($paramDef['unit'] ?? ''),
                'refRange' => $refRange,
                'flag' => $flag,
            ];
        }

        $resultData = [
            'parameters' => $flaggedResults,
            'enteredBy' => $request->input('enteredBy', 'Lab Technician'),
            'enteredAt' => $now->toIso8601String(),
            'comment' => $request->comment,
            'hasCritical' => $hasCritical,
        ];

        $test->update([
            'result_data' => $resultData,
            'result_status' => 'Entered',
            'result_entered_at' => $now,
            'result_entered_by' => $request->input('enteredBy', 'Lab Technician'),
            'status' => 'In Progress',
        ]);

        if ($order) {
            $allTests = LabOrderTest::where('lab_order_id', $request->orderId)->get();
            $allEntered = $allTests->every(fn($t) => $t->result_entered_at !== null);
            if ($allEntered) {
                $order->update(['status' => 'Ready']);
            } elseif ($order->status === 'Collected') {
                $order->update(['status' => 'In Progress']);
            }
            if ($hasCritical) {
                $order->update(['critical_flag' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'testId' => $test->test_id,
            'orderId' => $request->orderId,
            'resultStatus' => 'Entered',
            'hasCritical' => $hasCritical,
            'enteredAt' => $now->format('d-M-Y h:i A'),
        ]);
    }

    public function verifyResults(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'testId' => 'required|string',
            'verifiedBy' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        $test = LabOrderTest::where('test_id', $request->testId)
            ->where('lab_order_id', $request->orderId)->first();
        if (!$test) return response()->json(['error' => 'Test not found'], 404);
        if (!$test->result_entered_at) return response()->json(['error' => 'Results must be entered before verification'], 422);

        $now = Carbon::now();
        $verifiedBy = $request->input('verifiedBy', 'Dr. Rashid (Pathologist)');

        $resultData = $test->result_data ?? [];
        $resultData['verifiedBy'] = $verifiedBy;
        $resultData['verifiedAt'] = $now->toIso8601String();
        $resultData['verificationComments'] = $request->comments;

        $test->update([
            'result_data' => $resultData,
            'result_status' => 'Verified',
            'verified_at' => $now,
            'verified_by' => $verifiedBy,
            'status' => 'Verified',
        ]);

        $order = LabOrder::where('order_id', $request->orderId)->first();
        if ($order) {
            $allTests = LabOrderTest::where('lab_order_id', $request->orderId)->get();
            $allVerified = $allTests->every(fn($t) => $t->verified_at !== null);
            if ($allVerified) {
                $order->update([
                    'status' => 'Verified',
                    'verified_at' => $now,
                    'verified_by' => $verifiedBy,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'testId' => $test->test_id,
            'orderId' => $request->orderId,
            'resultStatus' => 'Verified',
            'verifiedAt' => $now->format('d-M-Y h:i A'),
            'verifiedBy' => $verifiedBy,
        ]);
    }

    public function verifyAllResults(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'verifiedBy' => 'nullable|string',
        ]);

        $order = LabOrder::with('tests')->where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $now = Carbon::now();
        $verifiedBy = $request->input('verifiedBy', 'Dr. Rashid (Pathologist)');
        $verified = 0;

        foreach ($order->tests as $test) {
            if ($test->result_entered_at && !$test->verified_at) {
                $resultData = $test->result_data ?? [];
                $resultData['verifiedBy'] = $verifiedBy;
                $resultData['verifiedAt'] = $now->toIso8601String();

                $test->update([
                    'result_data' => $resultData,
                    'result_status' => 'Verified',
                    'verified_at' => $now,
                    'verified_by' => $verifiedBy,
                    'status' => 'Verified',
                ]);
                $verified++;
            }
        }

        $allVerified = LabOrderTest::where('lab_order_id', $request->orderId)
            ->whereNull('verified_at')->count() === 0;
        if ($allVerified) {
            $order->update([
                'status' => 'Verified',
                'verified_at' => $now,
                'verified_by' => $verifiedBy,
            ]);
        }

        return response()->json([
            'success' => true,
            'orderId' => $request->orderId,
            'verifiedCount' => $verified,
            'allVerified' => $allVerified,
        ]);
    }

    private function parseRange($rangeStr)
    {
        if (!$rangeStr) return [null, null];
        if (preg_match('/^([\d.]+)\s*[-–]\s*([\d.]+)$/', $rangeStr, $m)) {
            return [(float) $m[1], (float) $m[2]];
        }
        return [null, null];
    }

    private function parseCritical($critStr)
    {
        if (!$critStr) return null;
        if (preg_match('/([\d.]+)/', $critStr, $m)) {
            return (float) $m[1];
        }
        return null;
    }

    private function resolveTestParameters($testCode, $testName = null)
    {
        $labTest = null;
        if ($testCode) {
            $labTest = LabTest::where('test_code', $testCode)->first();
        }
        if (!$labTest && $testName) {
            $labTest = LabTest::where('test_name', $testName)->first();
        }

        if ($labTest && $labTest->has_components && !empty($labTest->components)) {
            return collect($labTest->components)->map(function ($comp) {
                $rangeMale = $comp['rangeMale'] ?? '';
                $rangeFemale = $comp['rangeFemale'] ?? '';
                $rangeChild = $comp['rangeChild'] ?? '';

                [$lowM, $highM] = $this->parseRange($rangeMale);
                [$lowF, $highF] = $this->parseRange($rangeFemale);
                [$lowC, $highC] = $this->parseRange($rangeChild);

                $critLow = $this->parseCritical($comp['criticalLow'] ?? '');
                $critHigh = $this->parseCritical($comp['criticalHigh'] ?? '');

                $hasGenderRanges = ($rangeMale && $rangeFemale && $rangeMale !== $rangeFemale) || !empty($rangeChild);

                $result = [
                    'parameter' => $comp['name'] ?? $comp['short'] ?? 'Unknown',
                    'unit' => $comp['unit'] ?? '',
                    'criticalLow' => $critLow,
                    'criticalHigh' => $critHigh,
                    'hasGenderRanges' => $hasGenderRanges,
                ];

                if ($hasGenderRanges) {
                    $result['rangeMale'] = $rangeMale;
                    $result['rangeFemale'] = $rangeFemale;
                    $result['rangeChild'] = $rangeChild;
                    $result['lowMale'] = $lowM;
                    $result['highMale'] = $highM;
                    $result['lowFemale'] = $lowF;
                    $result['highFemale'] = $highF;
                    $result['lowChild'] = $lowC;
                    $result['highChild'] = $highC;
                    $result['refRange'] = $rangeMale ?: $rangeFemale;
                    $result['low'] = $lowM ?? $lowF;
                    $result['high'] = $highM ?? $highF;
                } else {
                    $primaryRange = $rangeMale ?: $rangeFemale;
                    $result['refRange'] = $primaryRange;
                    $result['low'] = $lowM ?? $lowF;
                    $result['high'] = $highM ?? $highF;
                }

                $isQualitative = !$result['low'] && !$result['high'] && !is_numeric($result['refRange'] ?? '');
                $result['qualitative'] = $isQualitative;

                return $result;
            })->toArray();
        }

        $params = $this->getTestParametersMap();
        $code = strtoupper($testCode ?: '');
        return $params[$code] ?? [];
    }

    private function getTestParametersMap()
    {
        return [
            'CBC' => [
                ['parameter' => 'Hemoglobin', 'unit' => 'g/dL', 'refRange' => '13-17', 'low' => 13, 'high' => 17, 'criticalLow' => 7, 'criticalHigh' => 20],
                ['parameter' => 'WBC Count', 'unit' => '/\u00b5L', 'refRange' => '4000-11000', 'low' => 4000, 'high' => 11000, 'criticalLow' => 2000, 'criticalHigh' => 30000],
                ['parameter' => 'RBC Count', 'unit' => 'M/\u00b5L', 'refRange' => '4.5-5.5', 'low' => 4.5, 'high' => 5.5, 'criticalLow' => 2.5, 'criticalHigh' => 7.5],
                ['parameter' => 'Hematocrit', 'unit' => '%', 'refRange' => '40-50', 'low' => 40, 'high' => 50, 'criticalLow' => 20, 'criticalHigh' => 60],
                ['parameter' => 'MCV', 'unit' => 'fL', 'refRange' => '80-100', 'low' => 80, 'high' => 100],
                ['parameter' => 'MCH', 'unit' => 'pg', 'refRange' => '27-32', 'low' => 27, 'high' => 32],
                ['parameter' => 'MCHC', 'unit' => 'g/dL', 'refRange' => '32-36', 'low' => 32, 'high' => 36],
                ['parameter' => 'Platelets', 'unit' => 'K/\u00b5L', 'refRange' => '150-400', 'low' => 150, 'high' => 400, 'criticalLow' => 50, 'criticalHigh' => 1000],
                ['parameter' => 'Neutrophils', 'unit' => '%', 'refRange' => '40-70', 'low' => 40, 'high' => 70],
                ['parameter' => 'Lymphocytes', 'unit' => '%', 'refRange' => '20-40', 'low' => 20, 'high' => 40],
                ['parameter' => 'Monocytes', 'unit' => '%', 'refRange' => '2-10', 'low' => 2, 'high' => 10],
                ['parameter' => 'Eosinophils', 'unit' => '%', 'refRange' => '1-6', 'low' => 1, 'high' => 6],
                ['parameter' => 'Basophils', 'unit' => '%', 'refRange' => '0-2', 'low' => 0, 'high' => 2],
            ],
            'LIPID' => [
                ['parameter' => 'Total Cholesterol', 'unit' => 'mg/dL', 'refRange' => '<200', 'high' => 200, 'criticalHigh' => 300],
                ['parameter' => 'Triglycerides', 'unit' => 'mg/dL', 'refRange' => '<150', 'high' => 150, 'criticalHigh' => 500],
                ['parameter' => 'HDL Cholesterol', 'unit' => 'mg/dL', 'refRange' => '>40', 'low' => 40, 'criticalLow' => 20],
                ['parameter' => 'LDL Cholesterol', 'unit' => 'mg/dL', 'refRange' => '<100', 'high' => 100, 'criticalHigh' => 190],
                ['parameter' => 'VLDL Cholesterol', 'unit' => 'mg/dL', 'refRange' => '<30', 'high' => 30],
                ['parameter' => 'Total/HDL Ratio', 'unit' => 'Ratio', 'refRange' => '<5', 'high' => 5],
            ],
            'LFT' => [
                ['parameter' => 'ALT (SGPT)', 'unit' => 'U/L', 'refRange' => '7-56', 'low' => 7, 'high' => 56, 'criticalHigh' => 1000],
                ['parameter' => 'AST (SGOT)', 'unit' => 'U/L', 'refRange' => '10-40', 'low' => 10, 'high' => 40, 'criticalHigh' => 1000],
                ['parameter' => 'ALP', 'unit' => 'U/L', 'refRange' => '44-147', 'low' => 44, 'high' => 147],
                ['parameter' => 'Total Bilirubin', 'unit' => 'mg/dL', 'refRange' => '0.1-1.2', 'low' => 0.1, 'high' => 1.2, 'criticalHigh' => 15],
                ['parameter' => 'Direct Bilirubin', 'unit' => 'mg/dL', 'refRange' => '0.0-0.3', 'low' => 0, 'high' => 0.3],
                ['parameter' => 'Albumin', 'unit' => 'g/dL', 'refRange' => '3.5-5.5', 'low' => 3.5, 'high' => 5.5, 'criticalLow' => 1.5],
                ['parameter' => 'Total Protein', 'unit' => 'g/dL', 'refRange' => '6.0-8.3', 'low' => 6.0, 'high' => 8.3],
                ['parameter' => 'GGT', 'unit' => 'U/L', 'refRange' => '9-48', 'low' => 9, 'high' => 48],
            ],
            'RFT' => [
                ['parameter' => 'Creatinine', 'unit' => 'mg/dL', 'refRange' => '0.7-1.3', 'low' => 0.7, 'high' => 1.3, 'criticalHigh' => 10],
                ['parameter' => 'BUN', 'unit' => 'mg/dL', 'refRange' => '7-20', 'low' => 7, 'high' => 20, 'criticalHigh' => 100],
                ['parameter' => 'Uric Acid', 'unit' => 'mg/dL', 'refRange' => '3.5-7.2', 'low' => 3.5, 'high' => 7.2],
                ['parameter' => 'eGFR', 'unit' => 'mL/min', 'refRange' => '>90', 'low' => 90, 'criticalLow' => 15],
            ],
            'TFT' => [
                ['parameter' => 'TSH', 'unit' => 'mIU/L', 'refRange' => '0.4-4.0', 'low' => 0.4, 'high' => 4.0, 'criticalLow' => 0.01, 'criticalHigh' => 100],
                ['parameter' => 'Free T3', 'unit' => 'pg/mL', 'refRange' => '2.0-4.4', 'low' => 2.0, 'high' => 4.4],
                ['parameter' => 'Free T4', 'unit' => 'ng/dL', 'refRange' => '0.8-1.8', 'low' => 0.8, 'high' => 1.8],
                ['parameter' => 'Total T3', 'unit' => 'ng/dL', 'refRange' => '80-200', 'low' => 80, 'high' => 200],
                ['parameter' => 'Total T4', 'unit' => '\u00b5g/dL', 'refRange' => '5.0-12.0', 'low' => 5.0, 'high' => 12.0],
            ],
            'ELEC' => [
                ['parameter' => 'Sodium (Na+)', 'unit' => 'mEq/L', 'refRange' => '136-145', 'low' => 136, 'high' => 145, 'criticalLow' => 120, 'criticalHigh' => 160],
                ['parameter' => 'Potassium (K+)', 'unit' => 'mEq/L', 'refRange' => '3.5-5.0', 'low' => 3.5, 'high' => 5.0, 'criticalLow' => 2.5, 'criticalHigh' => 6.5],
                ['parameter' => 'Chloride (Cl-)', 'unit' => 'mEq/L', 'refRange' => '98-106', 'low' => 98, 'high' => 106],
                ['parameter' => 'Bicarbonate (HCO3-)', 'unit' => 'mEq/L', 'refRange' => '22-29', 'low' => 22, 'high' => 29, 'criticalLow' => 10, 'criticalHigh' => 40],
            ],
            'ESR' => [
                ['parameter' => 'ESR (1st hour)', 'unit' => 'mm/hr', 'refRange' => '0-20', 'low' => 0, 'high' => 20],
            ],
            'PT-INR' => [
                ['parameter' => 'Prothrombin Time', 'unit' => 'sec', 'refRange' => '11-13.5', 'low' => 11, 'high' => 13.5, 'criticalHigh' => 30],
                ['parameter' => 'INR', 'unit' => '', 'refRange' => '0.8-1.1', 'low' => 0.8, 'high' => 1.1, 'criticalHigh' => 5],
            ],
            'CRP' => [
                ['parameter' => 'C-Reactive Protein', 'unit' => 'mg/L', 'refRange' => '<3', 'high' => 3, 'criticalHigh' => 100],
            ],
            'TROP-I' => [
                ['parameter' => 'Troponin I', 'unit' => 'ng/mL', 'refRange' => '<0.04', 'high' => 0.04, 'criticalHigh' => 2.0],
            ],
            'DDIMER' => [
                ['parameter' => 'D-Dimer', 'unit' => 'ng/mL', 'refRange' => '<500', 'high' => 500, 'criticalHigh' => 5000],
            ],
            'RBS' => [
                ['parameter' => 'Random Blood Sugar', 'unit' => 'mg/dL', 'refRange' => '<140', 'high' => 140, 'criticalLow' => 40, 'criticalHigh' => 500],
            ],
            'BSF' => [
                ['parameter' => 'Fasting Blood Sugar', 'unit' => 'mg/dL', 'refRange' => '70-100', 'low' => 70, 'high' => 100, 'criticalLow' => 40, 'criticalHigh' => 500],
            ],
            'HBA1C' => [
                ['parameter' => 'HbA1c', 'unit' => '%', 'refRange' => '<5.7', 'high' => 5.7, 'criticalHigh' => 14],
            ],
            'HBSAG' => [
                ['parameter' => 'HBsAg', 'unit' => '', 'refRange' => 'Non-Reactive', 'qualitative' => true],
            ],
            'HCV' => [
                ['parameter' => 'Anti-HCV', 'unit' => '', 'refRange' => 'Non-Reactive', 'qualitative' => true],
            ],
            'HIV' => [
                ['parameter' => 'HIV 1/2 Antibody', 'unit' => '', 'refRange' => 'Non-Reactive', 'qualitative' => true],
            ],
            'RF' => [
                ['parameter' => 'Rheumatoid Factor', 'unit' => 'IU/mL', 'refRange' => '<14', 'high' => 14],
            ],
            'URE' => [
                ['parameter' => 'Appearance', 'unit' => '', 'refRange' => 'Clear', 'qualitative' => true],
                ['parameter' => 'Color', 'unit' => '', 'refRange' => 'Pale Yellow', 'qualitative' => true],
                ['parameter' => 'pH', 'unit' => '', 'refRange' => '4.5-8.0', 'low' => 4.5, 'high' => 8.0],
                ['parameter' => 'Specific Gravity', 'unit' => '', 'refRange' => '1.005-1.030', 'low' => 1.005, 'high' => 1.030],
                ['parameter' => 'Protein', 'unit' => '', 'refRange' => 'Negative', 'qualitative' => true],
                ['parameter' => 'Glucose', 'unit' => '', 'refRange' => 'Negative', 'qualitative' => true],
                ['parameter' => 'WBC', 'unit' => '/HPF', 'refRange' => '0-5', 'low' => 0, 'high' => 5],
                ['parameter' => 'RBC', 'unit' => '/HPF', 'refRange' => '0-2', 'low' => 0, 'high' => 2],
                ['parameter' => 'Epithelial Cells', 'unit' => '/HPF', 'refRange' => 'Few', 'qualitative' => true],
                ['parameter' => 'Bacteria', 'unit' => '', 'refRange' => 'Absent', 'qualitative' => true],
                ['parameter' => 'Casts', 'unit' => '', 'refRange' => 'Absent', 'qualitative' => true],
            ],
            'ABG' => [
                ['parameter' => 'pH', 'unit' => '', 'refRange' => '7.35-7.45', 'low' => 7.35, 'high' => 7.45, 'criticalLow' => 7.1, 'criticalHigh' => 7.6],
                ['parameter' => 'pCO2', 'unit' => 'mmHg', 'refRange' => '35-45', 'low' => 35, 'high' => 45, 'criticalLow' => 20, 'criticalHigh' => 70],
                ['parameter' => 'pO2', 'unit' => 'mmHg', 'refRange' => '80-100', 'low' => 80, 'high' => 100, 'criticalLow' => 40],
                ['parameter' => 'HCO3-', 'unit' => 'mEq/L', 'refRange' => '22-26', 'low' => 22, 'high' => 26, 'criticalLow' => 10, 'criticalHigh' => 40],
                ['parameter' => 'Base Excess', 'unit' => 'mEq/L', 'refRange' => '-2 to +2', 'low' => -2, 'high' => 2],
                ['parameter' => 'O2 Saturation', 'unit' => '%', 'refRange' => '95-100', 'low' => 95, 'criticalLow' => 80],
            ],
            'BC-S' => [
                ['parameter' => 'Culture Result', 'unit' => '', 'refRange' => 'No Growth', 'qualitative' => true],
                ['parameter' => 'Organism Identified', 'unit' => '', 'refRange' => 'N/A', 'qualitative' => true],
                ['parameter' => 'Colony Count', 'unit' => 'CFU/mL', 'refRange' => 'No Growth', 'qualitative' => true],
            ],
            'UC-S' => [
                ['parameter' => 'Culture Result', 'unit' => '', 'refRange' => 'No Growth', 'qualitative' => true],
                ['parameter' => 'Organism Identified', 'unit' => '', 'refRange' => 'N/A', 'qualitative' => true],
                ['parameter' => 'Colony Count', 'unit' => 'CFU/mL', 'refRange' => '<10³', 'qualitative' => true],
            ],
            'WIDAL' => [
                ['parameter' => 'S. Typhi O', 'unit' => 'Titer', 'refRange' => '<1:80', 'qualitative' => true],
                ['parameter' => 'S. Typhi H', 'unit' => 'Titer', 'refRange' => '<1:80', 'qualitative' => true],
                ['parameter' => 'S. Paratyphi AO', 'unit' => 'Titer', 'refRange' => '<1:80', 'qualitative' => true],
                ['parameter' => 'S. Paratyphi BO', 'unit' => 'Titer', 'refRange' => '<1:80', 'qualitative' => true],
            ],
            'STOOL-RE' => [
                ['parameter' => 'Color', 'unit' => '', 'refRange' => 'Brown', 'qualitative' => true],
                ['parameter' => 'Consistency', 'unit' => '', 'refRange' => 'Formed', 'qualitative' => true],
                ['parameter' => 'Occult Blood', 'unit' => '', 'refRange' => 'Negative', 'qualitative' => true],
                ['parameter' => 'Ova/Parasites', 'unit' => '', 'refRange' => 'Not Seen', 'qualitative' => true],
                ['parameter' => 'WBC', 'unit' => '/HPF', 'refRange' => '0-5', 'low' => 0, 'high' => 5],
                ['parameter' => 'RBC', 'unit' => '/HPF', 'refRange' => '0-2', 'low' => 0, 'high' => 2],
            ],
            'USK' => [
                ['parameter' => 'Urine Sugar', 'unit' => '', 'refRange' => 'Negative', 'qualitative' => true],
                ['parameter' => 'Urine Ketones', 'unit' => '', 'refRange' => 'Negative', 'qualitative' => true],
            ],
        ];
    }

    private function getTestCatalogData()
    {
        return \App\Models\LabTest::where('status', 'Active')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->test_code,
                    'fasting' => in_array($t->fasting_required, ['Yes', '1', 1], true) || $t->fasting_required === true,
                    'specimen' => $t->sample_type ?? 'Blood',
                    'container' => $t->collection_container ?? 'Red Top (Plain)',
                    'volume' => $t->sample_volume ?? '3 mL',
                ];
            })
            ->toArray();
    }

    private function seedIfEmpty()
    {
        if (LabOrder::count() > 0) return;

        $now = Carbon::now();

        $doctors = ['Dr. Ayesha Siddiqui', 'Dr. Imran Khan', 'Dr. Zainab Malik', 'Dr. Hassan Raza', 'Dr. Nadia Hussain', 'Dr. Farhan Ahmed'];

        $patients = [
            ['Ahmed Ali', 'MRN-2026-0001', 45, 'M', 'IPD Ward A, Bed 5', 'VN-2026-0201', 'Acute Myocardial Infarction', ['Penicillin'], ['Diabetic', 'On anticoagulation therapy', 'Previous MI 2024'], ['Aspirin 75mg OD', 'Warfarin 5mg OD', 'Metformin 500mg BD']],
            ['Sara Khan', 'MRN-2026-0002', 32, 'F', 'OPD Gynecology', 'VN-2026-0202', 'Suspected UTI', [], ['Pregnant - 28 weeks', 'Gestational diabetes'], ['Folic Acid 5mg OD', 'Iron supplements']],
            ['Usman Ali', 'MRN-2026-0003', 58, 'M', 'IPD Ward B, Bed 12', 'VN-2026-0203', 'Pneumonia with Sepsis', ['Sulfa drugs'], ['COPD', 'Hypertension', 'Chronic kidney disease'], ['Metformin 500mg BD', 'Lisinopril 10mg OD', 'Salbutamol inhaler']],
            ['Fatima Bibi', 'MRN-2026-0004', 67, 'F', 'Emergency', 'VN-2026-0204', 'Hypertensive Crisis', ['ACE Inhibitors'], ['Diabetes Type 2', 'CKD Stage 3'], ['Amlodipine 5mg OD', 'Insulin Glargine']],
            ['Bilal Ahmed', 'MRN-2026-0005', 28, 'M', 'OPD Medicine', 'VN-2026-0205', 'Fever of unknown origin', [], ['No significant history'], []],
            ['Zara Iqbal', 'MRN-2026-0006', 40, 'F', 'IPD Ward C, Bed 3', 'VN-2026-0206', 'Post-Op Appendectomy', ['Codeine'], ['Anemia', 'Previous blood transfusion'], ['Cefixime 200mg BD', 'Paracetamol PRN']],
            ['Hamza Sheikh', 'MRN-2026-0007', 55, 'M', 'OT', 'VN-2026-0207', 'Hip Replacement - Pre-op', [], ['On warfarin', 'GERD'], ['Warfarin 5mg OD', 'Omeprazole 20mg OD']],
            ['Ayesha Noor', 'MRN-2026-0008', 35, 'F', 'Walk-in', 'VN-2026-0208', 'Routine Health Checkup', [], ['Thyroid disorder'], ['Thyroxine 50mcg OD']],
        ];

        $testCatalog = [
            ['Complete Blood Count (CBC)', 'CBC', 'Hematology', 'EDTA Blood', 'Purple Top (EDTA)', '3-5 mL', false, 'Room temp', null, '6 hours'],
            ['Erythrocyte Sedimentation Rate (ESR)', 'ESR', 'Hematology', 'EDTA Blood', 'Purple Top (EDTA)', '2 mL', false, 'Room temp', null, '4 hours'],
            ['Prothrombin Time (PT/INR)', 'PT-INR', 'Hematology', 'Citrate Blood', 'Blue Top (Citrate)', '2.7 mL', false, '2-8°C', null, '4 hours'],
            ['Liver Function Tests (LFT)', 'LFT', 'Clinical Chemistry', 'Serum', 'Red Top (Plain)', '5 mL', true, 'Room temp', null, '8 hours'],
            ['Renal Function Tests (RFT)', 'RFT', 'Clinical Chemistry', 'Serum', 'Red Top (Plain)', '5 mL', false, 'Room temp', null, '8 hours'],
            ['Lipid Profile', 'LIPID', 'Clinical Chemistry', 'Serum', 'Red Top (Plain)', '5 mL', true, '2-8°C', null, '8 hours'],
            ['Random Blood Sugar (RBS)', 'RBS', 'Clinical Chemistry', 'Fluoride Blood', 'Gray Top (Fluoride)', '2 mL', false, 'Room temp', null, '2 hours'],
            ['HbA1c', 'HBA1C', 'Clinical Chemistry', 'EDTA Blood', 'Purple Top (EDTA)', '3 mL', false, 'Room temp', null, '24 hours'],
            ['Thyroid Function Tests (TFT)', 'TFT', 'Clinical Chemistry', 'Serum', 'Red Top (Plain)', '3 mL', false, '2-8°C', null, '24 hours'],
            ['Blood Culture & Sensitivity', 'BC-S', 'Microbiology', 'Blood', 'Blood Culture Bottle', '10 mL', false, '37°C incubator', 'BacT/ALERT', '48-72 hours'],
            ['Urine Culture & Sensitivity', 'UC-S', 'Microbiology', 'Mid-stream Urine', 'Sterile Container', '10-20 mL', false, '2-8°C', null, '48-72 hours'],
            ['Sputum Culture', 'SPUT-C', 'Microbiology', 'Sputum', 'Sterile Container', '5 mL', false, 'Room temp', null, '48-72 hours'],
            ['Hepatitis B Surface Antigen (HBsAg)', 'HBSAG', 'Serology', 'Serum', 'Red Top (Plain)', '3 mL', false, '2-8°C', null, '24 hours'],
            ['Anti-HCV', 'HCV', 'Serology', 'Serum', 'Red Top (Plain)', '3 mL', false, '2-8°C', null, '24 hours'],
            ['HIV Screening', 'HIV', 'Serology', 'Serum', 'Red Top (Plain)', '5 mL', false, '2-8°C', null, '24 hours'],
            ['C-Reactive Protein (CRP)', 'CRP', 'Immunology', 'Serum', 'Red Top (Plain)', '3 mL', false, 'Room temp', null, '4 hours'],
            ['Rheumatoid Factor (RF)', 'RF', 'Immunology', 'Serum', 'Red Top (Plain)', '3 mL', false, '2-8°C', null, '24 hours'],
            ['Urinalysis (Urine R/E)', 'URE', 'Clinical Chemistry', 'Urine', 'Urine Container', '30 mL', false, 'Room temp', null, '2 hours'],
            ['Stool Routine Examination', 'STOOL-RE', 'Microbiology', 'Stool', 'Stool Container', '5 g', false, 'Room temp', null, '4 hours'],
            ['Troponin I', 'TROP-I', 'Clinical Chemistry', 'Serum', 'Red Top (Plain)', '3 mL', false, '2-8°C', null, '1 hour'],
            ['D-Dimer', 'DDIMER', 'Hematology', 'Citrate Blood', 'Blue Top (Citrate)', '2.7 mL', false, '2-8°C', null, '2 hours'],
            ['Serum Electrolytes', 'ELEC', 'Clinical Chemistry', 'Serum', 'Red Top (Plain)', '3 mL', false, 'Room temp', null, '4 hours'],
            ['Arterial Blood Gases (ABG)', 'ABG', 'Clinical Chemistry', 'Arterial Blood', 'Heparinized Syringe', '1-2 mL', false, 'On ice', null, '30 minutes'],
            ['PCR COVID-19', 'PCR-COV', 'Molecular Biology', 'Nasopharyngeal Swab', 'VTM Tube', 'Swab', false, '2-8°C', 'VTM', '6 hours'],
        ];

        $orderConfigs = [
            ['pIdx' => 0, 'dept' => 'IPD', 'ward' => 'Ward A', 'bed' => 'Bed 5', 'priority' => 'STAT', 'status' => 'Pending', 'sampleStatus' => 'Not Collected', 'critical' => true, 'tat' => 60, 'tests' => [0, 19, 2, 21], 'minutesAgo' => 15, 'indication' => 'Chest pain, rule out MI'],
            ['pIdx' => 1, 'dept' => 'OPD', 'ward' => null, 'bed' => null, 'priority' => 'Routine', 'status' => 'Collected', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 1440, 'tests' => [0, 17, 10, 6], 'minutesAgo' => 120, 'indication' => 'Suspected UTI, pregnancy monitoring'],
            ['pIdx' => 2, 'dept' => 'IPD', 'ward' => 'Ward B', 'bed' => 'Bed 12', 'priority' => 'STAT', 'status' => 'In Progress', 'sampleStatus' => 'Collected', 'critical' => true, 'tat' => 60, 'tests' => [0, 9, 15, 22, 4], 'minutesAgo' => 45, 'indication' => 'Sepsis workup, deteriorating patient'],
            ['pIdx' => 3, 'dept' => 'Emergency', 'ward' => null, 'bed' => null, 'priority' => 'STAT', 'status' => 'Pending', 'sampleStatus' => 'Not Collected', 'critical' => true, 'tat' => 60, 'tests' => [4, 21, 19, 22], 'minutesAgo' => 8, 'indication' => 'Hypertensive emergency, assess organ damage'],
            ['pIdx' => 4, 'dept' => 'OPD', 'ward' => null, 'bed' => null, 'priority' => 'Routine', 'status' => 'Collected', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 1440, 'tests' => [0, 1, 3, 15, 17], 'minutesAgo' => 300, 'indication' => 'Fever workup'],
            ['pIdx' => 5, 'dept' => 'IPD', 'ward' => 'Ward C', 'bed' => 'Bed 3', 'priority' => 'Urgent', 'status' => 'Ready', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 240, 'tests' => [0, 4, 3], 'minutesAgo' => 180, 'indication' => 'Post-operative monitoring'],
            ['pIdx' => 6, 'dept' => 'OT', 'ward' => null, 'bed' => null, 'priority' => 'Urgent', 'status' => 'Verified', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 240, 'tests' => [0, 2, 21, 12, 13], 'minutesAgo' => 360, 'indication' => 'Pre-operative assessment'],
            ['pIdx' => 7, 'dept' => 'Walk-in', 'ward' => null, 'bed' => null, 'priority' => 'Routine', 'status' => 'Reported', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 1440, 'tests' => [0, 5, 8, 6, 3], 'minutesAgo' => 1200, 'indication' => 'Annual health checkup'],
            ['pIdx' => 0, 'dept' => 'IPD', 'ward' => 'Ward A', 'bed' => 'Bed 5', 'priority' => 'Routine', 'status' => 'Completed', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 1440, 'tests' => [3, 4, 7], 'minutesAgo' => 2880, 'indication' => 'Diabetes and renal monitoring'],
            ['pIdx' => 2, 'dept' => 'IPD', 'ward' => 'Ward B', 'bed' => 'Bed 12', 'priority' => 'Routine', 'status' => 'Rejected', 'sampleStatus' => 'Rejected', 'critical' => false, 'tat' => 1440, 'tests' => [9], 'minutesAgo' => 200, 'indication' => 'Blood culture for sepsis'],
            ['pIdx' => 3, 'dept' => 'Emergency', 'ward' => null, 'bed' => null, 'priority' => 'Urgent', 'status' => 'In Progress', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 240, 'tests' => [0, 6, 4, 21], 'minutesAgo' => 90, 'indication' => 'Metabolic panel for crisis'],
            ['pIdx' => 4, 'dept' => 'OPD', 'ward' => null, 'bed' => null, 'priority' => 'Routine', 'status' => 'Ready', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 1440, 'tests' => [12, 13, 14], 'minutesAgo' => 600, 'indication' => 'Hepatitis and HIV screening'],
            ['pIdx' => 7, 'dept' => 'Walk-in', 'ward' => null, 'bed' => null, 'priority' => 'Routine', 'status' => 'Pending', 'sampleStatus' => 'Not Collected', 'critical' => false, 'tat' => 1440, 'tests' => [0, 8], 'minutesAgo' => 30, 'indication' => 'Thyroid follow-up'],
            ['pIdx' => 1, 'dept' => 'OPD', 'ward' => null, 'bed' => null, 'priority' => 'Urgent', 'status' => 'Collected', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 240, 'tests' => [0, 6, 17], 'minutesAgo' => 60, 'indication' => 'Gestational diabetes monitoring'],
            ['pIdx' => 5, 'dept' => 'IPD', 'ward' => 'Ward C', 'bed' => 'Bed 3', 'priority' => 'Routine', 'status' => 'In Progress', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 1440, 'tests' => [0, 1, 15], 'minutesAgo' => 150, 'indication' => 'Post-op infection markers'],
            ['pIdx' => 6, 'dept' => 'OT', 'ward' => null, 'bed' => null, 'priority' => 'STAT', 'status' => 'Collected', 'sampleStatus' => 'Collected', 'critical' => true, 'tat' => 60, 'tests' => [2, 0], 'minutesAgo' => 25, 'indication' => 'Intra-operative PT/INR check'],
            ['pIdx' => 2, 'dept' => 'IPD', 'ward' => 'Ward B', 'bed' => 'Bed 12', 'priority' => 'Urgent', 'status' => 'Pending', 'sampleStatus' => 'Not Collected', 'critical' => true, 'tat' => 240, 'tests' => [22, 0, 15], 'minutesAgo' => 20, 'indication' => 'ABG for respiratory distress'],
            ['pIdx' => 4, 'dept' => 'OPD', 'ward' => null, 'bed' => null, 'priority' => 'Routine', 'status' => 'Verified', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 1440, 'tests' => [0, 1, 17, 18], 'minutesAgo' => 720, 'indication' => 'General fever workup'],
            ['pIdx' => 0, 'dept' => 'IPD', 'ward' => 'Ward A', 'bed' => 'Bed 5', 'priority' => 'Urgent', 'status' => 'Collected', 'sampleStatus' => 'Collected', 'critical' => false, 'tat' => 240, 'tests' => [19, 20], 'minutesAgo' => 55, 'indication' => 'Cardiac markers follow-up'],
            ['pIdx' => 3, 'dept' => 'Emergency', 'ward' => null, 'bed' => null, 'priority' => 'STAT', 'status' => 'Ready', 'sampleStatus' => 'Collected', 'critical' => true, 'tat' => 60, 'tests' => [19, 0, 22], 'minutesAgo' => 40, 'indication' => 'Troponin for chest pain'],
        ];

        $testId = 1;
        foreach ($orderConfigs as $idx => $cfg) {
            $p = $patients[$cfg['pIdx']];
            $orderTime = $now->copy()->subMinutes($cfg['minutesAgo']);
            $fasting = false;
            foreach ($cfg['tests'] as $tIdx) {
                if ($testCatalog[$tIdx][5] ?? false) { $fasting = true; break; }
            }

            $orderId = sprintf('LAB-2026-%04d', $idx + 1);

            LabOrder::create([
                'order_id' => $orderId,
                'order_time' => $orderTime,
                'patient_name' => $p[0],
                'mrn' => $p[1],
                'visit_number' => $p[5],
                'patient_age' => $p[2],
                'patient_gender' => $p[3],
                'patient_location' => $p[4],
                'diagnosis' => $p[6],
                'allergies' => $p[7],
                'relevant_history' => $p[8],
                'source_department' => $cfg['dept'],
                'ward' => $cfg['ward'],
                'bed' => $cfg['bed'],
                'priority' => $cfg['priority'],
                'status' => $cfg['status'],
                'sample_status' => $cfg['sampleStatus'],
                'tests_count' => count($cfg['tests']),
                'ordered_by' => $doctors[array_rand($doctors)],
                'clinical_indication' => $cfg['indication'],
                'clinical_notes' => $cfg['indication'],
                'drug_history' => $p[9],
                'fasting_required' => $fasting,
                'fasting_compliant' => $fasting ? (bool)rand(0,1) : null,
                'critical_flag' => $cfg['critical'],
                'tat_minutes' => $cfg['tat'],
                'collected_at' => $cfg['sampleStatus'] === 'Collected' ? $orderTime->copy()->addMinutes(rand(5, 20)) : null,
                'collected_by' => $cfg['sampleStatus'] === 'Collected' ? 'Lab Tech. Amir' : null,
                'verified_at' => in_array($cfg['status'], ['Verified', 'Reported', 'Completed']) ? $orderTime->copy()->addMinutes(rand(60, 180)) : null,
                'verified_by' => in_array($cfg['status'], ['Verified', 'Reported', 'Completed']) ? 'Dr. Rashid (Pathologist)' : null,
                'reported_at' => in_array($cfg['status'], ['Reported', 'Completed']) ? $orderTime->copy()->addMinutes(rand(120, 300)) : null,
                'notes' => $cfg['status'] === 'Rejected' ? 'Sample hemolyzed - recollection needed' : null,
            ]);

            foreach ($cfg['tests'] as $tIdx) {
                $t = $testCatalog[$tIdx];
                $testStatus = $cfg['status'];
                if ($testStatus === 'Pending' && $cfg['sampleStatus'] === 'Not Collected') $testStatus = 'Pending';
                elseif ($testStatus === 'Collected' || ($testStatus !== 'Pending' && $cfg['sampleStatus'] === 'Collected' && $testStatus === 'Pending')) $testStatus = 'Collected';

                LabOrderTest::create([
                    'test_id' => sprintf('LT-%04d', $testId++),
                    'lab_order_id' => $orderId,
                    'test_name' => $t[0],
                    'test_code' => $t[1],
                    'category' => $t[2],
                    'specimen_type' => $t[3],
                    'container_type' => $t[4],
                    'volume' => $t[5],
                    'fasting_required' => $t[6],
                    'status' => $testStatus,
                    'special_instructions' => $t[6] ? 'Patient must fast 8-12 hours before collection' : null,
                    'storage_temp' => $t[7],
                    'transport_medium' => $t[8],
                    'stability' => $t[9],
                    'collected_at' => $cfg['sampleStatus'] === 'Collected' ? $orderTime->copy()->addMinutes(rand(5, 20)) : null,
                    'result_entered_at' => in_array($cfg['status'], ['Ready', 'Verified', 'Reported', 'Completed']) ? $orderTime->copy()->addMinutes(rand(30, 120)) : null,
                    'result_entered_by' => in_array($cfg['status'], ['Ready', 'Verified', 'Reported', 'Completed']) ? 'Lab Tech. Sarah' : null,
                    'verified_at' => in_array($cfg['status'], ['Verified', 'Reported', 'Completed']) ? $orderTime->copy()->addMinutes(rand(60, 180)) : null,
                    'verified_by' => in_array($cfg['status'], ['Verified', 'Reported', 'Completed']) ? 'Dr. Rashid (Pathologist)' : null,
                ]);
            }
        }
    }
}
