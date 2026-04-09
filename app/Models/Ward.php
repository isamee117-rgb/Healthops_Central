<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ward extends Model
{
    protected $table = 'wards';

    protected $fillable = [
        'ward_id',
        'name',
        'category',
        'floor_id',
    ];

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_id', 'floor_id');
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class, 'ward_id', 'ward_id');
    }
}
