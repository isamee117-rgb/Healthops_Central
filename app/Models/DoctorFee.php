<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorFee extends Model
{
    protected $table = 'doctor_fees';

    protected $fillable = [
        'fee_id',
        'doctor_id',
        'doctor_name',
        'service_type',
        'visit_type',
        'procedure',
        'fee',
    ];

    protected $casts = [
        'fee' => 'decimal:2',
    ];
}
