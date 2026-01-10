<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StudentAbsenceController extends Controller
{
    /**
     * Get paginated list of absences for the authenticated student.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $student = $user->student;
        $query = $student->absences()->with('module');

        // Filters
        if ($moduleId = $request->get('module_id')) {
            $query->where('module_id', $moduleId);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status); // e.g., 'Justified', 'Unjustified'
        }

        if ($date = $request->get('date')) {
            $query->whereDate('date', $date);
        }

        $perPage = (int) $request->get('per_page', 15);
        $absences = $query->orderByDesc('date')->paginate($perPage);

        return response()->json($absences);
    }
}
