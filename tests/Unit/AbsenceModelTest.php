<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Student;
use App\Models\Module;
use App\Models\Absence;

class AbsenceModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_absence_soft_delete_preserves_record()
    {
        $student = Student::factory()->create();
        $module = Module::create(['libelle' => 'Histoire', 'semestre' => 1]);

        $absence = Absence::create([
            'student_id' => $student->id,
            'module_id' => $module->id,
            'date_absence' => now()->toDateString(),
            'motif_absence' => 'Maladie',
        ]);

        $absence->delete();

        $this->assertSoftDeleted('absence', ['id' => $absence->id]);
        $this->assertDatabaseHas('absence', ['id' => $absence->id, 'motif_absence' => 'Maladie']);
    }
}
