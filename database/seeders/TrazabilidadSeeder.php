<?php

namespace Database\Seeders;

use App\Models\Trazabilidad;
use App\Models\Inscripcion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TrazabilidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $inscripciones = Inscripcion::with(['grupo', 'hijo'])->get();
        
        echo "DEBUG: Total inscripciones encontradas: " . $inscripciones->count() . "\n";
        
        $actividades = [
            'Llegada al punto de encuentro',
            'Abordaje del transporte',
            'Llegada al destino',
            'Check-in en el hotel',
            'Inicio de actividad turística',
            'Almuerzo en restaurante',
            'Actividad recreativa',
            'Tiempo libre supervisado',
            'Cena grupal',
            'Descanso nocturno',
            'Desayuno',
            'Excursión matutina',
            'Regreso seguro'
        ];
        
        // Coordenadas base para diferentes destinos
        $coordenadasBase = [
            'Cartagena' => ['lat' => 10.3910, 'lng' => -75.4794],
            'San Andrés' => ['lat' => 12.5847, 'lng' => -81.7006],
            'Bogotá' => ['lat' => 4.7110, 'lng' => -74.0721],
            'Medellín' => ['lat' => 6.2442, 'lng' => -75.5812],
            'Eje Cafetero' => ['lat' => 4.5389, 'lng' => -75.6814],
            'Santa Marta' => ['lat' => 11.2408, 'lng' => -74.2099],
        ];
        
        foreach ($inscripciones as $inscripcion) {
            echo "DEBUG: Procesando inscripción ID: " . $inscripcion->id . "\n";
            echo "DEBUG: Fecha inicio grupo: " . $inscripcion->grupo->fecha_inicio . "\n";
            echo "DEBUG: Fecha actual: " . now() . "\n";
            
            // Solo crear trazabilidad para grupos que ya iniciaron (fechas pasadas)
            if ($inscripcion->grupo->fecha_inicio <= now()) {
                echo "DEBUG: Grupo cumple condición de fecha, creando registros...\n";
                $numRegistros = rand(3, 8); // Entre 3 y 8 registros por niño
                
                // Determinar coordenadas base según el destino del paquete
                $destino = $inscripcion->grupo->paquete->destino;
                $coordenadaBase = null;
                
                foreach ($coordenadasBase as $lugar => $coord) {
                    if (strpos($destino, $lugar) !== false) {
                        $coordenadaBase = $coord;
                        break;
                    }
                }
                
                // Si no se encuentra, usar coordenadas por defecto (Bogotá)
                if (!$coordenadaBase) {
                    $coordenadaBase = $coordenadasBase['Bogotá'];
                }
                
                for ($i = 0; $i < $numRegistros; $i++) {
                    // Agregar variación a las coordenadas
                    $latVariacion = (rand(-200, 200) / 10000);
                    $lngVariacion = (rand(-200, 200) / 10000);
                    
                    Trazabilidad::create([
                        'paquete_id' => $inscripcion->paquete_id,
                        'grupo_id' => $inscripcion->grupo_id,
                        'hijo_id' => $inscripcion->hijo_id,
                        'descripcion' => $actividades[array_rand($actividades)],
                        'latitud' => $coordenadaBase['lat'] + $latVariacion,
                        'longitud' => $coordenadaBase['lng'] + $lngVariacion,
                    ]);
                    echo "DEBUG: Registro de trazabilidad creado para hijo ID: " . $inscripcion->hijo_id . "\n";
                }
                echo "DEBUG: Total registros creados para esta inscripción: " . $numRegistros . "\n";
            } else {
                echo "DEBUG: Grupo NO cumple condición de fecha, saltando...\n";
            }
        }
        
        $totalTrazabilidad = \App\Models\Trazabilidad::count();
        echo "DEBUG: Total registros de trazabilidad en la BD: " . $totalTrazabilidad . "\n";
    }
}
