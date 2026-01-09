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
        $query = Absence::with(['student.user', 'module'])->withTrashed();

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
