<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabTestPackage extends Model
{
    protected $table = 'lab_test_packages';
    protected $primaryKey = 'package_code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'package_code', 'package_name', 'package_name_urdu', 'description',
        'target_audience', 'tests', 'individual_total', 'package_price',
        'discount_percent', 'sample_summary', 'fasting_required', 'fasting_hours',
        'max_tat', 'departments', 'status', 'available_for', 'display_priority',
        'valid_from', 'valid_to', 'internal_notes', 'order_count',
    ];

    protected $casts = [
        'target_audience' => 'array',
        'tests' => 'array',
        'sample_summary' => 'array',
        'departments' => 'array',
        'available_for' => 'array',
        'fasting_required' => 'boolean',
        'individual_total' => 'decimal:2',
        'package_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
    ];
}
