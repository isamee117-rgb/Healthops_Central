<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabReagentBatch extends Model
{
    protected $primaryKey = 'batch_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    public function reagent()
    {
        return $this->belongsTo(LabReagent::class, 'reagent_id', 'reagent_id');
    }
}
