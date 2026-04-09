<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Floor extends Model
{
    protected $table = 'floors';

    protected $fillable = [
        'floor_id',
        'name',
        'code',
    ];

    public function wards(): HasMany
    {
        return $this->hasMany(Ward::class, 'floor_id', 'floor_id');
    }
}
