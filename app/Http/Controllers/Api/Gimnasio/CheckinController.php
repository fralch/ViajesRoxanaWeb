<?php

namespace App\Http\Controllers\Api\Gimnasio;

use App\Http\Controllers\Controller;
use App\Models\Gimnasio\GAsistencia;
use App\Models\Gimnasio\GMiembro;
use App\Models\Gimnasio\GMembresia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CheckinController extends Controller
{
    /**
     * GET /endpoint/gimnasio/verificar-membresia/{dni}
     */
    public function verificarMembresia($dni): JsonResponse
    {
        // 1. Buscar el miembro por DNI
        $miembro = GMiembro::where('dni', $dni)->first();

        if (!$miembro) {
            return response()->json(['error' => 'Miembro no encontrado'], 404);
        }

        $idUsuario = $miembro->id_usuario;

        // 2. Membresía activa: estado = 'Activa' y fecha_inicio <= hoy <= fecha_fin
        $hoy = Carbon::today();

        // Buscar cualquier membresía del usuario para debug
        $todasMembresias = GMembresia::where('id_usuario', $idUsuario)->get();

        $membresiaActiva = GMembresia::where('id_usuario', $idUsuario)
            ->where('estado', 'Activa')
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_fin', '>=', $hoy)
            ->first();

        if (!$membresiaActiva) {
            // Debug: Mostrar información detallada
            $debug = [
                'error' => 'Membresía inactiva o fuera de rango de fechas',
                'fecha_hoy' => $hoy->toDateString(),
                'debug' => [
                    'miembro' => [
                        'id_usuario' => $miembro->id_usuario,
                        'nombre' => $miembro->nombre,
                        'dni' => $miembro->dni
                    ],
                    'membresias_encontradas' => $todasMembresias->map(function($m) use ($hoy) {
                        return [
                            'id_membresia' => $m->id_membresia,
                            'tipo_plan' => $m->tipo_plan,
                            'estado' => $m->estado,
                            'estado_length' => strlen($m->estado),
                            'fecha_inicio' => $m->fecha_inicio,
                            'fecha_fin' => $m->fecha_fin,
                            'validaciones' => [
                                'estado_es_Activa' => $m->estado === 'Activa',
                                'fecha_inicio_ok' => $m->fecha_inicio <= $hoy->toDateString(),
                                'fecha_fin_ok' => $m->fecha_fin >= $hoy->toDateString(),
                            ]
                        ];
                    })
                ]
            ];
            return response()->json($debug, 403);
        }

        // 3. Sin duplicado hoy
        $existeHoy = GAsistencia::where('id_usuario', $idUsuario)
            ->whereDate('fecha_asistencia', $hoy)
            ->first();

        if ($existeHoy) {
            return response()->json([
                'mensaje' => 'Ya registrado hoy',
                'nombre' => $miembro->nombre,
                'hora' => Carbon::parse($existeHoy->hora_entrada)->format('H:i:s'),
            ], 200);
        }

        // 4. Insertar asistencia
        $now = Carbon::now();
        $asistencia = GAsistencia::create([
            'id_usuario' => $idUsuario,
            'fecha_asistencia' => $hoy->toDateString(),
            'hora_entrada' => $now->format('H:i:s'),
        ]);

        return response()->json([
            'mensaje' => 'Asistencia registrada exitosamente',
            'nombre' => $miembro->nombre,
            'hora' => Carbon::parse($asistencia->hora_entrada)->format('H:i:s'),
        ], 200);
    }
}