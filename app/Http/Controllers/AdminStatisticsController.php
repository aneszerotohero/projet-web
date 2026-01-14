<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Absence;
use App\Models\Student;
use App\Models\Module;
use Illuminate\Http\Request;

class AdminStatisticsController extends Controller
{
    public function index(Request $request)
    {
        // Get filter parameters
        $year = $request->get('annee');
        $specialite = $request->get('specialite_id');
        $option = $request->get('option_id');

        // Build base query for students
        $studentQuery = Student::query();

        if ($year) {
            $studentQuery->whereHas('option.specialite', fn($q) => $q->where('annee', $year));
        }
        if ($specialite) {
            $studentQuery->whereHas('option.specialite', fn($q) => $q->where('id', $specialite));
        }
        if ($option) {
            $studentQuery->where('option_id', $option);
        }

        $studentIds = $studentQuery->pluck('id');

        // 1. Absence statistics (Justified vs Unjustified)
        $absenceStats = [
            'justified' => Absence::whereIn('student_id', $studentIds)->where('justifie', true)->count(),
            'unjustified' => Absence::whereIn('student_id', $studentIds)->where('justifie', false)->count(),
        ];

        // 2. Average grades by module - Filter modules based on students' notes
        // Get modules that have notes from the filtered students
        $moduleIds = Note::whereIn('student_id', $studentIds)
            ->distinct()
            ->pluck('module_id');
        
        $moduleStats = Module::whereIn('id', $moduleIds)
            ->select('id', 'libelle', 'semestre')
            ->get()
            ->map(function ($module) use ($studentIds) {
                $avg = Note::where('module_id', $module->id)
                    ->whereIn('student_id', $studentIds)
                    ->avg('note');
                return [
                    'name' => $module->libelle,
                    'average' => round($avg ?? 0, 2),
                ];
            })
            ->filter(function ($module) {
                return $module['average'] > 0;
            })
            ->values();

        // 3. Student performances (Top 3)
        $topStudents = Student::whereIn('id', $studentIds)
            ->with('option.specialite')
            ->get()
            ->map(function ($student) {
                $avg = $student->notes()->avg('note') ?? 0;
                return [
                    'id' => $student->id,
                    'nom' => $student->nom,
                    'prenom' => $student->prenom,
                    'average' => round($avg, 2),
                    'option' => $student->option?->libelle ?? 'N/A',
                ];
            })
            ->sortByDesc('average')
            ->take(3)
            ->values();

        // 4. KPI Cards
        $totalStudents = $studentIds->count();
        $totalAbsences = Absence::whereIn('student_id', $studentIds)->count();
        $averageGrade = Note::whereIn('student_id', $studentIds)->avg('note') ?? 0;
        $failingStudents = Student::whereIn('id', $studentIds)
            ->whereHas('moyennes', fn($q) => $q->where('moyenne', '<', 10))
            ->count();

        // Get available filters
        $specialites = \App\Models\Specialite::select('id', 'libelle', 'annee')->get();
        $options = \App\Models\Option::select('id', 'libelle', 'specialite_id')->get();
        $years = \App\Models\Specialite::select('annee')->distinct()->pluck('annee')->sort()->values()->toArray();

        // Group specialites by libelle
        $specialitesByLibelle = [];
        foreach ($specialites as $spec) {
            if (!isset($specialitesByLibelle[$spec->libelle])) {
                $specialitesByLibelle[$spec->libelle] = [
                    'libelle' => $spec->libelle,
                    'specialites' => []
                ];
            }
            $specialitesByLibelle[$spec->libelle]['specialites'][] = $spec;
        }

        return \Inertia\Inertia::render('Admin/Statistics', [
            'kpis' => [
                'total_students' => $totalStudents,
                'total_absences' => $totalAbsences,
                'average_grade' => round($averageGrade, 2),
                'failing_students' => $failingStudents,
            ],
            'absence_stats' => $absenceStats,
            'module_stats' => $moduleStats,
            'top_students' => $topStudents,
            'filters' => $request->only(['annee', 'specialite_id', 'option_id']),
            'available_filters' => [
                'specialites' => $specialites,
                'specialites_by_libelle' => $specialitesByLibelle,
                'options' => $options,
                'years' => $years,
            ],
        ]);
    }
}
