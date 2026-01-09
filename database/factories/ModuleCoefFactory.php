<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Module;
use App\Models\Coef;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ModuleCoef>
 */
class ModuleCoefFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'coef_id' => Coef::factory(),
        ];
    }
}

