<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paquete;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaqueteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Paquete::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('destino', 'like', "%{$search}%");
            });
        }

        $paquetes = $query->with(['recorridos', 'grupos'])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $paquetes
        ]);
    }

    public function show(Paquete $paquete): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $paquete->load(['recorridos', 'grupos'])
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean'
        ]);

        $validated['activo'] = $request->boolean('activo', true);

        $paquete = Paquete::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Package created successfully',
            'data' => $paquete
        ], 201);
    }

    public function update(Request $request, Paquete $paquete): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean'
        ]);

        $validated['activo'] = $request->boolean('activo', $paquete->activo);

        $paquete->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Package updated successfully',
            'data' => $paquete
        ]);
    }

    public function destroy(Paquete $paquete): JsonResponse
    {
        if ($paquete->grupos()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete package because it has associated groups'
            ], 400);
        }

        $paquete->delete();

        return response()->json([
            'success' => true,
            'message' => 'Package deleted successfully'
        ]);
    }
}