<?php

namespace App\Http\Controllers;

use App\Models\Paquete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PaqueteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Paquete::query();
        
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('destino', 'like', "%{$search}%")
                  ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }
        
        $paquetes = $query->orderBy('nombre')->paginate(10);
        
        return Inertia::render('Paquetes/Index', [
            'paquetes' => $paquetes,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Paquetes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'activo' => 'boolean'
        ]);
        
        $validated['activo'] = $request->boolean('activo', true);
        
        Paquete::create($validated);
        
        return Redirect::route('paquetes.index')
                      ->with('success', 'Paquete creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Paquete $paquete)
    {
        return Inertia::render('Paquetes/Show', [
            'paquete' => $paquete->load(['grupos', 'inscripciones'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Paquete $paquete)
    {
        return Inertia::render('Paquetes/Edit', [
            'paquete' => $paquete
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Paquete $paquete)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'activo' => 'boolean'
        ]);
        
        $validated['activo'] = $request->boolean('activo', $paquete->activo);
        
        $paquete->update($validated);
        
        return Redirect::route('paquetes.index')
                      ->with('success', 'Paquete actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Paquete $paquete)
    {
        if ($paquete->grupos()->exists()) {
            return Redirect::route('paquetes.index')
                          ->with('error', 'No se puede eliminar el paquete porque tiene grupos asociados.');
        }
        
        $paquete->delete();
        
        return Redirect::route('paquetes.index')
                      ->with('success', 'Paquete eliminado exitosamente.');
    }
}