<?php

namespace App\Http\Controllers;

use App\Models\Paquete;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class PaqueteController extends Controller
{
    public function index(Request $request)
    {
        $query = Paquete::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('destino', 'like', "%{$search}%");
            });
        }

        $paquetes = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Paquetes/Index', [
            'paquetes' => $paquetes,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Paquetes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean'
        ]);

        $validated['activo'] = $request->boolean('activo', true);

        Paquete::create($validated);

        return Redirect::route('paquetes.index')
                      ->with('success', 'Paquete creado exitosamente.');
    }

    public function edit(Paquete $paquete)
    {
        return Inertia::render('Paquetes/Edit', [
            'paquete' => $paquete,
        ]);
    }

    public function update(Request $request, Paquete $paquete)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'destino' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean'
        ]);

        $validated['activo'] = $request->boolean('activo', $paquete->activo);

        $paquete->update($validated);

        return Redirect::route('paquetes.index')
                      ->with('success', 'Paquete actualizado exitosamente.');
    }

    public function destroy(Paquete $paquete)
    {
        if ($paquete->grupos()->count() > 0) {
            return Redirect::back()
                          ->with('error', 'No se puede eliminar el paquete porque tiene grupos asociados.');
        }

        $paquete->delete();

        return Redirect::route('paquetes.index')
                      ->with('success', 'Paquete eliminado exitosamente.');
    }
}
