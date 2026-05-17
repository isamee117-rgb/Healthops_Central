<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSection extends Model
{
    protected $fillable = ['form_id', 'title', 'description', 'is_collapsible', 'sort_order'];

    protected function casts(): array
    {
        return ['is_collapsible' => 'boolean'];
    }

    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    public function components()
    {
        return $this->hasMany(FormComponent::class)->orderBy('sort_order')->orderBy('id');
    }
}
