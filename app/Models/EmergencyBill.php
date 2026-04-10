<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyBill extends Model
{
    protected $table = 'emergency_bills';

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
    ];

    protected $casts = [
        'consultation_charges' => 'decimal:2',
        'doctor_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'history' => 'array',
    ];
}
