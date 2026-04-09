<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WardReturn extends Model
{
    protected $table = 'ward_returns';

    protected $fillable = [
        'return_id', 'ward_name', 'return_date', 'items', 'items_count',
        'total_value', 'status', 'received_by', 'processed_by', 'notes',
    ];

    protected $casts = [
        'return_date' => 'date',
        'items' => 'array',
        'total_value' => 'decimal:2',
    ];
}
