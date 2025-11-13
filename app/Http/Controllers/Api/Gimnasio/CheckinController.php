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
        $membresiaActiva = GMembresia::where('id_usuario', $idUsuario)
            ->where('estado', 'Activa')
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_fin', '>=', $hoy)
            ->first();

        if (!$membresiaActiva) {
            return response()->json(['error' => 'Membresía inactiva o fuera de rango de fechas'], 403);
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