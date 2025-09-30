<?php

namespace App\Http\Controllers;

use App\Models\Grupo;
use App\Models\Subgrupo;
use App\Models\Paquete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                  ->orWhereHas('paquete', function($pq) use ($search) {
                      $pq->where('nombre', 'like', "%{$search}%")
                        ->orWhere('destino', 'like', "%{$search}%");
                  })
                  ->orWhereHas('subgrupos', function($sq) use ($search) {
                      $sq->where('nombre', 'like', "%{$search}%")
                        ->orWhere('nombre_encargado_principal', 'like', "%{$search}%")
                        ->orWhere('nombre_encargado_secundario', 'like', "%{$search}%");
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
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'capacidad' => 'required|integer|min:1|max:100',
            'activo' => 'boolean',
            'subgrupos' => 'nullable|array',
            'subgrupos.*.nombre' => 'required|string|max:255',
            'subgrupos.*.descripcion' => 'nullable|string',
            'subgrupos.*.tipo_encargado_principal' => 'required|in:padre,madre,tutor_legal,familiar,otro',
            'subgrupos.*.nombre_encargado_principal' => 'required|string|max:255',
            'subgrupos.*.celular_encargado_principal' => 'required|string|max:20',
            'subgrupos.*.email_encargado_principal' => 'nullable|email|max:255',
            'subgrupos.*.tipo_encargado_secundario' => 'nullable|in:padre,madre,tutor_legal,familiar,otro',
            'subgrupos.*.nombre_encargado_secundario' => 'nullable|string|max:255',
            'subgrupos.*.celular_encargado_secundario' => 'nullable|string|max:20',
            'subgrupos.*.email_encargado_secundario' => 'nullable|email|max:255',
            'subgrupos.*.capacidad_maxima' => 'required|integer|min:1|max:50',
            'subgrupos.*.activo' => 'boolean',
            'subgrupos.*.observaciones' => 'nullable|string',
            'documentos_links' => 'nullable|array',
            'documentos_links.*.titulo' => 'required|string|max:255',
            'documentos_links.*.url' => 'required|url|max:500'
        ]);
        
        $validated['activo'] = $request->boolean('activo', true);

        DB::transaction(function () use ($validated, $request) {
            // Extract subgroups data before creating the group
            $subgruposData = $validated['subgrupos'] ?? [];
            unset($validated['subgrupos']);

            // Create the group
            $grupo = Grupo::create($validated);

            // Create subgroups if any
            if (!empty($subgruposData)) {
                foreach ($subgruposData as $subgrupoData) {
                    $subgrupoData['grupo_id'] = $grupo->id;
                    $subgrupoData['activo'] = $subgrupoData['activo'] ?? true;
                    Subgrupo::create($subgrupoData);
                }
            }
        });

        return Redirect::route('grupos.index')
                      ->with('success', 'Grupo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Grupo $grupo)
    {
        $grupo->load(['paquete', 'subgrupos']);

        $inscripcionesQuery = $grupo->inscripciones()->with(['hijo', 'user', 'subgrupo']);
        
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $inscripcionesQuery->where(function($q) use ($search) {
                $q->whereHas('hijo', function($hq) use ($search) {
                    $hq->where('nombres', 'like', "%{$search}%");
                })
                ->orWhereHas('user', function($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%");
                });
            });
        }
        
        $inscripciones = $inscripcionesQuery->orderBy('created_at', 'desc')->paginate(10);
        
        return Inertia::render('Grupos/Show', [
            'grupo' => $grupo,
            'inscripciones' => $inscripciones,
            'filters' => $request->only(['search'])
        ]);
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
            'grupo' => $grupo->load(['paquete', 'subgrupos']),
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
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'capacidad' => 'required|integer|min:1|max:100',
            'activo' => 'boolean',
            'documentos_links' => 'nullable|array',
            'documentos_links.*.titulo' => 'required|string|max:255',
            'documentos_links.*.url' => 'required|url|max:500'
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