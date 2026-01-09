<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Coef>
 */
class CoefFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            ['libelle' => 'DS', 'coef' => 2],
            ['libelle' => 'TP', 'coef' => 1],
            ['libelle' => 'Exam', 'coef' => 3],
            ['libelle' => 'Contrôle Continu', 'coef' => 1.5],
            ['libelle' => 'Projet', 'coef' => 2.5],
        ];

        $type = fake()->randomElement($types);

        return [
            'libelle' => $type['libelle'],
            'coef' => $type['coef'],
        ];
    }

    /**
     * Indicate that the coef is a DS (Devoir Surveillé).
     */
    public function ds(): static
    {
        return $this->state(fn (array $attributes) => [
            'libelle' => 'DS',
            'coef' => 2,
        ]);
    }

    /**
     * Indicate that the coef is a TP (Travaux Pratiques).
     */
    public function tp(): static
    {
        return $this->state(fn (array $attributes) => [
            'libelle' => 'TP',
            'coef' => 1,
        ]);
    }

    /**
     * Indicate that the coef is an Exam (Examen).
     */
    public function exam(): static
    {
        return $this->state(fn (array $attributes) => [
            'libelle' => 'Exam',
            'coef' => 3,
        ]);
    }
}

