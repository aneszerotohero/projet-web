<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Module;
use App\Models\Coef;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EleveNotesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login()
    {
        $response = $this->get('/eleve/notes');
        $response->assertRedirect('/login');
    }

    public function test_student_can_view_notes()
    {
        $student = Student::factory()->create();
        $user = User::create([
            'matricule' => '0', // placeholder until associated with Student
            'role' => 'eleve',
            'password' => Hash::make('password'),
        ]);
        // attach student to user
        $user->student()->associate($student);
        $user->save();

        // Observer should set matricule from student_id
        $this->assertEquals((string) $student->id, $user->matricule);

        // seed a module and a coef
        $module = Module::create(['libelle' => 'Maths', 'semestre' => 1]);
        $coef = Coef::create(['libelle' => 'CC', 'coef' => 1]);

        $response = $this->actingAs($user)->get('/eleve/notes');
        $response->assertStatus(200);
        // If the route returns HTML (Inertia page), ensure the notes page content is present
        $content = $response->getContent();
        // Inertia renders the page client-side; verify the server returned the Inertia page for Eleve/Notes
        $this->assertStringContainsString('Eleve\/Notes', $content);
    }
}
