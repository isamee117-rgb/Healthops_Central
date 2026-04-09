<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class HospitalSignatory extends Model
{
    protected $table = 'hospital_signatories';

    protected $fillable = [
        'title',
        'name',
        'qualifications',
        'designation',
        'registration_number',
        'photo_path',
        'signature_path',
        'stamp_path',
        'use_on',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'use_on' => 'array',
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
