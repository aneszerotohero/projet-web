<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Specialite>
 */
class SpecialiteFactory extends Factory
{
    public function definition(): array
    {
        $libelles = ['Informatique', 'Électronique', 'Mécanique'];
        
        return [
            'libelle' => fake()->randomElement($libelles),
            'annee' => fake()->randomElement([1, 2, 3]), // Année dans la spécialité (1, 2, ou 3)
        ];
    }
}
