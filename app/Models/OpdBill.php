<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpdBill extends Model
{
    protected $table = 'opd_bills';

    protected $fillable = [
        'bill_id',
        'mrn',
        'visit_id',
        'patient_name',
        'consultation_charges',
        'doctor_fee',
        'total_amount',
        'paid_amount',
        'payment_status',
        'history',
        'charge_ids',
        'additional_charges',
    ];

    protected $casts = [
        'consultation_charges' => 'decimal:2',
        'doctor_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'history' => 'array',
        'charge_ids' => 'array',
        'additional_charges' => 'array',
    ];
}
