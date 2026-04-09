<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HospitalCharge extends Model
{
    protected $table = 'hospital_charges';

    protected $fillable = [
        'charge_id',
        'name',
        'module',
        'category',
        'amount',
        'is_mandatory',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_mandatory' => 'boolean',
        'is_active' => 'boolean',
    ];
}
