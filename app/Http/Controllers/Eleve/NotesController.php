<?php

namespace App\Http\Controllers\Eleve;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Coef;
use Illuminate\Http\Request;

class NotesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user || ! $user->student) {
            abort(404, 'Student not found');
        }

        $student = $user->student;
        $sem = $request->get('semestre') ?? $request->attributes->get('current_semestre', 1);

        $modules = Module::where('semestre', $sem)->get();
        $coefs = Coef::all();

        $grid = $modules->map(function ($m) use ($coefs, $student) {
            $row = ['module_id' => $m->id, 'module' => $m->libelle, 'notes' => []];
            $total = 0; $weights = 0;
            foreach ($coefs as $c) {
                $note = $student->notes()->where('module_id', $m->id)->where('coef_id', $c->id)->first();
                $val = $note ? $note->note : null;
                $row['notes'][$c->id] = $val;

                if ($val !== null) {
                    $w = $c->coef ?? 1;
                    $total += ($val * $w);
                    $weights += $w;
                }
            }
            $row['module_moy'] = $weights > 0 ? ($total / $weights) : null;
            return $row;
        });

        $general = 0; $gweights = 0;
        foreach ($grid as $r) {
            if ($r['module_moy'] !== null) {
                $gweights += 1; // simple average across modules
                $general += $r['module_moy'];
            }
        }
        $general_moy = $gweights > 0 ? ($general / $gweights) : null;

        $payload = [
            'modules' => $grid,
            'coefs' => $coefs,
            'semestre' => (int) $sem,
            'general_moy' => $general_moy,
        ];

        if (class_exists(\Inertia\Inertia::class)) {
            return \Inertia\Inertia::render('Eleve/Notes', $payload);
        }

        return response()->json($payload);
    }
}
