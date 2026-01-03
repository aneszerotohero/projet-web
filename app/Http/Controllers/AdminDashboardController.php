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
        $annee = $filters['annee'] ?? 3;
        $specialite = $filters['specialite_id'] ?? null;
        $option = $filters['option_id'] ?? null;
        $search = $filters['search'] ?? null;

        $sem1 = 1; $sem2 = 2;

        $query = Student::with('option.specialite');

        if ($option) $query->where('option_id', $option);
        if ($specialite) $query->whereHas('option', function ($q) use ($specialite) {
            $q->where('specialite_id', $specialite);
        });

        $students = $query->get()->map(function ($s) use ($sem1,$sem2) {
            $s->s1 = $s->moyenneParSemestre($sem1);
            $s->s2 = $s->moyenneParSemestre($sem2);
            $s->moyenne_cycle = ($s->s1 + $s->s2) / 2;
            return $s;
        });

        // Sort order: s1, s2, moyenne_cycle (descending)
        $students = $students->sortByDesc('moyenne_cycle')->values();

        // podium
        $podium = $students->take(3);
        $others = $students->slice(3);

        $payload = ['podium' => $podium, 'others' => $others];

        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('Admin/Dashboard', $payload);
        }

        return response()->json($payload);
    }
}
