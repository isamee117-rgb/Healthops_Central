<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class HospitalBankAccount extends Model
{
    protected $table = 'hospital_bank_accounts';

    protected $fillable = [
        'label',
        'bank_name',
        'branch',
        'branch_code',
        'account_title',
        'account_number',
        'iban',
        'account_type',
        'swift_code',
        'use_for',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'use_for' => 'array',
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
        return $query->orderBy('display_order')->orderBy('label');
    }
}
