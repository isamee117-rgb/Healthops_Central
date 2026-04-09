<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $table = 'patients';

    protected $fillable = [
        'mrn',
        'name',
        'age',
        'gender',
        'phone',
        'cnic',
        'visit_count',
        'is_locked',
        'blood_group',
        'address',
        'first_visit_date',
        'last_visit_date',
        'allergies',
        'contact_type',
        'guardian_name',
        'guardian_phone',
        'guardian_cnic',
        'relationship_to_patient',
        'status',
    ];

    protected $casts = [
        'age' => 'integer',
        'visit_count' => 'integer',
        'is_locked' => 'boolean',
        'first_visit_date' => 'datetime',
        'last_visit_date' => 'datetime',
        'allergies' => 'array',
    ];
}
