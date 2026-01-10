<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class FilterController extends Controller
{
    public function rankings(Request $request)
    {
        $sem = $request->get('semestre', 1);
        $specialite = $request->get('specialite_id');
        $option = $request->get('option_id');

        $query = Student::with('option.specialite');
        if ($option) $query->where('option_id', $option);
        if ($specialite) $query->whereHas('option', function ($q) use ($specialite) {
            $q->where('specialite_id', $specialite);
        });

        $students = $query->get()->map(function ($s) use ($sem) {
            $s->note_sem = $s->moyenneParSemestre((int) $sem);
            return $s;
        })->sortByDesc('note_sem')->values();

        return response()->json($students);
    }

    public function searchStudents(Request $request)
    {
        $term = $request->get('q');
        if (!$term || strlen($term) < 2) {
            return response()->json([]);
        }
        
        $students = Student::search($term)
            ->with(['user:id,student_id,matricule'])
            ->select('id', 'nom', 'prenom', 'option_id')
            ->with('option:id,libelle')
            ->limit(20)
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'nom' => $student->nom,
                    'prenom' => $student->prenom,
                    'matricule' => $student->user?->matricule ?? 'N/A',
                    'option' => $student->option?->libelle ?? 'N/A',
                ];
            });
        
        return response()->json($students);
    }
}
