<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtIntraopFormSection extends Model
{
    protected $table = 'ot_intraop_form_sections';

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
