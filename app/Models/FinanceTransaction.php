<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanceTransaction extends Model
{
    protected $table = 'finance_transactions';

    protected $fillable = [
        'transaction_id',
        'type',
        'head',
        'head_id',
        'transaction_type',
        'description',
        'amount',
        'payment_mode',
        'reference_number',
        'date',
        'remarks',
        'posted_at',
        'posted_by',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
        'posted_at' => 'datetime',
    ];
}
