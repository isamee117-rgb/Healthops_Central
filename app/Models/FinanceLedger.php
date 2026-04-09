<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanceLedger extends Model
{
    protected $table = 'finance_ledger';

    protected $fillable = [
        'ledger_id',
        'date',
        'source',
        'mrn',
        'visit_id',
        'category',
        'debit',
        'credit',
        'reference_id',
        'posted_at',
    ];

    protected $casts = [
        'date' => 'date',
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
        'posted_at' => 'datetime',
    ];
}
