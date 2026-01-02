<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

// Use Inertia when available
use function class_exists;

class StudentDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user || ! $user->student) {
            abort(404, 'Student not found for user');
        }

        $sem = $request->get('semestre') ?? $request->attributes->get('current_semestre', 1);

        $student = $user->student()->with(['notes.module','notes.coef','moyennes'])->first();

        $moyenneSem = $student->moyenneParSemestre((int) $sem);
        $moyennesParModule = $student->moyennesParModule((int) $sem);

        $payload = [
            'student' => $student,
            'semestre' => (int) $sem,
            'moyenne_semestre' => $moyenneSem,
            'moyennes_par_module' => $moyennesParModule,
        ];

        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('Eleve/Dashboard', $payload);
        }

        return response()->json($payload);
    }
}
