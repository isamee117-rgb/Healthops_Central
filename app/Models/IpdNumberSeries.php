<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IpdNumberSeries extends Model
{
    protected $table = 'ipd_number_series';

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
