<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountHead;
use App\Models\FinanceTransaction;
use App\Traits\HmsHelpers;
use Carbon\Carbon;
use Illuminate\Http\Request;

class IncomeExpenseController extends Controller
{
    use HmsHelpers;

    private $headTypeCodes = [
        'Patient Services Revenue' => 'PSR',
        'Non-Patient Services' => 'NPS',
        'Government Grants/Subsidies' => 'GGS',
        'Donations & Gifts' => 'DNG',
        'Investment Income' => 'INV',
        'Other Income' => 'OTI',
        'Medical Supplies & Equipment' => 'MSE',
        'Staff Salaries' => 'SAL',
        'Infrastructure & Maintenance' => 'INF',
        'Utilities (Electricity, Water, Gas)' => 'UTL',
        'Administrative Expenses' => 'ADM',
        'Professional Services' => 'PFS',
        'Marketing & Business Development' => 'MBD',
        'Other Expenses' => 'OTE',
    ];

    public function accountHeads(Request $request)
    {
        $query = AccountHead::query();
        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        return response()->json($this->toCamelCollection($query->orderBy('created_at', 'desc')->get()));
    }

    public function showAccountHead($id)
    {
        $head = AccountHead::where('head_id', $id)->first();
        if (!$head) {
            return response()->json(['error' => 'Account head not found'], 404);
        }
        return response()->json($this->toCamel($head));
    }

