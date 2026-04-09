<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillCorrection extends Model
{
    protected $table = 'bill_corrections';

    protected $fillable = [
        'correction_id',
        'bill_id',
        'visit_id',
        'mrn',
        'section',
        'field_name',
        'old_value',
        'new_value',
        'corrected_by',
        'reason',
    ];
}
