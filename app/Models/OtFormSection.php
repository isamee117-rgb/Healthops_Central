<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtFormSection extends Model
{
    protected $table = 'ot_form_sections';

    protected $fillable = [
        'key',
        'label',
        'is_default',
        'is_enabled',
        'sort_order',
        'department',
        'fields',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_enabled' => 'boolean',
        'fields'     => 'array',
    ];
}
