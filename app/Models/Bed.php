<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bed extends Model
{
    protected $table = 'beds';

    protected $fillable = [
        'bed_id',
        'bed_number',
        'type',
        'ward_id',
        'floor_id',
        'status',
        'assigned_patient_name',
        'assigned_patient_mrn',
        'admission_date',
    ];

    protected $casts = [
        'admission_date' => 'datetime',
    ];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class, 'ward_id', 'ward_id');
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_id', 'floor_id');
    }
}
