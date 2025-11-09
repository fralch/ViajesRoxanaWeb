<?php

namespace App\Http\Controllers\Api\Gimnasio;

use App\Http\Controllers\Controller;
use App\Models\Gimnasio\GAsistencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GAsistenciaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GAsistencia::query();

        if ($request->has('id_usuario')) {
            $query->where('id_usuario', $request->id_usuario);
        }
        if ($request->has('fecha_asistencia')) {
            $query->where('fecha_asistencia', $request->fecha_asistencia);
        }

        $asistencias = $query->orderBy('id_asistencia', 'desc')->get();
        return response()->json(['success' => true, 'data' => $asistencias]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_usuario' => 'required|integer|exists:g_miembros,id_usuario',
            'fecha_asistencia' => 'required|date',
            'hora_entrada' => 'required|date_format:H:i:s',
        ]);

        $asistencia = GAsistencia::create($data);
        return response()->json(['success' => true, 'data' => $asistencia], 201);
    }

    public function show($asistencia): JsonResponse
    {
        $found = GAsistencia::findOrFail($asistencia);
        return response()->json(['success' => true, 'data' => $found]);
    }

    public function update(Request $request, $asistencia): JsonResponse
    {
        $found = GAsistencia::findOrFail($asistencia);
        $data = $request->validate([
            'id_usuario' => 'sometimes|required|integer|exists:g_miembros,id_usuario',
            'fecha_asistencia' => 'sometimes|required|date',
            'hora_entrada' => 'sometimes|required|date_format:H:i:s',
        ]);
        $found->update($data);
        return response()->json(['success' => true, 'data' => $found]);
    }

    public function destroy($asistencia): JsonResponse
    {
        $found = GAsistencia::findOrFail($asistencia);
        $found->delete();
        return response()->json(['success' => true]);
    }
}