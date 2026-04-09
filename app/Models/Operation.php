<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Operation extends Model
{
    protected $table = 'operations';

    protected $fillable = [
        'operation_id',
        'operation_number',
        'mrn',
        'patient_name',
        'age',
        'gender',
        'phone',
        'cnic',
        'procedure',
        'surgery_type',
        'prev_related_surgery',
        'prev_surgery_details',
        'start_time',
        'surgery_date',
        'estimated_duration',
        'priority',
        'booking_status',
        'status',
        'payment_status',
        'admission_source',
        'surgeon',
        'anaesthetist',
        'anaesthetist_fee',
        'theater',
        'checklist',
        'checklist_status',
        'intraop_record',
        'current_phase',
        'anesthesia_start_time',
        'postop_notes',
        'postop_location',
        'expected_discharge_date',
        'discharged',
        'custom_checklist_data',
        'custom_intraop_data',
        'custom_postop_data',
        'registered_by',
        'checklist_saved_by',
        'intraop_saved_by',
        'postop_saved_by',
    ];

    protected $casts = [
        'operation_number' => 'integer',
        'age' => 'integer',
        'prev_related_surgery' => 'boolean',
        'surgery_date' => 'date',
        'anaesthetist_fee' => 'decimal:2',
        'checklist' => 'array',
        'custom_checklist_data' => 'array',
        'custom_intraop_data'   => 'array',
        'custom_postop_data'    => 'array',
        'intraop_record' => 'array',
        'postop_notes' => 'array',
        'expected_discharge_date' => 'date',
        'discharged' => 'boolean',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'mrn', 'mrn');
    }
}
