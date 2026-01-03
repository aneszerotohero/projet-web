<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
       return \Inertia\Inertia::render('Home');
})->name('home');

// Auth
Route::get('/login', [\App\Http\Controllers\AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);
Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout'])->name('logout');

// Student dashboard
Route::middleware(['auth','auth.eleve','current.semester'])->group(function () {
    Route::get('/eleve/dashboard', [\App\Http\Controllers\StudentDashboardController::class, 'index'])->name('eleve.dashboard');
    Route::get('/eleve/absences', [\App\Http\Controllers\AbsenceController::class, 'index'])->name('eleve.absences');
    Route::get('/eleve/notes', [\App\Http\Controllers\Eleve\NotesController::class, 'index'])->name('eleve.notes');
});

// Admin dashboard
Route::middleware(['auth','auth.admin'])->group(function () {
    Route::get('/admin/dashboard', [\App\Http\Controllers\AdminDashboardController::class, 'index'])->name('admin.dashboard');
    // Admin SPA pages
    Route::get('/admin/notes/manage', function (\Illuminate\Http\Request $request) {
        $metaResp = app(\App\Http\Controllers\NoteController::class)->meta();
        $meta = $metaResp instanceof \Illuminate\Http\JsonResponse ? $metaResp->getData(true) : $metaResp;
        $resResp = app(\App\Http\Controllers\NoteController::class)->index($request);
        $res = $resResp instanceof \Illuminate\Http\JsonResponse ? $resResp->getData(true) : $resResp;
        return \Inertia\Inertia::render('Admin/Notes', [
            'meta' => $meta,
            'res' => $res,
        ]);
    })->name('admin.notes.manage');

    Route::get('/admin/absences/manage', function (\Illuminate\Http\Request $request) {
        $resResp = app(\App\Http\Controllers\AbsenceController::class)->indexAdmin($request);
        $res = $resResp instanceof \Illuminate\Http\JsonResponse ? $resResp->getData(true) : $resResp;
        return \Inertia\Inertia::render('Admin/Absences', [
            'res' => $res,
        ]);
    })->name('admin.absences.manage');

    // Notes & absences management
    Route::get('/admin/notes', [\App\Http\Controllers\NoteController::class, 'index']);
    Route::get('/admin/notes/meta', [\App\Http\Controllers\NoteController::class, 'meta']);
    Route::post('/admin/notes/single', [\App\Http\Controllers\NoteController::class, 'storeSingle']);
    Route::post('/admin/notes/bulk', [\App\Http\Controllers\NoteController::class, 'storeBulk']);
    Route::patch('/admin/notes/{note}', [\App\Http\Controllers\NoteController::class, 'update']);
    Route::delete('/admin/notes/{note}', [\App\Http\Controllers\NoteController::class, 'destroy']);

    Route::get('/admin/absences', [\App\Http\Controllers\AbsenceController::class, 'indexAdmin']);
    Route::post('/admin/absences', [\App\Http\Controllers\AbsenceController::class, 'store']);
    Route::patch('/admin/absences/{absence}', [\App\Http\Controllers\AbsenceController::class, 'update']);
    Route::delete('/admin/absences/{absence}', [\App\Http\Controllers\AbsenceController::class, 'destroy']);
    Route::get('/admin/absences/filter', [\App\Http\Controllers\AbsenceController::class, 'filter']);
});
