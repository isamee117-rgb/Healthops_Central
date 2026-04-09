<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpdVital extends Model
{
    protected $table = 'opd_vitals';

    protected $fillable = [
        'vital_id',
        'mrn',
        'visit_id',
        'temperature',
        'systolic',
        'diastolic',
        'heart_rate',
        'sp_o2',
        'respiratory_rate',
        'weight',
        'blood_sugar',
        'pain_scale',
        'notes',
        'recorded_at',
        'recorded_by',
    ];

    protected $casts = [
        'temperature' => 'decimal:2',
        'systolic' => 'integer',
        'diastolic' => 'integer',
        'heart_rate' => 'integer',
        'sp_o2' => 'integer',
        'respiratory_rate' => 'integer',
        'weight' => 'decimal:2',
        'blood_sugar' => 'integer',
        'pain_scale' => 'integer',
        'recorded_at' => 'datetime',
    ];
}
