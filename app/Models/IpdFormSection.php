<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IpdFormSection extends Model
{
    protected $table = 'ipd_form_sections';

    protected $fillable = [
        'key',
        'label',
        'is_default',
        'is_enabled',
        'department',
        'sort_order',
        'fields',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_enabled' => 'boolean',
        'fields'     => 'array',
    ];
}
