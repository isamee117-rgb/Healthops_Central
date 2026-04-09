<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_active', 'email_verified_at', 'created_at', 'updated_at')
            ->orderByDesc('created_at')
            ->get();

        $stats = $this->getUserStats();

        return response()->json([
            'users' => $users,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = auth()->user() ?? $request->user();

        $allowedRoles = $this->getAllowedRoles($currentUser);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', 'string', Rule::in($allowedRoles)],
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role,
            'is_active' => $request->input('is_active', true),
        ]);

        // Sync user_roles pivot so permission checks work immediately
        $roleModel = Role::where('slug', $request->role)->first();
        if ($roleModel) {
            $user->roles()->sync([$roleModel->id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'user' => $user->only('id', 'name', 'email', 'role', 'is_active', 'created_at'),
        ], 201);
    }

    public function show($id)
    {
        $user = User::select('id', 'name', 'email', 'role', 'is_active', 'email_verified_at', 'created_at', 'updated_at')
            ->find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $currentUser = auth()->user() ?? $request->user();
        $allowedRoles = $this->getAllowedRoles($currentUser);

        if ($request->filled('role') && !in_array($request->role, $allowedRoles)) {
            return response()->json(['error' => 'You cannot assign this role'], 403);
        }

        if ($user->role === 'superadmin' && $request->filled('role') && $request->role !== 'superadmin') {
            if (!$currentUser || !$currentUser->isSuperadmin()) {
                return response()->json(['error' => 'Cannot change superadmin role'], 403);
            }
        }

        $rules = [
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => ['sometimes', 'string', Rule::in($allowedRoles)],
            'is_active' => 'boolean',
        ];

        $request->validate($rules);

        $data = $request->only(['name', 'email', 'role', 'is_active']);

        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $user->update($data);

        // Sync user_roles pivot whenever role changes so permissions take effect
        if (isset($data['role'])) {
            $roleModel = Role::where('slug', $user->role)->first();
            if ($roleModel) {
                $user->roles()->sync([$roleModel->id]);
            } else {
                $user->roles()->detach(); // custom slug with no matching role record
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'user' => $user->only('id', 'name', 'email', 'role', 'is_active', 'created_at', 'updated_at'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if ($user->role === 'superadmin') {
            return response()->json(['error' => 'Cannot delete superadmin account'], 403);
        }

        $currentUser = auth()->user() ?? $request->user();
        if ($currentUser && $currentUser->id === $user->id) {
            return response()->json(['error' => 'Cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    public function stats()
    {
        return response()->json($this->getUserStats());
    }

    private function getUserStats()
    {
        return [
            'total' => User::count(),
            'superadmins' => User::where('role', 'superadmin')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'users' => User::where('role', 'user')->count(),
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
        ];
    }

    private function getAllowedRoles($currentUser)
    {
        // Built-in roles always available
        $builtIn = ['superadmin', 'admin', 'user'];

        // Custom roles from the roles table (slugs of all active roles)
        $custom = Role::where('is_active', true)->pluck('slug')->toArray();

        // Merge without duplicates
        $all = array_unique(array_merge($builtIn, $custom));

        if (!$currentUser) {
            // API routes don't carry web sessions — allow all roles since
            // access to this page is already guarded by the web auth middleware.
            return $all;
        }

        if ($currentUser->isSuperadmin()) {
            return $all;
        }

        if ($currentUser->isAdmin()) {
            // Admins can assign non-superadmin roles
            return array_values(array_filter($all, fn($r) => $r !== 'superadmin'));
        }

        return ['user'];
    }
}
