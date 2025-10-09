<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hijo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class HijoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // SEGURIDAD: Requiere autenticación
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Authentication required'
            ], 401);
        }

        // Si no es admin, solo mostrar sus propios hijos
        if (!Auth::user()->is_admin) {
            $query = Hijo::where('user_id', Auth::id());
        } else {
            $query = Hijo::query();
        }

        // NO incluir datos sensibles del usuario (email, phone, etc.)
        $query->with(['inscripciones.grupo.paquete']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                  ->orWhere('doc_numero', 'like', "%{$search}%");
            });
        }

        $hijos = $query->orderBy('nombres')->get();

        // Filtrar datos sensibles antes de retornar
        $hijosFiltered = $hijos->map(function($hijo) {
            return [
                'id' => $hijo->id,
                'nombres' => $hijo->nombres,
                'doc_tipo' => $hijo->doc_tipo,
                'doc_numero' => $hijo->doc_numero,
                'inscripciones' => $hijo->inscripciones
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $hijosFiltered
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'nombres' => 'required|string|max:255',
            'doc_tipo' => 'required|in:CC,TI,RC,CE',
            'doc_numero' => 'required|string|max:20|unique:hijos,doc_numero',
            'nums_emergencia' => 'nullable|array|max:5',
            'nums_emergencia.*' => 'required|string|max:20',
            'fecha_nacimiento' => 'required|date|before:today',
            'foto' => 'nullable|string',
            'pasatiempos' => 'nullable|string',
            'deportes' => 'nullable|string',
            'plato_favorito' => 'nullable|string|max:255',
            'color_favorito' => 'nullable|string|max:100',
            'informacion_adicional' => 'nullable|string',
            'ver_fichas' => 'nullable|boolean'
        ]);
        
        // If not admin, assign to authenticated user
        if (!Auth::user()->is_admin) {
            $validated['user_id'] = Auth::id();
        }
        
        $hijo = Hijo::create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Hijo registered successfully',
            'data' => $hijo->load(['user', 'inscripciones.grupo.paquete'])
        ], 201);
    }

    public function show(Hijo $hijo): JsonResponse
    {
        // SEGURIDAD: Requiere autenticación
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Authentication required'
            ], 401);
        }

        // Verificar permisos: solo el padre o admin puede ver
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - You do not have permission to view this child'
            ], 403);
        }

        // NO exponer datos sensibles del usuario
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $hijo->id,
                'nombres' => $hijo->nombres,
                'doc_tipo' => $hijo->doc_tipo,
                'doc_numero' => $hijo->doc_numero,
                'inscripciones' => $hijo->inscripciones()->with('grupo.paquete')->get()
            ]
        ]);
    }

    public function update(Request $request, Hijo $hijo): JsonResponse
    {
        // Check permissions
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this child'
            ], 403);
        }
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'nombres' => 'required|string|max:255',
            'doc_numero' => 'required|string|max:20|unique:hijos,doc_numero,' . $hijo->id,
            'nums_emergencia' => 'nullable|array|max:5',
            'nums_emergencia.*' => 'required|string|max:20',
            'fecha_nacimiento' => 'required|date|before:today',
            'foto' => 'nullable|string',
            'pasatiempos' => 'nullable|string',
            'deportes' => 'nullable|string',
            'plato_favorito' => 'nullable|string|max:255',
            'color_favorito' => 'nullable|string|max:100',
            'informacion_adicional' => 'nullable|string',
            'ver_fichas' => 'nullable|boolean'
        ]);
        
        // Document type cannot be changed, keep current one
        $validated['doc_tipo'] = $hijo->doc_tipo;
        
        // If not admin, maintain current user
        if (!Auth::user()->is_admin) {
            $validated['user_id'] = $hijo->user_id;
        }
        
        $hijo->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Child updated successfully',
            'data' => $hijo->load(['user', 'inscripciones.grupo.paquete'])
        ]);
    }

    public function destroy(Hijo $hijo): JsonResponse
    {
        // Check permissions
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this child'
            ], 403);
        }
        
        if ($hijo->inscripciones()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete child because they have associated inscriptions'
            ], 400);
        }
        
        $hijo->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Child deleted successfully'
        ]);
    }

    public function getHijoByDni($dni): JsonResponse
    {
        // SEGURIDAD: Requiere autenticación
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Authentication required'
            ], 401);
        }

        $hijo = Hijo::where('doc_numero', $dni)->first();

        if (!$hijo) {
            return response()->json([
                'success' => false,
                'message' => 'Child not found'
            ], 404);
        }

        // Verificar permisos: solo el padre o admin puede ver
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - You do not have permission to view this child'
            ], 403);
        }

        // NO exponer datos sensibles
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $hijo->id,
                'nombres' => $hijo->nombres,
                'doc_tipo' => $hijo->doc_tipo,
                'doc_numero' => $hijo->doc_numero
            ]
        ]);
    }

    public function destroyParent(User $user): JsonResponse
    {
        // Only admin can delete parents
        if (!Auth::user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete parents'
            ], 403);
        }

        // Prevent deleting admin users
        if ($user->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete an admin user'
            ], 400);
        }

        // Prevent self-deletion
        if ($user->id === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete yourself'
            ], 400);
        }

        try {
            $user->delete(); // This will cascade delete all related data

            return response()->json([
                'success' => true,
                'message' => 'Parent and all dependencies deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting parent: ' . $e->getMessage()
            ], 500);
        }
    }
}