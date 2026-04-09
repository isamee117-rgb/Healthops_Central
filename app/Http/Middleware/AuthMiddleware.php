<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }
            return redirect(url('/login'));
        }

        if (!Auth::user()->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            return redirect(url('/login'))->withErrors(['email' => 'Your account has been deactivated.']);
        }

        return $next($request);
    }
}
