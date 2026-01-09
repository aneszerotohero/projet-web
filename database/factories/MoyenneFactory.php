<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Student;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Moyenne>
 */
class MoyenneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'semestre' => fake()->randomElement([1, 2]),
            'moyenne' => fake()->randomFloat(2, 0, 20),
        ];
    }

    /**
     * Indicate that the moyenne is for semester 1.
     */
    public function semester1(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 1,
        ]);
    }

    /**
     * Indicate that the moyenne is for semester 2.
     */
    public function semester2(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 2,
        ]);
    }
}

