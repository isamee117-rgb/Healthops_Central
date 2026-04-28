<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormGroup extends Model
{
    protected $fillable = ['name', 'context', 'description', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function forms()
    {
        return $this->hasMany(Form::class)->orderBy('sort_order')->orderBy('id');
    }
}
