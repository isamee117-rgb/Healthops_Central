<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanceNumberSeries extends Model
{
    protected $table = 'finance_number_series';

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
