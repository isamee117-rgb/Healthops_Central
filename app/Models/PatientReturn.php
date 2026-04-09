<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientReturn extends Model
{
    protected $table = 'patient_returns';

    protected $fillable = [
        'return_id', 'return_date', 'patient_name', 'mrn', 'order_id',
        'purchase_date', 'medicine_name', 'medicine_id', 'batch_number',
        'expiry_date', 'quantity', 'unit', 'reason', 'patient_notes',
        'condition', 'can_restock', 'original_amount', 'refund_amount',
        'refund_method', 'status', 'processed_by', 'processed_at',
    ];

    protected $casts = [
        'return_date' => 'date',
        'purchase_date' => 'date',
        'can_restock' => 'boolean',
        'original_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];
}
