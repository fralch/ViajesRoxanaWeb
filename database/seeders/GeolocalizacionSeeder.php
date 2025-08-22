<?php

namespace Database\Seeders;

use App\Models\Geolocalizacion;
use App\Models\Inscripcion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GeolocalizacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $inscripciones = Inscripcion::all();
        
        // Coordenadas de diferentes destinos turísticos en Colombia
        $coordenadas = [
            // Cartagena
            ['lat' => '10.3910', 'lng' => '-75.4794'],
            ['lat' => '10.4236', 'lng' => '-75.5378'],
            // San Andrés
            ['lat' => '12.5847', 'lng' => '-81.7006'],
            ['lat' => '12.5564', 'lng' => '-81.7015'],
            // Bogotá
            ['lat' => '4.7110', 'lng' => '-74.0721'],
            ['lat' => '4.6097', 'lng' => '-74.0817'],
            // Medellín
            ['lat' => '6.2442', 'lng' => '-75.5812'],
            ['lat' => '6.2518', 'lng' => '-75.5636'],
            // Eje Cafetero
            ['lat' => '4.5389', 'lng' => '-75.6814'],
            ['lat' => '5.0689', 'lng' => '-75.5174'],
            // Santa Marta
            ['lat' => '11.2408', 'lng' => '-74.2099'],
            ['lat' => '11.2057', 'lng' => '-74.1813'],
        ];
        
        foreach ($inscripciones as $inscripcion) {
            // 60% de probabilidad de tener geolocalización
            if (rand(1, 100) <= 60) {
                $coordenada = $coordenadas[array_rand($coordenadas)];
                
                // Agregar pequeña variación a las coordenadas
                $latVariacion = (rand(-100, 100) / 10000);
                $lngVariacion = (rand(-100, 100) / 10000);
                
                Geolocalizacion::create([
                    'paquete_id' => $inscripcion->paquete_id,
                    'hijo_id' => $inscripcion->hijo_id,
                    'latitud' => (float)$coordenada['lat'] + $latVariacion,
                    'longitud' => (float)$coordenada['lng'] + $lngVariacion,
                ]);
            }
        }
    }
}
