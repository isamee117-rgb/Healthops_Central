<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabStockTransaction extends Model
{
    protected $table = 'lab_stock_transactions';
    protected $guarded = [];

    public function reagent()
    {
        return $this->belongsTo(LabReagent::class, 'reagent_id', 'reagent_id');
    }
}
