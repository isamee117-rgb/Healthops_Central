<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'module',
        'parent_module',
        'level',
        'action_type',
        'is_dangerous',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_dangerous' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
            ->withPivot('granted_by')
            ->withTimestamps();
    }

    public function scopePage(Builder $query): Builder
    {
        return $query->where('level', 'page');
    }

    public function scopeAction(Builder $query): Builder
    {
        return $query->where('level', 'action');
    }

    public function scopeForModule(Builder $query, string $module): Builder
    {
        return $query->where('module', $module);
    }
}
