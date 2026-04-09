<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class InsurancePanel extends Model
{
    protected $table = 'insurance_panels';

    protected $fillable = [
        'name',
        'panel_code',
        'company_type',
        'contact_person',
        'phone',
        'email',
        'coverage',
        'discount_rates',
        'credit_limit',
        'payment_terms',
        'agreement_start',
        'agreement_end',
        'auto_renewable',
        'document_path',
        'status',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'coverage' => 'array',
            'discount_rates' => 'array',
            'credit_limit' => 'decimal:2',
            'agreement_start' => 'date',
            'agreement_end' => 'date',
            'auto_renewable' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('name');
    }
}
