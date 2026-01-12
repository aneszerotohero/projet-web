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
        $notes = $notes->orderBy('module_id')->orderBy('created_at', 'desc')->get();
        
        // Group notes by module and calculate module averages
        $notesByModule = $notes->groupBy('module_id')->map(function ($moduleNotes, $moduleId) {
            $module = $moduleNotes->first()->module;
            $sum = 0;
            $totalWeight = 0;
            
            foreach ($moduleNotes as $note) {
                $weight = $note->coef->coef ?? 1;
                $sum += $note->note * $weight;
                $totalWeight += $weight;
            }
            
            $average = $totalWeight > 0 ? $sum / $totalWeight : 0;
            
            return [
                'module' => $module,
                'notes' => $moduleNotes->values()->all(),
                'average' => round($average, 2),
                'total_weight' => $totalWeight,
                'notes_count' => $moduleNotes->count(),
            ];
        })->values();
        
        // Get modules for the student (for filter dropdown)
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
        
        // Calculate general average for filtered semester
        $generalAverage = $notesByModule->count() > 0
            ? $notesByModule->sum('average') / $notesByModule->count()
            : 0;
        
        $payload = [
            'student' => $student,
            'notes' => $notes, // Keep flat list for backward compatibility if needed
            'notes_by_module' => $notesByModule, // New: Pre-grouped data
            'moyennes' => $moyennes,
            'selected_semester' => $semester,
            'modules' => $modules,
            'general_average' => round($generalAverage, 2),
        ];
        
        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('Admin/StudentTranscript', $payload);
        }
        
        return response()->json($payload);
    }
}
