<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PanelClaim extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'claim_date' => 'date',
        'claim_amount' => 'decimal:2',
    ];
}
