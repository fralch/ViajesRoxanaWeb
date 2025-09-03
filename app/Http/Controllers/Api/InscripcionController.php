<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\User;
use App\Models\Grupo;
use App\Models\Paquete;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class InscripcionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->is_admin) {
            $inscripciones = Inscripcion::with(['hijo.user', 'grupo.paquete'])->get();
        } else {
            $inscripciones = Inscripcion::whereHas('hijo', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with(['hijo', 'grupo.paquete'])->get();
        }

        return response()->json([
            'success' => true,
            'data' => $inscripciones
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'grupo_id' => 'required|exists:grupos,id',
            'hijo_id' => 'required|exists:hijos,id',
        ]);

        // Check if child belongs to authenticated user (unless admin)
        if (!Auth::user()->is_admin) {
            $hijo = \App\Models\Hijo::find($validated['hijo_id']);
            if ($hijo->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to inscribe this child'
                ], 403);
            }
        }

        // Check group capacity
        $grupo = Grupo::find($validated['grupo_id']);
        if ($grupo->inscripciones()->count() >= $grupo->capacidad_maxima) {
            return response()->json([
                'success' => false,
                'message' => 'Group is at maximum capacity'
            ], 400);
        }

        // Check if already inscribed
        $existingInscription = Inscripcion::where('grupo_id', $validated['grupo_id'])
            ->where('hijo_id', $validated['hijo_id'])
            ->first();

        if ($existingInscription) {
            return response()->json([
                'success' => false,
                'message' => 'Child is already inscribed in this group'
            ], 400);
        }

        $inscripcion = Inscripcion::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inscription created successfully',
            'data' => $inscripcion->load(['hijo', 'grupo.paquete'])
        ], 201);
    }

    public function show(Inscripcion $inscripcion): JsonResponse
    {
        // Check permissions
        if (!Auth::user()->is_admin && $inscripcion->hijo->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $inscripcion->load(['hijo.user', 'grupo.paquete'])
        ]);
    }

    public function destroy(Inscripcion $inscripcion): JsonResponse
    {
        // Check permissions
        if (!Auth::user()->is_admin && $inscripcion->hijo->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this inscription'
            ], 403);
        }

        $inscripcion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inscription deleted successfully'
        ]);
    }

    public function checkUserExists(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        return response()->json([
            'exists' => $user ? true : false,
            'user' => $user ? $user->only(['id', 'name', 'email']) : null
        ]);
    }
}