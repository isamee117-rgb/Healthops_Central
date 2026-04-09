<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressNote extends Model
{
    protected $table = 'progress_notes';

    protected $fillable = [
        'note_id',
        'mrn',
        'admission_id',
        'subjective',
        'objective',
        'assessment',
        'plan',
        'recorded_by',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];
}
