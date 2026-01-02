<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Student;
use App\Models\Module;
use App\Models\Absence;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AbsenceControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_soft_delete_absence_with_motif()
    {
        $student = Student::factory()->create();
        $module = Module::create(['libelle' => 'Anglais', 'semestre' => 1]);

        $absence = Absence::create([
            'student_id' => $student->id,
            'module_id' => $module->id,
            'date_absence' => now()->toDateString(),
            'motif_absence' => 'Retard',
        ]);

        // create admin
        $admin = User::create([
            'matricule' => 'ADMIN001',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        $response = $this->actingAs($admin)->deleteJson('/admin/absences/' . $absence->id, ['motif_suppression' => 'Erreur']);
        $response->assertStatus(200)->assertJson(['deleted' => true]);

        $this->assertSoftDeleted('absence', ['id' => $absence->id]);
        $this->assertDatabaseHas('absence', ['id' => $absence->id, 'motif_suppression' => 'Erreur']);
    }
}
