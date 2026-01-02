<?php

namespace App\Observers;

use App\Models\Moyenne;
use App\Models\Note;

class NoteObserver
{
    protected function recalc(Note $note): void
    {
        $studentId = $note->student_id;
        $module = $note->module;
        if (! $module) {
            // If relation not loaded (deleted scenario), try to fetch
            $module = \App\Models\Module::find($note->module_id);
            if (! $module) {
                return;
            }
        }

        $sem = $module->semestre;

        $notes = Note::where('student_id', $studentId)
            ->whereHas('module', function ($q) use ($sem) {
                $q->where('semestre', $sem);
            })->with('coef')->get();

        if ($notes->isEmpty()) {
            Moyenne::where('student_id', $studentId)->where('semestre', $sem)->delete();
            return;
        }

        $sum = 0.0;
        $weights = 0.0;

        foreach ($notes as $n) {
            $w = $n->coef?->coef ?? 1;
            $sum += ($n->note * $w);
            $weights += $w;
        }

        $moy = $weights > 0 ? ($sum / $weights) : 0.0;

        Moyenne::updateOrCreate(
            ['student_id' => $studentId, 'semestre' => $sem],
            ['moyenne' => $moy]
        );
    }

    public function created(Note $note): void
    {
        $this->recalc($note);
    }

    public function updated(Note $note): void
    {
        $this->recalc($note);
    }

    public function deleted(Note $note): void
    {
        // After delete, $note->module relation may be null if relations were eager; try to reload if needed
        $this->recalc($note);
    }
}
