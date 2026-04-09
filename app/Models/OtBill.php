<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtBill extends Model
{
    protected $table = 'ot_bills';

    protected $fillable = [
        'bill_id',
        'mrn',
        'operation_id',
        'patient_name',
        'theater_charges',
        'surgeon_fee',
        'anaesthetist_fee',
        'total_amount',
        'payment_status',
        'history',
    ];

    protected $casts = [
        'theater_charges' => 'decimal:2',
        'surgeon_fee' => 'decimal:2',
        'anaesthetist_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'history' => 'array',
    ];
}
