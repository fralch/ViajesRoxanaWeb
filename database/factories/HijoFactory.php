<?php

namespace Database\Factories;

use App\Models\Hijo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class HijoFactory extends Factory
{
    protected $model = Hijo::class;

    public function definition(): array
    {
        $nombres = [
            'Sofía García', 'Mateo López', 'Isabella Rodríguez', 'Santiago Martínez',
            'Valentina Hernández', 'Sebastián González', 'Camila Pérez', 'Nicolás Sánchez'
        ];

        $pasatiempos = [
            ['Leer', 'Dibujar', 'Videojuegos'],
            ['Música', 'Baile', 'Teatro'],
            ['Pintura', 'Manualidades', 'Cocinar'],
            ['Fotografía', 'Escritura', 'Cine']
        ];

        $deportes = [
            ['Fútbol', 'Natación'],
            ['Baloncesto', 'Tenis'],
            ['Voleibol', 'Atletismo'],
            ['Ciclismo', 'Patinaje']
        ];

        $platos = [
            'Pizza', 'Hamburguesa', 'Pasta', 'Pollo asado', 'Tacos',
            'Sushi', 'Lasaña', 'Arroz con pollo', 'Empanadas', 'Hot dogs'
        ];

        $colores = [
            'Azul', 'Rosa', 'Verde', 'Rojo', 'Morado',
            'Amarillo', 'Naranja', 'Negro', 'Blanco', 'Turquesa'
        ];

        $edad = $this->faker->numberBetween(8, 17);
        $fechaNacimiento = now()->subYears($edad)->subDays($this->faker->numberBetween(0, 365));

        return [
            'user_id' => User::factory(),
            'nombres' => $this->faker->randomElement($nombres),
            'doc_tipo' => $this->faker->randomElement(['TI', 'CC']),
            'doc_numero' => $this->faker->numberBetween(1000000000, 9999999999),
            'nums_emergencia' => [
                '310' . $this->faker->numberBetween(1000000, 9999999),
                '320' . $this->faker->numberBetween(1000000, 9999999)
            ],
            'fecha_nacimiento' => $fechaNacimiento->format('Y-m-d'),
            'foto' => null,
            'pasatiempos' => implode(', ', $this->faker->randomElement($pasatiempos)),
            'deportes' => implode(', ', $this->faker->randomElement($deportes)),
            'plato_favorito' => $this->faker->randomElement($platos),
            'color_favorito' => $this->faker->randomElement($colores),
            'informacion_adicional' => $this->faker->sentence(),
            'password_hijo' => bcrypt('password'),
        ];
    }
}