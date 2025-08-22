<?php

namespace Database\Seeders;

use App\Models\Inscripcion;
use App\Models\Hijo;
use App\Models\Grupo;
use App\Models\Paquete;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InscripcionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hijos = Hijo::all();
        $grupos = Grupo::where('activo', true)->get();
        
        foreach ($hijos as $hijo) {
            // 70% de probabilidad de que un hijo tenga inscripción
            if (rand(1, 100) <= 70) {
                $grupo = $grupos->random();
                
                // Verificar que no exista ya una inscripción para este hijo en este grupo
                $existeInscripcion = Inscripcion::where('hijo_id', $hijo->id)
                    ->where('grupo_id', $grupo->id)
                    ->exists();
                
                if (!$existeInscripcion) {
                    Inscripcion::create([
                        'hijo_id' => $hijo->id,
                        'paquete_id' => $grupo->paquete_id,
                        'grupo_id' => $grupo->id,
                        'usuario_id' => $hijo->user_id,
                    ]);
                }
            }
        }
    }
}
