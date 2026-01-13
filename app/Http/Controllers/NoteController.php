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

        return to_route('admin.notes.manage')
            ->with('success', 'Note créée avec succès');
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

        return to_route('admin.notes.manage')
            ->with('success', 'Notes créées avec succès');
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

        // Force HTTP 303 (See Other) pour que le navigateur convertisse PATCH en GET
        return redirect()->route('admin.notes.manage', [], 303)
            ->with('success', 'Note mise à jour avec succès');
    }

    public function destroy(Request $request, Note $note)
    {
        $note->delete();

        return to_route('admin.notes.manage', [], 303)
            ->with('success', 'Note supprimée avec succès');
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

        try {
            $file = $request->file('file');
            $path = $file->getRealPath();
            $data = array_map('str_getcsv', file($path));

            // Skip header row
            $header = array_shift($data);

            if (empty($data)) {
                return back()->withErrors(['file' => 'Le fichier est vide']);
            }

            $imported = 0;
            $errors = [];

            DB::transaction(function () use ($data, &$imported, &$errors) {
                foreach ($data as $index => $row) {
                    try {
                        // Expected CSV format: student_matricule, module_libelle, coef_libelle, note
                        if (count($row) < 4) {
                            $errors[] = "Ligne " . ($index + 2) . ": Colonnes insuffisantes";
                            continue;
                        }

                        $matricule = trim($row[0]);
                        $moduleLibelle = trim($row[1]);
                        $coefLibelle = trim($row[2]);
                        $note = (float) trim($row[3]);

                        // Skip empty rows
                        if (empty($matricule) || empty($moduleLibelle) || empty($coefLibelle)) {
                            continue;
                        }

                        // Find student by matricule
                        $student = \App\Models\Student::whereHas('user', function($q) use ($matricule) {
                            $q->where('matricule', $matricule);
                        })->first();

                        if (!$student) {
                            $errors[] = "Ligne " . ($index + 2) . ": Étudiant avec matricule '{$matricule}' non trouvé";
                            continue;
                        }

                        // Find module
                        $module = \App\Models\Module::where('libelle', $moduleLibelle)->first();
                        if (!$module) {
                            $errors[] = "Ligne " . ($index + 2) . ": Module '{$moduleLibelle}' non trouvé";
                            continue;
                        }

                        // Find coef
                        $coef = \App\Models\Coef::where('libelle', $coefLibelle)->first();
                        if (!$coef) {
                            $errors[] = "Ligne " . ($index + 2) . ": Coefficient '{$coefLibelle}' non trouvé";
                            continue;
                        }

                        // Validate note
                        if ($note < 0 || $note > 20) {
                            $errors[] = "Ligne " . ($index + 2) . ": La note doit être entre 0 et 20";
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
                        $errors[] = "Ligne " . ($index + 2) . ": " . $e->getMessage();
                    }
                }
            });

            // If all rows had errors, return error
            if ($imported === 0 && !empty($errors)) {
                $errorMessage = implode(' | ', array_slice($errors, 0, 5));
                if (count($errors) > 5) {
                    $errorMessage .= ' ... et ' . (count($errors) - 5) . ' autres erreurs';
                }
                return back()->withErrors(['file' => $errorMessage]);
            }

            // Return success even with some errors
            $message = "$imported note(s) importée(s) avec succès";
            if (!empty($errors)) {
                $message .= " (" . count($errors) . " erreurs rencontrées)";
            }

            return to_route('admin.notes.manage')
                ->with('success', $message);

        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Erreur lors de l\'import: ' . $e->getMessage()]);
        }
    }

    public function manage(Request $request)
    {
        // Get notes with filters
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

        if ($specialiteId = $request->get('specialite_id')) {
            $query->whereHas('student.option.specialite', function ($q) use ($specialiteId) {
                $q->where('id', $specialiteId);
            });
        }

        if ($annee = $request->get('annee')) {
            $query->whereHas('student.option.specialite', function ($q) use ($annee) {
                $q->where('annee', $annee);
            });
        }

        if ($optionId = $request->get('option_id')) {
            $query->whereHas('student', function ($q) use ($optionId) {
                $q->where('option_id', $optionId);
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $notesData = $query->orderByDesc('created_at')->paginate($perPage);

        // Get metadata (students, modules, coefs, etc.)
        $students = \App\Models\Student::select('id','nom','prenom')->get();
        $modules = \App\Models\Module::select('id','libelle','semestre')->get();
        $coefs = \App\Models\Coef::select('id','libelle','coef')->get();

        $metaData = [
            'students' => $students,
            'modules' => $modules,
            'coefs' => $coefs
        ];

        // Get statistics
        $allNotes = Note::with('student')->get();
        $averageGpa = $allNotes->count() > 0 ? $allNotes->avg('note') : 0;
        $failingStudents = \App\Models\Student::whereHas('moyennes', function($q) {
            $q->where('moyenne', '<', 10);
        })->distinct()->count();
        $gradesToday = Note::whereDate('created_at', today())->count();

        $statsData = [
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

        // Get available filters (specialites, options, years)
        $specialites = \App\Models\Specialite::select('id', 'libelle', 'annee')->get();
        $options = \App\Models\Option::select('id', 'libelle', 'specialite_id')->get();
        $years = \App\Models\Specialite::select('annee')->distinct()->pluck('annee')->sort()->values()->toArray();

        // Group specialites by libelle with proper structure
        $specialitesByLibelle = [];
        foreach ($specialites as $spec) {
            if (!isset($specialitesByLibelle[$spec->libelle])) {
                $specialitesByLibelle[$spec->libelle] = [
                    'libelle' => $spec->libelle,
                    'specialites' => []
                ];
            }
            $specialitesByLibelle[$spec->libelle]['specialites'][] = $spec;
        }

        $availableFilters = [
            'specialites' => $specialites,
            'options' => $options,
            'years' => $years,
            'specialites_by_libelle' => $specialitesByLibelle,
        ];

        return \Inertia\Inertia::render('Admin/Notes', [
            'res' => $notesData,
            'meta' => $metaData,
            'stats' => $statsData,
            'filters' => $request->all(),
            'available_filters' => $availableFilters,
        ]);
    }
}
