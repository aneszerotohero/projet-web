<?php

use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth','auth.admin'])->group(function () {
    Route::get('/rankings', [\App\Http\Controllers\Api\FilterController::class, 'rankings']);
    Route::get('/students/search', [\App\Http\Controllers\Api\FilterController::class, 'searchStudents']);
});

// Public-ish endpoints for eleve searching (with auth)
Route::middleware(['auth','auth.eleve'])->group(function () {
    Route::get('/students/search', [\App\Http\Controllers\Api\FilterController::class, 'searchStudents']);
});
