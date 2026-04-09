<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicineBatch extends Model
{
    protected $table = 'medicine_batches';

    protected $fillable = [
        'batch_id', 'batch_number', 'medicine_id',
        'received_date', 'expiry_date',
        'qty_received', 'current_qty', 'unit_price',
        'supplier', 'status',
    ];

    protected $casts = [
        'received_date' => 'date',
        'expiry_date' => 'date',
        'unit_price' => 'decimal:2',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class, 'medicine_id', 'medicine_id');
    }
}
