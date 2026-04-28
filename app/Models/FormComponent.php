<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormComponent extends Model
{
    protected $fillable = ['form_section_id', 'type', 'label', 'key', 'is_required', 'sort_order', 'config'];

    protected function casts(): array
    {
        return [
            'config'      => 'array',
            'is_required' => 'boolean',
        ];
    }

    public function section()
    {
        return $this->belongsTo(FormSection::class, 'form_section_id');
    }
}
