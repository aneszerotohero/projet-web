<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Student;
use App\Models\Module;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Absence>
 */
class AbsenceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $motifs = [
            'Maladie',
            'Rendez-vous médical',
            'Problème de transport',
            'Urgence familiale',
            'Décès dans la famille',
            'Accident',
            'Absence non justifiée',
        ];

        return [
            'student_id' => Student::factory(),
            'module_id' => Module::factory(),
            'date_absence' => fake()->dateTimeBetween('-6 months', 'now'),
            'motif_absence' => fake()->randomElement($motifs),
            'justifie' => fake()->boolean(70), // 70% des absences sont justifiées
            'motif_suppression' => null,
        ];
    }

    /**
     * Indicate that the absence is justified.
     */
    public function justified(): static
    {
        return $this->state(fn (array $attributes) => [
            'justifie' => true,
            'motif_absence' => fake()->randomElement(['Maladie', 'Rendez-vous médical', 'Urgence familiale']),
        ]);
    }

    /**
     * Indicate that the absence is not justified.
     */
    public function unjustified(): static
    {
        return $this->state(fn (array $attributes) => [
            'justifie' => false,
            'motif_absence' => 'Absence non justifiée',
        ]);
    }
}

