<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpdNumberSeries extends Model
{
    protected $table = 'opd_number_series';

    protected $fillable = [
        'series_key',
        'label',
        'prefix',
        'starting_number',
        'padding',
    ];

    protected $casts = [
        'starting_number' => 'integer',
        'padding'         => 'integer',
    ];
}
