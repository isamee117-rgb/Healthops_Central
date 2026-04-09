<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $table = 'doctors';

    protected $fillable = [
        'doctor_id',
        'employee_id',
        'role',
        'designation',
        'department',
        'specialist',
        'first_name',
        'last_name',
        'father_name',
        'mother_name',
        'gender',
        'marital_status',
        'blood_group',
        'dob',
        'phone',
        'email',
        'emergency_contact',
        'cnic',
        'current_address',
        'permanent_address',
        'qualification',
        'work_experience',
        'specialization',
        'notes',
        'basic_salary',
        'contract_type',
        'work_shift',
        'work_location',
        'bank_account_number',
        'bank_name',
        'bank_branch_name',
        'joining_date',
        'relieving_date',
        'duty_from',
        'duty_to',
        'duty_days',
        'status',
    ];

    protected $casts = [
        'dob' => 'date',
        'basic_salary' => 'decimal:2',
        'joining_date' => 'date',
        'relieving_date' => 'date',
        'duty_days' => 'array',
    ];
}
