<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpdConsultation extends Model
{
    protected $table = 'opd_consultations';

    protected $fillable = [
        'consultation_id',
        'visit_id',
        'mrn',
        'doctor_name',
        'consultation_date',
        'symptoms',
        'clinical_findings',
        'provisional_diagnosis',
        'final_diagnosis',
        'prescriptions',
        'investigation_orders',
        'doctor_notes',
        'custom_section_data',
        'outcome',
        'outcome_notes',
    ];

    protected $casts = [
        'consultation_date'   => 'datetime',
        'symptoms'            => 'array',
        'prescriptions'       => 'array',
        'investigation_orders'=> 'array',
        'custom_section_data' => 'array',
    ];
}
