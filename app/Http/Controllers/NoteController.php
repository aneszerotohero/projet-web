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
            'note' => 'required|numeric',
        ]);

        $note = Note::updateOrCreate(
            ['student_id' => $data['student_id'], 'module_id' => $data['module_id'], 'coef_id' => $data['coef_id']],
            ['note' => $data['note']]
        );

        return response()->json($note);
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

        $created = [];

        DB::transaction(function () use ($payload, &$created) {
            foreach ($payload['notes'] as $n) {
                $created[] = Note::updateOrCreate(
                    ['student_id' => $n['student_id'], 'module_id' => $n['module_id'], 'coef_id' => $n['coef_id']],
                    ['note' => $n['note']]
                );
            }
        });

        return response()->json($created);
    }

    public function index(Request $request)
    {
        $query = Note::with(['student','module','coef']);

        if ($search = $request->get('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhere('matricule', 'like', "%$search%");
            })->orWhereHas('module', function ($q) use ($search) {
                $q->where('libelle', 'like', "%$search%");
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $notes = $query->paginate($perPage);

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
            'note' => 'required|numeric',
        ]);

        $note->update($data);

        return response()->json($note);
    }

    public function destroy(Note $note)
    {
        $note->delete();
        return response()->json(['deleted' => true]);
    }
}
