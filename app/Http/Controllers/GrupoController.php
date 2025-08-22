<?php

namespace App\Http\Controllers;

use App\Models\Grupo;
use App\Models\Paquete;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class GrupoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Grupo::with('paquete');
        
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhereJsonContains('nombre_encargado', $search)
                  ->orWhereJsonContains('nombre_encargado_agencia', $search)
                  ->orWhereHas('paquete', function($pq) use ($search) {
                      $pq->where('nombre', 'like', "%{$search}%");
                  });
            });
        }
        
        $grupos = $query->orderBy('created_at', 'desc')->paginate(10);
        
        return Inertia::render('Grupos/Index', [
            'grupos' => $grupos,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $paquetes = Paquete::where('activo', true)
                          ->orderBy('nombre')
                          ->get(['id', 'nombre', 'destino']);
                          
        return Inertia::render('Grupos/Create', [
            'paquetes' => $paquetes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'paquete_id' => 'required|exists:paquetes,id',
            'nombre' => 'required|string|max:255',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'capacidad' => 'required|integer|min:1|max:100',
            'tipo_encargado' => 'required|array',
            'tipo_encargado.*' => 'required|string|max:255',
            'nombre_encargado' => 'required|array',
            'nombre_encargado.*' => 'required|string|max:255',
            'celular_encargado' => 'required|array',
            'celular_encargado.*' => 'required|string|max:20',
            'tipo_encargado_agencia' => 'nullable|array',
            'tipo_encargado_agencia.*' => 'nullable|string|max:255',
            'nombre_encargado_agencia' => 'nullable|array',
            'nombre_encargado_agencia.*' => 'nullable|string|max:255',
            'celular_encargado_agencia' => 'nullable|array',
            'celular_encargado_agencia.*' => 'nullable|string|max:20',
            'activo' => 'boolean'
        ]);
        
        $validated['activo'] = $request->boolean('activo', true);
        
        Grupo::create($validated);
        
        return Redirect::route('grupos.index')
                      ->with('success', 'Grupo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Grupo $grupo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Grupo $grupo)
    {
        $paquetes = Paquete::where('activo', true)
                          ->orderBy('nombre')
                          ->get(['id', 'nombre', 'destino']);
                          
        return Inertia::render('Grupos/Edit', [
            'grupo' => $grupo->load('paquete'),
            'paquetes' => $paquetes
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Grupo $grupo)
    {
        $validated = $request->validate([
            'paquete_id' => 'required|exists:paquetes,id',
            'nombre' => 'required|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'capacidad' => 'required|integer|min:1|max:100',
            'tipo_encargado' => 'required|array',
            'tipo_encargado.*' => 'required|string|max:255',
            'nombre_encargado' => 'required|array',
            'nombre_encargado.*' => 'required|string|max:255',
            'celular_encargado' => 'required|array',
            'celular_encargado.*' => 'required|string|max:20',
            'tipo_encargado_agencia' => 'nullable|array',
            'tipo_encargado_agencia.*' => 'nullable|string|max:255',
            'nombre_encargado_agencia' => 'nullable|array',
            'nombre_encargado_agencia.*' => 'nullable|string|max:255',
            'celular_encargado_agencia' => 'nullable|array',
            'celular_encargado_agencia.*' => 'nullable|string|max:20',
            'activo' => 'boolean'
        ]);
        
        $validated['activo'] = $request->boolean('activo', $grupo->activo);
        
        $grupo->update($validated);
        
        return Redirect::route('grupos.index')
                      ->with('success', 'Grupo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Grupo $grupo)
    {
        // Verificar si el grupo tiene inscripciones
        if ($grupo->inscripciones()->count() > 0) {
            return Redirect::back()
                          ->with('error', 'No se puede eliminar el grupo porque tiene inscripciones asociadas.');
        }
        
        $grupo->delete();
        
        return Redirect::route('grupos.index')
                      ->with('success', 'Grupo eliminado exitosamente.');
    }
}