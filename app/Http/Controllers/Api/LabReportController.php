<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabReport;
use App\Models\LabOrder;
use App\Models\LabOrderTest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LabReportController extends Controller
{
    public function stats()
    {
        $reports = LabReport::all();
        $today = now()->startOfDay();

        return response()->json([
            'totalReports' => $reports->count(),
            'generatedToday' => $reports->where('report_date', '>=', $today)->count(),
            'pendingDelivery' => $reports->filter(function ($r) {
                $ds = $r->delivery_status ?? [];
                return !($ds['email'] ?? false) && !($ds['sms'] ?? false) && !($ds['collected'] ?? false);
            })->count(),
            'deliveredToday' => $reports->where('report_date', '>=', $today)->filter(function ($r) {
                $ds = $r->delivery_status ?? [];
                return ($ds['email'] ?? false) || ($ds['sms'] ?? false) || ($ds['collected'] ?? false);
            })->count(),
            'criticalReports' => $reports->where('critical_flag', true)->count(),
            'archivedReports' => $reports->where('is_archived', true)->count(),
        ]);
    }

    public function index(Request $request)
    {
        $query = LabReport::query()->orderBy('report_date', 'desc');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('report_id', 'LIKE', "%{$s}%")
                  ->orWhere('patient_name', 'LIKE', "%{$s}%")
                  ->orWhere('mrn', 'LIKE', "%{$s}%")
                  ->orWhere('lab_order_id', 'LIKE', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('department')) {
            $query->where('source_department', $request->department);
        }

        if ($request->filled('date_from')) {
            $query->where('report_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('report_date', '<=', $request->date_to . ' 23:59:59');
        }

        if ($request->filled('type')) {
            $query->where('report_type', $request->type);
        }

        if ($request->boolean('critical_only')) {
            $query->where('critical_flag', true);
        }

        if ($request->boolean('archived')) {
            $query->where('is_archived', true);
        }

        $reports = $query->get()->map(function ($r) {
            $ds = $r->delivery_status ?? [];
            $deliveryCount = collect($ds)->filter()->count();
            $totalChannels = 6;
            return [
                'reportId' => $r->report_id,
                'labOrderId' => $r->lab_order_id,
                'patientName' => $r->patient_name,
                'mrn' => $r->mrn,
                'patientAge' => $r->patient_age,
                'patientGender' => $r->patient_gender,
                'referredBy' => $r->referred_by,
                'sourceDepartment' => $r->source_department,
                'reportDate' => $r->report_date?->format('d-M-Y h:i A'),
                'reportDateRaw' => $r->report_date,
                'collectionDate' => $r->collection_date?->format('d-M-Y h:i A'),
                'reportType' => $r->report_type,
                'status' => $r->status,
                'priority' => $r->priority,
                'criticalFlag' => $r->critical_flag,
                'testsCount' => is_array($r->test_results) ? count($r->test_results) : 0,
                'testNames' => collect($r->test_results ?? [])->pluck('testName')->toArray(),
                'deliveryStatus' => $ds,
                'deliveryProgress' => $deliveryCount . '/' . $totalChannels,
                'isArchived' => $r->is_archived,
                'qrCode' => $r->qr_code,
                'verifiedBy' => $r->verified_by,
            ];
        });

        return response()->json($reports);
    }

    public function show($reportId)
    {
        $r = LabReport::where('report_id', $reportId)->first();
        if (!$r) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        return response()->json([
            'reportId' => $r->report_id,
            'labOrderId' => $r->lab_order_id,
            'patientName' => $r->patient_name,
            'mrn' => $r->mrn,
            'patientAge' => $r->patient_age,
            'patientGender' => $r->patient_gender,
            'referredBy' => $r->referred_by,
            'sourceDepartment' => $r->source_department,
            'ward' => $r->ward,
            'bed' => $r->bed,
            'visitNumber' => $r->visit_number,
            'diagnosis' => $r->diagnosis,
            'collectionDate' => $r->collection_date?->format('d-M-Y'),
            'collectionTime' => $r->collection_date?->format('h:i A'),
            'reportDate' => $r->report_date?->format('d-M-Y'),
            'reportTime' => $r->report_date?->format('h:i A'),
            'reportType' => $r->report_type,
            'status' => $r->status,
            'testResults' => $r->test_results ?? [],
            'pathologistComments' => $r->pathologist_comments,
            'performedBy' => $r->performed_by,
            'verifiedBy' => $r->verified_by,
            'verifierTitle' => $r->verifier_title,
            'verifierQualifications' => $r->verifier_qualifications,
            'priority' => $r->priority,
            'criticalFlag' => $r->critical_flag,
            'deliveryStatus' => $r->delivery_status ?? [],
            'emailSentAt' => $r->email_sent_at?->format('d-M-Y h:i A'),
            'smsSentAt' => $r->sms_sent_at?->format('d-M-Y h:i A'),
            'whatsappSentAt' => $r->whatsapp_sent_at?->format('d-M-Y h:i A'),
            'collectedAt' => $r->collected_at?->format('d-M-Y h:i A'),
            'printedAt' => $r->printed_at?->format('d-M-Y h:i A'),
            'qrCode' => $r->qr_code,
            'retentionYears' => $r->retention_years,
            'isArchived' => $r->is_archived,
            'createdAt' => $r->created_at?->format('d-M-Y h:i A'),
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'lab_order_id' => 'required|string',
        ]);

        $order = LabOrder::where('order_id', $request->lab_order_id)->first();
        if (!$order) {
            return response()->json(['error' => 'Lab order not found'], 404);
        }

        $existing = LabReport::where('lab_order_id', $request->lab_order_id)->first();
        if ($existing) {
            return response()->json(['error' => 'Report already generated', 'reportId' => $existing->report_id], 409);
        }

        $tests = LabOrderTest::where('lab_order_id', $request->lab_order_id)->get();
        $testResults = $tests->map(function ($t) {
            return [
                'testName' => $t->test_name,
                'testCode' => $t->test_code,
                'category' => $t->category,
                'specimenType' => $t->specimen_type,
                'status' => $t->result_status ?? 'Pending',
                'resultData' => $t->result_data,
                'enteredBy' => $t->result_entered_by,
                'enteredAt' => $t->result_entered_at?->format('d-M-Y h:i A'),
                'verifiedBy' => $t->verified_by,
                'verifiedAt' => $t->verified_at?->format('d-M-Y h:i A'),
            ];
        })->toArray();

        $seq = LabReport::count() + 1;
        $reportId = 'RPT-' . date('Y') . '-' . str_pad($seq, 4, '0', STR_PAD_LEFT);

        $report = LabReport::create([
            'report_id' => $reportId,
            'lab_order_id' => $request->lab_order_id,
            'patient_name' => $order->patient_name,
            'mrn' => $order->mrn,
            'patient_age' => $order->patient_age ?? 'N/A',
            'patient_gender' => $order->patient_gender ?? 'N/A',
            'referred_by' => $order->ordered_by,
            'source_department' => $order->source_department,
            'ward' => $order->ward,
            'bed' => $order->bed,
            'visit_number' => $order->visit_number,
            'diagnosis' => $order->diagnosis,
            'collection_date' => $order->collected_at,
            'report_date' => now(),
            'report_type' => 'Individual',
            'status' => 'Generated',
            'test_results' => $testResults,
            'pathologist_comments' => $request->pathologist_comments,
            'performed_by' => $request->performed_by ?? 'Ahmed Khan',
            'verified_by' => $request->verified_by ?? 'Dr. Sarah Ahmed',
            'verifier_title' => $request->verifier_title ?? 'Consultant Pathologist',
            'verifier_qualifications' => $request->verifier_qualifications ?? 'FCPS, MCPS',
            'priority' => $order->priority ?? 'Routine',
            'critical_flag' => $order->critical_flag ?? false,
            'delivery_status' => [
                'email' => false,
                'sms' => false,
                'whatsapp' => false,
                'collected' => false,
                'courier' => false,
                'portal' => false,
            ],
            'qr_code' => 'QR-' . strtoupper(Str::random(8)),
            'retention_years' => 5,
            'is_archived' => false,
        ]);

        return response()->json([
            'message' => 'Report generated successfully',
            'reportId' => $report->report_id,
        ], 201);
    }

    public function updateDelivery(Request $request, $reportId)
    {
        $report = LabReport::where('report_id', $reportId)->first();
        if (!$report) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        $ds = $report->delivery_status ?? [];
        $channel = $request->channel;

        if ($channel && in_array($channel, ['email', 'sms', 'whatsapp', 'collected', 'courier', 'portal'])) {
            $ds[$channel] = true;
            $report->delivery_status = $ds;

            $tsField = match ($channel) {
                'email' => 'email_sent_at',
                'sms' => 'sms_sent_at',
                'whatsapp' => 'whatsapp_sent_at',
                'collected' => 'collected_at',
                default => null,
            };

            if ($tsField) {
                $report->$tsField = now();
            }

            $report->status = 'Delivered';
            $report->save();
        }

        return response()->json(['message' => 'Delivery updated', 'deliveryStatus' => $report->delivery_status]);
    }

    public function markPrinted($reportId)
    {
        $report = LabReport::where('report_id', $reportId)->first();
        if (!$report) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        $report->printed_at = now();
        $report->save();

        return response()->json(['message' => 'Report marked as printed']);
    }

    public function archive($reportId)
    {
        $report = LabReport::where('report_id', $reportId)->first();
        if (!$report) {
            return response()->json(['error' => 'Report not found'], 404);
        }

        $report->is_archived = true;
        $report->save();

        return response()->json(['message' => 'Report archived']);
    }

    public function cumulativeReport($mrn)
    {
        $reports = LabReport::where('mrn', $mrn)
            ->orderBy('report_date', 'asc')
            ->get();

        $testTrends = [];

        foreach ($reports as $report) {
            foreach ($report->test_results ?? [] as $test) {
                $testName = $test['testName'] ?? 'Unknown';
                if (!isset($testTrends[$testName])) {
                    $testTrends[$testName] = [];
                }

                $params = $test['resultData'] ?? [];
                if (is_array($params)) {
                    foreach ($params as $param) {
                        $paramName = $param['parameter'] ?? ($param['name'] ?? 'Value');
                        $value = $param['result'] ?? ($param['value'] ?? null);
                        if ($value !== null && is_numeric($value)) {
                            $testTrends[$testName][] = [
                                'date' => $report->report_date?->format('d-M-Y'),
                                'parameter' => $paramName,
                                'value' => (float) $value,
                                'unit' => $param['unit'] ?? '',
                                'refRange' => $param['referenceRange'] ?? ($param['range'] ?? ''),
                                'flag' => $param['flag'] ?? 'Normal',
                            ];
                        }
                    }
                }
            }
        }

        return response()->json([
            'mrn' => $mrn,
            'patientName' => $reports->first()?->patient_name ?? 'Unknown',
            'totalReports' => $reports->count(),
            'dateRange' => [
                'from' => $reports->first()?->report_date?->format('d-M-Y'),
                'to' => $reports->last()?->report_date?->format('d-M-Y'),
            ],
            'reports' => $reports->map(function ($r) {
                return [
                    'reportId' => $r->report_id,
                    'reportDate' => $r->report_date?->format('d-M-Y'),
                    'testNames' => collect($r->test_results ?? [])->pluck('testName')->toArray(),
                    'status' => $r->status,
                ];
            }),
            'testTrends' => $testTrends,
        ]);
    }

    public function deliveryQueue()
    {
        $reports = LabReport::where('status', '!=', 'Delivered')
            ->whereNotNull('report_date')
            ->orderBy('priority', 'asc')
            ->orderBy('report_date', 'desc')
            ->get()
            ->map(function ($r) {
                $ds = $r->delivery_status ?? [];
                return [
                    'reportId' => $r->report_id,
                    'patientName' => $r->patient_name,
                    'mrn' => $r->mrn,
                    'reportDate' => $r->report_date?->format('d-M-Y h:i A'),
                    'priority' => $r->priority,
                    'criticalFlag' => $r->critical_flag,
                    'deliveryStatus' => $ds,
                    'pendingChannels' => collect($ds)->filter(fn($v) => !$v)->keys()->toArray(),
                ];
            });

        return response()->json($reports);
    }
}
