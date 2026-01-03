<?php

namespace App\Http\Controllers\Eleve;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Coef;
use Illuminate\Http\Request;

class NotesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // TEMP: Return mock data for frontend development if no user is logged in
        if (! $user || ! $user->student) {
            $mockPayload = [
                'student' => [
                    'nom' => 'Benali',
                    'prenom' => 'Amine',
                    'class_name' => '12th Grade (Science)',
                    'academic_year' => '2023-2024',
                ],
                'stats' => [
                    'general_avg' => 14.50,
                    'highest_module' => ['name' => 'Physics', 'score' => 18.00],
                    'lowest_module' => ['name' => 'History', 'score' => 09.00],
                    'total_absences' => ['hours' => 4, 'unjustified' => 2],
                    'passing_status' => 'Admis',
                ],
                'grade_distribution' => [
                    '0-9' => 2,
                    '10-12' => 5,
                    '13-15' => 8,
                    '16-20' => 4
                ],
                'performance_trend' => [
                    'months' => ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB'],
                    'data' => [10, 12, 11.5, 13.8, 14.2, 16.5]
                ],
                'detailed_grades' => [
                     [
                        'id' => 1,
                        'date' => 'Jan 15, 2024',
                        'module' => 'Physics',
                        'type' => 'Devoir (DS)',
                        'coef' => 4,
                        'grade' => 18.00,
                        'weighted' => 72.00,
                        'status' => 'passed'
                    ],
                    [
                        'id' => 2,
                        'date' => 'Jan 12, 2024',
                        'module' => 'Mathematics',
                        'type' => 'Examen',
                        'coef' => 5,
                        'grade' => 14.50,
                        'weighted' => 72.50,
                        'status' => 'passed'
                    ],
                    [
                        'id' => 3,
                        'date' => 'Jan 10, 2024',
                        'module' => 'Arabic Literature',
                        'type' => 'TD',
                        'coef' => 3,
                        'grade' => 16.00,
                        'weighted' => 48.00,
                        'status' => 'passed'
                    ],
                    [
                        'id' => 4,
                        'date' => 'Jan 08, 2024',
                        'module' => 'History & Geo',
                        'type' => 'Devoir (DS)',
                        'coef' => 2,
                        'grade' => 8.50,
                        'weighted' => 17.00,
                        'status' => 'failed'
                    ],
                    [
                        'id' => 5,
                        'date' => 'Jan 05, 2024',
                        'module' => 'Natural Sciences',
                        'type' => 'TP',
                        'coef' => 5,
                        'grade' => 15.50,
                        'weighted' => 77.50,
                        'status' => 'passed'
                    ],
                    [
                        'id' => 6,
                        'date' => 'Dec 22, 2023',
                        'module' => 'French',
                        'type' => 'Devoir (DS)',
                        'coef' => 2,
                        'grade' => 12.00,
                        'weighted' => 24.00,
                        'status' => 'passed'
                    ]
                ],
                // Keeping legacy structure for compatibility if needed, but primary is above
                'modules' => [
                    [
                        'module_id' => 1,
                        'module' => 'Mathématiques',
                        'notes' => [1 => 15.5, 2 => 14.0, 3 => 16.0, 4 => 15.0],
                        'module_moy' => 15.2,
                    ],
                    // ... (legacy modules can be simplified or kept if specific components rely on them)
                ],
                'coefs' => [
                    ['id' => 1, 'libelle' => 'DS', 'coef' => 2],
                    ['id' => 2, 'libelle' => 'TD', 'coef' => 1],
                    ['id' => 3, 'libelle' => 'TP', 'coef' => 1],
                    ['id' => 4, 'libelle' => 'Exam', 'coef' => 3],
                ],
                'semestre' => 1,
                'general_moy' => 14.6,
            ];
            
            if (class_exists(\Inertia\Inertia::class)) {
                return \Inertia\Inertia::render('Eleve/Notes', $mockPayload);
            }
            return response()->json($mockPayload);
        }

        $student = $user->student;
        $sem = $request->get('semestre') ?? $request->attributes->get('current_semestre', 1);

        $modules = Module::where('semestre', $sem)->get();
        $coefs = Coef::all();

        $grid = $modules->map(function ($m) use ($coefs, $student) {
            $row = ['module_id' => $m->id, 'module' => $m->libelle, 'notes' => []];
            $total = 0; $weights = 0;
            foreach ($coefs as $c) {
                $note = $student->notes()->where('module_id', $m->id)->where('coef_id', $c->id)->first();
                $val = $note ? $note->note : null;
                $row['notes'][$c->id] = $val;

                if ($val !== null) {
                    $w = $c->coef ?? 1;
                    $total += ($val * $w);
                    $weights += $w;
                }
            }
            $row['module_moy'] = $weights > 0 ? ($total / $weights) : null;
            return $row;
        });

        $general = 0; $gweights = 0;
        foreach ($grid as $r) {
            if ($r['module_moy'] !== null) {
                $gweights += 1; // simple average across modules
                $general += $r['module_moy'];
            }
        }
        $general_moy = $gweights > 0 ? ($general / $gweights) : null;

        $payload = [
            'modules' => $grid,
            'coefs' => $coefs,
            'semestre' => (int) $sem,
            'general_moy' => $general_moy,
        ];

        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('Eleve/Notes', $payload);
        }

        return response()->json($payload);
    }
}
