<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grupo;
use App\Models\Paquete;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GrupoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Grupo::with(['paquete']);

        if ($request->has('paquete_id')) {
            $query->where('paquete_id', $request->paquete_id);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%");
        }

        $grupos = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $grupos
        ]);
    }

    public function show(Grupo $grupo): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $grupo->load(['paquete', 'inscripciones.hijo'])
        ]);
    }

    public function getByPaquete(Paquete $paquete): JsonResponse
    {
        $grupos = $paquete->grupos()->with(['inscripciones.hijo'])->get();

        return response()->json([
            'success' => true,
            'data' => $grupos
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'paquete_id' => 'required|exists:paquetes,id',
            'nombre' => 'required|string|max:255',
            'capacidad_maxima' => 'required|integer|min:1',
            'activo' => 'boolean'
        ]);

        $validated['activo'] = $request->boolean('activo', true);

        $grupo = Grupo::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Group created successfully',
            'data' => $grupo->load('paquete')
        ], 201);
    }

    public function update(Request $request, Grupo $grupo): JsonResponse
    {
        $validated = $request->validate([
            'paquete_id' => 'required|exists:paquetes,id',
            'nombre' => 'required|string|max:255',
            'capacidad_maxima' => 'required|integer|min:1',
            'activo' => 'boolean'
        ]);

        $validated['activo'] = $request->boolean('activo', $grupo->activo);

        $grupo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Group updated successfully',
            'data' => $grupo->load('paquete')
        ]);
    }

    public function destroy(Grupo $grupo): JsonResponse
    {
        if ($grupo->inscripciones()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete group because it has inscriptions'
            ], 400);
        }

        $grupo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Group deleted successfully'
        ]);
    }
}