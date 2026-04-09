<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpdConfigItem extends Model
{
    protected $table = 'opd_config_items';

    protected $fillable = [
        'category',
        'name',
        'is_active',
        'sort_order',
        'value',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
        'value'      => 'integer',
    ];

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
