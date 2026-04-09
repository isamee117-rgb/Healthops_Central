<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabTransaction extends Model
{
    protected $table = 'lab_transactions';

    protected $fillable = [
        'transaction_id', 'transaction_date', 'patient_name', 'mrn',
        'department', 'order_id', 'subtotal', 'discount', 'tax', 'total_amount',
        'payment_mode', 'payment_status', 'billed_to', 'charge_posted',
        'reconciliation_status', 'receipt_number', 'billing_reference',
        'ordered_by', 'processed_by', 'items', 'notes',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
        'items'            => 'array',
        'charge_posted'    => 'boolean',
    ];
}
