<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Geolocalizacion;
use App\Models\Grupo;
use App\Models\Hijo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

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

        // Get paquete_id from the hijo's group closest to current Lima date
        $paqueteId = $validated['paquete_id'] ?? null;
        if (!$paqueteId && $hijo->inscripciones->isNotEmpty()) {
            // Get current date in Lima timezone
            $currentDateLima = Carbon::now('America/Lima')->toDateString();

            // Find the group with date closest to today
            $closestInscripcion = null;
            $minDateDiff = null;

            foreach ($hijo->inscripciones as $inscripcion) {
                $grupo = $inscripcion->grupo;
                if (!$grupo) continue;

                // Calculate difference between group start date and current date
                $groupStartDate = Carbon::parse($grupo->fecha_inicio);
                $dateDiff = abs($groupStartDate->diffInDays(Carbon::parse($currentDateLima)));

                if ($minDateDiff === null || $dateDiff < $minDateDiff) {
                    $minDateDiff = $dateDiff;
                    $closestInscripcion = $inscripcion;
                }
            }

            $paqueteId = $closestInscripcion->grupo->paquete_id ?? null;
        }

        if (!$paqueteId) {
            return response()->json([
                'success' => false,
                'message' => 'No paquete found for this hijo. Please provide paquete_id or ensure the hijo has an active inscription.'
            ], 400);
        }

        // Optimized cleanup: use subquery to avoid counting all records
        $recordsToKeep = 9;
        Geolocalizacion::where('hijo_id', $hijoId)
            ->whereNotIn('id', function($query) use ($hijoId, $recordsToKeep) {
                $query->select('id')
                    ->from('geolocalizacion')
                    ->where('hijo_id', $hijoId)
                    ->orderBy('created_at', 'desc')
                    ->limit($recordsToKeep);
            })
            ->delete();

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

    public function getLocationByHijo(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hijo_id' => 'required|string',
        ]);

        // Optimized: Use join instead of separate queries
        $geolocalizacion = Geolocalizacion::select('geolocalizacion.*')
            ->join('hijos', 'hijos.id', '=', 'geolocalizacion.hijo_id')
            ->where('hijos.doc_numero', $validated['hijo_id'])
            ->with(['paquete', 'hijo'])
            ->orderBy('geolocalizacion.created_at', 'desc')
            ->first();

        if (!$geolocalizacion) {
            return response()->json([
                'success' => false,
                'message' => 'No location data found for this hijo or hijo not found'
            ], 404);
        }

        // Check if the location is recent (within last 5 minutes)
        $minutesAgo = Carbon::parse($geolocalizacion->created_at)
            ->diffInMinutes(Carbon::now());
        $isRecent = $minutesAgo <= 5;

        return response()->json([
            'success' => true,
            'data' => [
                'geolocalizacion' => $geolocalizacion,
                'is_recent' => $isRecent,
                'last_update' => $geolocalizacion->created_at,
                'minutes_ago' => $minutesAgo
            ]
        ]);
    }
}