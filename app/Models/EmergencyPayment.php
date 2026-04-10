<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyPayment extends Model
{
    protected $table = 'emergency_payments';

    protected $fillable = [
        'payment_id',
        'bill_id',
        'visit_id',
        'mrn',
        'amount',
        'payment_mode',
        'receipt_number',
        'reference',
        'received_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];
}
