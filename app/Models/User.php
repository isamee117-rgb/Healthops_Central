<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isSuperadmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    public function canManageUsers(): bool
    {
        return in_array($this->role, ['superadmin', 'admin']);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot('assigned_by')
            ->withTimestamps();
    }

    /**
     * Return all permission slugs for this user (memoised — one DB hit per request).
     * Falls back to the role matched by users.role slug if user_roles pivot is empty.
     */
    private ?array $_permissionSlugs = null;

    public function permissionSlugs(): array
    {
        if ($this->_permissionSlugs === null) {
            $roles = $this->roles()->with('permissions')->get();

            // Fallback: if pivot is empty, look up the role by users.role slug
            if ($roles->isEmpty() && $this->role) {
                $role = Role::where('slug', $this->role)->with('permissions')->first();
                if ($role) {
                    $roles = collect([$role]);
                    // Auto-sync the pivot so future checks are consistent
                    $this->roles()->syncWithoutDetaching([$role->id]);
                }
            }

            $this->_permissionSlugs = $roles
                ->flatMap(fn($r) => $r->permissions->pluck('slug'))
                ->unique()
                ->values()
                ->toArray();
        }

        return $this->_permissionSlugs;
    }

    public function hasPermission(string $slug): bool
    {
        if ($this->isSuperadmin()) {
            return true;
        }

        return in_array($slug, $this->permissionSlugs());
    }

    /**
     * Check if the user has ANY permission belonging to a parent module
     * e.g. hasModuleAccess('opd') → true if user has opd.registration.access etc.
     */
    public function hasModuleAccess(string $parentModule): bool
    {
        if ($this->isSuperadmin()) {
            return true;
        }

        $prefix = $parentModule . '.';
        foreach ($this->permissionSlugs() as $slug) {
            if (str_starts_with($slug, $prefix)) {
                return true;
            }
        }

        return false;
    }

    public function hasAnyPermission(array $slugs): bool
    {
        if ($this->isSuperadmin()) {
            return true;
        }

        foreach ($slugs as $slug) {
            if (in_array($slug, $this->permissionSlugs())) {
                return true;
            }
        }

        return false;
    }

    public function assignRole(string $slug): void
    {
        $role = Role::where('slug', $slug)->firstOrFail();
        if (!$this->roles()->where('roles.id', $role->id)->exists()) {
            $this->roles()->attach($role->id);
        }
    }

    public function removeRole(string $slug): void
    {
        $role = Role::where('slug', $slug)->firstOrFail();
        $this->roles()->detach($role->id);
    }
}
