<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NoteController extends Controller
{
    // create or update single note
    public function storeSingle(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'module_id' => 'required|exists:modules,id',
            'coef_id' => 'required|exists:coef,id',
            'note' => 'required|numeric|min:0|max:20',
        ]);

        Note::updateOrCreate(
            ['student_id' => $data['student_id'], 'module_id' => $data['module_id'], 'coef_id' => $data['coef_id']],
            ['note' => $data['note']]
        );

        return response()->noContent();
    }

    // bulk creation: array of notes
    public function storeBulk(Request $request)
    {
        $payload = $request->validate([
            'notes' => 'required|array',
            'notes.*.student_id' => 'required|exists:students,id',
            'notes.*.module_id' => 'required|exists:modules,id',
            'notes.*.coef_id' => 'required|exists:coef,id',
            'notes.*.note' => 'required|numeric',
        ]);

        DB::transaction(function () use ($payload) {
            foreach ($payload['notes'] as $n) {
                Note::updateOrCreate(
                    ['student_id' => $n['student_id'], 'module_id' => $n['module_id'], 'coef_id' => $n['coef_id']],
                    ['note' => $n['note']]
                );
            }
        });

        return response()->noContent();
    }

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

    public function meta()
    {
        $students = \App\Models\Student::select('id','nom','prenom')->get();
        $modules = \App\Models\Module::select('id','libelle','semestre')->get();
        $coefs = \App\Models\Coef::select('id','libelle','coef')->get();

        return response()->json([ 'students' => $students, 'modules' => $modules, 'coefs' => $coefs ]);
    }

    public function update(Request $request, Note $note)
    {
        $data = $request->validate([
            'student_id' => 'sometimes|exists:students,id',
            'module_id' => 'sometimes|exists:modules,id',
            'coef_id' => 'sometimes|exists:coef,id',
            'note' => 'required|numeric|min:0|max:20',
        ]);

        $note->update($data);
// On redirige explicitement vers la route de gestion
         return redirect()->route('admin.notes.manage')->with('success', 'Action effectuée avec succès');
    }

    public function destroy(Request $request, Note $note)
    {
        $note->delete();
        
        return response()->noContent();
    }

    public function stats()
    {
        $allNotes = Note::with('student')->get();
        $averageGpa = $allNotes->count() > 0 ? $allNotes->avg('note') : 0;
        $failingStudents = \App\Models\Student::whereHas('moyennes', function($q) {
            $q->where('moyenne', '<', 10);
        })->distinct()->count();
        $gradesToday = Note::whereDate('created_at', today())->count();
        
        return [
            'average_gpa' => [
                'value' => number_format($averageGpa, 1),
                'trend' => null,
                'trend_type' => 'up'
            ],
            'failing_students' => [
                'value' => number_format($failingStudents, 0),
                'trend' => null,
                'trend_type' => 'down_good'
            ],
            'grades_today' => [
                'value' => number_format($gradesToday, 0),
                'trend' => null,
                'trend_type' => 'up'
            ]
        ];
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));
        
        // Skip header row
        $header = array_shift($data);
        
        $imported = 0;
        $errors = [];
        
        DB::transaction(function () use ($data, &$imported, &$errors) {
            foreach ($data as $index => $row) {
                try {
                    // Expected CSV format: student_matricule, module_libelle, coef_libelle, note
                    if (count($row) < 4) {
                        $errors[] = "Row " . ($index + 2) . ": Insufficient columns";
                        continue;
                    }
                    
                    $matricule = trim($row[0]);
                    $moduleLibelle = trim($row[1]);
                    $coefLibelle = trim($row[2]);
                    $note = (float) trim($row[3]);
                    
                    // Find student by matricule
                    $student = \App\Models\Student::whereHas('user', function($q) use ($matricule) {
                        $q->where('matricule', $matricule);
                    })->first();
                    
                    if (!$student) {
                        $errors[] = "Row " . ($index + 2) . ": Student with matricule '{$matricule}' not found";
                        continue;
                    }
                    
                    // Find module
                    $module = \App\Models\Module::where('libelle', $moduleLibelle)->first();
                    if (!$module) {
                        $errors[] = "Row " . ($index + 2) . ": Module '{$moduleLibelle}' not found";
                        continue;
                    }
                    
                    // Find coef
                    $coef = \App\Models\Coef::where('libelle', $coefLibelle)->first();
                    if (!$coef) {
                        $errors[] = "Row " . ($index + 2) . ": Coefficient '{$coefLibelle}' not found";
                        continue;
                    }
                    
                    // Validate note
                    if ($note < 0 || $note > 20) {
                        $errors[] = "Row " . ($index + 2) . ": Note must be between 0 and 20";
                        continue;
                    }
                    
                    // Create or update note
                    Note::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'module_id' => $module->id,
                            'coef_id' => $coef->id,
                        ],
                        ['note' => $note]
                    );
                    
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
                }
            }
        });

        return response()->noContent();
    }
}
