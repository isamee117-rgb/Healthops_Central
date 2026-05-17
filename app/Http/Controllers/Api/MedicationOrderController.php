<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicationOrder;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\OpdConfigItem;
use App\Traits\HmsHelpers;
use App\Traits\PharmacyHelper;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MedicationOrderController extends Controller
{
    use HmsHelpers, PharmacyHelper;

    private function blockedDepartments(): array
    {
        return OpdConfigItem::where('category', 'dept_routing')
            ->where('is_active', false)
            ->pluck('name')
            ->toArray();
    }

    public function stats()
    {
        $blocked = $this->blockedDepartments();
        $today = Carbon::today();
        $base = fn() => $blocked
            ? MedicationOrder::whereNotIn('department', $blocked)
            : MedicationOrder::query();

        $pending        = $base()->where('status', 'Pending')->count();
        $inProgress     = $base()->whereIn('status', ['Verified', 'Dispensing'])->count();
        $ready          = $base()->where('status', 'Ready')->count();
        $completedToday = $base()->where('status', 'Completed')
            ->whereDate('updated_at', $today)->count();

        return response()->json([
            'pending' => $pending,
            'inProgress' => $inProgress,
            'ready' => $ready,
            'completedToday' => $completedToday,
        ]);
    }

    public function index(Request $request)
    {
        $query = MedicationOrder::query();

        $blocked = $this->blockedDepartments();
        if (!empty($blocked)) {
            $query->whereNotIn('department', $blocked);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('paymentStatus')) {
            $query->where('payment_status', $request->paymentStatus);
        }
        if ($request->filled('dateRange')) {
            $range = $request->dateRange;
            if ($range === 'today') {
                $query->whereDate('order_time', Carbon::today());
            } elseif ($range === 'yesterday') {
                $query->whereDate('order_time', Carbon::yesterday());
            } elseif ($range === 'week') {
                $query->where('order_time', '>=', Carbon::now()->subDays(7));
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

        $orders = $query->orderByRaw("
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
            $tatExceeded = $minutesAgo > $order->tat_minutes && !in_array($order->status, ['Completed', 'Cancelled']);

            $ageLabel = '';
            if ($minutesAgo < 60) {
                $ageLabel = $minutesAgo . ' mins ago';
            } elseif ($minutesAgo < 1440) {
                $ageLabel = floor($minutesAgo / 60) . ' hrs ago';
            } else {
                $ageLabel = floor($minutesAgo / 1440) . ' days ago';
            }

            return [
                'orderId' => $order->order_id,
                'orderTime' => $order->order_time,
                'ageLabel' => $ageLabel,
                'patientName' => $order->patient_name,
                'mrn' => $order->mrn,
                'visitNumber' => $order->visit_number,
                'department' => $order->department,
                'ward' => $order->ward,
                'priority' => $order->priority,
                'itemsCount' => $order->items_count,
                'orderValue' => round($order->order_value, 2),
                'orderedBy' => $order->ordered_by,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
                'tatRemaining' => $tatRemaining,
                'tatExceeded' => $tatExceeded,
                'isPending30' => $minutesAgo > 30 && $order->status === 'Pending',
            ];
        });

        return response()->json($result);
    }

    public function show($orderId)
    {
        $order = MedicationOrder::where('order_id', $orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $enrichedItems = collect($order->items)
            ->map(fn($item) => $this->enrichItemWithLiveData($item))
            ->values();

        $allergyAlerts = [];
        $drugInteractions = [];
        $duplicateTherapy = [];
        $doseChecks = [];

        $allergies = $order->allergies ?? [];
        foreach ($enrichedItems as $item) {
            foreach ($allergies as $allergy) {
                if (stripos($item['name'] ?? '', $allergy) !== false ||
                    stripos($item['generic'] ?? '', $allergy) !== false) {
                    $allergyAlerts[] = [
                        'medicine' => $item['name'] ?? '',
                        'allergy' => $allergy,
                        'severity' => 'High',
                        'message' => "Patient is allergic to {$allergy} group",
                    ];
                }
            }
        }

        $checks = [
            'allergyCheck' => count($allergyAlerts) === 0,
            'allergyAlerts' => $allergyAlerts,
            'drugInteractions' => $order->clinical_checks['drugInteractions'] ?? [],
            'duplicateTherapy' => $order->clinical_checks['duplicateTherapy'] ?? [],
            'doseChecks' => $order->clinical_checks['doseChecks'] ?? [],
            'substitutions' => $order->clinical_checks['substitutions'] ?? [],
        ];

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
            'currentMedications' => $order->current_medications,
            'labValues' => $order->lab_values,
            'department' => $order->department,
            'ward' => $order->ward,
            'bed' => $order->bed,
            'priority' => $order->priority,
            'items' => $enrichedItems,
            'itemsCount' => $order->items_count,
            'orderValue' => round($enrichedItems->sum('total'), 2),
            'orderedBy' => $order->ordered_by,
            'status' => $order->status,
            'paymentStatus' => $order->payment_status,
            'patientPayable' => round($enrichedItems->sum('total'), 2),
            'tatMinutes' => $order->tat_minutes,
            'clinicalChecks' => $checks,
            'notes' => $order->notes,
            'dispensedBy' => $order->dispensed_by,
            'dispensedAt' => $order->dispensed_at,
            'verifiedAt' => $order->verified_at,
            'verifiedBy' => $order->verified_by,
        ]);
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'status' => 'required|string|in:Pending,Verified,Dispensing,Ready,Completed,On Hold,Cancelled',
        ]);

        $order = MedicationOrder::where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $updates = ['status' => $request->status];

        if ($request->status === 'Verified') {
            $updates['verified_at'] = Carbon::now();
            $updates['verified_by'] = $request->input('verifiedBy', 'Admin Pharmacist');
            $enriched = $this->enrichItemsAndCalcTotal($order->items ?? []);
            $updates['items']          = $enriched['items'];
            $updates['order_value']    = $enriched['total'];
            $updates['patient_payable'] = $enriched['total'];
        }
        if ($request->status === 'Dispensing') {
            $updates['dispensed_by'] = $request->input('dispensedBy', 'Admin Pharmacist');
        }
        if ($request->status === 'Completed' || $request->status === 'Ready') {
            $updates['dispensed_at'] = Carbon::now();
        }

        $order->update($updates);

        if ($order->mrn) {
            $this->logActivity($order->mrn, "Order {$request->status}", 'Pharmacy',
                "Order {$order->order_id} status changed to {$request->status}");
        }

        return response()->json(['success' => true, 'orderId' => $order->order_id, 'status' => $request->status]);
    }

    public function verifyOrder(Request $request)
    {
        $request->validate(['orderId' => 'required|string']);

        $order = MedicationOrder::where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $enriched = $this->enrichItemsAndCalcTotal($order->items ?? []);
        $order->update([
            'status'          => 'Verified',
            'verified_at'     => Carbon::now(),
            'verified_by'     => $request->input('verifiedBy', 'Admin Pharmacist'),
            'items'           => $enriched['items'],
            'order_value'     => $enriched['total'],
            'patient_payable' => $enriched['total'],
        ]);

        return response()->json(['success' => true, 'orderId' => $order->order_id]);
    }

    public function startDispensing(Request $request)
    {
        $request->validate(['orderId' => 'required|string']);

        $order = MedicationOrder::where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $order->update([
            'status' => 'Dispensing',
            'dispensed_by' => $request->input('dispensedBy', 'Admin Pharmacist'),
        ]);

        return response()->json(['success' => true, 'orderId' => $order->order_id]);
    }

    public function holdOrder(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $order = MedicationOrder::where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $order->update([
            'status' => 'On Hold',
            'notes' => $request->reason ?? $order->notes,
        ]);

        return response()->json(['success' => true, 'orderId' => $order->order_id]);
    }

    public function updateItems(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'items'   => 'required|array',
        ]);

        $order = MedicationOrder::where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);
        if ($order->status !== 'Pending') return response()->json(['error' => 'Order is not Pending'], 422);

        /* strip client-only flags before persisting */
        $items = array_map(function ($item) {
            unset($item['_removed'], $item['_isAlt']);
            return $item;
        }, $request->items);

        $total = round(collect($items)->sum('total'), 2);

        $order->update([
            'items'           => $items,
            'items_count'     => count($items),
            'order_value'     => $total,
            'patient_payable' => $total,
        ]);

        return response()->json(['success' => true]);
    }

    public function removeItem(Request $request)
    {
        $request->validate([
            'orderId' => 'required|string',
            'itemIndex' => 'required|integer',
        ]);

        $order = MedicationOrder::where('order_id', $request->orderId)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);

        $items = $order->items;
        if (isset($items[$request->itemIndex])) {
            array_splice($items, $request->itemIndex, 1);
            $total = collect($items)->sum('total');
            $order->update([
                'items' => $items,
                'items_count' => count($items),
                'order_value' => round($total, 2),
                'patient_payable' => round($total, 2),
            ]);
        }

        return response()->json(['success' => true]);
    }

}
