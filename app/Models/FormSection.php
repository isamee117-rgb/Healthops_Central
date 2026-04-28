<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSection extends Model
{
    protected $fillable = ['form_id', 'title', 'sort_order'];

    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    public function components()
    {
        return $this->hasMany(FormComponent::class)->orderBy('sort_order')->orderBy('id');
    }
}
