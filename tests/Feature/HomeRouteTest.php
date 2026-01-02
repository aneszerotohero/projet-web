<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class HomeRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_sees_home_inertia()
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $content = $response->getContent();
        // Inertia renders content client-side; assert the server returned the Home component marker
        $this->assertStringContainsString('component&quot;:&quot;Home&quot;', $content);
    }

    public function test_authenticated_admin_redirects_to_admin_dashboard()
    {
        $admin = User::create(['matricule' => 'ADMIN', 'role' => 'admin', 'password' => Hash::make('password')]);
        $this->actingAs($admin)->get('/')->assertRedirect('/admin/dashboard');
    }

    public function test_authenticated_eleve_redirects_to_eleve_dashboard()
    {
        $eleve = User::create(['matricule' => 'S1', 'role' => 'eleve', 'password' => Hash::make('password')]);
        $this->actingAs($eleve)->get('/')->assertRedirect('/eleve/dashboard');
    }
}