    public function createAccountHead(Request $request)
    {
        try {
            $request->validate([
                'category' => 'required|string|in:Income,Expense',
                'headType' => 'required|string',
                'headName' => 'required|string|min:3|max:100',
            ]);

            $duplicate = AccountHead::where('category', $request->input('category'))
                ->whereRaw('LOWER(head_name) = ?', [strtolower($request->input('headName'))])
                ->exists();
            if ($duplicate) {
                return response()->json(['error' => 'An account head with this name already exists in this category.'], 422);
            }

            $headId = $this->nextId(AccountHead::class, 'head_id', 'HEAD-');

            $catCode = $request->input('category') === 'Income' ? 'INC' : 'EXP';
            $typeCode = $this->headTypeCodes[$request->input('headType')] ?? 'GEN';
            $seq = AccountHead::where('category', $request->input('category'))
                ->where('head_type', $request->input('headType'))
                ->count() + 1;
            $headCode = $request->input('headCode') ?: ($catCode . '-' . $typeCode . '-' . str_pad($seq, 3, '0', STR_PAD_LEFT));

            if (AccountHead::where('head_code', $headCode)->exists()) {
                $headCode = $catCode . '-' . $typeCode . '-' . str_pad($seq + 1, 3, '0', STR_PAD_LEFT);
            }

            $head = AccountHead::create([
                'head_id' => $headId,
                'category' => $request->input('category'),
                'head_type' => $request->input('headType'),
                'head_name' => $request->input('headName'),
                'head_code' => $headCode,
                'description' => $request->input('description'),
                'budget_limit' => $request->input('budgetLimit'),
                'gl_account_code' => $request->input('glAccountCode'),
                'status' => $request->input('status', 'Active'),
                'created_by' => 'Admin',
            ]);

            return response()->json($this->toCamel($head), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => collect($e->errors())->flatten()->first()], 422);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function updateAccountHead($id, Request $request)
    {
        try {
            $head = AccountHead::where('head_id', $id)->first();
            if (!$head) {
                return response()->json(['error' => 'Account head not found'], 404);
            }

            $newName = $request->input('headName', $head->head_name);
            $newCat = $request->input('category', $head->category);
            $duplicate = AccountHead::where('category', $newCat)
                ->whereRaw('LOWER(head_name) = ?', [strtolower($newName)])
                ->where('head_id', '!=', $id)
                ->exists();
            if ($duplicate) {
                return response()->json(['error' => 'An account head with this name already exists in this category.'], 422);
            }

            $updateData = [];
            if ($request->has('category')) $updateData['category'] = $request->input('category');
            if ($request->has('headType')) $updateData['head_type'] = $request->input('headType');
            if ($request->has('headName')) $updateData['head_name'] = $request->input('headName');
            if ($request->has('headCode')) $updateData['head_code'] = $request->input('headCode');
            if ($request->has('description')) $updateData['description'] = $request->input('description');
            if ($request->has('budgetLimit')) $updateData['budget_limit'] = $request->input('budgetLimit');
            if ($request->has('glAccountCode')) $updateData['gl_account_code'] = $request->input('glAccountCode');
            if ($request->has('status')) $updateData['status'] = $request->input('status');

            $head->update($updateData);
            return response()->json($this->toCamel($head->fresh()));
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function deleteAccountHead($id)
    {
        try {
            $head = AccountHead::where('head_id', $id)->first();
            if (!$head) {
                return response()->json(['error' => 'Account head not found'], 404);
            }
            $used = FinanceTransaction::where('head_id', $id)->exists();
            if ($used) {
                return response()->json(['error' => 'Cannot delete this account head — it has transactions linked to it. Deactivate it instead.'], 422);
            }
            $head->delete();
            return response()->json(['message' => 'Account head deleted']);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete record');
        }
    }

    public function transactions(Request $request)
    {
        $query = FinanceTransaction::whereNotNull('head_id');
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->has('headId')) {
            $query->where('head_id', $request->input('headId'));
        }
        if ($request->has('startDate') && $request->has('endDate')) {
            $query->whereBetween('date', [$request->input('startDate'), $request->input('endDate')]);
        }
        $transactions = $query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->get();

        $result = $transactions->map(function ($txn) {
            $head = AccountHead::where('head_id', $txn->head_id)->first();
            $data = $this->toCamel($txn);
            if ($head) {
                $data['headName'] = $head->head_name;
                $data['headCode'] = $head->head_code;
                $data['headCategory'] = $head->category;
            }
            return $data;
        });

        return response()->json($result->values()->all());
    }

    public function createTransaction(Request $request)
    {
        try {
            $request->validate([
                'headId' => 'required|string',
                'transactionDate' => 'required|date',
                'transactionType' => 'required|string',
                'description' => 'required|string|min:10',
                'amount' => 'required|numeric|min:1',
                'paymentMode' => 'required|string',
            ]);

            $head = AccountHead::where('head_id', $request->input('headId'))->first();
            if (!$head) {
                return response()->json(['error' => 'Account head not found'], 404);
            }
            if ($head->status !== 'Active') {
                return response()->json(['error' => 'Cannot post to an inactive account head'], 422);
            }

            $txnDate = Carbon::parse($request->input('transactionDate'));
            if ($txnDate->isFuture()) {
                return response()->json(['error' => 'Transaction date cannot be in the future'], 422);
            }

            $transactionId = $this->nextId(FinanceTransaction::class, 'transaction_id', 'FT-');
            $status = $request->input('status', 'Draft');

            $transaction = FinanceTransaction::create([
                'transaction_id' => $transactionId,
                'type' => $head->category,
                'head' => $head->head_name,
                'head_id' => $head->head_id,
                'transaction_type' => $request->input('transactionType'),
                'description' => $request->input('description'),
                'amount' => $request->input('amount'),
                'payment_mode' => $request->input('paymentMode'),
                'reference_number' => $request->input('referenceNumber'),
                'date' => $txnDate,
                'remarks' => $request->input('remarks'),
                'posted_at' => $status === 'Posted' ? Carbon::now() : null,
                'posted_by' => 'Admin',
                'status' => $status,
            ]);

            if ($status === 'Posted') {
                $amount = $request->input('amount');
                $this->postToLedger([
                    'date' => $txnDate,
                    'source' => 'Income & Expense',
                    'category' => $head->head_name,
                    'debit' => $head->category === 'Expense' ? $amount : 0,
                    'credit' => $head->category === 'Income' ? $amount : 0,
                    'reference_id' => $transactionId,
                ]);
            }

            $data = $this->toCamel($transaction);
            $data['headName'] = $head->head_name;
            $data['headCode'] = $head->head_code;
            $data['headCategory'] = $head->category;

            return response()->json($data, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => collect($e->errors())->flatten()->first()], 422);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to create record');
        }
    }

    public function updateTransaction($id, Request $request)
    {
        try {
            $txn = FinanceTransaction::where('transaction_id', $id)->first();
            if (!$txn) {
                return response()->json(['error' => 'Transaction not found'], 404);
            }
            if ($txn->status === 'Posted') {
                return response()->json(['error' => 'Cannot edit a posted transaction'], 422);
            }

            $updateData = [];
            if ($request->has('headId')) {
                $head = AccountHead::where('head_id', $request->input('headId'))->first();
                if ($head) {
                    $updateData['head_id'] = $head->head_id;
                    $updateData['head'] = $head->head_name;
                    $updateData['type'] = $head->category;
                }
            }
            if ($request->has('transactionDate')) $updateData['date'] = $request->input('transactionDate');
            if ($request->has('transactionType')) $updateData['transaction_type'] = $request->input('transactionType');
            if ($request->has('description')) $updateData['description'] = $request->input('description');
            if ($request->has('amount')) $updateData['amount'] = $request->input('amount');
            if ($request->has('paymentMode')) $updateData['payment_mode'] = $request->input('paymentMode');
            if ($request->has('referenceNumber')) $updateData['reference_number'] = $request->input('referenceNumber');
            if ($request->has('remarks')) $updateData['remarks'] = $request->input('remarks');

            $txn->update($updateData);
            $fresh = $txn->fresh();
            $data = $this->toCamel($fresh);
            $head = AccountHead::where('head_id', $fresh->head_id)->first();
            if ($head) {
                $data['headName'] = $head->head_name;
                $data['headCode'] = $head->head_code;
                $data['headCategory'] = $head->category;
            }
            return response()->json($data);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to update record');
        }
    }

    public function postTransaction($id)
    {
        try {
            $txn = FinanceTransaction::where('transaction_id', $id)->first();
            if (!$txn) {
                return response()->json(['error' => 'Transaction not found'], 404);
            }
            if ($txn->status === 'Posted') {
                return response()->json(['error' => 'Transaction is already posted'], 422);
            }

            $txn->update([
                'status' => 'Posted',
                'posted_at' => Carbon::now(),
            ]);

            $head = AccountHead::where('head_id', $txn->head_id)->first();
            if ($head) {
                $this->postToLedger([
                    'date' => $txn->date,
                    'source' => 'Income & Expense',
                    'category' => $head->head_name,
                    'debit' => $head->category === 'Expense' ? $txn->amount : 0,
                    'credit' => $head->category === 'Income' ? $txn->amount : 0,
                    'reference_id' => $txn->transaction_id,
                ]);
            }

            return response()->json(['message' => 'Transaction posted successfully']);
        } catch (\Exception $e) {
            return $this->safeError($e, 'An unexpected error occurred');
        }
    }

    public function deleteTransaction($id)
    {
        try {
            $txn = FinanceTransaction::where('transaction_id', $id)->first();
            if (!$txn) {
                return response()->json(['error' => 'Transaction not found'], 404);
            }
            if ($txn->status === 'Posted') {
                return response()->json(['error' => 'Cannot delete a posted transaction'], 422);
            }
            $txn->delete();
            return response()->json(['message' => 'Transaction deleted']);
        } catch (\Exception $e) {
            return $this->safeError($e, 'Failed to delete record');
        }
    }

    public function summary()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();

        $monthlyTxns = FinanceTransaction::whereNotNull('head_id')
            ->where('status', 'Posted')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        $totalIncome = 0;
        $totalExpense = 0;

        foreach ($monthlyTxns as $txn) {
            $head = AccountHead::where('head_id', $txn->head_id)->first();
            if (!$head) continue;
            if ($head->category === 'Income') $totalIncome += $txn->amount;
            else $totalExpense += $txn->amount;
        }

        $totalBudget = AccountHead::where('category', 'Expense')
            ->where('status', 'Active')
            ->whereNotNull('budget_limit')
            ->sum('budget_limit');

        return response()->json([
            'totalIncome' => round($totalIncome, 2),
            'totalExpense' => round($totalExpense, 2),
            'netProfitLoss' => round($totalIncome - $totalExpense, 2),
            'totalBudget' => round($totalBudget, 2),
            'budgetUsed' => round($totalExpense, 2),
            'month' => $now->format('F Y'),
        ]);
    }
}
