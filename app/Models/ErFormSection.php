<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ErFormSection extends Model
{
    protected $table = 'er_form_sections';

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
