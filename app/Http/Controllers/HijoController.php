<?php

namespace App\Http\Controllers;

use App\Models\Hijo;
use App\Models\User;
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
        
        // Para admin, mostrar todos los usuarios con hijos y sus datos
        $query = User::whereHas('hijos')->with(['hijos' => function($hijoQuery) use ($request) {
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
        
        $users = $query->orderBy('name')->paginate(10);
        
        return Inertia::render('Hijos/Index', [
            'users' => $users,
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
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'nombres' => 'required|string|max:255',
            'doc_tipo' => 'required|in:CC,TI,RC,CE',
            'doc_numero' => 'required|string|max:20|unique:hijos,doc_numero',
            'nums_emergencia' => 'required|array|min:1',
            'nums_emergencia.*' => 'required|string|max:20',
            'fecha_nacimiento' => 'required|date|before:today',
            'foto' => 'nullable|string',
            'pasatiempos' => 'nullable|string',
            'deportes' => 'nullable|string',
            'plato_favorito' => 'nullable|string|max:255',
            'color_favorito' => 'nullable|string|max:100',
            'informacion_adicional' => 'nullable|string'
        ]);
        
        // Si no es admin, asignar al usuario autenticado
        if (!Auth::user()->is_admin) {
            $validated['user_id'] = Auth::id();
        }
        
        Hijo::create($validated);
        
        return Redirect::route('hijos.index')
                      ->with('success', 'Hijo registrado exitosamente.');
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
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'nombres' => 'required|string|max:255',
            'doc_numero' => 'required|string|max:20|unique:hijos,doc_numero,' . $hijo->id,
            'nums_emergencia' => 'required|array|min:1',
            'nums_emergencia.*' => 'required|string|max:20',
            'fecha_nacimiento' => 'required|date|before:today'
        ]);
        
        // El tipo de documento no se puede cambiar, mantener el actual
        $validated['doc_tipo'] = $hijo->doc_tipo;
        
        // Si no es admin, mantener el usuario actual
        if (!Auth::user()->is_admin) {
            $validated['user_id'] = $hijo->user_id;
        }
        
        $hijo->update($validated);
        
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
}