<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyVisit extends Model
{
    protected $table = 'emergency_visits';

    protected $fillable = [
        'visit_id',
        'visit_number',
        'mrn',
        'patient_name',
        'doctor_name',
        'department',
        'visit_type',
        'consultation_date',
        'status',
        'payment_status',
        'esi',
        'mode_of_arrival',
        'triage_category',
        'chief_complaint',
        'vitals',
        'clinical_status',
        'disposition',
        'discharge_status',
        'discharge_info',
        'custom_order_data',
        'registered_by',
    ];

    protected $casts = [
        'visit_number'      => 'integer',
        'consultation_date' => 'datetime',
        'vitals'            => 'array',
        'discharge_info'    => 'array',
        'custom_order_data' => 'array',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'mrn', 'mrn');
    }
}
