<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabOrder extends Model
{
    protected $table = 'lab_orders';

    protected $fillable = [
        'order_id', 'order_time', 'patient_name', 'mrn', 'visit_number',
        'patient_age', 'patient_gender', 'patient_location',
        'diagnosis', 'allergies', 'relevant_history',
        'source_department', 'ward', 'bed', 'priority', 'status', 'sample_status',
        'tests_count', 'ordered_by', 'clinical_indication', 'clinical_notes',
        'drug_history', 'fasting_required', 'fasting_compliant', 'critical_flag',
        'tat_minutes', 'collected_at', 'collected_by',
        'verified_at', 'verified_by', 'reported_at',
        'cancel_reason', 'hold_reason', 'notes',
    ];

    protected $casts = [
        'order_time' => 'datetime',
        'allergies' => 'array',
        'relevant_history' => 'array',
        'drug_history' => 'array',
        'fasting_required' => 'boolean',
        'fasting_compliant' => 'boolean',
        'critical_flag' => 'boolean',
        'collected_at' => 'datetime',
        'verified_at' => 'datetime',
        'reported_at' => 'datetime',
    ];

    public function tests()
    {
        return $this->hasMany(LabOrderTest::class, 'lab_order_id', 'order_id');
    }
}
