<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountHead extends Model
{
    protected $table = 'account_heads';

    protected $fillable = [
        'head_id',
        'category',
        'head_type',
        'head_name',
        'head_code',
        'description',
        'budget_limit',
        'gl_account_code',
        'status',
        'created_by',
    ];

    protected $casts = [
        'budget_limit' => 'decimal:2',
    ];
}
