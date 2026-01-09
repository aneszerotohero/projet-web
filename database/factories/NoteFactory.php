<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Student;
use App\Models\Module;
use App\Models\Coef;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Note>
 */
class NoteFactory extends Factory
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
            'module_id' => Module::factory(),
            'coef_id' => Coef::factory(),
            'note' => fake()->randomFloat(2, 0, 20),
        ];
    }

    /**
     * Generate a note with a good score (between 14 and 20).
     */
    public function good(): static
    {
        return $this->state(fn (array $attributes) => [
            'note' => fake()->randomFloat(2, 14, 20),
        ]);
    }

    /**
     * Generate a note with an average score (between 10 and 14).
     */
    public function average(): static
    {
        return $this->state(fn (array $attributes) => [
            'note' => fake()->randomFloat(2, 10, 14),
        ]);
    }

    /**
     * Generate a note with a poor score (between 0 and 10).
     */
    public function poor(): static
    {
        return $this->state(fn (array $attributes) => [
            'note' => fake()->randomFloat(2, 0, 10),
        ]);
    }
}

