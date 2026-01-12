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
Route::prefix('student')->middleware(['auth','auth.eleve','current.semester'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\StudentDashboardController::class, 'index'])->name('eleve.dashboard');
    Route::get('/notes', [\App\Http\Controllers\StudentDashboardController::class, 'notes'])->name('eleve.notes');
    Route::get('/absences', [\App\Http\Controllers\StudentDashboardController::class, 'absences'])->name('eleve.absences');
    
    // Student mutations
    Route::post('/notes/correction', [\App\Http\Controllers\StudentDashboardController::class, 'requestCorrection'])->name('eleve.notes.correction');
    Route::post('/absences/request', [\App\Http\Controllers\StudentDashboardController::class, 'requestJustification'])->name('eleve.absences.request');
});
  // Notes & absences management
  Route::post('/admin/notes/single', [\App\Http\Controllers\NoteController::class, 'storeSingle']);
  Route::post('/admin/notes/bulk', [\App\Http\Controllers\NoteController::class, 'storeBulk']);
  Route::patch('/admin/notes/{note}', [\App\Http\Controllers\NoteController::class, 'update']);
  Route::delete('/admin/notes/{note}', [\App\Http\Controllers\NoteController::class, 'destroy']);

  Route::get('/admin/absences', [\App\Http\Controllers\AbsenceController::class, 'indexAdmin']);
  Route::post('/admin/absences', [\App\Http\Controllers\AbsenceController::class, 'store']);
  Route::patch('/admin/absences/{absence}', [\App\Http\Controllers\AbsenceController::class, 'update']);
  Route::delete('/admin/absences/{absence}', [\App\Http\Controllers\AbsenceController::class, 'destroy']);
  Route::post('/admin/absences/{id}/restore', [\App\Http\Controllers\AbsenceController::class, 'restore'])->name('admin.absences.restore');
  Route::get('/admin/absences/filter', [\App\Http\Controllers\AbsenceController::class, 'filter']);
  
 
// Admin dashboard
Route::middleware(['auth','auth.admin'])->group(function () {
   
    Route::get('/admin/dashboard', [\App\Http\Controllers\AdminDashboardController::class, 'index'])->name('admin.dashboard');
    // Admin SPA pages
   // Dans web.php, remplace temporairement le bloc Route::get('/admin/notes/manage', ...) par :
Route::get('/admin/notes/manage', function () {
    return \Inertia\Inertia::render('Admin/Notes', [
        'meta' => [],
        'res' => [],
        'stats' => [],
        'filters' => [],
        'available_filters' => [],
    ]);
})->name('admin.notes.manage');

    Route::get('/admin/absences/manage', function (\Illuminate\Http\Request $request) {
        $absenceController = app(\App\Http\Controllers\AbsenceController::class);
        $resResp = $absenceController->indexAdmin($request);
        $res = $resResp instanceof \Illuminate\Http\JsonResponse ? $resResp->getData(true) : $resResp;
        $stats = $absenceController->stats();
        $modules = \App\Models\Module::select('id','libelle')->get();
        $students = \App\Models\Student::select('id','nom','prenom')->with('user:id,student_id,matricule')->get();
        
        // Get specialities and options for filters
        $specialites = \App\Models\Specialite::with('options')->get();
        $options = \App\Models\Option::all();
        $specialitesByLibelle = $specialites->groupBy('libelle')->map(function ($group) {
            return [
                'libelle' => $group->first()->libelle,
                'specialites' => $group->values()
            ];
        });
        
        return \Inertia\Inertia::render('Admin/Absences', [
            'res' => $res,
            'stats' => $stats,
            'modules' => $modules,
            'students' => $students,
            'filters' => $request->only(['search', 'module_id', 'status', 'annee', 'specialite_id', 'option_id']) + ['status' => $request->get('status', 'Active')],
            'available_filters' => [
                'specialites' => $specialites,
                'specialites_by_libelle' => $specialitesByLibelle,
                'options' => $options,
                'years' => [1, 2, 3],
            ],
        ]);
    })->name('admin.absences.manage');

  
    // Student transcript for admin
    Route::get('/admin/students/{student}/transcript', [\App\Http\Controllers\AdminStudentTranscriptController::class, 'show'])->name('admin.students.transcript');
    Route::get('/admin/students/{student}/transcript/export', [\App\Http\Controllers\AdminStudentTranscriptExportController::class, 'export'])->name('admin.students.transcript.export');
    
    // Dashboard export
    Route::get('/admin/dashboard/export', [\App\Http\Controllers\AdminDashboardExportController::class, 'export'])->name('admin.dashboard.export');
    
    // Import CSV for notes
    Route::post('/admin/notes/import', [\App\Http\Controllers\NoteController::class, 'importCsv'])->name('admin.notes.import');
});
