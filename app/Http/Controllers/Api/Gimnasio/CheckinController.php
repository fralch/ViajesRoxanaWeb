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
            // Diferenciar entre usuario sin membresía y usuario con membresía vencida
            if ($todasMembresias->isEmpty()) {
                return response()->json([
                    'error' => 'Usuario sin membresía',
                    'mensaje' => 'El usuario no tiene ninguna membresía registrada'
                ], 404);
            }

            // Verificar si tiene membresías vencidas
            $membresiaVencida = $todasMembresias->first(function($m) use ($hoy) {
                return $m->fecha_fin < $hoy->toDateString();
            });

            if ($membresiaVencida) {
                return response()->json([
                    'error' => 'Membresía vencida',
                    'mensaje' => 'La membresía del usuario ha expirado',
                    'fecha_vencimiento' => $membresiaVencida->fecha_fin
                ], 403);
            }

            // Si no está vencida, está inactiva o fuera de rango
            return response()->json([
                'error' => 'Membresía inactiva',
                'mensaje' => 'La membresía del usuario no está activa o está fuera del rango de fechas'
            ], 403);
        }

        // 3. Sin duplicado hoy
        $existeHoy = GAsistencia::where('id_usuario', $idUsuario)
            ->whereDate('fecha_asistencia', $hoy)
            ->first();

        if ($existeHoy) {
            $response = [
                'mensaje' => 'Ya registrado hoy',
                'nombre' => $miembro->nombre,
                'hora' => Carbon::parse($existeHoy->hora_entrada)->format('H:i:s'),
            ];

            // Agregar foto del usuario si existe
            if ($miembro->foto_perfil) {
                $response['foto_perfil'] = url('storage/' . $miembro->foto_perfil);
            }

            return response()->json($response, 200);
        }

        // 4. Insertar asistencia
        $now = Carbon::now();
        $asistencia = GAsistencia::create([
            'id_usuario' => $idUsuario,
            'fecha_asistencia' => $hoy->toDateString(),
            'hora_entrada' => $now->format('H:i:s'),
        ]);

        $response = [
            'mensaje' => 'Asistencia registrada exitosamente',
            'nombre' => $miembro->nombre,
            'hora' => Carbon::parse($asistencia->hora_entrada)->format('H:i:s'),
        ];

        // Agregar foto del usuario si existe
        if ($miembro->foto_perfil) {
            $response['foto_perfil'] = url('storage/' . $miembro->foto_perfil);
        }

        return response()->json($response, 200);
    }
}