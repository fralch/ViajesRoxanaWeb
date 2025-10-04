<?php

namespace App\Http\Controllers;

use App\Models\Hijo;
use App\Models\User;
use App\Models\SaludFicha;
use App\Models\NutricionFicha;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class HijoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Si no es admin, mostrar solo sus propios datos
        if (!Auth::user()->is_admin) {
            $user = Auth::user()->load(['hijos' => function($query) use ($request) {
                if ($request->has('search') && $request->search) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->where('nombres', 'like', "%{$search}%")
                          ->orWhere('doc_numero', 'like', "%{$search}%");
                    });
                }
                $query->orderBy('nombres');
            }]);
            
            return Inertia::render('Hijos/Index', [
                'users' => collect([$user]),
                'filters' => $request->only(['search']),
                'isAdmin' => false
            ]);
        }
        
        // Para admin, mostrar todos los usuarios con sus hijos
        $query = User::with(['hijos' => function($hijoQuery) use ($request) {
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $hijoQuery->where(function($q) use ($search) {
                    $q->where('nombres', 'like', "%{$search}%")
                      ->orWhere('doc_numero', 'like', "%{$search}%");
                });
            }
            $hijoQuery->orderBy('nombres');
        }]);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhereHas('hijos', function($hijoQuery) use ($search) {
                      $hijoQuery->where('nombres', 'like', "%{$search}%")
                               ->orWhere('doc_numero', 'like', "%{$search}%");
                  });
            });
        }

        $users = $query->orderBy('name')->get();

        return Inertia::render('Hijos/Index', [
            'users' => ['data' => $users],
            'filters' => $request->only(['search']),
            'isAdmin' => true
        ]);
    }

    /**
     * Display all children with ver_fichas management functionality
     */
    public function allChildren(Request $request)
    {
        // Only admin can access this view
        if (!Auth::user()->is_admin) {
            abort(403, 'No tienes permisos para acceder a esta vista.');
        }

        $query = Hijo::with('user');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                  ->orWhere('doc_numero', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $hijos = $query->orderBy('nombres')->get();

        return Inertia::render('Hijos/AllChildren', [
            'hijos' => $hijos,
            'filters' => $request->only(['search']),
            'isAdmin' => true
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = null;
        
        // Si es admin, obtener todos los usuarios para el selector
        if (Auth::user()->is_admin) {
            $users = User::select('id', 'name', 'email')
                        ->orderBy('name')
                        ->get();
        }
        
        return Inertia::render('Hijos/Create', [
            'users' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validationRules = [
            'nombres' => 'required|string|max:255',
            'doc_tipo' => 'required|in:DNI,carnet_extranjeria,pasaporte',
            'doc_numero' => 'required|string|max:20|unique:hijos,doc_numero',
            'nums_emergencia' => 'nullable|array|max:5',
            'nums_emergencia.*' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date|before:today',
            'foto' => 'nullable|string',
            'pasatiempos' => 'nullable|string',
            'deportes' => 'nullable|string',
            'plato_favorito' => 'nullable|string|max:255',
            'color_favorito' => 'nullable|string|max:100',
            'informacion_adicional' => 'nullable|string',
            'ver_fichas' => 'nullable|boolean'
        ];

        $requestData = $request->all();

        if (Auth::user()->is_admin && empty($requestData['user_id'])) {
            $requestData['user_id'] = Auth::id();
        }

        $request->merge($requestData);

        if (Auth::user()->is_admin) {
            $validationRules['user_id'] = 'required|exists:users,id';
        } else {
            $validationRules['user_id'] = 'sometimes|nullable|exists:users,id';
        }

        $validated = $request->validate($validationRules);

        if (!Auth::user()->is_admin) {
            $validated['user_id'] = Auth::id();
        }

        try {
            $hijo = Hijo::create($validated);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Hijo registrado exitosamente.',
                    'hijo' => $hijo->load('user')
                ], 201);
            }

            // Si es una petición de Inertia (como las de modales), responder con datos para el modal
            if ($request->header('X-Inertia')) {
                return back()->with([
                    'success' => 'Hijo registrado exitosamente.',
                    'hijo' => $hijo->load('user')
                ]);
            }

            // Si es una petición normal, redireccionar como antes
            return Redirect::route('hijos.index')
                          ->with('success', 'Hijo registrado exitosamente.')
                          ->with('hijo', $hijo);
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error interno al crear el hijo: ' . $e->getMessage()
                ], 500);
            }
            
            // Si es una petición AJAX, responder con JSON de error
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error interno al crear el hijo: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Error interno al crear el hijo: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Hijo $hijo)
    {
        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para ver este hijo.');
        }
        
        return Inertia::render('Hijos/Show', [
            'hijo' => $hijo->load(['user', 'inscripciones.grupo.paquete'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Hijo $hijo)
    {
        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para editar este hijo.');
        }
        
        $users = null;
        
        // Si es admin, obtener todos los usuarios para el selector
        if (Auth::user()->is_admin) {
            $users = User::select('id', 'name', 'email')
                        ->orderBy('name')
                        ->get();
        }
        
        return Inertia::render('Hijos/Edit', [
            'hijo' => $hijo,
            'users' => $users
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Hijo $hijo)
    {
        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para editar este hijo.');
        }

        \Log::info('=== UPDATE HIJO DEBUG ===');
        \Log::info('Request all data:', $request->all());
        \Log::info('ver_fichas value:', ['ver_fichas' => $request->ver_fichas]);
        \Log::info('ver_fichas has:', ['has' => $request->has('ver_fichas')]);
        \Log::info('Hijo actual ver_fichas:', ['current' => $hijo->ver_fichas]);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'nombres' => 'required|string|max:255',
            'doc_numero' => 'required|string|max:20|unique:hijos,doc_numero,' . $hijo->id,
            'nums_emergencia' => 'nullable|array|max:5',
            'nums_emergencia.*' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date|before:today',
            'ver_fichas' => 'sometimes|boolean'
        ]);

        \Log::info('Validated data:', $validated);

        // El tipo de documento no se puede cambiar, mantener el actual
        $validated['doc_tipo'] = $hijo->doc_tipo;

        // Si no es admin, mantener el usuario actual
        if (!Auth::user()->is_admin) {
            $validated['user_id'] = $hijo->user_id;
        }

        // Asegurarse de que ver_fichas se actualice explícitamente
        if ($request->has('ver_fichas')) {
            $validated['ver_fichas'] = filter_var($request->ver_fichas, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
            \Log::info('ver_fichas after filter_var:', ['value' => $validated['ver_fichas']]);
        }

        \Log::info('Final data to update:', $validated);

        $hijo->update($validated);

        \Log::info('Hijo after update ver_fichas:', ['updated' => $hijo->fresh()->ver_fichas]);

        // Si es una petición Inertia con preserveState, simplemente devolver back
        if ($request->header('X-Inertia')) {
            return back()->with('success', 'Hijo actualizado exitosamente.');
        }

        return Redirect::route('hijos.index')
                      ->with('success', 'Hijo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Hijo $hijo)
    {
        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para eliminar este hijo.');
        }
        
        if ($hijo->inscripciones()->exists()) {
            return Redirect::route('hijos.index')
                          ->with('error', 'No se puede eliminar el hijo porque tiene inscripciones asociadas.');
        }
        
        $hijo->delete();
        
        return Redirect::route('hijos.index')
                      ->with('success', 'Hijo eliminado exitosamente.');
    }

    public function getHijoByDni($dni)
    {
        $hijo = Hijo::where('doc_numero', $dni)->first();

        if (!$hijo) {
            return response()->json(null, 404);
        }

        return response()->json($hijo);
    }

    /**
     * Delete a user (parent) and all their dependencies
     */
    public function destroyParent(User $user)
    {
        // Only admin can delete parents
        if (!Auth::user()->is_admin) {
            abort(403, 'No tienes permisos para eliminar padres.');
        }

        // Prevent deleting admin users
        if ($user->is_admin) {
            return Redirect::route('hijos.index')
                          ->with('error', 'No se puede eliminar un usuario administrador.');
        }

        // Prevent self-deletion
        if ($user->id === Auth::id()) {
            return Redirect::route('hijos.index')
                          ->with('error', 'No puedes eliminarte a ti mismo.');
        }

        try {
            $user->delete(); // This will cascade delete all related data via the User model's booted method

            return Redirect::route('hijos.index')
                          ->with('success', 'Padre y todas sus dependencias eliminados exitosamente.');
        } catch (\Exception $e) {
            return Redirect::route('hijos.index')
                          ->with('error', 'Error al eliminar el padre: ' . $e->getMessage());
        }
    }

    /**
     * Show the child profile with health and nutrition records
     */
    public function perfil($docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para ver este perfil.');
        }

        // Cargar las fichas de salud y nutrición si existen
        $saludFicha = SaludFicha::where('hijo_id', $hijo->id)->first();
        $nutricionFicha = NutricionFicha::where('hijo_id', $hijo->id)->first();

        return Inertia::render('PerfilHijo', [
            'hijo' => $hijo,
            'saludFicha' => $saludFicha,
            'nutricionFicha' => $nutricionFicha
        ]);
    }

    /**
     * Update child profile (basic information)
     */
    public function updatePerfil(Request $request, $docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para editar este perfil.');
        }

        $validated = $request->validate([
            'nombres' => 'required|string|max:255',
            'doc_numero' => 'required|string|max:20|unique:hijos,doc_numero,' . $hijo->id,
            'fecha_nacimiento' => 'nullable|date|before:today',
            'foto' => 'nullable|string',
            'pasatiempos' => 'nullable|string',
            'deportes' => 'nullable|string',
            'plato_favorito' => 'nullable|string|max:255',
            'color_favorito' => 'nullable|string|max:100',
            'informacion_adicional' => 'nullable|string',
            'nums_emergencia' => 'nullable|array|max:2',
            'nums_emergencia.*' => 'nullable|string|max:20',
            'ver_fichas' => 'nullable|boolean'
        ]);

        $hijo->update($validated);

        return Redirect::back()->with([
            'message' => 'Perfil actualizado exitosamente.',
            'hijo' => $hijo->fresh()
        ]);
    }

    // ===========================================
    // HEALTH RECORD (Ficha de Salud) CRUD
    // ===========================================

    /**
     * Store or update health record
     */
    public function storeSaludFicha(Request $request, $docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para gestionar esta ficha.');
        }

        $validated = $request->validate([
            'alergias' => 'nullable|string',
            'medicamentos' => 'nullable|string',
            'seguros' => 'nullable|string|max:255',
            'emergencia_contacto' => 'nullable|string|max:255',
            'emergencia_telefono' => 'nullable|string|max:20',
            'observaciones' => 'nullable|string'
        ]);

        $validated['hijo_id'] = $hijo->id;

        // Usar updateOrCreate para actualizar si existe o crear si no existe
        SaludFicha::updateOrCreate(
            ['hijo_id' => $hijo->id],
            $validated
        );

        return Redirect::back()->with('message', 'Ficha de salud guardada exitosamente.');
    }

    /**
     * Show health record
     */
    public function showSaludFicha($docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para ver esta ficha.');
        }

        $saludFicha = SaludFicha::where('hijo_id', $hijo->id)->first();

        return response()->json([
            'hijo' => $hijo,
            'saludFicha' => $saludFicha
        ]);
    }

    /**
     * Update health record
     */
    public function updateSaludFicha(Request $request, $docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para editar esta ficha.');
        }

        $saludFicha = SaludFicha::where('hijo_id', $hijo->id)->firstOrFail();

        $validated = $request->validate([
            'alergias' => 'nullable|string',
            'medicamentos' => 'nullable|string',
            'seguros' => 'nullable|string|max:255',
            'emergencia_contacto' => 'nullable|string|max:255',
            'emergencia_telefono' => 'nullable|string|max:20',
            'observaciones' => 'nullable|string'
        ]);

        $saludFicha->update($validated);

        return Redirect::back()->with('message', 'Ficha de salud actualizada exitosamente.');
    }

    /**
     * Delete health record
     */
    public function destroySaludFicha($docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para eliminar esta ficha.');
        }

        $saludFicha = SaludFicha::where('hijo_id', $hijo->id)->first();

        if ($saludFicha) {
            $saludFicha->delete();
            return Redirect::back()->with('message', 'Ficha de salud eliminada exitosamente.');
        }

        return Redirect::back()->with('error', 'No se encontró la ficha de salud.');
    }

    // ===========================================
    // NUTRITION RECORD (Ficha de Nutrición) CRUD
    // ===========================================

    /**
     * Store or update nutrition record
     */
    public function storeNutricionFicha(Request $request, $docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para gestionar esta ficha.');
        }

        $validated = $request->validate([
            'restricciones' => 'nullable|string',
            'preferencias' => 'nullable|string',
            'alergias_alimentarias' => 'nullable|string',
            'intolerancias' => 'nullable|string',
            'otras_notas' => 'nullable|string'
        ]);

        $validated['hijo_id'] = $hijo->id;

        // Usar updateOrCreate para actualizar si existe o crear si no existe
        NutricionFicha::updateOrCreate(
            ['hijo_id' => $hijo->id],
            $validated
        );

        return Redirect::back()->with('message', 'Ficha nutricional guardada exitosamente.');
    }

    /**
     * Show nutrition record
     */
    public function showNutricionFicha($docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para ver esta ficha.');
        }

        $nutricionFicha = NutricionFicha::where('hijo_id', $hijo->id)->first();

        return response()->json([
            'hijo' => $hijo,
            'nutricionFicha' => $nutricionFicha
        ]);
    }

    /**
     * Update nutrition record
     */
    public function updateNutricionFicha(Request $request, $docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para editar esta ficha.');
        }

        $nutricionFicha = NutricionFicha::where('hijo_id', $hijo->id)->firstOrFail();

        $validated = $request->validate([
            'restricciones' => 'nullable|string',
            'preferencias' => 'nullable|string',
            'alergias_alimentarias' => 'nullable|string',
            'intolerancias' => 'nullable|string',
            'otras_notas' => 'nullable|string'
        ]);

        $nutricionFicha->update($validated);

        return Redirect::back()->with('message', 'Ficha nutricional actualizada exitosamente.');
    }

    /**
     * Delete nutrition record
     */
    public function destroyNutricionFicha($docNumero)
    {
        $hijo = Hijo::where('doc_numero', $docNumero)->firstOrFail();

        // Verificar permisos
        if (!Auth::user()->is_admin && $hijo->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para eliminar esta ficha.');
        }

        $nutricionFicha = NutricionFicha::where('hijo_id', $hijo->id)->first();

        if ($nutricionFicha) {
            $nutricionFicha->delete();
            return Redirect::back()->with('message', 'Ficha nutricional eliminada exitosamente.');
        }

        return Redirect::back()->with('error', 'No se encontró la ficha nutricional.');
    }
}