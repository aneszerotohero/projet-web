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
            'Mathématiques I', 'Mathématiques II', 'Mathématiques III',
            'Physique I', 'Physique II',
            'Algorithmique', 'Base de données I', 'Base de données avancées',
            'Programmation I', 'Programmation avancée',
            'Réseaux I', 'Réseaux avancés',
            'Systèmes d\'exploitation I', 'Systèmes d\'exploitation avancés',
            'Gestion de projet I', 'Management de projet',
            'Anglais I', 'Anglais II', 'Anglais technique',
            'Économie', 'Communication', 'Statistiques I', 'Statistiques II',
            'Recherche opérationnelle', 'Sécurité informatique',
            'Architecture des systèmes', 'Architecture logicielle',
            'Intelligence artificielle', 'Cloud Computing', 'Big Data',
            'Projet de fin d\'études I', 'Projet de fin d\'études II',
            'Stage en entreprise', 'Innovation et entrepreneuriat',
            'Éthique professionnelle', 'Droit informatique', 'Gestion d\'entreprise'
        ];

        return [
            'libelle' => fake()->randomElement($modules),
            'semestre' => fake()->randomElement([1, 2, 3, 4, 5, 6]), // S1-S6 selon logique métier
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

    /**
     * Indicate that the module belongs to semester 3.
     */
    public function semester3(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 3,
        ]);
    }

    /**
     * Indicate that the module belongs to semester 4.
     */
    public function semester4(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 4,
        ]);
    }

    /**
     * Indicate that the module belongs to semester 5.
     */
    public function semester5(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 5,
        ]);
    }

    /**
     * Indicate that the module belongs to semester 6.
     */
    public function semester6(): static
    {
        return $this->state(fn (array $attributes) => [
            'semestre' => 6,
        ]);
    }
}

