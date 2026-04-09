<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicationOrder extends Model
{
    protected $table = 'medication_orders';

    protected $fillable = [
        'order_id', 'order_time', 'patient_name', 'mrn', 'visit_number',
        'patient_age', 'patient_gender', 'patient_location',
        'diagnosis', 'allergies', 'current_medications', 'lab_values',
        'department', 'ward', 'bed', 'priority',
        'items', 'items_count', 'order_value',
        'ordered_by', 'status', 'payment_status', 'payment_category',
        'patient_payable', 'panel_payable', 'coverage_status',
        'tat_minutes', 'clinical_checks', 'notes',
        'dispensed_by', 'dispensed_at', 'verified_at', 'verified_by',
    ];

    protected $casts = [
        'order_time' => 'datetime',
        'items' => 'array',
        'allergies' => 'array',
        'current_medications' => 'array',
        'lab_values' => 'array',
        'clinical_checks' => 'array',
        'order_value' => 'decimal:2',
        'patient_payable' => 'decimal:2',
        'panel_payable' => 'decimal:2',
        'dispensed_at' => 'datetime',
        'verified_at' => 'datetime',
    ];
}
