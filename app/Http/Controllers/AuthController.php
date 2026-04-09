<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect($this->firstAccessibleUrl(Auth::user()));
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            return back()->withErrors(['email' => 'Invalid email or password.'])->withInput($request->only('email', 'remember'));
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return back()->withErrors(['email' => 'Your account has been deactivated. Please contact an administrator.'])->withInput($request->only('email'));
        }

        $request->session()->regenerate();

        return redirect()->intended($this->firstAccessibleUrl($user));
    }

    private function firstAccessibleUrl($user): string
    {
        if ($user->isSuperadmin()) return url('/');

        $candidates = [
            '/'                  => 'dashboard.access',
            '/opd'               => 'opd',
            '/ipd'               => 'ipd',
            '/emergency'         => 'emergency',
            '/ot'                => 'ot',
            '/pharmacy'          => 'pharmacy',
            '/laboratory'        => 'laboratory',
            '/patients'          => 'patients.access',
            '/doctors'           => 'doctors.access',
            '/staff'             => 'staff.access',
            '/user-management'   => 'user-management.access',
            '/role-management'   => 'role-management.access',
            '/hospital-info'     => 'hospital-info',
            '/configuration/opd' => 'configuration.opd.access',
        ];

        foreach ($candidates as $path => $permission) {
            $granted = str_contains($permission, '.')
                ? $user->hasPermission($permission)
                : $user->hasModuleAccess($permission);
            if ($granted) return url($path);
        }

        return url('/');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect(url('/login'));
    }
}
