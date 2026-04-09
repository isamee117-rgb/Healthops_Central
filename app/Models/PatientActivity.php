<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientActivity extends Model
{
    protected $table = 'patient_activities';

    protected $fillable = [
        'activity_id',
        'mrn',
        'timestamp',
        'action',
        'user',
        'module',
        'details',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'mrn', 'mrn');
    }
}
