<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trazabilidad;
use App\Models\Grupo;
use App\Models\Hijo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TrazabilidadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Trazabilidad::with(['hijo', 'grupo']);

        if (!Auth::user()->is_admin) {
            // Only show tracking for user's children
            $query->whereHas('hijo', function($q) {
                $q->where('user_id', Auth::id());
            });
        }

        if ($request->has('grupo_id')) {
            $query->where('grupo_id', $request->grupo_id);
        }

        if ($request->has('hijo_id')) {
            $query->where('hijo_id', $request->hijo_id);
        }

        $trazabilidades = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $trazabilidades
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grupo_id' => 'required|exists:grupos,id',
            'hijo_id' => 'required|exists:hijos,id',
            'ubicacion' => 'required|string|max:255',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'mensaje' => 'nullable|string',
        ]);

        $trazabilidad = Trazabilidad::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tracking record created successfully',
            'data' => $trazabilidad->load(['hijo', 'grupo'])
        ], 201);
    }

    public function show(Trazabilidad $trazabilidad): JsonResponse
    {
        // Check permissions
        if (!Auth::user()->is_admin && $trazabilidad->hijo->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $trazabilidad->load(['hijo', 'grupo'])
        ]);
    }

    public function obtenerHijosGrupo(Grupo $grupo): JsonResponse
    {
        $hijos = $grupo->inscripciones()->with('hijo')->get()->pluck('hijo');

        return response()->json([
            'success' => true,
            'data' => $hijos
        ]);
    }

    public function procesarEscaneo(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grupo_id' => 'required|exists:grupos,id',
            'dni_hijo' => 'required|string',
            'ubicacion' => 'required|string|max:255',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'mensaje' => 'nullable|string',
        ]);

        $hijo = Hijo::where('doc_numero', $validated['dni_hijo'])->first();

        if (!$hijo) {
            return response()->json([
                'success' => false,
                'message' => 'Child not found with this document number'
            ], 404);
        }

        $trazabilidad = Trazabilidad::create([
            'grupo_id' => $validated['grupo_id'],
            'hijo_id' => $hijo->id,
            'ubicacion' => $validated['ubicacion'],
            'latitud' => $validated['latitud'] ?? null,
            'longitud' => $validated['longitud'] ?? null,
            'mensaje' => $validated['mensaje'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tracking record created successfully',
            'data' => $trazabilidad->load(['hijo', 'grupo'])
        ], 201);
    }

    public function guardarMensaje(Request $request, Grupo $grupo): JsonResponse
    {
        $validated = $request->validate([
            'mensaje' => 'required|string',
            'hijos_ids' => 'required|array',
            'hijos_ids.*' => 'exists:hijos,id',
            'ubicacion' => 'required|string|max:255',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
        ]);

        $trazabilidades = [];

        foreach ($validated['hijos_ids'] as $hijo_id) {
            $trazabilidades[] = Trazabilidad::create([
                'grupo_id' => $grupo->id,
                'hijo_id' => $hijo_id,
                'ubicacion' => $validated['ubicacion'],
                'latitud' => $validated['latitud'] ?? null,
                'longitud' => $validated['longitud'] ?? null,
                'mensaje' => $validated['mensaje'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Messages saved successfully for ' . count($trazabilidades) . ' children',
            'data' => collect($trazabilidades)->load(['hijo', 'grupo'])
        ], 201);
    }

    public function confirmacionTrazabilidad($dni_hijo): JsonResponse
    {
        $hijo = Hijo::where('doc_numero', $dni_hijo)->first();

        if (!$hijo) {
            return response()->json([
                'success' => false,
                'message' => 'Child not found'
            ], 404);
        }

        // Get latest tracking records for this child
        $trazabilidades = Trazabilidad::where('hijo_id', $hijo->id)
            ->with(['grupo.paquete'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'hijo' => $hijo,
                'trazabilidades' => $trazabilidades
            ]
        ]);
    }
}