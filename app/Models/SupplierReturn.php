<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierReturn extends Model
{
    protected $table = 'supplier_returns';

    protected $fillable = [
        'rtv_id', 'supplier_id', 'supplier_name', 'po_reference',
        'return_date', 'items', 'items_count', 'reason', 'notes',
        'total_credit', 'status', 'created_by',
    ];

    protected $casts = [
        'return_date' => 'date',
        'items' => 'array',
        'total_credit' => 'decimal:2',
    ];
}
