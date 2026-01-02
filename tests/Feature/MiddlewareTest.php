<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class MiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_eleve_middleware_allows_eleves_and_blocks_others()
    {
        // register temporary route for test
        Route::middleware(['auth.eleve'])->get('/_test-auth-eleve', function () {
            return response()->json(['ok' => true]);
        });

        // guest should be forbidden
        $this->getJson('/_test-auth-eleve')->assertStatus(403);

        // admin should be forbidden
        $admin = User::create(['matricule' => 'A1', 'role' => 'admin', 'password' => Hash::make('password')]);
        $this->actingAs($admin)->getJson('/_test-auth-eleve')->assertStatus(403);

        // eleve allowed
        $eleve = User::create(['matricule' => 'S1', 'role' => 'eleve', 'password' => Hash::make('password')]);
        $this->actingAs($eleve)->getJson('/_test-auth-eleve')->assertStatus(200)->assertJson(['ok' => true]);
    }

    public function test_current_semester_middleware_sets_semester_and_absolute_semester_with_cohort()
    {
        // route for testing
        Route::middleware(['current.semester'])->get('/_test-current-sem', function (\Illuminate\Http\Request $r) {
            return response()->json([
                'sem' => $r->attributes->get('current_semestre'),
                'label' => $r->attributes->get('current_semestre_label'),
            ]);
        });

        // Set time to October (month 10) -> semInYear = 1
        Carbon::setTestNow(Carbon::create(2026, 10, 1));

        $res = $this->getJson('/_test-current-sem');
        $res->assertStatus(200)->assertJson(['sem' => 1, 'label' => 'S1']);

        // Test absolute semester with cohort_start_year = 2024
        $res2 = $this->getJson('/_test-current-sem?cohort_start_year=2024');
        // academicYearStart = 2026 -> academicYearNumber = (2026 - 2024) + 1 = 3 -> absoluteSem = ((3-1)*2)+1 = 5
        $res2->assertStatus(200)->assertJson(['sem' => 5, 'label' => 'S5']);

        Carbon::setTestNow(); // clear
    }
}
