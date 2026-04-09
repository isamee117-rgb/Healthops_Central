<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisposalRecord extends Model
{
    protected $table = 'disposal_records';

    protected $fillable = [
        'disposal_id', 'items', 'items_count', 'total_loss',
        'disposal_method', 'disposal_facility', 'certificate_number',
        'disposal_date', 'witness_1', 'witness_2', 'disposed_by',
        'authorized_by', 'status', 'notes',
    ];

    protected $casts = [
        'items' => 'array',
        'total_loss' => 'decimal:2',
        'disposal_date' => 'date',
    ];
}
