<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Geolocalizacion;
use App\Models\Grupo;
use App\Models\Hijo;
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
            'hijo_id' => 'required|string',
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
        ]);

        // Find hijo by doc_numero (treating hijo_id as doc_numero)
        $hijo = Hijo::with('inscripciones.grupo.paquete')->where('doc_numero', $validated['hijo_id'])->first();

        if (!$hijo) {
            return response()->json([
                'success' => false,
                'message' => 'Hijo not found with document number: ' . $validated['hijo_id']
            ], 404);
        }

        // Use the actual hijo ID for the database
        $hijoId = $hijo->id;

        // Get paquete_id from the hijo's most recent group inscription
        $paqueteId = $validated['paquete_id'] ?? null;
        if (!$paqueteId && $hijo->inscripciones->isNotEmpty()) {
            // Get the most recent inscription by created_at
            $latestInscripcion = $hijo->inscripciones->sortByDesc('created_at')->first();
            $paqueteId = $latestInscripcion->grupo->paquete_id ?? null;
        }

        if (!$paqueteId) {
            return response()->json([
                'success' => false,
                'message' => 'No paquete found for this hijo. Please provide paquete_id or ensure the hijo has an active inscription.'
            ], 400);
        }

        // Check current count for this hijo_id
        $currentCount = Geolocalizacion::where('hijo_id', $hijoId)->count();

        // If we have 10 or more records, delete the oldest ones to make room
        if ($currentCount >= 10) {
            $recordsToDelete = $currentCount - 9; // Keep 9, so we can add 1 more
            Geolocalizacion::where('hijo_id', $hijoId)
                ->orderBy('created_at', 'asc')
                ->limit($recordsToDelete)
                ->delete();
        }

        $geolocalizacion = Geolocalizacion::create([
            'paquete_id' => $paqueteId,
            'hijo_id' => $hijoId,
            'latitud' => $validated['latitud'],
            'longitud' => $validated['longitud'],
        ]);

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