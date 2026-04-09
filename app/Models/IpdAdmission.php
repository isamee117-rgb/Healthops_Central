<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpdAdmission extends Model
{
    protected $table = 'ipd_admissions';

    protected $fillable = [
        'admission_id',
        'admission_number',
        'mrn',
        'patient_name',
        'doctor_name',
        'department',
        'admission_date',
        'admission_source',
        'status',
        'payment_status',
        'admission_type',
        'initial_diagnosis',
        'estimated_stay',
        'ward',
        'floor_room',
        'bed',
        'bed_id',
        'discharge_status',
        'discharge_info',
        'custom_order_data',
        'registered_by',
    ];

    protected $casts = [
        'admission_number'  => 'integer',
        'admission_date'    => 'datetime',
        'discharge_info'    => 'array',
        'custom_order_data' => 'array',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'mrn', 'mrn');
    }
}
