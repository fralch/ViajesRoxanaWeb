<?php

namespace App\Http\Controllers;

use App\Models\Subgrupo;
use App\Models\Grupo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubgrupoController extends Controller
{
    public function index(): Response|JsonResponse
    {
        $subgrupos = Subgrupo::with(['grupo.paquete', 'inscripciones.hijo'])
            ->orderBy('created_at', 'desc')
            ->get();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => $subgrupos
            ]);
        }

        return Inertia::render('Subgrupos/Index', compact('subgrupos'));
    }

    public function show(Subgrupo $subgrupo): Response|JsonResponse
    {
        $subgrupo->load(['grupo.paquete', 'inscripciones.hijo']);

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => $subgrupo
            ]);
        }

        return Inertia::render('Subgrupos/Show', compact('subgrupo'));
    }

    public function create(): Response
    {
        $grupos = Grupo::with('paquete')->activos()->get();
        return Inertia::render('Subgrupos/Create', compact('grupos'));
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'grupo_id' => 'required|exists:grupos,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo_encargado_principal' => 'required|in:padre,madre,tutor_legal,familiar,otro',
            'nombre_encargado_principal' => 'required|string|max:255',
            'celular_encargado_principal' => 'required|string|max:20',
            'email_encargado_principal' => 'nullable|email|max:255',
            'tipo_encargado_secundario' => 'nullable|in:padre,madre,tutor_legal,familiar,otro',
            'nombre_encargado_secundario' => 'nullable|string|max:255',
            'celular_encargado_secundario' => 'nullable|string|max:20',
            'email_encargado_secundario' => 'nullable|email|max:255',
            'capacidad_maxima' => 'required|integer|min:1|max:50',
            'activo' => 'boolean',
            'observaciones' => 'nullable|string'
        ]);

        $subgrupo = Subgrupo::create($validated);

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Subgrupo creado exitosamente',
                'data' => $subgrupo->load('grupo')
            ], 201);
        }

        return redirect()->route('subgrupos.index')
            ->with('success', 'Subgrupo creado exitosamente');
    }

    public function edit(Subgrupo $subgrupo): Response
    {
        $grupos = Grupo::with('paquete')->activos()->get();
        return Inertia::render('Subgrupos/Edit', compact('subgrupo', 'grupos'));
    }

    public function update(Request $request, Subgrupo $subgrupo): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'grupo_id' => 'required|exists:grupos,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo_encargado_principal' => 'required|in:padre,madre,tutor_legal,familiar,otro',
            'nombre_encargado_principal' => 'required|string|max:255',
            'celular_encargado_principal' => 'required|string|max:20',
            'email_encargado_principal' => 'nullable|email|max:255',
            'tipo_encargado_secundario' => 'nullable|in:padre,madre,tutor_legal,familiar,otro',
            'nombre_encargado_secundario' => 'nullable|string|max:255',
            'celular_encargado_secundario' => 'nullable|string|max:20',
            'email_encargado_secundario' => 'nullable|email|max:255',
            'capacidad_maxima' => 'required|integer|min:1|max:50',
            'activo' => 'boolean',
            'observaciones' => 'nullable|string'
        ]);

        $subgrupo->update($validated);

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Subgrupo actualizado exitosamente',
                'data' => $subgrupo->load('grupo')
            ]);
        }

        return redirect()->route('subgrupos.index')
            ->with('success', 'Subgrupo actualizado exitosamente');
    }

    public function destroy(Subgrupo $subgrupo): RedirectResponse|JsonResponse
    {
        if ($subgrupo->inscripciones()->count() > 0) {
            if (request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el subgrupo porque tiene inscripciones asociadas'
                ], 422);
            }

            return redirect()->route('subgrupos.index')
                ->with('error', 'No se puede eliminar el subgrupo porque tiene inscripciones asociadas');
        }

        $subgrupo->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Subgrupo eliminado exitosamente'
            ]);
        }

        return redirect()->route('subgrupos.index')
            ->with('success', 'Subgrupo eliminado exitosamente');
    }

    public function getByGrupo(Grupo $grupo): JsonResponse
    {
        $subgrupos = $grupo->subgrupos()
            ->activos()
            ->conCapacidad()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subgrupos
        ]);
    }

    public function toggleStatus(Subgrupo $subgrupo): JsonResponse
    {
        $subgrupo->update(['activo' => !$subgrupo->activo]);

        return response()->json([
            'success' => true,
            'message' => $subgrupo->activo ? 'Subgrupo activado' : 'Subgrupo desactivado',
            'data' => $subgrupo
        ]);
    }
}