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
        $search = request('search');

        $subgrupos = Subgrupo::with(['grupo.paquete', 'inscripciones.hijo'])
            ->withCount('inscripciones')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('nombre', 'like', '%' . $search . '%')
                      ->orWhere('nombre_encargado_principal', 'like', '%' . $search . '%')
                      ->orWhere('nombre_encargado_secundario', 'like', '%' . $search . '%')
                      ->orWhereHas('grupo', function ($query) use ($search) {
                          $query->where('nombre', 'like', '%' . $search . '%');
                      });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => $subgrupos
            ]);
        }

        $filters = request()->only(['search']);

        return Inertia::render('Subgrupos/Index', compact('subgrupos', 'filters'));
    }

    public function show(Subgrupo $subgrupo): Response|JsonResponse
    {
        $subgrupo->load(['grupo.paquete']);

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => $subgrupo
            ]);
        }

        // Get search parameter
        $search = request('search');

        // Load paginated inscriptions with detailed hijo information
        $inscripciones = $subgrupo->inscripciones()
            ->with([
                'hijo' => function($query) {
                    $query->select('id', 'nombres', 'doc_tipo', 'doc_numero', 'fecha_nacimiento',
                                   'pasatiempos', 'deportes', 'plato_favorito', 'color_favorito',
                                   'informacion_adicional', 'user_id', 'nums_emergencia');
                },
                'hijo.user:id,name,email',
                'user:id,name,email',
                'paquete:id,nombre,destino,descripcion',
                'grupo:id,nombre'
            ])
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->whereHas('hijo', function ($hijoQuery) use ($search) {
                        $hijoQuery->where('nombres', 'like', '%' . $search . '%')
                                  ->orWhere('doc_numero', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', '%' . $search . '%')
                                  ->orWhere('email', 'like', '%' . $search . '%');
                    });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Load data needed for inscription creation modal
        $paquetes = \App\Models\Paquete::where('activo', true)->get();
        $grupos = \App\Models\Grupo::where('activo', true)->with('paquete')->get();
        $subgrupos = \App\Models\Subgrupo::activos()->with(['grupo'])->get();

        // Si no es admin, solo mostrar sus hijos
        if (\Illuminate\Support\Facades\Auth::user()->is_admin) {
            $hijos = \App\Models\Hijo::with('user')->get();
        } else {
            $hijos = \App\Models\Hijo::where('user_id', \Illuminate\Support\Facades\Auth::id())->get();
        }

        // Pass search filters
        $filters = request()->only(['search']);

        return Inertia::render('Subgrupos/Show', compact('subgrupo', 'inscripciones', 'filters', 'paquetes', 'grupos', 'subgrupos', 'hijos'));
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