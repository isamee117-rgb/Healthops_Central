<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicalOrder extends Model
{
    protected $table = 'clinical_orders';

    protected $fillable = [
        'order_id',
        'mrn',
        'admission_id',
        'type',
        'priority',
        'details',
        'status',
        'ordered_by',
        'ordered_at',
        'metadata',
    ];

    protected $casts = [
        'ordered_at' => 'datetime',
        'metadata' => 'array',
    ];
}
