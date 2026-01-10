<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class AdminStudentTranscriptController extends Controller
{
    public function show(Request $request, $studentId)
    {
        $student = Student::with(['option.specialite', 'user', 'notes.module', 'notes.coef', 'moyennes'])
            ->findOrFail($studentId);
        
        $semester = $request->get('semester');
        
        // Get notes filtered by semester if provided
        $notes = $student->notes()->with(['module', 'coef']);
        if ($semester && $semester !== 'all') {
            $notes->whereHas('module', function ($q) use ($semester) {
                $q->where('semestre', $semester);
            });
        }
        $notes = $notes->orderBy('created_at', 'desc')->get();
        
        // Get modules for the student
        $modules = \App\Models\Module::whereHas('notes', function($q) use ($student) {
            $q->where('student_id', $student->id);
        })->get();
        
        // Get averages by semester
        $moyennes = [];
        for ($i = 1; $i <= 6; $i++) {
            $moy = $student->moyenneParSemestre($i);
            if ($moy > 0) {
                $moyennes[$i] = $moy;
            }
        }
        
        $payload = [
            'student' => $student,
            'notes' => $notes,
            'moyennes' => $moyennes,
            'selected_semester' => $semester,
            'modules' => $modules,
        ];
        
        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('Admin/StudentTranscript', $payload);
        }
        
        return response()->json($payload);
    }
}
