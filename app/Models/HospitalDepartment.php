<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class HospitalDepartment extends Model
{
    protected $table = 'hospital_departments';

    protected $fillable = [
        'name',
        'name_urdu',
        'code',
        'hod_name',
        'location',
        'extension',
        'direct_line',
        'email',
        'services',
        'opd_start',
        'opd_end',
        'is_emergency_24x7',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_emergency_24x7' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('name');
    }
}
