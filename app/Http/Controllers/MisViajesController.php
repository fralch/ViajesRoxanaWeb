<?php

namespace App\Http\Controllers;

use App\Models\Paquete;
use App\Models\Grupo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MisViajesController extends Controller
{
    public function index()
    {
        // Obtener grupos activos con sus paquetes relacionados
        $grupos = Grupo::with('paquete')
            ->where('activo', true)
            ->orderBy('fecha_inicio', 'asc')
            ->get();

        // Agregar el status calculado a cada grupo
        $viajes = $grupos->map(function ($grupo) {
            $today = Carbon::now();
            $fechaInicio = Carbon::parse($grupo->fecha_inicio);
            $fechaFin = Carbon::parse($grupo->fecha_fin);

            if ($fechaInicio <= $today && $today <= $fechaFin) {
                $status = 'en_curso';
            } elseif ($fechaInicio > $today) {
                $status = 'proximo';
            } else {
                $status = 'finalizado';
            }

            return [
                'id' => $grupo->id,
                'nombre' => $grupo->nombre,
                'fecha_inicio' => $grupo->fecha_inicio,
                'fecha_fin' => $grupo->fecha_fin,
                'capacidad' => $grupo->capacidad,
                'activo' => $grupo->activo,
                'status' => $status,
                'paquete' => [
                    'id' => $grupo->paquete->id,
                    'nombre' => $grupo->paquete->nombre,
                    'destino' => $grupo->paquete->destino,
                    'descripcion' => $grupo->paquete->descripcion,
                ]
            ];
        });

        return Inertia::render('MisViajes', [
            'viajes' => $viajes
        ]);
    }

    public function show(Grupo $grupo)
    {
        // Cargar el grupo con su paquete y relaciones necesarias
        $grupo->load(['paquete', 'inscripciones', 'trazabilidades']);

        return Inertia::render('MisViajes/Show', [
            'grupo' => $grupo
        ]);
    }
}