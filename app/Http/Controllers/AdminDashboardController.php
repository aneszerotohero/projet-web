<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
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
