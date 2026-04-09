<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashReconciliation extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'reconciliation_date' => 'date',
        'denominations' => 'array',
        'opening_balance' => 'decimal:2',
        'cash_sales' => 'decimal:2',
        'payments_received' => 'decimal:2',
        'returns_refunds' => 'decimal:2',
        'expected_closing' => 'decimal:2',
        'actual_cash' => 'decimal:2',
        'variance' => 'decimal:2',
        'bank_deposit_amount' => 'decimal:2',
        'remaining_float' => 'decimal:2',
    ];
}
