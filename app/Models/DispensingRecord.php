<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DispensingRecord extends Model
{
    protected $table = 'dispensing_records';

    protected $fillable = [
        'dispensing_id', 'order_id', 'patient_name', 'mrn', 'visit_number',
        'department', 'ward', 'bed', 'priority',
        'items_dispensing', 'counseling_checklist', 'counseling_notes',
        'counseled_by', 'patient_signature', 'dispensed_by', 'dispensed_at',
        'status', 'total_value', 'total_items', 'items_dispensed',
        'all_labels_printed', 'counseling_done', 'stock_updated',
    ];

    protected $casts = [
        'items_dispensing' => 'array',
        'counseling_checklist' => 'array',
        'patient_signature' => 'boolean',
        'dispensed_at' => 'datetime',
        'total_value' => 'decimal:2',
        'all_labels_printed' => 'boolean',
        'counseling_done' => 'boolean',
        'stock_updated' => 'boolean',
    ];

    public function medicationOrder()
    {
        return $this->belongsTo(MedicationOrder::class, 'order_id', 'order_id');
    }
}
