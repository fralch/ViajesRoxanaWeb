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
            'tip_maleta' => 'required|string|in:Maleta de 8 kg,Maleta de 23 kg',
            'num_etiqueta' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'caracteristicas' => 'nullable|string',
            'peso' => 'nullable|numeric|min:0',
            'images' => 'nullable|string',
            'images1' => 'nullable|string',
            'images2' => 'nullable|string',
            'lugar_regis' => 'nullable|string|max:255',
        ]);

        // Verificar que el hijo pertenece al usuario autenticado
        $hijo = Hijo::where('id', $request->hijo_id)
                   ->where('user_id', auth()->id())
                   ->firstOrFail();

        Equipaje::create([
            'hijo_id' => $request->hijo_id,
            'tip_maleta' => $request->tip_maleta,
            'num_etiqueta' => $request->num_etiqueta,
            'color' => $request->color,
            'caracteristicas' => $request->caracteristicas,
            'peso' => $request->peso,
            'images' => $request->images,
            'images1' => $request->images1,
            'images2' => $request->images2,
            'lugar_regis' => $request->lugar_regis,
        ]);

        return redirect()->route('equipaje.index')->with('success', 'Equipaje agregado correctamente.');
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
            'tip_maleta' => 'required|string|in:Maleta de 8 kg,Maleta de 23 kg',
            'num_etiqueta' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'caracteristicas' => 'nullable|string',
            'peso' => 'nullable|numeric|min:0',
            'images' => 'nullable|string',
            'images1' => 'nullable|string',
            'images2' => 'nullable|string',
            'lugar_regis' => 'nullable|string|max:255',
        ]);

        // Verificar que el nuevo hijo también pertenece al usuario autenticado
        $hijo = Hijo::where('id', $request->hijo_id)
                   ->where('user_id', auth()->id())
                   ->firstOrFail();

        $equipaje->update([
            'hijo_id' => $request->hijo_id,
            'tip_maleta' => $request->tip_maleta,
            'num_etiqueta' => $request->num_etiqueta,
            'color' => $request->color,
            'caracteristicas' => $request->caracteristicas,
            'peso' => $request->peso,
            'images' => $request->images,
            'images1' => $request->images1,
            'images2' => $request->images2,
            'lugar_regis' => $request->lugar_regis,
        ]);

        return redirect()->route('equipaje.index')->with('success', 'Equipaje actualizado correctamente.');
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

        return redirect()->route('equipaje.index')->with('success', 'Equipaje eliminado correctamente.');
    }
}