<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Form extends Model
{
    protected $fillable = ['form_group_id', 'name', 'description', 'instructions', 'declaration', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function formGroup()
    {
        return $this->belongsTo(FormGroup::class);
    }

    public function sections()
    {
        return $this->hasMany(FormSection::class)->orderBy('sort_order')->orderBy('id');
    }
}
