<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Geolocalizacion;
use App\Models\Grupo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GeolocalizacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Geolocalizacion::with(['grupo']);

        if ($request->has('grupo_id')) {
            $query->where('grupo_id', $request->grupo_id);
        }

        $geolocalizaciones = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $geolocalizaciones
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'paquete_id' => 'nullable|exists:paquetes,id',
            'hijo_id' => 'required|exists:hijos,id',
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
        ]);

        // Check current count for this hijo_id
        $currentCount = Geolocalizacion::where('hijo_id', $validated['hijo_id'])->count();

        // If we have 10 or more records, delete the oldest ones to make room
        if ($currentCount >= 10) {
            $recordsToDelete = $currentCount - 9; // Keep 9, so we can add 1 more
            Geolocalizacion::where('hijo_id', $validated['hijo_id'])
                ->orderBy('created_at', 'asc')
                ->limit($recordsToDelete)
                ->delete();
        }

        $geolocalizacion = Geolocalizacion::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Location saved successfully',
            'data' => $geolocalizacion->load(['paquete', 'hijo'])
        ], 201);
    }

    public function show(Geolocalizacion $geolocalizacion): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $geolocalizacion->load('grupo')
        ]);
    }

    public function getGroupHistory(Grupo $grupo): JsonResponse
    {
        $history = $grupo->geolocalizaciones()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}