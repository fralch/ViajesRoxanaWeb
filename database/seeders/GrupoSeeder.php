<?php

namespace Database\Seeders;

use App\Models\Grupo;
use App\Models\Paquete;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GrupoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paquetes = Paquete::all();
        
        foreach ($paquetes as $paquete) {
            // Crear 2-3 grupos por paquete
            $numGrupos = rand(2, 3);
            
            for ($i = 1; $i <= $numGrupos; $i++) {
                // 50% de grupos en el pasado (para trazabilidad) y 50% en el futuro
                if ($i <= ceil($numGrupos / 2)) {
                    // Grupos pasados (1-60 días atrás)
                    $fechaInicio = now()->subDays(rand(1, 60));
                } else {
                    // Grupos futuros (30-180 días adelante)
                    $fechaInicio = now()->addDays(rand(30, 180));
                }
                $fechaFin = $fechaInicio->copy()->addDays(rand(3, 7));
                
                Grupo::create([
                    'paquete_id' => $paquete->id,
                    'nombre' => $paquete->nombre . ' - Grupo ' . $i,
                    'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                    'fecha_fin' => $fechaFin->format('Y-m-d'),
                    'capacidad' => rand(15, 30),
                    'tipo_encargado' => json_encode(['Coordinador', 'Guía Turístico']),
                    'nombre_encargado' => json_encode(['María González', 'Carlos Rodríguez']),
                    'celular_encargado' => json_encode(['3101234567', '3109876543']),
                    'tipo_encargado_agencia' => json_encode(['Supervisor', 'Asistente']),
                    'nombre_encargado_agencia' => json_encode(['Ana Martínez', 'Luis Pérez']),
                    'celular_encargado_agencia' => json_encode(['3201234567', '3209876543']),
                    'activo' => $i <= 2, // Solo los primeros 2 grupos activos
                ]);
            }
        }
    }
}
