<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $table = 'staff';

    protected $fillable = [
        'staff_id',
        'employee_id',
        'first_name',
        'last_name',
        'gender',
        'dob',
        'cnic',
        'blood_group',
        'marital_status',
        'phone',
        'secondary_phone',
        'email',
        'current_address',
        'permanent_address',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_phone',
        'category',
        'designation',
        'department',
        'shift',
        'employment_type',
        'employment_status',
        'joining_date',
        'contract_end_date',
        'education_level',
        'qualification',
        'registration_authority',
        'registration_number',
        'registration_valid_until',
        'certifications',
        'special_skills',
        'work_experience',
        'notes',
        'internal_notes',
    ];

    protected $casts = [
        'dob' => 'date',
        'joining_date' => 'date',
        'contract_end_date' => 'date',
        'registration_valid_until' => 'date',
    ];
}
