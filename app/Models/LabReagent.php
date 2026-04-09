<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabReagent extends Model
{
    protected $primaryKey = 'reagent_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    public function batches()
    {
        return $this->hasMany(LabReagentBatch::class, 'reagent_id', 'reagent_id');
    }

    public function transactions()
    {
        return $this->hasMany(LabStockTransaction::class, 'reagent_id', 'reagent_id');
    }
}
