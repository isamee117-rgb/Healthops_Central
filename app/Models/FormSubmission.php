<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    protected $fillable = [
        'form_id', 'form_section_id', 'admission_id', 'mrn',
        'context', 'data', 'submitted_by',
    ];

    protected function casts(): array
    {
        return ['data' => 'array'];
    }

    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    public function section()
    {
        return $this->belongsTo(FormSection::class, 'form_section_id');
    }
}
