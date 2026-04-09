<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GrnItem extends Model
{
    protected $table = 'grn_items';

    protected $fillable = [
        'grn_id', 'medicine_id', 'expected_qty', 'received_qty',
        'batch_number', 'manufacturing_date', 'expiry_date',
        'unit_price', 'quality_checks', 'remarks', 'accepted',
    ];

    protected $casts = [
        'manufacturing_date' => 'date',
        'expiry_date' => 'date',
        'unit_price' => 'decimal:2',
        'quality_checks' => 'array',
        'accepted' => 'boolean',
    ];

    public function grn()
    {
        return $this->belongsTo(GoodsReceivedNote::class, 'grn_id', 'grn_id');
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class, 'medicine_id', 'medicine_id');
    }
}
