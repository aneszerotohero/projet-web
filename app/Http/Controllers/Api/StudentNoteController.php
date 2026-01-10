<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StudentNoteController extends Controller
{
    /**
     * Get paginated list of notes for the authenticated student.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $student = $user->student;
        $query = $student->notes()->with(['module', 'coef']);

        // Filters
        if ($search = $request->get('search')) {
            $query->whereHas('module', function ($q) use ($search) {
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

        if ($annee = $request->get('annee')) {
            // Assuming notes are linked to an academic year, or filter by created_at
            // For now, let's filter by created_at year if 'annee' is just a number
            // Or better, via module/semester logical year if applicable.
            // Simplified: Filter by created_at year
             $query->whereYear('created_at', $annee);
        }

        $perPage = (int) $request->get('per_page', 15);
        $notes = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($notes);
    }

    /**
     * Get list of modules available for the student (for filter dropdowns).
     */
    public function modules(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->student) {
            return response()->json([], 404);
        }

        // Return modules that the student has notes in, or all modules for their specialite
        // Option 1: All modules for their specialite (better for filters)
        $student = $user->student->load('option.specialite.modules');
        
        $modules = [];
        if ($student->option && $student->option->specialite) {
             $modules = $student->option->specialite->modules()->select('id', 'libelle', 'semestre')->get();
        }

        return response()->json(['modules' => $modules]);
    }
}
