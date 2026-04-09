<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\PharmacyHelper;
use App\Traits\HmsHelpers;
use Illuminate\Http\Request;
use App\Models\MedicationOrder;
use App\Models\DispensingRecord;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\PharmacyTransaction;
use Carbon\Carbon;

class DispensingController extends Controller
{
    use PharmacyHelper, HmsHelpers;
    public function stats()
    {
        $verified = MedicationOrder::where('status', 'Verified')->count();
        $dispensing = MedicationOrder::where('status', 'Dispensing')->count();
        $ready = MedicationOrder::where('status', 'Ready')->count();
        $completedToday = MedicationOrder::where('status', 'Completed')
            ->whereDate('dispensed_at', Carbon::today())
            ->count();

        return response()->json([
            'awaitingDispensing' => $verified,
            'inProgress' => $dispensing,
            'readyForPickup' => $ready,
            'completedToday' => $completedToday,
        ]);
    }

    public function queue(Request $request)
    {
        $query = MedicationOrder::whereIn('status', ['Verified', 'Dispensing', 'Ready']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
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
            CASE status
                WHEN 'Verified' THEN 1
                WHEN 'Dispensing' THEN 2
                WHEN 'Ready' THEN 3
                ELSE 4
            END,
            order_time DESC
        ")->limit(100)->get();

        $result = $orders->map(function ($order) {
            $minutesAgo = (int) Carbon::parse($order->order_time)->diffInMinutes(Carbon::now());
            $tatRemaining = max(0, $order->tat_minutes - $minutesAgo);
            $tatExceeded = $minutesAgo > $order->tat_minutes && !in_array($order->status, ['Completed', 'Cancelled']);

            $dispensingRecord = DispensingRecord::where('order_id', $order->order_id)->first();
            $itemsDispensed = 0;
            if ($dispensingRecord) {
                $itemsDispensed = $dispensingRecord->items_dispensed;
            }

            return [
                'orderId' => $order->order_id,
                'orderTime' => $order->order_time,
                'ageLabel' => $this->getAgeLabel($minutesAgo),
                'patientName' => $order->patient_name,
                'mrn' => $order->mrn,
                'visitNumber' => $order->visit_number,
                'department' => $order->department,
                'ward' => $order->ward,
                'bed' => $order->bed,
                'priority' => $order->priority,
                'itemsCount' => $order->items_count,
                'itemsDispensed' => $itemsDispensed,
                'orderValue' => $order->order_value,
                'orderedBy' => $order->ordered_by,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
                'tatRemaining' => $tatRemaining,
                'tatExceeded' => $tatExceeded,
                'verifiedAt' => $order->verified_at,
                'verifiedBy' => $order->verified_by,
            ];
        });

        return response()->json($result);
    }

    private function getAgeLabel($minutesAgo)
    {
        if ($minutesAgo < 60) {
            return $minutesAgo . ' mins ago';
        } elseif ($minutesAgo < 1440) {
            return floor($minutesAgo / 60) . ' hrs ago';
        }
        return floor($minutesAgo / 1440) . ' days ago';
    }

    public function workstation($orderId)
    {
        $order = MedicationOrder::where('order_id', $orderId)->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $dispensingRecord = DispensingRecord::where('order_id', $orderId)->first();

        $items = $order->items ?? [];
        $itemsDispensing = [];

        if ($dispensingRecord) {
            $itemsDispensing = $dispensingRecord->items_dispensing ?? [];
        } else {
            foreach ($items as $idx => $item) {
                $enriched = $this->enrichItemWithLiveData($item);

                $batchNumber    = $enriched['batch']['batchNumber'] ?? '';
                $expiryDate     = $enriched['batch']['expiryDate']  ?? '';
                $stockAvailable = $enriched['stockAvailable'] ?? 0;

                $itemsDispensing[] = [
                    'index'             => $idx,
                    'name'              => $item['name'] ?? '',
                    'generic'           => $item['generic'] ?? '',
                    'form'              => $item['form'] ?? '',
                    'dose'              => $item['dose'] ?? '',
                    'frequency'         => $item['frequency'] ?? '',
                    'duration'          => $item['duration'] ?? '',
                    'totalQty'          => $item['totalQty'] ?? 0,
                    'unitPrice'         => $enriched['unitPrice'],
                    'total'             => $enriched['total'],
                    'medicineId'        => $enriched['medicineId'] ?? null,
                    'batchNumber'       => $batchNumber,
                    'expiryDate'        => $expiryDate,
                    'location'          => $this->getStorageLocation($enriched),
                    'stockAvailable'    => $stockAvailable,
                    'quantityDispensed' => 0,
                    'labelPrinted'      => false,
                    'markedDispensed'   => false,
                    'barcodeScanned'    => false,
                    'counseling' => [
                        'nameExplained'       => false,
                        'purposeExplained'    => false,
                        'dosageInstructions'  => false,
                        'durationExplained'   => false,
                        'sideEffectsDiscussed'=> false,
                        'foodInstructions'    => false,
                        'missedDoseAdvice'    => false,
                        'followUpAdvised'     => false,
                        'warningSigns'        => false,
                        'patientUnderstood'   => false,
                    ],
                ];
            }
        }

        $counselingChecklist = $dispensingRecord->counseling_checklist ?? null;
        $counselingNotes = $dispensingRecord->counseling_notes ?? '';
        $counseledBy = $dispensingRecord->counseled_by ?? 'Pharmacist Ahmed';
        $patientSignature = $dispensingRecord->patient_signature ?? false;

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
            'department' => $order->department,
            'ward' => $order->ward,
            'bed' => $order->bed,
            'priority' => $order->priority,
            'status' => $order->status,
            'orderedBy' => $order->ordered_by,
            'orderValue' => collect($itemsDispensing)->sum('total'),
            'paymentStatus' => $order->payment_status,
            'itemsDispensing' => $itemsDispensing,
            'counselingNotes' => $counselingNotes,
            'counseledBy' => $counseledBy,
            'patientSignature' => $patientSignature,
            'dispensingId' => $dispensingRecord->dispensing_id ?? null,
            'totalItems' => count($items),
            'itemsDispensedCount' => collect($itemsDispensing)->where('markedDispensed', true)->count(),
            'allLabels' => collect($itemsDispensing)->every('labelPrinted', true),
            'counselingDone' => $dispensingRecord->counseling_done ?? false,
        ]);
    }

    private function getStorageLocation(array $enriched): string
    {
        return $enriched['storageLocation'] ?? 'Pharmacy Store';
    }

    public function saveProgress(Request $request)
    {
        $validated = $request->validate([
            'orderId' => 'required|string',
            'itemsDispensing' => 'required|array',
            'counselingNotes' => 'nullable|string',
            'patientSignature' => 'nullable|boolean',
        ]);

        $order = MedicationOrder::where('order_id', $validated['orderId'])->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $itemsDispensing = $validated['itemsDispensing'];
        $totalItems      = count($itemsDispensing);
        $dispensedCount  = collect($itemsDispensing)->where('markedDispensed', true)->count();
        $allDispensed    = $totalItems > 0 && $dispensedCount === $totalItems;
        $anyDispensed    = $dispensedCount > 0;
        $allLabels       = collect($itemsDispensing)->every(fn($i) => $i['labelPrinted'] ?? false);

        $allCounselingDone = collect($itemsDispensing)->every(function ($item) {
            $c = $item['counseling'] ?? [];
            return ($c['nameExplained'] ?? false) && ($c['purposeExplained'] ?? false) &&
                   ($c['dosageInstructions'] ?? false) && ($c['durationExplained'] ?? false) &&
                   ($c['sideEffectsDiscussed'] ?? false) && ($c['patientUnderstood'] ?? false);
        });

        // Auto-transition order status based on dispensed item count
        $currentStatus = $order->status;
        $newStatus     = $currentStatus;
        $orderUpdates  = [];

        if ($allDispensed) {
            $newStatus = 'Ready';
            $orderUpdates = [
                'status'        => $newStatus,
                'dispensed_by'  => 'Pharmacist Ahmed',
                'dispensed_at'  => Carbon::now(),
            ];
        } elseif ($anyDispensed && in_array($currentStatus, ['Verified', 'Pending'])) {
            $newStatus = 'Dispensing';
            $orderUpdates = [
                'status'       => $newStatus,
                'dispensed_by' => 'Pharmacist Ahmed',
            ];
        }

        if (!empty($orderUpdates)) {
            $order->update($orderUpdates);
            if ($newStatus === 'Ready' && $currentStatus !== 'Ready') {
                $order->refresh();
                $this->billCompletedOrder($order);
            }
        }

        $record = DispensingRecord::updateOrCreate(
            ['order_id' => $validated['orderId']],
            [
                'dispensing_id'  => 'DSP-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'patient_name'   => $order->patient_name,
                'mrn'            => $order->mrn,
                'visit_number'   => $order->visit_number,
                'department'     => $order->department,
                'ward'           => $order->ward,
                'bed'            => $order->bed,
                'priority'       => $order->priority,
                'items_dispensing'    => $itemsDispensing,
                'counseling_notes'    => $validated['counselingNotes'] ?? '',
                'patient_signature'   => $validated['patientSignature'] ?? false,
                'counseled_by'        => 'Pharmacist Ahmed',
                'dispensed_by'        => 'Pharmacist Ahmed',
                'dispensed_at'        => $allDispensed ? Carbon::now() : null,
                'status'              => $allDispensed ? 'Completed' : 'In Progress',
                'total_value'         => $order->order_value,
                'total_items'         => $totalItems,
                'items_dispensed'     => $dispensedCount,
                'all_labels_printed'  => $allLabels,
                'counseling_done'     => $allCounselingDone,
                'stock_updated'       => $allDispensed,
            ]
        );

        return response()->json([
            'success'        => true,
            'message'        => $allDispensed ? 'All items dispensed — order moved to Ready for Pickup' : 'Progress saved',
            'dispensingId'   => $record->dispensing_id,
            'itemsDispensed' => $dispensedCount,
            'totalItems'     => $totalItems,
            'newStatus'      => $newStatus,
            'statusChanged'  => $newStatus !== $currentStatus,
        ]);
    }

    public function completeDispensing(Request $request)
    {
        $validated = $request->validate([
            'orderId' => 'required|string',
            'itemsDispensing' => 'required|array',
            'counselingNotes' => 'nullable|string',
            'patientSignature' => 'nullable|boolean',
        ]);

        $order = MedicationOrder::where('order_id', $validated['orderId'])->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $itemsDispensing = $validated['itemsDispensing'];
        $allDispensed = collect($itemsDispensing)->every(fn($i) => $i['markedDispensed'] ?? false);
        $allLabels = collect($itemsDispensing)->every(fn($i) => $i['labelPrinted'] ?? false);

        if (!$allDispensed) {
            return response()->json(['error' => 'All items must be dispensed before completing'], 422);
        }

        $finalStatus = in_array($order->department, ['IPD', 'OT']) ? 'Completed' : 'Ready';

        $order->update([
            'status' => $finalStatus,
            'dispensed_by' => 'Pharmacist Ahmed',
            'dispensed_at' => Carbon::now(),
        ]);

        $order->refresh();
        $this->billCompletedOrder($order);

        $record = DispensingRecord::updateOrCreate(
            ['order_id' => $validated['orderId']],
            [
                'dispensing_id' => 'DSP-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'patient_name' => $order->patient_name,
                'mrn' => $order->mrn,
                'visit_number' => $order->visit_number,
                'department' => $order->department,
                'ward' => $order->ward,
                'bed' => $order->bed,
                'priority' => $order->priority,
                'items_dispensing' => $itemsDispensing,
                'counseling_notes' => $validated['counselingNotes'] ?? '',
                'patient_signature' => $validated['patientSignature'] ?? false,
                'counseled_by' => 'Pharmacist Ahmed',
                'dispensed_by' => 'Pharmacist Ahmed',
                'dispensed_at' => Carbon::now(),
                'status' => 'Completed',
                'total_value' => $order->order_value,
                'total_items' => count($itemsDispensing),
                'items_dispensed' => count($itemsDispensing),
                'all_labels_printed' => $allLabels,
                'counseling_done' => true,
                'stock_updated' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $finalStatus === 'Completed'
                ? 'Dispensing completed. Medicines delivered to ward.'
                : 'Dispensing completed. Ready for patient pickup.',
            'finalStatus' => $finalStatus,
            'dispensingId' => $record->dispensing_id,
            'department' => $order->department,
        ]);
    }

    public function printLabel(Request $request)
    {
        $validated = $request->validate([
            'orderId' => 'required|string',
            'itemIndex' => 'required|integer',
        ]);

        $order = MedicationOrder::where('order_id', $validated['orderId'])->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $items = $order->items ?? [];
        $idx = $validated['itemIndex'];
        if (!isset($items[$idx])) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        $item = $items[$idx];

        return response()->json([
            'success' => true,
            'label' => [
                'hospitalName' => 'CITY HOSPITAL PHARMACY',
                'patientName' => $order->patient_name,
                'mrn' => $order->mrn,
                'ward' => $order->ward,
                'bed' => $order->bed,
                'medicineName' => strtoupper($item['name'] ?? ''),
                'generic' => $item['generic'] ?? '',
                'dose' => $item['dose'] ?? '',
                'frequency' => $item['frequency'] ?? '',
                'duration' => $item['duration'] ?? '',
                'instructions' => $this->getInstructions($item['name'] ?? ''),
                'barcode' => $order->order_id . '-' . ($idx + 1),
                'dispensedDate' => Carbon::now()->format('d-M-Y'),
                'dispensedBy' => 'Pharmacist Ahmed',
            ],
        ]);
    }

    private function getInstructions($medicineName)
    {
        $name = strtolower($medicineName);
        if (str_contains($name, 'augmentin') || str_contains($name, 'amoxicillin')) {
            return "Take with food\nComplete full course";
        }
        if (str_contains($name, 'risek') || str_contains($name, 'omeprazole')) {
            return "Take before meals\nDo not crush or chew";
        }
        if (str_contains($name, 'panadol') || str_contains($name, 'paracetamol')) {
            return "Take with water\nDo not exceed recommended dose";
        }
        if (str_contains($name, 'insulin') || str_contains($name, 'novorapid')) {
            return "Store in refrigerator\nInject subcutaneously";
        }
        if (str_contains($name, 'losartan') || str_contains($name, 'amlodipine')) {
            return "Take at same time daily\nMonitor blood pressure";
        }
        return "Follow prescriber instructions\nStore in cool, dry place";
    }

    public function cancelDispensing(Request $request)
    {
        $validated = $request->validate([
            'orderId' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $order = MedicationOrder::where('order_id', $validated['orderId'])->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->update(['status' => 'Verified', 'dispensed_by' => null]);

        DispensingRecord::where('order_id', $validated['orderId'])->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dispensing cancelled. Order returned to queue.',
        ]);
    }

    private function billCompletedOrder(MedicationOrder $order): void
    {
        // Prevent duplicate billing transactions for the same order
        if (PharmacyTransaction::where('order_id', $order->order_id)->exists()) {
            return;
        }

        $rawItems = is_array($order->items) ? $order->items : json_decode($order->items, true) ?? [];
        $billingItems = array_map(function ($i) {
            return [
                'medicineId' => $i['medicineId'] ?? '',
                'name'       => $i['name'] ?? '-',
                'qty'        => $i['totalQty'] ?? $i['quantity'] ?? 0,
                'unitPrice'  => round($i['unitPrice'] ?? 0, 2),
                'total'      => round($i['total'] ?? 0, 2),
            ];
        }, $rawItems);

        $total = round($order->order_value ?? 0, 2);

        $dept = in_array($order->department, ['ER', 'Emergency']) ? 'ER' : ($order->department ?? 'Walk-in');

        $txnId = $this->generateYearId(PharmacyTransaction::class, 'transaction_id', 'TXN');

        PharmacyTransaction::create([
            'transaction_id'        => $txnId,
            'transaction_date'      => Carbon::now(),
            'patient_name'          => $order->patient_name ?? 'Unknown',
            'mrn'                   => $order->mrn,
            'department'            => $dept,
            'order_id'              => $order->order_id,
            'subtotal'              => $total,
            'discount'              => 0,
            'tax'                   => 0,
            'total_amount'          => $total,
            'payment_mode'          => $dept === 'IPD' ? 'IPD Account' : ($dept === 'ER' ? 'ER Account' : 'Credit'),
            'payment_status'        => 'Pending',
            'billed_to'             => $dept,
            'charge_posted'         => true,
            'reconciliation_status' => 'Pending',
            'receipt_number'        => str_replace('TXN', 'RCP', $txnId),
            'billing_reference'     => $order->visit_number ?? $order->order_id,
            'ordered_by'            => $order->ordered_by ?? null,
            'received_by'           => $order->dispensed_by ?? 'Pharmacist',
            'items'                 => $billingItems,
        ]);
    }
}
