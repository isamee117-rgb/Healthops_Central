<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NursingRecord extends Model
{
    protected $table = 'nursing_records';

    protected $fillable = [
        'record_id',
        'mrn',
        'admission_id',
        'patient_name',
        'status',
        'initial_vitals_completed',
        'discharge_vitals_completed',
    ];

    protected $casts = [
        'initial_vitals_completed' => 'boolean',
        'discharge_vitals_completed' => 'boolean',
    ];

    public function vitalEntries(): HasMany
    {
        return $this->hasMany(VitalEntry::class, 'vital_master_id', 'record_id');
    }
}
