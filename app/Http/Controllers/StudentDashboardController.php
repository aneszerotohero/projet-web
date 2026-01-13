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

        // TEMP: Return mock data for frontend development if no user is logged in
        if (! $user || ! $user->student) {
            $mockPayload = [
                'student' => [
                    'id' => 1,
                    'nom' => 'Benali',
                    'prenom' => 'Amine',
                    'matricule' => 'STU2024001',
                    'date_naissance' => '2005-03-15',
                    'adresse' => '123 Rue de la Paix, Alger',
                ],
                'semestre' => 2,
                'annee' => '2023-2024',
                'moyenne_semestre' => 14.50,
                'moyenne_generale' => 13.80, // Cumulative
                'progression_semestre' => 0.50,
                'progression_generale' => 0.2,
                'moyennes_par_module' => [
                    [
                        'id' => 1,
                        'module' => 'Mathématiques',
                        'code' => 'MATH',
                        'coef' => 5,
                        'ds' => 12.00,
                        'td' => 14.50,
                        'tp' => null,
                        'exam' => 13.00,
                        'moyenne' => 13.10
                    ],
                    [
                        'id' => 2,
                        'module' => 'Physique',
                        'code' => 'PHYS',
                        'coef' => 4,
                        'ds' => 8.50,
                        'td' => 12.00,
                        'tp' => 13.50,
                        'exam' => 8.00,
                        'moyenne' => 9.80
                    ],
                    [
                        'id' => 3,
                        'module' => 'Littérature Arabe',
                        'code' => 'ARAB',
                        'coef' => 3,
                        'ds' => 15.00,
                        'td' => 16.00,
                        'tp' => null,
                        'exam' => 15.50,
                        'moyenne' => 15.40
                    ],
                    [
                        'id' => 4,
                        'module' => 'Sciences Naturelles',
                        'code' => 'SCI',
                        'coef' => 5,
                        'ds' => 10.00,
                        'td' => 11.00,
                        'tp' => 12.00,
                        'exam' => 11.50,
                        'moyenne' => 11.30
                    ],
                    [
                        'id' => 5,
                        'module' => 'Anglais',
                        'code' => 'ENG',
                        'coef' => 2,
                        'ds' => 16.50,
                        'td' => 17.00,
                        'tp' => null,
                        'exam' => 14.00,
                        'moyenne' => 15.10
                    ],
                ],
                'classement' => [
                    'rank' => 5,
                    'total' => 32,
                ],
                'absences_stats' => [
                    'total' => 4,
                    'unjustified' => 2,
                    'justified' => 2,
                ],
                'chart_data' => [
                    'labels' => ['MATH', 'PHYS', 'ARAB', 'SCI', 'ENG'],
                    'student' => [13.10, 9.80, 15.40, 11.30, 15.10],
                    'class_avg' => [11.50, 10.20, 12.50, 10.80, 13.00],
                ],
                'current_semestre' => 'S1',
            ];

            if (class_exists(\Inertia\Inertia::class)) {
                return \Inertia\Inertia::render('Eleve/Dashboard', $mockPayload);
            }
            return response()->json($mockPayload);
        }

        $sem = $request->get('semestre') ?? $request->attributes->get('current_semestre', 1);

        $student = $user->student()->with(['notes.module','notes.coef','moyennes'])->first();

        $moyenneSem = $student->moyenneParSemestre((int) $sem);
        $moyennesParModule = $student->moyennesParModule((int) $sem);

        // Ensure it's a list for JSON serialization if it's a collection or assoc array
        if ($moyennesParModule instanceof \Illuminate\Support\Collection) {
            $moyennesParModule = $moyennesParModule->values();
        } else if (is_array($moyennesParModule)) {
            $moyennesParModule = array_values($moyennesParModule);
        }

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

    public function notes()
    {
        return \Inertia\Inertia::render('Eleve/Notes');
    }

    public function absences()
    {
        return \Inertia\Inertia::render('Eleve/Absences');
    }

    public function requestCorrection(Request $request)
    {
        // Placeholder for correction logic
        // $request->validate([...]);
        // CorrectionRequest::create([...]);

        return to_route('eleve.notes', [], 303)
            ->with('success', 'Demande de correction envoyée');
    }

    public function requestJustification(Request $request)
    {
        // Placeholder for justification logic
        // $request->validate([...]);
        // Justification::create([...]);

        return to_route('eleve.absences', [], 303)
            ->with('success', 'Demande de justification envoyée');
    }
}
