<?php

namespace Database\Seeders;

use App\Models\Hijo;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HijoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $usuarios = User::where('is_admin', false)->get();
        
        $nombres = [
            'Sofía García', 'Mateo López', 'Isabella Rodríguez', 'Santiago Martínez',
            'Valentina Hernández', 'Sebastián González', 'Camila Pérez', 'Nicolás Sánchez',
            'Mariana Torres', 'Diego Ramírez', 'Antonella Flores', 'Emiliano Castro'
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
        
        foreach ($usuarios as $usuario) {
            // Cada usuario puede tener 1-3 hijos
            $numHijos = rand(1, 3);
            
            for ($i = 0; $i < $numHijos; $i++) {
                $nombre = $nombres[array_rand($nombres)];
                $edad = rand(8, 17);
                $fechaNacimiento = now()->subYears($edad)->subDays(rand(0, 365));
                
                Hijo::create([
                    'user_id' => $usuario->id,
                    'nombres' => $nombre,
                    'doc_tipo' => rand(0, 1) ? 'TI' : 'CC',
                    'doc_numero' => rand(1000000000, 9999999999),
                    'nums_emergencia' => [
                        '310' . rand(1000000, 9999999),
                        '320' . rand(1000000, 9999999)
                    ],
                    'fecha_nacimiento' => $fechaNacimiento->format('Y-m-d'),
                    'foto' => null,
                    'pasatiempos' => implode(', ', $pasatiempos[array_rand($pasatiempos)]),
                    'deportes' => implode(', ', $deportes[array_rand($deportes)]),
                    'plato_favorito' => $platos[array_rand($platos)],
                    'color_favorito' => $colores[array_rand($colores)],
                    'informacion_adicional' => 'Información adicional sobre ' . $nombre
                ]);
            }
        }
    }
}
