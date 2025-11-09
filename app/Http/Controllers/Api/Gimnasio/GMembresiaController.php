<?php

namespace App\Http\Controllers\Api\Gimnasio;

use App\Http\Controllers\Controller;
use App\Models\Gimnasio\GMembresia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GMembresiaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GMembresia::query();
        if ($request->has('id_usuario')) {
            $query->where('id_usuario', $request->id_usuario);
        }
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }
        $membresias = $query->orderBy('id_membresia', 'desc')->get();
        return response()->json(['success' => true, 'data' => $membresias]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_usuario' => 'required|integer|exists:g_miembros,id_usuario',
            'tipo_plan' => 'required|string|max:100',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'estado' => 'required|string|max:50',
        ]);

        $membresia = GMembresia::create($data);
        return response()->json(['success' => true, 'data' => $membresia], 201);
    }

    public function show($membresia): JsonResponse
    {
        $found = GMembresia::findOrFail($membresia);
        return response()->json(['success' => true, 'data' => $found]);
    }

    public function update(Request $request, $membresia): JsonResponse
    {
        $found = GMembresia::findOrFail($membresia);
        $data = $request->validate([
            'id_usuario' => 'sometimes|required|integer|exists:g_miembros,id_usuario',
            'tipo_plan' => 'sometimes|required|string|max:100',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'sometimes|required|date|after_or_equal:fecha_inicio',
            'estado' => 'sometimes|required|string|max:50',
        ]);
        $found->update($data);
        return response()->json(['success' => true, 'data' => $found]);
    }

    public function destroy($membresia): JsonResponse
    {
        $found = GMembresia::findOrFail($membresia);
        $found->delete();
        return response()->json(['success' => true]);
    }
}