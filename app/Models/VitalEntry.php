<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VitalEntry extends Model
{
    protected $table = 'vital_entries';

    protected $fillable = [
        'entry_id',
        'vital_master_id',
        'category',
        'bp_systolic',
        'bp_diastolic',
        'pulse',
        'temperature',
        'respiration',
        'sp_o2',
        'weight',
        'height',
        'blood_sugar',
        'pain_scale',
        'notes',
        'recorded_by',
        'recorded_at',
    ];

    protected $casts = [
        'bp_systolic'  => 'integer',
        'bp_diastolic' => 'integer',
        'pulse'        => 'integer',
        'temperature'  => 'decimal:2',
        'respiration'  => 'integer',
        'sp_o2'        => 'integer',
        'weight'       => 'decimal:2',
        'height'       => 'decimal:2',
        'blood_sugar'  => 'decimal:2',
        'pain_scale'   => 'integer',
        'recorded_at'  => 'datetime',
    ];

    public function nursingRecord(): BelongsTo
    {
        return $this->belongsTo(NursingRecord::class, 'vital_master_id', 'record_id');
    }
}
