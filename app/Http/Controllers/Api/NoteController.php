<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Student;
use App\Models\Module;
use App\Models\Coef;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Get list of notes (API)
     */
    public function index(Request $request)
    {
        $query = Note::with(['student.user','module','coef']);

        if ($search = $request->get('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhereHas('user', function ($q2) use ($search) {
                      $q2->where('matricule', 'like', "%$search%");
                  });
            })->orWhereHas('module', function ($q) use ($search) {
                $q->where('libelle', 'like', "%$search%");
            });
        }

        if ($moduleId = $request->get('module_id')) {
            $query->where('module_id', $moduleId);
        }

        if ($semester = $request->get('semester')) {
            $query->whereHas('module', function ($q) use ($semester) {
                $q->where('semestre', $semester);
            });
        }

        if ($coefId = $request->get('coef_id')) {
            $query->where('coef_id', $coefId);
        }

        // Filter by speciality (by libelle)
        if ($specialiteId = $request->get('specialite_id')) {
            $query->whereHas('student.option.specialite', function ($q) use ($specialiteId) {
                $q->where('id', $specialiteId);
            });
        }

        // Filter by year
        if ($annee = $request->get('annee')) {
            $query->whereHas('student.option.specialite', function ($q) use ($annee) {
                $q->where('annee', $annee);
            });
        }

        // Filter by option
        if ($optionId = $request->get('option_id')) {
            $query->whereHas('student', function ($q) use ($optionId) {
                $q->where('option_id', $optionId);
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $notes = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($notes);
    }

    /**
     * Get modules for a specific student based on their option's speciality year
     */
    public function getModulesForStudent(Request $request, $studentId)
    {
        $student = Student::with('option.specialite')->findOrFail($studentId);
        
        if (!$student->option || !$student->option->specialite) {
            return response()->json(['modules' => []]);
        }
        
        $specialiteAnnee = $student->option->specialite->annee; // 1, 2, or 3
        
        // Map year to semesters: Year 1 -> S1,S2, Year 2 -> S3,S4, Year 3 -> S5,S6
        $semesters = [];
        if ($specialiteAnnee == 1) {
            $semesters = [1, 2];
        } elseif ($specialiteAnnee == 2) {
            $semesters = [3, 4];
        } elseif ($specialiteAnnee == 3) {
            $semesters = [5, 6];
        }
        
        $modules = Module::whereIn('semestre', $semesters)
            ->select('id', 'libelle', 'semestre')
            ->orderBy('semestre')
            ->orderBy('libelle')
            ->get();
        
        return response()->json(['modules' => $modules]);
    }

    /**
     * Get metadata for filtering/forms
     */
    public function meta()
    {
        $students = Student::select('id','nom','prenom')->get();
        $modules = Module::select('id','libelle','semestre')->get();
        $coefs = Coef::select('id','libelle','coef')->get();

        return response()->json([ 'students' => $students, 'modules' => $modules, 'coefs' => $coefs ]);
    }
}
