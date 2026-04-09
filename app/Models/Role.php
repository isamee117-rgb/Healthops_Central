<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
            ->withPivot('granted_by')
            ->withTimestamps();
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->withPivot('assigned_by')
            ->withTimestamps();
    }

    public function isSystem(): bool
    {
        return $this->type === 'system';
    }

    public function isCustom(): bool
    {
        return $this->type === 'custom';
    }

    public function hasPermission(string $slug): bool
    {
        return $this->permissions()->where('permissions.slug', $slug)->exists();
    }
}
