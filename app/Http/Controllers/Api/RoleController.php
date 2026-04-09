<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::withCount(['users', 'permissions'])
            ->orderByDesc('created_at')
            ->get();

        $stats = [
            'total' => Role::count(),
            'system' => Role::where('type', 'system')->count(),
            'custom' => Role::where('type', 'custom')->count(),
            'active' => Role::where('is_active', true)->count(),
            'inactive' => Role::where('is_active', false)->count(),
            'total_permissions' => Permission::count(),
        ];

        return response()->json([
            'roles' => $roles,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'slug' => 'nullable|string|max:255|unique:roles,slug',
            'description' => 'nullable|string',
            'type' => 'sometimes|string|in:system,custom',
            'is_active' => 'boolean',
        ]);

        $slug = $request->input('slug') ?: Str::slug($request->name);

        if (Role::where('slug', $slug)->exists()) {
            return response()->json(['error' => 'A role with this slug already exists'], 422);
        }

        $role = Role::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'type' => $request->input('type', 'custom'),
            'is_active' => $request->input('is_active', true),
            'created_by' => $request->user() ? $request->user()->id : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'role' => $role,
        ], 201);
    }

    public function show($id)
    {
        $role = Role::with('permissions')->withCount(['users', 'permissions'])->find($id);

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        return response()->json($role);
    }

    public function update(Request $request, $id)
    {
        $role = Role::find($id);
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('roles')->ignore($id)],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('roles')->ignore($id)],
            'description' => 'nullable|string',
            'type' => 'sometimes|string|in:system,custom',
            'is_active' => 'boolean',
        ]);

        $data = $request->only(['name', 'description', 'is_active']);

        if ($request->filled('slug')) {
            $data['slug'] = $request->slug;
        }

        if ($request->filled('type') && !$role->isSystem()) {
            $data['type'] = $request->type;
        }

        $role->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'role' => $role,
        ]);
    }

    public function destroy($id)
    {
        $role = Role::withCount('users')->find($id);
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        if ($role->isSystem()) {
            return response()->json(['error' => 'Cannot delete system roles'], 403);
        }

        if ($role->users_count > 0) {
            return response()->json(['error' => 'Cannot delete role that has users assigned'], 403);
        }

        $role->permissions()->detach();
        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully',
        ]);
    }

    public function permissions($id)
    {
        $role = Role::find($id);
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $assignedIds = $role->permissions()->pluck('permissions.id')->toArray();

        $allPermissions = Permission::orderBy('display_order')
            ->orderBy('module')
            ->orderBy('level')
            ->get();

        $grouped = [];
        foreach ($allPermissions as $perm) {
            $parentModule = $perm->parent_module ?: $perm->module;
            $module = $perm->module;

            if (!isset($grouped[$parentModule])) {
                $grouped[$parentModule] = [];
            }
            if (!isset($grouped[$parentModule][$module])) {
                $grouped[$parentModule][$module] = [];
            }

            $grouped[$parentModule][$module][] = [
                'id' => $perm->id,
                'name' => $perm->name,
                'slug' => $perm->slug,
                'description' => $perm->description,
                'level' => $perm->level,
                'action_type' => $perm->action_type,
                'is_dangerous' => $perm->is_dangerous,
                'assigned' => in_array($perm->id, $assignedIds),
            ];
        }

        return response()->json([
            'role' => $role->only('id', 'name', 'slug', 'type'),
            'permissions' => $grouped,
            'assigned_count' => count($assignedIds),
            'total_count' => $allPermissions->count(),
        ]);
    }

    public function syncPermissions(Request $request, $id)
    {
        $role = Role::find($id);
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        if ($role->slug === 'superadmin') {
            return response()->json(['error' => 'Cannot modify superadmin permissions'], 403);
        }

        $request->validate([
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        $grantedBy = $request->user() ? $request->user()->id : null;

        $syncData = [];
        foreach ($request->permission_ids as $permId) {
            $syncData[$permId] = ['granted_by' => $grantedBy];
        }

        $role->permissions()->sync($syncData);

        $role->loadCount('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Permissions synced successfully',
            'permissions_count' => $role->permissions_count,
        ]);
    }

    public function duplicate(Request $request, $id)
    {
        $role = Role::with('permissions')->find($id);
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'slug' => 'nullable|string|max:255|unique:roles,slug',
        ]);

        $slug = $request->input('slug') ?: Str::slug($request->name);

        if (Role::where('slug', $slug)->exists()) {
            return response()->json(['error' => 'A role with this slug already exists'], 422);
        }

        $newRole = Role::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $role->description,
            'type' => 'custom',
            'is_active' => true,
            'created_by' => $request->user() ? $request->user()->id : null,
        ]);

        $permissionIds = $role->permissions->pluck('id')->toArray();
        $grantedBy = $request->user() ? $request->user()->id : null;
        $syncData = [];
        foreach ($permissionIds as $permId) {
            $syncData[$permId] = ['granted_by' => $grantedBy];
        }
        $newRole->permissions()->sync($syncData);

        $newRole->loadCount(['users', 'permissions']);

        return response()->json([
            'success' => true,
            'message' => 'Role duplicated successfully',
            'role' => $newRole,
        ], 201);
    }
}
