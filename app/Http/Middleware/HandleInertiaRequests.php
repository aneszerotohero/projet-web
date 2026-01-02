<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;

class HandleInertiaRequests extends Middleware
{
    /**
     * Determine the current asset version.
     */
    public function version(Request $request)
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? $request->user()->only(['id', 'matricule', 'role']) : null,
            ],
            'flash' => [
                'message' => $request->session()->get('message'),
                'errors' => $request->session()->get('errors') ? $request->session()->get('errors')->getBag('default')->getMessages() : new \stdClass(),
            ],
        ]);
    }
}
