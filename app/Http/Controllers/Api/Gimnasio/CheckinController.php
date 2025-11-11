<?php

namespace App\Http\Controllers\Api\Gimnasio;

use App\Http\Controllers\Controller;
use App\Models\Gimnasio\GAsistencia;
use App\Models\Gimnasio\GMembresia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CheckinController extends Controller
{
    /**
     * POST /endpoint/gimnasio/marcar-asistencia
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validar cuerpo (sin autenticación): se requiere id_usuario y qr_token
        $data = $request->validate([
            'id_usuario' => 'required|integer|exists:g_miembros,id_usuario',
            'qr_token' => 'required|string',
        ]);

        $idUsuario = (int) $data['id_usuario'];

        $tokenBD = DB::table('g_configuracion')
            ->where('clave', 'qr_checkin_token')
            ->value('valor');

        if (!$tokenBD || $data['qr_token'] !== $tokenBD) {
            return response()->json(['error' => 'QR inválido'], 403);
        }

        // 3. Membresía activa: estado = 'Activa' y fecha_fin >= hoy
        $hoy = Carbon::today();
        $membresiaActiva = GMembresia::where('id_usuario', $idUsuario)
            ->where('estado', 'Activa')
            ->whereDate('fecha_fin', '>=', $hoy)
            ->first();

        if (!$membresiaActiva) {
            return response()->json(['error' => 'Membresía inactiva'], 403);
        }

        // 4. Sin duplicado hoy
        $existeHoy = GAsistencia::where('id_usuario', $idUsuario)
            ->whereDate('fecha_asistencia', $hoy)
            ->first();

        if ($existeHoy) {
            return response()->json([
                'mensaje' => 'Ya registrado hoy',
                'hora' => Carbon::parse($existeHoy->hora_entrada)->format('H:i:s'),
            ], 200);
        }

        // 5. Insertar asistencia
        $now = Carbon::now();
        $asistencia = GAsistencia::create([
            'id_usuario' => $idUsuario,
            'fecha_asistencia' => $hoy->toDateString(),
            'hora_entrada' => $now->format('H:i:s'),
        ]);

        return response()->json([
            'mensaje' => 'Asistencia registrada',
            'hora' => Carbon::parse($asistencia->hora_entrada)->format('H:i:s'),
        ], 200);
    }
}