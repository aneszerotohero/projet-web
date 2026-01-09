<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Module>
 */
class ModuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $modules = [
            'Mathématiques', 'Physique', 'Chimie', 'Informatique', 'Algorithmique',
            'Base de données', 'Réseaux', 'Systèmes d\'exploitation', 'Programmation',
            'Électronique', 'Mécanique', 'Gestion de projet', 'Anglais', 'Français',
            'Économie', 'Communication', 'Statistiques', 'Recherche opérationnelle'
        ];

        return [
            'libelle' => fake()->randomElement($modules),
            'semestre' => fake()->randomElement([1, 2]),
            'coef' => fake()->randomFloat(2, 1, 5),
        ];
    }

    /**
     * Indicate that the module belongs to semester 1.
     */
    public function semester1(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 1,
        ]);
    }

    /**
     * Indicate that the module belongs to semester 2.
     */
    public function semester2(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 2,
        ]);
    }
}

