<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        // TEMP: Return mock data for frontend development
        $user = $request->user();
        if (!$user) {
            $mockPodium = [
                [
                    'id' => 1,
                    'nom' => 'Benali',
                    'prenom' => 'Amine',
                    'matricule' => '2023-SCI-045',
                    's1' => 18.25,
                    's2' => 18.75,
                    'moyenne_cycle' => 18.50,
                    'rank' => 1,
                    'avatar' => null // Frontend will handle placeholders
                ],
                [
                    'id' => 2,
                    'nom' => 'Kacem',
                    'prenom' => 'Sara',
                    'matricule' => '2023-SCI-112',
                    's1' => 18.10,
                    's2' => 18.30,
                    'moyenne_cycle' => 18.20,
                    'rank' => 2,
                    'avatar' => null
                ],
                [
                    'id' => 3,
                    'nom' => 'Zidane',
                    'prenom' => 'Omar',
                    'matricule' => '2023-SCI-089',
                    's1' => 17.80,
                    's2' => 18.10,
                    'moyenne_cycle' => 17.95,
                    'rank' => 3,
                    'avatar' => null
                ],
            ];
            
            $mockOthers = [
                [
                    'id' => 4,
                    'nom' => 'Bouzid',
                    'prenom' => 'Yasmine',
                    'matricule' => '2023-SCI-022',
                    's1' => 17.50,
                    's2' => 17.60,
                    'moyenne_cycle' => 17.55,
                    'rank' => 4,
                    'avatar' => null
                ],
                [
                    'id' => 5,
                    'nom' => 'Fekir',
                    'prenom' => 'Karim',
                    'matricule' => '2023-SCI-101',
                    's1' => 16.90,
                    's2' => 17.10,
                    'moyenne_cycle' => 17.00,
                    'rank' => 5,
                    'avatar' => null
                ],
                // Add more mock students if necessary for pagination demo
            ];
            
            $payload = [
                'podium' => $mockPodium,
                'others' => $mockOthers,
                'filters' => [
                    'year' => '2023-2024',
                    'speciality' => 'Science',
                    'option' => 'All',
                    'semester' => 1
                ],
                'ranking_stats' => [
                    'total_students' => ['value' => '1,240', 'trend' => '+5%', 'trend_type' => 'up'],
                    'class_average' => ['value' => '12.45', 'trend' => '+0.2%', 'trend_type' => 'up'],
                    'pass_rate' => ['value' => '88%', 'trend' => '+2%', 'trend_type' => 'up'],
                    'total_absences' => ['value' => '145', 'trend' => '-10%', 'trend_type' => 'down_good'], // 'down_good' implies negative decrease is positive
                ],
            ];
            
            if (class_exists(\Inertia\Inertia::class)) {
                return \Inertia\Inertia::render('Admin/Dashboard', $payload);
            }
            return response()->json($payload);
        }
        
        $filters = $request->only(['annee','specialite_id','option_id','group','search']);
        $annee = $filters['annee'] ?? null; // annee = 1, 2, ou 3 (année dans la spécialité)
        $specialite = $filters['specialite_id'] ?? null;
        $option = $filters['option_id'] ?? null;
        $search = $filters['search'] ?? null;
        $semestre = $request->get('semester'); // S1-S6 ou null pour moyenne de cycle

        $query = Student::with(['option.specialite', 'user']);

        if ($option) {
            $query->where('option_id', $option);
        }
        if ($specialite) {
            $query->whereHas('option', function ($q) use ($specialite) {
                $q->where('specialite_id', $specialite);
            });
        }
        // Filter by annee (année dans la spécialité: 1, 2, ou 3)
        if ($annee) {
            $query->whereHas('option.specialite', function ($q) use ($annee) {
                $q->where('annee', $annee);
            });
        }
        if ($search) {
            $query->search($search);
        }

        $students = $query->get()->map(function ($s) use ($semestre) {
            $s->matricule = $s->user?->matricule ?? 'N/A';
            
            if ($semestre && $semestre !== 'cycle') {
                // Calculate average for specific semester (S1-S6)
                $sem = (int) $semestre;
                $s->moyenne_semestre = $s->moyenneParSemestre($sem);
                // For display purposes, keep s1 and s2 for compatibility
                $s->s1 = $sem <= 2 ? ($sem === 1 ? $s->moyenne_semestre : 0) : 0;
                $s->s2 = $sem <= 2 ? ($sem === 2 ? $s->moyenne_semestre : 0) : 0;
                $s->moyenne_cycle = $s->moyenne_semestre;
            } else {
                // Calculate cycle average: average of all existing semesters (S1-S6)
                $moyennes = [];
                for ($i = 1; $i <= 6; $i++) {
                    $moy = $s->moyenneParSemestre($i);
                    if ($moy > 0) {
                        $moyennes[] = $moy;
                    }
                }
                $s->moyenne_cycle = count($moyennes) > 0 ? array_sum($moyennes) / count($moyennes) : 0;
                // For display, calculate S1 and S2 if they exist
                $s->s1 = $s->moyenneParSemestre(1);
                $s->s2 = $s->moyenneParSemestre(2);
            }
            
            return $s;
        });

        // Sort order: moyenne_cycle (descending) or moyenne_semestre if specific semester
        $sortKey = ($semestre && $semestre !== 'cycle') ? 'moyenne_semestre' : 'moyenne_cycle';
        $students = $students->sortByDesc($sortKey)->values();

        // Add rank to each student
        $students = $students->map(function ($student, $index) {
            $student->rank = $index + 1;
            return $student;
        });

        // podium (top 3)
        $podium = $students->take(3)->values();
        $others = $students->slice(3)->values();

        // Calculate statistics
        $totalStudents = $students->count();
        $classAverage = $students->count() > 0 ? $students->avg('moyenne_cycle') : 0;
        $passRate = $students->count() > 0 
            ? ($students->filter(fn($s) => $s->moyenne_cycle >= 10)->count() / $students->count()) * 100 
            : 0;
        
        $totalAbsences = \App\Models\Absence::whereIn('student_id', $students->pluck('id'))->count();

        // Get specialities and options for filters
        $specialites = \App\Models\Specialite::with('options')->get();
        $options = \App\Models\Option::all();
        
        // Group specialites by libelle only (without year)
        $specialitesByLibelle = $specialites->groupBy('libelle')->map(function ($group) {
            return [
                'libelle' => $group->first()->libelle,
                'specialites' => $group->values() // All specialites with this libelle (different years)
            ];
        });

        // Get filter labels
        $specialityLabel = 'All';
        if ($specialite) {
            $spec = \App\Models\Specialite::find($specialite);
            $specialityLabel = $spec ? $spec->libelle : 'All'; // Only libelle, no year
        }

        $optionLabel = 'All';
        if ($option) {
            $opt = \App\Models\Option::find($option);
            $optionLabel = $opt ? $opt->libelle : 'All';
        }
        
        $yearLabel = $annee ? 'Année ' . $annee : 'All';

        $payload = [
            'podium' => $podium,
            'others' => $others,
            'filters' => [
                'year' => $annee,
                'year_label' => $yearLabel,
                'speciality' => $specialityLabel,
                'specialite_id' => $specialite,
                'option' => $optionLabel,
                'option_id' => $option,
                'semester' => $semestre ?? 'cycle',
                'search' => $search
            ],
            'ranking_stats' => [
                'total_students' => [
                    'value' => number_format($totalStudents, 0, ',', ','),
                    'trend' => null,
                    'trend_type' => 'up'
                ],
                'class_average' => [
                    'value' => number_format($classAverage, 2, '.', ''),
                    'trend' => null,
                    'trend_type' => $classAverage >= 10 ? 'up' : 'down'
                ],
                'pass_rate' => [
                    'value' => number_format($passRate, 0) . '%',
                    'trend' => null,
                    'trend_type' => $passRate >= 50 ? 'up' : 'down'
                ],
                'total_absences' => [
                    'value' => number_format($totalAbsences, 0, ',', ','),
                    'trend' => null,
                    'trend_type' => 'down_good'
                ],
            ],
            'available_filters' => [
                'specialites' => $specialites,
                'specialites_by_libelle' => $specialitesByLibelle, // Grouped by libelle only
                'options' => $options,
                'years' => [1, 2, 3], // Années possibles dans une spécialité
                'semesters' => [
                    ['value' => 'cycle', 'label' => 'Moyenne de cycle'],
                    ['value' => 1, 'label' => 'S1 (1ère année - 1er semestre)'],
                    ['value' => 2, 'label' => 'S2 (1ère année - 2e semestre)'],
                    ['value' => 3, 'label' => 'S3 (2e année - 1er semestre)'],
                    ['value' => 4, 'label' => 'S4 (2e année - 2e semestre)'],
                    ['value' => 5, 'label' => 'S5 (3e année - 1er semestre)'],
                    ['value' => 6, 'label' => 'S6 (3e année - 2e semestre)'],
                ]
            ]
        ];

        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('Admin/Dashboard', $payload);
        }

        return response()->json($payload);
    }
}
