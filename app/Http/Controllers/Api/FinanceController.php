<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancePosting;
use App\Models\FinanceTransaction;
use App\Models\FinanceLedger;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    use HmsHelpers;

    public function postings()
    {
        return response()->json($this->toCamelCollection(FinancePosting::all()));
    }

    public function transactions()
    {
        return response()->json($this->toCamelCollection(FinanceTransaction::all()));
    }

    public function ledger()
    {
        return response()->json($this->toCamelCollection(FinanceLedger::all()));
    }

    public function addPosting(Request $request)
    {
        try {
            $request->validate([
                'mrn' => 'required|string',
                'patientName' => 'required|string',
                'department' => 'required|string',
                'visitId' => 'required|string',
                'items' => 'required|array',
                'totalAmount' => 'required|numeric',
            ]);

            $postingId = $this->nextId(FinancePosting::class, 'posting_id', 'FP-');

            $posting = FinancePosting::create([
                'posting_id' => $postingId,
                'mrn' => $request->input('mrn'),
                'patient_name' => $request->input('patientName'),
                'department' => $request->input('department'),
                'visit_id' => $request->input('visitId'),
                'items' => $request->input('items'),
                'total_amount' => $request->input('totalAmount'),
                'posted_at' => Carbon::now(),
                'posted_by' => $request->input('postedBy', 'Admin / Sys'),
            ]);

            return response()->json($this->toCamel($posting), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function addTransaction(Request $request)
    {
        try {
            $request->validate([
                'type' => 'required|string|in:Income,Expense',
                'head' => 'required|string',
                'amount' => 'required|numeric',
                'date' => 'required|string',
            ]);

            $transactionId = $this->nextId(FinanceTransaction::class, 'transaction_id', 'FT-');

            $transaction = FinanceTransaction::create([
                'transaction_id' => $transactionId,
                'type' => $request->input('type'),
                'head' => $request->input('head'),
                'amount' => $request->input('amount'),
                'date' => $request->input('date'),
                'remarks' => $request->input('remarks'),
                'posted_at' => Carbon::now(),
                'posted_by' => $request->input('postedBy', 'Admin / Sys'),
                'status' => 'POSTED',
            ]);

            $type = $request->input('type');
            $amount = $request->input('amount');

            $this->postToLedger([
                'date' => Carbon::now(),
                'source' => 'General Ledger',
                'category' => $request->input('head'),
                'debit' => $type === 'Income' ? $amount : 0,
                'credit' => $type === 'Expense' ? $amount : 0,
                'reference_id' => $transactionId,
            ]);

            return response()->json($this->toCamel($transaction), 201);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }
}
