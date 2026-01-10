<?php

use Illuminate\Support\Facades\Route;

// Shared endpoints for both Admin and Eleve
Route::middleware(['auth'])->group(function () {
    Route::get('/students/search', [\App\Http\Controllers\Api\FilterController::class, 'searchStudents']);
    Route::get('/students/{student}/modules', [\App\Http\Controllers\Api\NoteController::class, 'getModulesForStudent']);
    Route::get('/notes', [\App\Http\Controllers\Api\NoteController::class, 'index']);
});

Route::prefix('admin')->middleware(['auth','auth.admin'])->group(function () {
    Route::get('/rankings', [\App\Http\Controllers\Api\FilterController::class, 'rankings']);
});

// Student specific endpoints
Route::prefix('student')->middleware(['auth','auth.eleve'])->group(function () {
    Route::get('/notes', [\App\Http\Controllers\Api\StudentNoteController::class, 'index']);
    Route::get('/modules', [\App\Http\Controllers\Api\StudentNoteController::class, 'modules']);
    Route::get('/absences', [\App\Http\Controllers\Api\StudentAbsenceController::class, 'index']);
    Route::get('/rankings', [\App\Http\Controllers\Api\FilterController::class, 'rankings']); // Reuse existing if suitable
});
