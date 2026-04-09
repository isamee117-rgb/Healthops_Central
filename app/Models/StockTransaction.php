<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    protected $table = 'stock_transactions';

    protected $fillable = [
        'transaction_id', 'medicine_id', 'batch_id',
        'type', 'quantity', 'stock_before', 'stock_after',
        'reason', 'reference', 'notes', 'performed_by',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class, 'medicine_id', 'medicine_id');
    }

    public function batch()
    {
        return $this->belongsTo(MedicineBatch::class, 'batch_id', 'batch_id');
    }
}
