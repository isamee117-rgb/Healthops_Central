<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabOrderTest extends Model
{
    protected $table = 'lab_order_tests';

    protected $fillable = [
        'test_id', 'lab_order_id', 'test_name', 'test_code', 'category',
        'specimen_type', 'container_type', 'volume', 'fasting_required',
        'status', 'special_instructions', 'storage_temp', 'transport_medium',
        'stability', 'result_data', 'result_status',
        'collected_at', 'result_entered_at', 'result_entered_by',
        'verified_at', 'verified_by',
    ];

    protected $casts = [
        'fasting_required' => 'boolean',
        'result_data' => 'array',
        'collected_at' => 'datetime',
        'result_entered_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(LabOrder::class, 'lab_order_id', 'order_id');
    }
}
