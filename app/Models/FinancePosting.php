<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancePosting extends Model
{
    protected $table = 'finance_postings';

    protected $fillable = [
        'posting_id',
        'mrn',
        'patient_name',
        'department',
        'visit_id',
        'items',
        'total_amount',
        'posted_at',
        'posted_by',
    ];

    protected $casts = [
        'items' => 'array',
        'total_amount' => 'decimal:2',
        'posted_at' => 'datetime',
    ];
}
