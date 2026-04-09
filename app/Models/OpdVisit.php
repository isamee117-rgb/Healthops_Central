<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpdVisit extends Model
{
    protected $table = 'opd_visits';

    protected $fillable = [
        'visit_id',
        'visit_number',
        'mrn',
        'patient_name',
        'doctor_name',
        'department',
        'visit_type',
        'referred_by',
        'consultation_date',
        'status',
        'payment_status',
        'registered_by',
    ];

    protected $casts = [
        'visit_number' => 'integer',
        'consultation_date' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'mrn', 'mrn');
    }
}
