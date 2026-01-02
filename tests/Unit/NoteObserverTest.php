<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Student;
use App\Models\Module;
use App\Models\Coef;
use App\Models\Note;
use App\Models\Moyenne;

class NoteObserverTest extends TestCase
{
    use RefreshDatabase;

    public function test_moyenne_is_created_updated_and_deleted()
    {
        $student = Student::factory()->create();
        $module = Module::create(['libelle' => 'Physique', 'semestre' => 1]);
        $coef1 = Coef::create(['libelle' => 'CC', 'coef' => 1]);
        $coef2 = Coef::create(['libelle' => 'Exam', 'coef' => 2]);

        // create notes
        Note::create([ 'student_id' => $student->id, 'module_id' => $module->id, 'coef_id' => $coef1->id, 'note' => 10 ]);
        Note::create([ 'student_id' => $student->id, 'module_id' => $module->id, 'coef_id' => $coef2->id, 'note' => 8 ]);

        // Expected weighted average: (10*1 + 8*2) / (1+2) = (10 + 16)/3 = 8.666...
        $this->assertDatabaseHas('moyennes', [
            'student_id' => $student->id,
            'semestre' => 1,
        ]);

        $m = Moyenne::where('student_id', $student->id)->where('semestre', 1)->first();
        $this->assertNotNull($m);
        $this->assertEqualsWithDelta((10*1 + 8*2)/3, (float) $m->moyenne, 0.001);

        // Update a note
        $note = Note::where('student_id', $student->id)->where('coef_id', $coef1->id)->first();
        $note->update(['note' => 12]); // new average (12*1 + 8*2)/3 = (12+16)/3 = 9.333...

        $m = Moyenne::where('student_id', $student->id)->where('semestre', 1)->first();
        $this->assertEqualsWithDelta((12*1 + 8*2)/3, (float) $m->moyenne, 0.001);

        // Delete notes one by one (use model delete to trigger observer) and assert moyenne is removed when none remain
        foreach (Note::where('student_id', $student->id)->get() as $nn) {
            $nn->delete();
        }

        $this->assertDatabaseMissing('moyennes', [
            'student_id' => $student->id,
            'semestre' => 1,
        ]);
    }
}
