<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpdPayment extends Model
{
    protected $table = 'opd_payments';

    protected $fillable = [
        'payment_id',
        'bill_id',
        'visit_id',
        'mrn',
        'amount',
        'payment_mode',
        'receipt_number',
        'reference',
        'charge_ids',
        'received_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'charge_ids' => 'array',
    ];
}
