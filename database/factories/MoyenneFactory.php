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
            'semestre' => fake()->randomElement([1, 2, 3, 4, 5, 6]), // S1-S6 selon logique métier
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

    /**
     * Indicate that the moyenne is for semester 3.
     */
    public function semester3(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 3,
        ]);
    }

    /**
     * Indicate that the moyenne is for semester 4.
     */
    public function semester4(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 4,
        ]);
    }

    /**
     * Indicate that the moyenne is for semester 5.
     */
    public function semester5(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 5,
        ]);
    }

    /**
     * Indicate that the moyenne is for semester 6.
     */
    public function semester6(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 6,
        ]);
    }
}

