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
            'images' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'lugar_regis' => 'nullable|string|max:255',
        ]);

        // Verificar que el hijo pertenece al usuario autenticado
        $hijo = Hijo::where('id', $request->hijo_id)
                    ->where('user_id', auth()->id())
                    ->firstOrFail();

        // Procesar las imágenes
        $imagePaths = [];
        $imageFields = ['images', 'images1', 'images2'];

        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                $image = $request->file($field);
                $filename = time() . '_' . uniqid() . '_' . $field . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('equipaje', $filename, 'public');
                $imagePaths[$field] = $path;
            }
        }

        Equipaje::create([
            'hijo_id' => $request->hijo_id,
            'tip_maleta' => $request->tip_maleta,
            'num_etiqueta' => $request->num_etiqueta,
            'color' => $request->color,
            'caracteristicas' => $request->caracteristicas,
            'peso' => $request->peso,
            'images' => $imagePaths['images'] ?? null,
            'images1' => $imagePaths['images1'] ?? null,
            'images2' => $imagePaths['images2'] ?? null,
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
            'images' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'lugar_regis' => 'nullable|string|max:255',
        ]);

        // Verificar que el nuevo hijo también pertenece al usuario autenticado
        $hijo = Hijo::where('id', $request->hijo_id)
                    ->where('user_id', auth()->id())
                    ->firstOrFail();

        // Procesar las imágenes
        $imagePaths = [];
        $imageFields = ['images', 'images1', 'images2'];

        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                // Eliminar imagen anterior si existe
                if ($equipaje->$field && \Storage::disk('public')->exists($equipaje->$field)) {
                    \Storage::disk('public')->delete($equipaje->$field);
                }

                $image = $request->file($field);
                $filename = time() . '_' . uniqid() . '_' . $field . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('equipaje', $filename, 'public');
                $imagePaths[$field] = $path;
            } else {
                // Mantener la imagen existente si no se sube una nueva
                $imagePaths[$field] = $equipaje->$field;
            }
        }

        $equipaje->update([
            'hijo_id' => $request->hijo_id,
            'tip_maleta' => $request->tip_maleta,
            'num_etiqueta' => $request->num_etiqueta,
            'color' => $request->color,
            'caracteristicas' => $request->caracteristicas,
            'peso' => $request->peso,
            'images' => $imagePaths['images'],
            'images1' => $imagePaths['images1'],
            'images2' => $imagePaths['images2'],
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

        // Eliminar imágenes asociadas
        $imageFields = ['images', 'images1', 'images2'];
        foreach ($imageFields as $field) {
            if ($equipaje->$field && \Storage::disk('public')->exists($equipaje->$field)) {
                \Storage::disk('public')->delete($equipaje->$field);
            }
        }

        $equipaje->delete();

        return redirect()->route('equipaje.index')->with('success', 'Equipaje eliminado correctamente.');
    }
}