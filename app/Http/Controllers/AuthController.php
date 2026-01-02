<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function showLogin(Request $request)
    {
        if ($request->user()) {
            // Redirect authenticated users to their dashboard
            $role = $request->user()->role ?? null;
            if ($role === 'admin') {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('eleve.dashboard');
        }

        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('Auth/Login');
        }

        return view('auth.login');
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'matricule' => 'required|string',
            'password' => 'required|string',
        ]);

        if (Auth::attempt(['matricule' => $data['matricule'], 'password' => $data['password']])) {
            $request->session()->regenerate();
            $user = $request->user();

            $redirect = $user->role === 'admin' ? route('admin.dashboard') : route('eleve.dashboard');

            // If the request originates from Inertia, use Inertia::location to trigger a full-page visit
            if ($request->header('X-Inertia')) {
                return \Inertia\Inertia::location($redirect);
            }

            return redirect()->intended($redirect);
        }

        // For Inertia (AJAX) requests return JSON validation-style error and 422 status
        if ($request->header('X-Inertia') || $request->wantsJson()) {
            return response()->json(['errors' => ['matricule' => 'Identifiants invalides']], 422);
        }

        return back()->withErrors(['matricule' => 'Identifiants invalides'])->withInput();
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}
