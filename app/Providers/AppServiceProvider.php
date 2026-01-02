<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use App\Models\Note;
use App\Models\User;
use App\Observers\NoteObserver;
use App\Observers\UserObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Note::observe(NoteObserver::class);
        User::observe(UserObserver::class);

        // Share common Inertia props
        Inertia::share([
            'app' => [
                'name' => config('app.name'),
            ],
            'user' => function () {
                return auth()->user() ? auth()->user()->only(['id','matricule','role']) : null;
            },
            // Provide an `auth` object with `user` for Inertia apps that expect `props.auth.user`
            'auth' => function () {
                return [
                    'user' => auth()->user() ? auth()->user()->only(['id','matricule','role']) : null,
                ];
            },
            'flash' => function () {
                return [
                    'message' => session('message'),
                    'errors' => session('errors') ? session('errors')->getBag('default')->getMessages() : new \stdClass(),
                ];
            },
        ]);

        // Register route middleware aliases so they can be used in route definitions
        \Illuminate\Support\Facades\Route::aliasMiddleware('auth.admin', \App\Http\Middleware\AuthAdmin::class);
        \Illuminate\Support\Facades\Route::aliasMiddleware('auth.eleve', \App\Http\Middleware\AuthEleve::class);
        \Illuminate\Support\Facades\Route::aliasMiddleware('current.semester', \App\Http\Middleware\CurrentSemester::class);
        // Inertia middleware alias (uses our HandleInertiaRequests to share auth/flash props)
        \Illuminate\Support\Facades\Route::aliasMiddleware('inertia', \App\Http\Middleware\HandleInertiaRequests::class);
    }
}
