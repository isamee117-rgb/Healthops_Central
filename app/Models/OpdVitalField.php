<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpdVitalField extends Model
{
    protected $table = 'opd_vital_fields';

    protected $fillable = [
        'field_key',
        'label',
        'icon',
        'unit',
        'input_type',
        'is_visible',
        'sort_order',
    ];

    protected $casts = [
        'is_visible'  => 'boolean',
        'sort_order'  => 'integer',
    ];
}
