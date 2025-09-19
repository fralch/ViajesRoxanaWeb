<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Hijo;
use App\Models\Equipaje;

class EquipajeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Obtener los hijos del usuario con sus equipajes
        $hijos = $user->hijos()->with(['equipajes' => function($query) {
            $query->orderBy('created_at', 'desc');
        }])->get();

        return Inertia::render('Equipaje/Index', [
            'hijos' => $hijos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();
        $hijos = $user->hijos;

        return Inertia::render('Equipaje/Create', [
            'hijos' => $hijos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'hijo_id' => 'required|exists:hijos,id',
            'nombre_item' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'cantidad' => 'required|integer|min:1',
            'categoria' => 'required|string|in:ropa,calzado,higiene,medicamentos,electronica,documentos,otros',
            'peso_estimado' => 'nullable|numeric|min:0',
            'es_fragil' => 'boolean',
            'notas' => 'nullable|string',
        ]);

        // Verificar que el hijo pertenece al usuario autenticado
        $hijo = Hijo::where('id', $request->hijo_id)
                   ->where('user_id', auth()->id())
                   ->firstOrFail();

        Equipaje::create([
            'hijo_id' => $request->hijo_id,
            'nombre_item' => $request->nombre_item,
            'descripcion' => $request->descripcion,
            'cantidad' => $request->cantidad,
            'categoria' => $request->categoria,
            'peso_estimado' => $request->peso_estimado,
            'es_fragil' => $request->boolean('es_fragil'),
            'notas' => $request->notas,
        ]);

        return redirect()->route('equipaje.index')->with('success', 'Item de equipaje agregado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $equipaje = Equipaje::with('hijo')->findOrFail($id);
        
        // Verificar que el equipaje pertenece a un hijo del usuario autenticado
        if ($equipaje->hijo->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Equipaje/Show', [
            'equipaje' => $equipaje,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $equipaje = Equipaje::with('hijo')->findOrFail($id);
        
        // Verificar que el equipaje pertenece a un hijo del usuario autenticado
        if ($equipaje->hijo->user_id !== auth()->id()) {
            abort(403);
        }

        $user = auth()->user();
        $hijos = $user->hijos;

        return Inertia::render('Equipaje/Edit', [
            'equipaje' => $equipaje,
            'hijos' => $hijos,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $equipaje = Equipaje::with('hijo')->findOrFail($id);
        
        // Verificar que el equipaje pertenece a un hijo del usuario autenticado
        if ($equipaje->hijo->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'hijo_id' => 'required|exists:hijos,id',
            'nombre_item' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'cantidad' => 'required|integer|min:1',
            'categoria' => 'required|string|in:ropa,calzado,higiene,medicamentos,electronica,documentos,otros',
            'peso_estimado' => 'nullable|numeric|min:0',
            'es_fragil' => 'boolean',
            'notas' => 'nullable|string',
        ]);

        // Verificar que el nuevo hijo también pertenece al usuario autenticado
        $hijo = Hijo::where('id', $request->hijo_id)
                   ->where('user_id', auth()->id())
                   ->firstOrFail();

        $equipaje->update([
            'hijo_id' => $request->hijo_id,
            'nombre_item' => $request->nombre_item,
            'descripcion' => $request->descripcion,
            'cantidad' => $request->cantidad,
            'categoria' => $request->categoria,
            'peso_estimado' => $request->peso_estimado,
            'es_fragil' => $request->boolean('es_fragil'),
            'notas' => $request->notas,
        ]);

        return redirect()->route('equipaje.index')->with('success', 'Item de equipaje actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $equipaje = Equipaje::with('hijo')->findOrFail($id);
        
        // Verificar que el equipaje pertenece a un hijo del usuario autenticado
        if ($equipaje->hijo->user_id !== auth()->id()) {
            abort(403);
        }

        $equipaje->delete();

        return redirect()->route('equipaje.index')->with('success', 'Item de equipaje eliminado correctamente.');
    }
}