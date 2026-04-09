<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OpdBill;
use App\Models\EmergencyBill;
use App\Models\IpdBill;
use App\Models\OtBill;
use App\Models\OpdVisit;
use App\Models\EmergencyVisit;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    use HmsHelpers;

    private function findBill(string $billId, string $type)
    {
        return match ($type) {
            'OPD' => OpdBill::where('bill_id', $billId)->first(),
            'ER' => EmergencyBill::where('bill_id', $billId)->first(),
            'IPD' => IpdBill::where('bill_id', $billId)->first(),
            'OT' => OtBill::where('bill_id', $billId)->first(),
            default => null,
        };
    }

    private function updateVisitPaymentStatus(string $type, $bill, string $status)
    {
        if ($type === 'OPD') {
            OpdVisit::where('visit_id', $bill->visit_id)->update(['payment_status' => $status]);
        } elseif ($type === 'ER') {
            EmergencyVisit::where('visit_id', $bill->visit_id)->update(['payment_status' => $status]);
        }
    }

    public function markAsPaid(Request $request)
    {
        try {
            $request->validate([
                'billId' => 'required|string',
                'type' => 'required|string|in:OPD,ER,IPD,OT',
            ]);

            $bill = $this->findBill($request->input('billId'), $request->input('type'));
            if (!$bill) {
                return response()->json(['error' => 'Bill not found'], 404);
            }

            $bill->update(['payment_status' => 'Paid']);
            $this->updateVisitPaymentStatus($request->input('type'), $bill, 'Paid');

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => $request->input('type'),
                'mrn' => $bill->mrn,
                'reference_id' => $bill->bill_id,
                'category' => 'Payment Received',
                'debit' => 0,
                'credit' => $bill->total_amount,
            ]);

            $this->logActivity($bill->mrn, "Payment Received: {$bill->total_amount}", $request->input('type'));

            return response()->json($this->toCamel($bill->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function refund(Request $request)
    {
        try {
            $request->validate([
                'billId' => 'required|string',
                'type' => 'required|string|in:OPD,ER,IPD,OT',
            ]);

            $bill = $this->findBill($request->input('billId'), $request->input('type'));
            if (!$bill) {
                return response()->json(['error' => 'Bill not found'], 404);
            }

            $bill->update(['payment_status' => 'Refunded']);
            $this->updateVisitPaymentStatus($request->input('type'), $bill, 'Refunded');

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => 'Refund',
                'mrn' => $bill->mrn,
                'reference_id' => $bill->bill_id,
                'category' => 'Bill Refunded',
                'debit' => 0,
                'credit' => -$bill->total_amount,
            ]);

            $this->logActivity($bill->mrn, "Bill Refunded: {$bill->total_amount}", $request->input('type'));

            return response()->json($this->toCamel($bill->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'An unexpected error occurred');
        }
    }

    public function correct(Request $request)
    {
        try {
            $request->validate([
                'billId' => 'required|string',
                'type' => 'required|string|in:OPD,ER,IPD,OT',
            ]);

            $type = $request->input('type');
            $bill = $this->findBill($request->input('billId'), $type);
            if (!$bill) {
                return response()->json(['error' => 'Bill not found'], 404);
            }

            $oldAmount = $bill->total_amount;
            $history = $bill->history ?? [];
            $reason = $request->input('reason', 'Bill Correction');

            if ($type === 'OPD' || $type === 'ER') {
                $newCharges = $request->input('newConsultationCharges', $bill->consultation_charges);
                $newFee = $request->input('newDoctorFee', $bill->doctor_fee);
                $history[] = [
                    'date' => Carbon::now()->toISOString(),
                    'consultationCharges' => $bill->consultation_charges,
                    'doctorFee' => $bill->doctor_fee,
                    'totalAmount' => $oldAmount,
                    'reason' => $reason,
                ];
                $bill->update([
                    'consultation_charges' => $newCharges,
                    'doctor_fee' => $newFee,
                    'total_amount' => $newCharges + $newFee,
                    'payment_status' => 'Corrected',
                    'history' => $history,
                ]);
            } elseif ($type === 'IPD') {
                $newCharges = $request->input('newRoomCharges', $bill->room_charges);
                $newFee = $request->input('newDoctorFee', $bill->doctor_fee);
                $history[] = [
                    'date' => Carbon::now()->toISOString(),
                    'consultationCharges' => $bill->room_charges,
                    'doctorFee' => $bill->doctor_fee,
                    'totalAmount' => $oldAmount,
                    'reason' => $reason,
                ];
                $bill->update([
                    'room_charges' => $newCharges,
                    'doctor_fee' => $newFee,
                    'total_amount' => $newCharges + $newFee,
                    'payment_status' => 'Corrected',
                    'history' => $history,
                ]);
            } elseif ($type === 'OT') {
                $newCharges = $request->input('newTheaterCharges', $bill->theater_charges);
                $newFee = $request->input('newSurgeonFee', $bill->surgeon_fee);
                $anaesthetistFee = $bill->anaesthetist_fee ?? 0;
                $history[] = [
                    'date' => Carbon::now()->toISOString(),
                    'consultationCharges' => $bill->theater_charges,
                    'doctorFee' => $bill->surgeon_fee,
                    'totalAmount' => $oldAmount,
                    'reason' => $reason,
                ];
                $bill->update([
                    'theater_charges' => $newCharges,
                    'surgeon_fee' => $newFee,
                    'total_amount' => $newCharges + $newFee + $anaesthetistFee,
                    'payment_status' => 'Corrected',
                    'history' => $history,
                ]);
            }

            $this->updateVisitPaymentStatus($type, $bill, 'Corrected');

            $bill->refresh();

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => $type,
                'mrn' => $bill->mrn,
                'reference_id' => $bill->bill_id,
                'category' => 'Bill Correction',
                'debit' => $bill->total_amount - $oldAmount,
                'credit' => 0,
            ]);

            $this->logActivity($bill->mrn, "Bill Corrected. New Total: {$bill->total_amount}", $type);

            return response()->json($this->toCamel($bill));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }
}
