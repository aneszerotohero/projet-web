<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $studentId = $user->student_id ?? ($user->student->id ?? null);
        if (! $studentId) {
            abort(404, 'Student not found.');
        }

        $absences = Absence::with('module')
            ->where('student_id', $studentId)
            ->withTrashed()
            ->orderByDesc('date_absence')
            ->get();

        return view('eleve.absences.index', compact('absences'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'module_id' => 'required|exists:modules,id',
            'date_absence' => 'required|date',
            'motif_absence' => 'required|string',
            'motif_suppression' => 'nullable|string',
            'justifie' => 'sometimes|boolean',
        ]);

        $absence = Absence::create($data);

        return response()->json($absence);
    }

    public function update(Request $request, Absence $absence)
    {
        $data = $request->validate([
            'date_absence' => 'sometimes|date',
            'motif_absence' => 'sometimes|string',
            'motif_suppression' => 'nullable|string',
            'justifie' => 'sometimes|boolean',
        ]);

        $absence->update($data);

        return response()->json($absence);
    }

    public function destroy(Request $request, Absence $absence)
    {
        $data = $request->validate([
            'motif_suppression' => 'nullable|string',
        ]);

        if (isset($data['motif_suppression'])) {
            $absence->update(['motif_suppression' => $data['motif_suppression']]);
        }

        $absence->delete();

        return response()->json(['deleted' => true]);
    }

    public function filter(Request $request)
    {
        $query = Absence::query();

        if ($request->has('module_id')) {
            $query->where('module_id', $request->get('module_id'));
        }

        if ($request->has('date_from')) {
            $query->whereDate('date_absence', '>=', $request->get('date_from'));
        }

        if ($request->has('date_to')) {
            $query->whereDate('date_absence', '<=', $request->get('date_to'));
        }

        return response()->json($query->with('student','module')->get());
    }

    public function indexAdmin(Request $request)
    {
        $query = Absence::with('student','module')->withTrashed();

        if ($search = $request->get('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhere('matricule', 'like', "%$search%");
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $absences = $query->orderByDesc('date_absence')->paginate($perPage);

        return response()->json($absences);
    }
}
