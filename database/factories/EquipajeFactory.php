<?php

namespace Database\Factories;

use App\Models\Equipaje;
use App\Models\Hijo;
use Illuminate\Database\Eloquent\Factories\Factory;

class EquipajeFactory extends Factory
{
    protected $model = Equipaje::class;

    public function definition(): array
    {
        return [
            'hijo_id' => Hijo::factory(),
            'tip_maleta' => $this->faker->randomElement(['Maleta de 8 kg', 'Maleta de 23 kg']),
            'num_etiqueta' => $this->faker->optional()->regexify('[A-Z]{3}[0-9]{3}'),
            'color' => $this->faker->optional()->colorName(),
            'caracteristicas' => $this->faker->optional()->sentence(),
            'peso' => $this->faker->optional()->randomFloat(2, 1, 30),
            'images' => null,
            'images1' => null,
            'images2' => null,
            'lugar_regis' => $this->faker->optional()->city(),
        ];
    }
}