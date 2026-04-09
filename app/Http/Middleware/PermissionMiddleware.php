<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:
     *   ->middleware('permission:dashboard.access')        — exact slug check
     *   ->middleware('permission:opd')                     — module-level check (any opd.* permission)
     *   ->middleware('permission:pharmacy.pos.access')     — sub-module access check
     */
    public function handle(Request $request, Closure $next, string $permission): mixed
    {
        if (!Auth::check()) {
            return $request->expectsJson()
                ? response()->json(['error' => 'Unauthenticated'], 401)
                : redirect(url('/login'));
        }

        $user = Auth::user();

        // Superadmin bypasses all permission checks
        if ($user->isSuperadmin()) {
            return $next($request);
        }

        // Module-level check: 'permission:opd' → hasModuleAccess('opd')
        $granted = str_contains($permission, '.')
            ? $user->hasPermission($permission)
            : $user->hasModuleAccess($permission);

        if (!$granted) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error'   => 'Forbidden',
                    'message' => 'You do not have permission to access this resource.',
                ], 403);
            }

            return response()->view('errors.403', [
                'permission' => $permission,
                'backUrl'    => url()->previous() !== url()->current() ? url()->previous() : url('/'),
            ], 403);
        }

        return $next($request);
    }
}
