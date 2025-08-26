<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Geolocalizacion;
use App\Models\Hijo;
use App\Models\Paquete;
use App\Models\Inscripcion;
use Carbon\Carbon;

class GeolocalizacionSeeder extends Seeder
{
    /**
     * Ejecuta el seeder de datos de geolocalización
     */
    public function run(): void
    {
        // Primero crear datos específicos para hijo ID 23
        $this->createHijo23Data();
        
        // Luego crear datos generales para otras inscripciones
        $this->createGeneralData();
    }

    private function createHijo23Data(): void
    {
        // Crear hijo de prueba si no existe
        $hijo = Hijo::firstOrCreate([
            'id' => 23
        ], [
            'user_id' => 1, // Asumiendo que existe user ID 1
            'nombres' => 'Leonardo Calderon',
            'doc_tipo' => 'TI',
            'doc_numero' => '1234567890',
            'nums_emergencia' => json_encode(['3001234567', '3009876543']),
            'fecha_nacimiento' => '2010-05-15',
            'pasatiempos' => 'Videojuegos, Lectura',
            'deportes' => 'Fútbol, Natación',
            'plato_favorito' => 'Pizza',
            'color_favorito' => 'Azul',
            'informacion_adicional' => 'Niño alegre y responsable'
        ]);

        // Crear paquete de prueba si no existe
        $paquete = Paquete::firstOrCreate([
            'id' => 1
        ], [
            'nombre' => 'Excursión Escolar Bogotá',
            'destino' => 'Centro Histórico de Bogotá',
            'descripcion' => 'Tour educativo por el centro histórico de la ciudad',
            'activo' => true
        ]);

        // Eliminar datos previos del hijo 23
        Geolocalizacion::where('hijo_id', 23)->delete();

        // Generar ruta ficticia desde casa al colegio y luego por el centro histórico
        $locations = [
            // Ruta desde casa (norte de Bogotá)
            [4.6500, -74.0600, 'Casa - Salida'],
            [4.6450, -74.0650, 'Avenida Caracas'],
            [4.6400, -74.0700, 'Calle 72'],
            [4.6350, -74.0750, 'Zona Rosa'],
            [4.6300, -74.0780, 'Calle 63'],
            [4.6250, -74.0800, 'Universidad Nacional'],
            [4.6200, -74.0820, 'Calle 45'],
            [4.6150, -74.0830, 'Chapinero'],
            [4.6100, -74.0840, 'Zona Centro'],
            
            // Centro histórico (destino)
            [4.6000, -74.0850, 'Plaza de Bolívar'],
            [4.5980, -74.0860, 'Catedral Primada'],
            [4.5970, -74.0855, 'Palacio de Justicia'],
            [4.5990, -74.0845, 'Capitolio Nacional'],
            [4.6020, -74.0870, 'Casa de Nariño'],
            [4.6010, -74.0880, 'Teatro Colón'],
            [4.6040, -74.0860, 'Museo del Oro'],
            [4.6050, -74.0850, 'Biblioteca Luis Ángel Arango'],
            [4.6030, -74.0840, 'Plaza de Armas'],
            [4.6000, -74.0830, 'Mercado de Pulgas'],
            
            // Regreso
            [4.6080, -74.0820, 'Regreso - Calle 19'],
            [4.6120, -74.0800, 'Avenida Jiménez'],
            [4.6160, -74.0780, 'TransMilenio Universidades'],
            [4.6200, -74.0760, 'Calle 32'],
            [4.6250, -74.0740, 'Zona Industrial'],
            [4.6300, -74.0720, 'Calle 53'],
            [4.6350, -74.0700, 'Regreso Chapinero'],
            [4.6400, -74.0680, 'Calle 72 - Regreso'],
            [4.6450, -74.0660, 'Zona Norte'],
            [4.6500, -74.0640, 'Llegada a Casa']
        ];

        $now = Carbon::now();
        
        foreach ($locations as $index => $location) {
            Geolocalizacion::create([
                'paquete_id' => $paquete->id,
                'hijo_id' => 23,
                'latitud' => $location[0],
                'longitud' => $location[1],
                'created_at' => $now->copy()->subMinutes(count($locations) - $index - 1)->subMinutes(rand(0, 2)),
                'updated_at' => $now->copy()->subMinutes(count($locations) - $index - 1)->subMinutes(rand(0, 2))
            ]);
        }

        // Agregar algunas ubicaciones adicionales más recientes (simulando movimiento actual)
        $recentLocations = [
            [4.6505, -74.0635, 'Ubicación Actual - Parque'],
            [4.6508, -74.0632, 'Cerca del Parque'],
            [4.6510, -74.0630, 'Camino a Casa']
        ];

        foreach ($recentLocations as $index => $location) {
            Geolocalizacion::create([
                'paquete_id' => $paquete->id,
                'hijo_id' => 23,
                'latitud' => $location[0],
                'longitud' => $location[1],
                'created_at' => $now->copy()->subMinutes(5 - $index),
                'updated_at' => $now->copy()->subMinutes(5 - $index)
            ]);
        }

        $this->command->info('✅ Datos específicos creados para hijo ID 23 (Leonardo Calderon)');
        $this->command->info('📍 Total de puntos: ' . (count($locations) + count($recentLocations)));
        $this->command->info('🗺️ Última ubicación: ' . end($recentLocations)[2]);
    }

    private function createGeneralData(): void
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
            // Saltar si es el hijo 23 (ya creado arriba)
            if ($inscripcion->hijo_id == 23) {
                continue;
            }
            
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

        $this->command->info('✅ Datos generales de geolocalización creados para otras inscripciones');
    }
}
