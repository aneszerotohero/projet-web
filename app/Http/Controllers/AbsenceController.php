<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AbsenceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // TEMP: Return mock data for frontend development if no user is logged in
        if (!$user) {
            $mockData = [
                'student' => [
                    'nom' => 'Benzineb',
                    'prenom' => 'Karim',
                    'academic_year' => '2023-2024',
                    'term' => 'Term 1'
                ],
                'stats' => [
                    'total_hours' => 14,
                    'since_last_month' => 2,
                    'justified_hours' => 10,
                    'unjustified_hours' => 4,
                    'deleted_records' => 2
                ],
                'trends' => [
                    // Mock trend data for last 6 months
                    'months' => ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                    'data' => [2, 0, 4, 3, 2, 3]
                ],
                'absences' => [
                    [
                        'id' => 1,
                        'date' => 'Feb 12, 2024',
                        'module' => 'Mathematics',
                        'time' => '08:00 - 10:00',
                        'type' => 'Unjustified',
                        'status' => 'Active Record',
                        'details' => '-',
                        'is_deleted' => false
                    ],
                    [
                        'id' => 2,
                        'date' => 'Feb 10, 2024',
                        'module' => 'Physics',
                        'time' => '14:00 - 16:00',
                        'type' => 'N/A',
                        'status' => 'Deleted',
                        'details' => 'Teacher error - student was present during lab session.',
                        'is_deleted' => true
                    ],
                    [
                        'id' => 3,
                        'date' => 'Jan 28, 2024',
                        'module' => 'French',
                        'time' => '10:00 - 11:00',
                        'type' => 'Justified',
                        'status' => 'Active Record',
                        'details' => 'Medical Certificate.pdf',
                        'is_deleted' => false
                    ],
                    // Add more if needed...
                ]
            ];

            if (class_exists(\Inertia\Inertia::class)) {
                return \Inertia\Inertia::render('Eleve/Absences', $mockData);
            }
            return response()->json($mockData);
        }

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
            'motif_absence' => 'required|string|max:500',
            'motif_suppression' => 'nullable|string|max:500',
            'justifie' => 'sometimes|boolean',
        ]);

        Absence::create($data);

        return to_route('admin.absences.manage')
            ->with('success', 'Absence créée avec succès');
    }

    public function update(Request $request, Absence $absence)
    {
        $data = $request->validate([
            'date_absence' => 'sometimes|date',
            'motif_absence' => 'sometimes|string|max:500',
            'motif_suppression' => 'nullable|string|max:500',
            'justifie' => 'sometimes|boolean',
        ]);

        $absence->update($data);

        return to_route('admin.absences.manage', [], 303)
            ->with('success', 'Absence mise à jour avec succès');
    }

    public function destroy(Request $request, Absence $absence)
    {
        $data = $request->validate([
            'motif_suppression' => 'nullable|string|max:500',
        ]);

        if (isset($data['motif_suppression'])) {
            $absence->update(['motif_suppression' => $data['motif_suppression']]);
        }

        $absence->delete();

        return to_route('admin.absences.manage', [], 303)
            ->with('success', 'Absence supprimée avec succès');
    }

    public function restore(Request $request, $id)
    {
        $absence = Absence::withTrashed()->findOrFail($id);
        $absence->restore();
        $absence->update(['motif_suppression' => null]);

        return to_route('admin.absences.manage', [], 303)
            ->with('success', 'Absence restaurée avec succès');
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
        $query = Absence::with(['student.user', 'module', 'student.option'])->withTrashed();

        if ($search = $request->get('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhereHas('user', function ($q2) use ($search) {
                      $q2->where('matricule', 'like', "%$search%");
                  });
            });
        }

        if ($moduleId = $request->get('module_id')) {
            $query->where('module_id', $moduleId);
        }

        // Filter by status (Active = not deleted, Deleted = deleted)
        if ($status = $request->get('status')) {
            if ($status === 'Deleted') {
                $query->onlyTrashed();
            } else {
                $query->whereNull('deleted_at');
            }
        } else {
            // Default: show only active (not deleted)
            $query->whereNull('deleted_at');
        }

        // Filter by speciality (by libelle)
        if ($specialiteId = $request->get('specialite_id')) {
            $query->whereHas('student.option.specialite', function ($q) use ($specialiteId) {
                $q->where('id', $specialiteId);
            });
        }

        // Filter by year (année dans la spécialité: 1, 2, ou 3)
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
        $absences = $query->orderByDesc('date_absence')->paginate($perPage);

        return response()->json($absences);
    }

    public function stats()
    {
        $newAbsencesToday = Absence::whereDate('created_at', today())->count();

        $mostAbsentModule = Absence::with('module')
            ->select('module_id', DB::raw('count(*) as total'))
            ->groupBy('module_id')
            ->orderByDesc('total')
            ->first();

        $warningList = \App\Models\Student::whereHas('absences', function($q) {
            $q->where('justifie', false);
        })->get()->filter(function($student) {
            return $student->absences()->where('justifie', false)->count() >= 3;
        })->count();

        return [
            'new_absences' => [
                'value' => number_format($newAbsencesToday, 0),
                'trend' => null,
                'trend_type' => 'up_bad'
            ],
            'most_absent_module' => [
                'value' => $mostAbsentModule && $mostAbsentModule->module ? $mostAbsentModule->module->libelle : 'N/A',
                'subtext' => $mostAbsentModule ? $mostAbsentModule->total . ' absences' : 'No data',
                'icon' => 'Calculator'
            ],
            'warning_list' => [
                'value' => number_format($warningList, 0),
                'subtext' => 'Students approaching limit',
                'trend_type' => 'warning'
            ]
        ];
    }
}
