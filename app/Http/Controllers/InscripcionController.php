<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use App\Models\Paquete;
use App\Models\Grupo;
use App\Models\Subgrupo;
use App\Models\User;
use App\Models\Hijo;
use App\Http\Requests\StoreInscripcionFormRequest;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InscripcionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Inscripcion::with(['hijo', 'paquete', 'grupo', 'subgrupo', 'user']);
        
        // Si no es admin, solo mostrar sus propias inscripciones
        if (!Auth::user()->is_admin) {
            $query->where('usuario_id', Auth::id());
        }
        
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('hijo', function($hq) use ($search) {
                    $hq->where('nombres', 'like', "%{$search}%")
                       ->orWhere('doc_numero', 'like', "%{$search}%");
                })
                ->orWhereHas('paquete', function($pq) use ($search) {
                    $pq->where('nombre', 'like', "%{$search}%")
                       ->orWhere('destino', 'like', "%{$search}%");
                })
                ->orWhereHas('grupo', function($gq) use ($search) {
                    $gq->where('nombre', 'like', "%{$search}%");
                })
                ->orWhereHas('subgrupo', function($sq) use ($search) {
                    $sq->where('nombre', 'like', "%{$search}%");
                });
            });
        }
        
        $inscripciones = $query->orderBy('created_at', 'desc')->paginate(10);
        
        return Inertia::render('Inscripciones/Index', [
            'inscripciones' => $inscripciones,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $paquetes = Paquete::where('activo', true)->get();
        $grupos = Grupo::where('activo', true)->with('paquete')->get();
        $subgrupos = Subgrupo::activos()->with(['grupo'])->get();
        
        // Si no es admin, solo mostrar sus hijos
        if (Auth::user()->is_admin) {
            $hijos = Hijo::with('user')->get();
        } else {
            $hijos = Hijo::where('user_id', Auth::id())->get();
        }
        
        return Inertia::render('Inscripciones/Create', [
            'paquetes' => $paquetes,
            'grupos' => $grupos,
            'subgrupos' => $subgrupos,
            'hijos' => $hijos
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $paqueteId = null, $grupoId = null, $subgrupoId = null)
    {
        $validated = $request->validate([
            'hijo_id' => 'required|exists:hijos,id',
            'paquete_id' => 'required|exists:paquetes,id',
            'grupo_id' => 'required|exists:grupos,id',
            'subgrupo_id' => 'required|exists:subgrupos,id',
            'usuario_id' => 'required|exists:users,id'
        ]);
        
        // Verificar que el grupo pertenece al paquete
        $grupo = Grupo::findOrFail($validated['grupo_id']);
        if ($grupo->paquete_id != $validated['paquete_id']) {
            return back()->withErrors(['grupo_id' => 'El grupo seleccionado no pertenece al paquete.']);
        }

        // Verificar que el subgrupo pertenece al grupo
        $subgrupo = Subgrupo::findOrFail($validated['subgrupo_id']);
        if ($subgrupo->grupo_id != $validated['grupo_id']) {
            return back()->withErrors(['subgrupo_id' => 'El subgrupo seleccionado no pertenece al grupo.']);
        }

        // Verificar que el subgrupo está activo
        if (!$subgrupo->activo) {
            return back()->withErrors(['subgrupo_id' => 'El subgrupo seleccionado no está activo.']);
        }

        // Verificar capacidad del subgrupo
        if (!$subgrupo->tieneCapacidad()) {
            return back()->withErrors(['subgrupo_id' => 'El subgrupo ya no tiene cupos disponibles.']);
        }

        // Verificar que el hijo pertenece al usuario (si no es admin)
        $hijo = Hijo::findOrFail($validated['hijo_id']);
        if (!Auth::user()->is_admin) {
            if ($hijo->user_id !== Auth::id()) {
                abort(403, 'No tienes permisos para inscribir este hijo.');
            }
            $validated['usuario_id'] = Auth::id();
        }
        
        // Ya no verificamos capacidad del grupo, solo del subgrupo
        
        // Verificar que no exista inscripción duplicada en el subgrupo
        $existeInscripcion = Inscripcion::where('hijo_id', $validated['hijo_id'])
                                      ->where('subgrupo_id', $validated['subgrupo_id'])
                                      ->exists();

        if ($existeInscripcion) {
            return back()->withErrors(['hijo_id' => 'Este hijo ya está inscrito en el subgrupo seleccionado.']);
        }
        
        Inscripcion::create($validated);
        
        return Redirect::route('inscripciones.index')
                      ->with('success', 'Inscripción creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Inscripcion $inscripcion)
    {
        // Verificar permisos
        if (!Auth::user()->is_admin && $inscripcion->usuario_id !== Auth::id()) {
            abort(403, 'No tienes permisos para ver esta inscripción.');
        }

        return Inertia::render('Inscripciones/Show', [
            'inscripcion' => $inscripcion->load(['hijo', 'paquete', 'grupo', 'subgrupo', 'user'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inscripcion $inscripcion)
    {
        $paquetes = Paquete::where('activo', true)->get();
        $grupos = Grupo::where('activo', true)->with('paquete')->get();
        $subgrupos = Subgrupo::activos()->with(['grupo'])->get();

        // Si no es admin, solo mostrar sus hijos
        if (Auth::user()->is_admin) {
            $hijos = Hijo::with('user')->get();
        } else {
            $hijos = Hijo::where('user_id', Auth::id())->get();
        }

        return Inertia::render('Inscripciones/Edit', [
            'inscripcion' => $inscripcion->load(['hijo', 'paquete', 'grupo', 'subgrupo', 'user']),
            'paquetes' => $paquetes,
            'grupos' => $grupos,
            'subgrupos' => $subgrupos,
            'hijos' => $hijos
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inscripcion $inscripcion)
    {
        // Verificar permisos
        if (!Auth::user()->is_admin && $inscripcion->usuario_id !== Auth::id()) {
            abort(403, 'No tienes permisos para editar esta inscripción.');
        }
        
        $validated = $request->validate([
            'hijo_id' => 'required|exists:hijos,id',
            'paquete_id' => 'required|exists:paquetes,id',
            'grupo_id' => 'required|exists:grupos,id',
            'subgrupo_id' => 'required|exists:subgrupos,id',
            'usuario_id' => 'required|exists:users,id'
        ]);
        
        // Verificar que el grupo pertenece al paquete
        $grupo = Grupo::findOrFail($validated['grupo_id']);
        if ($grupo->paquete_id != $validated['paquete_id']) {
            return back()->withErrors(['grupo_id' => 'El grupo seleccionado no pertenece al paquete.']);
        }
        
        // Verificar que el hijo pertenece al usuario (si no es admin)
        $hijo = Hijo::findOrFail($validated['hijo_id']);
        if (!Auth::user()->is_admin) {
            if ($hijo->user_id !== Auth::id()) {
                abort(403, 'No tienes permisos para inscribir este hijo.');
            }
            $validated['usuario_id'] = $inscripcion->usuario_id;
        }
        
        // Verificar que el subgrupo pertenece al grupo
        $subgrupo = Subgrupo::findOrFail($validated['subgrupo_id']);
        if ($subgrupo->grupo_id != $validated['grupo_id']) {
            return back()->withErrors(['subgrupo_id' => 'El subgrupo seleccionado no pertenece al grupo.']);
        }

        // Verificar que el subgrupo está activo
        if (!$subgrupo->activo) {
            return back()->withErrors(['subgrupo_id' => 'El subgrupo seleccionado no está activo.']);
        }

        // Verificar capacidad del subgrupo (excluyendo la inscripción actual)
        $inscripcionesEnSubgrupo = Inscripcion::where('subgrupo_id', $validated['subgrupo_id'])
                                            ->where('id', '!=', $inscripcion->id)
                                            ->count();
        if ($inscripcionesEnSubgrupo >= $subgrupo->capacidad_maxima) {
            return back()->withErrors(['subgrupo_id' => 'El subgrupo ya no tiene cupos disponibles.']);
        }

        // Verificar que no exista inscripción duplicada en el subgrupo (excluyendo la actual)
        $existeInscripcion = Inscripcion::where('hijo_id', $validated['hijo_id'])
                                      ->where('subgrupo_id', $validated['subgrupo_id'])
                                      ->where('id', '!=', $inscripcion->id)
                                      ->exists();
        if ($existeInscripcion) {
            return back()->withErrors(['hijo_id' => 'Este hijo ya está inscrito en el subgrupo seleccionado.']);
        }
        
        $inscripcion->update($validated);
        
        return Redirect::route('inscripciones.index')
                      ->with('success', 'Inscripción actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inscripcion $inscripcion)
    {
        // Verificar permisos
        if (!Auth::user()->is_admin && $inscripcion->usuario_id !== Auth::id()) {
            abort(403, 'No tienes permisos para eliminar esta inscripción.');
        }
        
        $inscripcion->delete();
        
        return Redirect::route('inscripciones.index')
                      ->with('success', 'Inscripción eliminada exitosamente.');
    }

    /**
     * Mostrar formulario público de inscripción (grupo solamente)
     */
    public function showForm(Paquete $paquete, Grupo $grupo)
    {
        // Verificar que el grupo pertenece al paquete
        if ($grupo->paquete_id !== $paquete->id) {
            abort(404, 'El grupo no pertenece a este paquete');
        }

        // Verificar que el paquete y grupo estén activos
        if (!$paquete->activo || !$grupo->activo) {
            return Inertia::render('Inscripciones/form', [
                'paquete' => null,
                'grupo' => null,
                'subgrupo' => null,
                'capacidadDisponible' => 0,
                'hijosInscritos' => [],
                'error' => 'Este paquete o grupo no está disponible para inscripciones.'
            ]);
        }

        // Obtener subgrupos activos del grupo
        $subgrupos = $grupo->subgrupos()->activos()->get();

        // Si no hay subgrupos, mostrar error
        if ($subgrupos->isEmpty()) {
            return Inertia::render('Inscripciones/form', [
                'paquete' => $paquete,
                'grupo' => $grupo,
                'subgrupo' => null,
                'capacidadDisponible' => 0,
                'hijosInscritos' => [],
                'error' => 'Este grupo no tiene subgrupos activos disponibles para inscripciones.'
            ]);
        }

        // Calcular capacidad total disponible del grupo (suma de todos los subgrupos)
        $capacidadTotal = $subgrupos->sum('capacidad_maxima');
        $inscritosCount = Inscripcion::whereIn('subgrupo_id', $subgrupos->pluck('id'))->count();
        $capacidadDisponible = $capacidadTotal - $inscritosCount;

        // Obtener hijos inscritos en TODOS los subgrupos de este grupo con información completa
        $hijosInscritos = Hijo::select('id', 'nombres', 'doc_tipo', 'doc_numero', 'user_id', 'fecha_nacimiento')
            ->whereHas('inscripciones', function($query) use ($subgrupos) {
                $query->whereIn('subgrupo_id', $subgrupos->pluck('id'));
            })
            ->with(['user:id,name,email,phone', 'inscripciones' => function($query) use ($subgrupos) {
                $query->whereIn('subgrupo_id', $subgrupos->pluck('id'))->with('subgrupo:id,nombre');
            }])
            ->get()
            ->map(function($hijo) use ($subgrupos) {
                // Obtener el subgrupo específico donde está inscrito
                $inscripcion = $hijo->inscripciones->first();
                return [
                    'id' => $hijo->id,
                    'nombres' => $hijo->nombres,
                    'doc_tipo' => $hijo->doc_tipo,
                    'doc_numero' => $hijo->doc_numero,
                    'fecha_nacimiento' => $hijo->fecha_nacimiento,
                    'user_id' => $hijo->user_id,
                    'subgrupo_nombre' => $inscripcion ? $inscripcion->subgrupo->nombre : 'Sin subgrupo',
                    'user' => $hijo->user ? [
                        'id' => $hijo->user->id,
                        'name' => $hijo->user->name,
                        'email' => $hijo->user->email,
                        'phone' => $hijo->user->phone
                    ] : null
                ];
            });

        return Inertia::render('Inscripciones/form', [
            'paquete' => $paquete,
            'grupo' => $grupo,
            'subgrupo' => null, // No hay subgrupo específico
            'capacidadDisponible' => $capacidadDisponible,
            'hijosInscritos' => $hijosInscritos,
            'error' => $capacidadDisponible <= 0 ? 'Este grupo ya no tiene cupos disponibles.' : null
        ]);
    }

    /**
     * Mostrar página de selección de subgrupos
     */
    public function showSubgrupoSelection(Paquete $paquete, Grupo $grupo)
    {
        // Verificar que el grupo pertenece al paquete
        if ($grupo->paquete_id !== $paquete->id) {
            abort(404, 'El grupo no pertenece a este paquete');
        }

        // Verificar que el paquete y grupo estén activos
        if (!$paquete->activo || !$grupo->activo) {
            return Inertia::render('Inscripciones/SubgrupoSelection', [
                'paquete' => $paquete,
                'grupo' => $grupo,
                'subgrupos' => [],
                'error' => 'Este paquete o grupo no está disponible para inscripciones.'
            ]);
        }

        // Obtener subgrupos activos del grupo con conteos de inscripciones
        $subgrupos = $grupo->subgrupos()
            ->activos()
            ->withCount('inscripciones')
            ->orderBy('nombre')
            ->get();

        // Si no hay subgrupos, mostrar error
        if ($subgrupos->isEmpty()) {
            return Inertia::render('Inscripciones/SubgrupoSelection', [
                'paquete' => $paquete,
                'grupo' => $grupo,
                'subgrupos' => [],
                'error' => 'Este grupo no tiene subgrupos activos disponibles para inscripciones.'
            ]);
        }

        return Inertia::render('Inscripciones/SubgrupoSelection', [
            'paquete' => $paquete,
            'grupo' => $grupo,
            'subgrupos' => $subgrupos,
            'error' => null
        ]);
    }

    /**
     * Mostrar formulario público de inscripción para subgrupo específico
     */
    public function showFormSubgrupo(Paquete $paquete, Grupo $grupo, Subgrupo $subgrupo)
    {
        // Verificar que el grupo pertenece al paquete
        if ($grupo->paquete_id !== $paquete->id) {
            abort(404, 'El grupo no pertenece a este paquete');
        }

        // Verificar que el subgrupo pertenece al grupo
        if ($subgrupo->grupo_id !== $grupo->id) {
            abort(404, 'El subgrupo no pertenece a este grupo');
        }

        // Verificar que el paquete, grupo y subgrupo estén activos
        if (!$paquete->activo || !$grupo->activo || !$subgrupo->activo) {
            return Inertia::render('Inscripciones/form', [
                'paquete' => null,
                'grupo' => null,
                'subgrupo' => null,
                'capacidadDisponible' => 0,
                'error' => 'Este paquete, grupo o subgrupo no está disponible para inscripciones.'
            ]);
        }

        // Calcular capacidad disponible del subgrupo
        $inscritosCount = Inscripcion::where('subgrupo_id', $subgrupo->id)->count();
        $capacidadDisponible = $subgrupo->capacidad_maxima - $inscritosCount;

        // Obtener hijos inscritos en este subgrupo con información completa
        $hijosInscritos = Hijo::select('id', 'nombres', 'doc_tipo', 'doc_numero', 'user_id', 'fecha_nacimiento')
            ->whereHas('inscripciones', function($query) use ($subgrupo) {
                $query->where('subgrupo_id', $subgrupo->id);
            })
            ->with('user:id,name,email,phone')
            ->get()
            ->map(function($hijo) {
                return [
                    'id' => $hijo->id,
                    'nombres' => $hijo->nombres,
                    'doc_tipo' => $hijo->doc_tipo,
                    'doc_numero' => $hijo->doc_numero,
                    'fecha_nacimiento' => $hijo->fecha_nacimiento,
                    'user_id' => $hijo->user_id,
                    'user' => $hijo->user ? [
                        'id' => $hijo->user->id,
                        'name' => $hijo->user->name,
                        'email' => $hijo->user->email,
                        'phone' => $hijo->user->phone
                    ] : null
                ];
            });

        if ($capacidadDisponible <= 0) {
            return Inertia::render('Inscripciones/form', [
                'paquete' => $paquete,
                'grupo' => $grupo,
                'subgrupo' => $subgrupo,
                'capacidadDisponible' => 0,
                'hijosInscritos' => $hijosInscritos,
                'error' => 'Este subgrupo ya no tiene cupos disponibles.'
            ]);
        }

        return Inertia::render('Inscripciones/form', [
            'paquete' => $paquete,
            'grupo' => $grupo,
            'subgrupo' => $subgrupo,
            'capacidadDisponible' => $capacidadDisponible,
            'hijosInscritos' => $hijosInscritos,
            'error' => null
        ]);
    }

    /**
     * Procesar inscripción desde formulario público
     */
    public function storeForm(Request $request, Paquete $paquete, Grupo $grupo)
    {
        \Log::info('=== STORE FORM GRUPO START ===');
        \Log::info('Request data received:', $request->all());
        \Log::info('Request method:', ['method' => $request->method()]);
        \Log::info('Has assign_guardian?', ['has_assign_guardian' => $request->has('assign_guardian')]);
        \Log::info('assign_guardian value:', ['assign_guardian' => $request->assign_guardian]);

        // Verificar que el grupo pertenece al paquete
        if ($grupo->paquete_id !== $paquete->id) {
            abort(404, 'El grupo no pertenece a este paquete');
        }

        // Verificar que el paquete y grupo estén activos
        if (!$paquete->activo || !$grupo->activo) {
            return back()->withErrors([
                'capacity' => 'Este paquete o grupo no está disponible para inscripciones.'
            ]);
        }

        // Check if this is a guardian assignment request
        if ($request->has('assign_guardian') && $request->assign_guardian) {
            \Log::info('Redirecting to handleGuardianAssignmentGroup method');
            return $this->handleGuardianAssignmentGroup($request, $paquete, $grupo);
        }

        return back()->withErrors([
            'capacity' => 'Esta funcionalidad se ha actualizado para confirmación de inscripciones por grupo.'
        ]);
    }

    /**
     * Procesar inscripción desde formulario público para subgrupo específico
     */
    public function storeFormSubgrupo(StoreInscripcionFormRequest $request, Paquete $paquete, Grupo $grupo, Subgrupo $subgrupo)
    {
        \Log::info('=== STORE FORM SUBGRUPO START ===');
        \Log::info('Request data received:', $request->all());
        \Log::info('Request method:', ['method' => $request->method()]);
        \Log::info('Has assign_guardian?', ['has_assign_guardian' => $request->has('assign_guardian')]);
        \Log::info('assign_guardian value:', ['assign_guardian' => $request->assign_guardian]);

        // Verificar que el grupo pertenece al paquete
        if ($grupo->paquete_id !== $paquete->id) {
            abort(404, 'El grupo no pertenece a este paquete');
        }

        // Verificar que el subgrupo pertenece al grupo
        if ($subgrupo->grupo_id !== $grupo->id) {
            abort(404, 'El subgrupo no pertenece a este grupo');
        }

        // Verificar que el paquete, grupo y subgrupo estén activos
        if (!$paquete->activo || !$grupo->activo || !$subgrupo->activo) {
            return back()->withErrors([
                'capacity' => 'Este paquete, grupo o subgrupo no está disponible para inscripciones.'
            ]);
        }

        // Validar datos (ya validados por el FormRequest)
        $validated = $request->validated();
        \Log::info('Validated data:', $validated);

        // Check if this is a guardian assignment request
        if ($request->has('assign_guardian') && $request->assign_guardian) {
            \Log::info('Redirecting to handleGuardianAssignment method');
            return $this->handleGuardianAssignment($request, $paquete, $grupo, $subgrupo);
        }

        \Log::info('Processing regular inscription (not guardian assignment)');

        // Verificar capacidad disponible del subgrupo
        $inscritosCount = Inscripcion::where('subgrupo_id', $subgrupo->id)->count();
        $capacidadDisponible = $subgrupo->capacidad_maxima - $inscritosCount;

        if ($capacidadDisponible < count($validated['children'])) {
            return back()->withErrors([
                'capacity' => 'No hay suficientes cupos disponibles en el subgrupo para todos los niños.'
            ]);
        }

        try {
            DB::transaction(function () use ($validated, $paquete, $grupo, $subgrupo) {
                // Buscar usuario existente por DNI
                $user = User::where('dni', $validated['parent_dni'])->first();

                if (!$user) {
                    // Verificar si ya existe un usuario con el mismo email o teléfono
                    $existingUserByEmail = User::where('email', $validated['parent_email'])->first();
                    $existingUserByPhone = User::where('phone', $validated['parent_phone'])->first();

                    if ($existingUserByEmail) {
                        throw new \Exception('email_exists');
                    }

                    if ($existingUserByPhone) {
                        throw new \Exception('phone_exists');
                    }

                    // Crear contraseña con DNI
                    $password = $validated['parent_dni'];

                    $user = User::create([
                        'name' => $validated['parent_name'],
                        'email' => $validated['parent_email'],
                        'phone' => $validated['parent_phone'],
                        'dni' => $validated['parent_dni'],
                        'password' => Hash::make($password),
                        'email_verified_at' => now(),
                        'is_admin' => false,
                    ]);

                    // Enviar WhatsApp si el usuario fue creado exitosamente
                    if ($user) {
                        WhatsAppService::enviarWhatsApp($validated['parent_phone'], $validated['parent_email'], $password);
                    }
                } else {
                    // Si el usuario ya existe, actualizar datos si es necesario
                    $user->update([
                        'name' => $validated['parent_name'],
                        'email' => $validated['parent_email'],
                        'phone' => $validated['parent_phone'],
                        'dni' => $validated['parent_dni'],
                    ]);
                }

                // Crear hijos e inscripciones
                foreach ($validated['children'] as $childData) {
                    // Verificar si ya existe un hijo con el mismo documento para este usuario
                    $hijoExistente = Hijo::where('user_id', $user->id)
                                        ->where('doc_tipo', $childData['docType'])
                                        ->where('doc_numero', $childData['docNumber'])
                                        ->first();

                    if ($hijoExistente) {
                        $hijo = $hijoExistente;
                        // Actualizar datos del hijo si es necesario
                        $hijo->update([
                            'nombres' => $childData['name'],
                            'nums_emergencia' => [$validated['parent_phone']], // Actualizar contacto de emergencia
                        ]);
                    } else {
                        $hijo = Hijo::create([
                            'nombres' => $childData['name'],
                            'doc_tipo' => $childData['docType'],
                            'doc_numero' => $childData['docNumber'],
                            'user_id' => $user->id,
                            'nums_emergencia' => [$validated['parent_phone']], // Teléfono del padre como contacto de emergencia
                        ]);
                    }

                    // Verificar que no exista inscripción duplicada en el subgrupo
                    $existeInscripcion = Inscripcion::where('hijo_id', $hijo->id)
                                                  ->where('subgrupo_id', $subgrupo->id)
                                                  ->exists();

                    if (!$existeInscripcion) {
                        Inscripcion::create([
                            'hijo_id' => $hijo->id,
                            'paquete_id' => $paquete->id,
                            'grupo_id' => $grupo->id,
                            'subgrupo_id' => $subgrupo->id,
                            'usuario_id' => $user->id,
                        ]);
                    }
                }
            });

            return redirect()->route('inscripcion.subgrupo.form', [$paquete->id, $grupo->id, $subgrupo->id])
                ->with('success', 'Inscripción realizada exitosamente. Recibirás un correo con los detalles.');
        } catch (\Exception $e) {
            if ($e->getMessage() === 'email_exists') {
                return back()->withErrors([
                    'parent_email' => 'Ya existe un usuario registrado con este correo electrónico.'
                ]);
            }

            if ($e->getMessage() === 'phone_exists') {
                return back()->withErrors([
                    'parent_phone' => 'Ya existe un usuario registrado con este número de teléfono.'
                ]);
            }

            // Re-lanzar la excepción si no es una de las que manejamos
            throw $e;
        }
    }

    /**
     * Handle guardian assignment to an existing child
     */
    private function handleGuardianAssignment(Request $request, Paquete $paquete, Grupo $grupo, Subgrupo $subgrupo)
    {
        \Log::info('=== GUARDIAN ASSIGNMENT DEBUG START ===');
        \Log::info('Full request data:', $request->all());
        \Log::info('Request method:', ['method' => $request->method()]);
        \Log::info('Request headers:', $request->headers->all());
        \Log::info('Request input:', $request->input());

        \Log::info('Selected child ID:', ['selected_child_id' => $request->selected_child_id]);
        \Log::info('User creation mode:', ['user_creation_mode' => $request->user_creation_mode]);
        \Log::info('Confirm existing guardian:', ['confirm_existing_guardian' => $request->confirm_existing_guardian]);
        \Log::info('Assign guardian:', ['assign_guardian' => $request->assign_guardian]);

        \Log::info('Parent data received:', [
            'parent_name' => $request->parent_name,
            'parent_email' => $request->parent_email,
            'parent_phone' => $request->parent_phone,
            'parent_dni' => $request->parent_dni
        ]);

        $childId = $request->selected_child_id;
        $userCreationMode = $request->user_creation_mode;
        $confirmExistingGuardian = $request->confirm_existing_guardian;

        // Find the child
        $child = Hijo::findOrFail($childId);
        \Log::info('Child found:', ['id' => $child->id, 'nombres' => $child->nombres, 'user_id' => $child->user_id]);

        // Verify the child is enrolled in this subgroup
        $inscription = Inscripcion::where('hijo_id', $childId)
            ->where('subgrupo_id', $subgrupo->id)
            ->first();

        if (!$inscription) {
            \Log::error('Child not enrolled in subgroup:', ['child_id' => $childId, 'subgrupo_id' => $subgrupo->id]);
            return back()->withErrors([
                'selected_child_id' => 'El niño seleccionado no está inscrito en este subgrupo.'
            ]);
        }

        \Log::info('Inscription found:', ['id' => $inscription->id, 'confirmado' => $inscription->confirmado ?? 'null']);

        // If just confirming existing guardian, confirm inscription and send WhatsApp message
        if ($confirmExistingGuardian && $child->user_id !== 1) {
            \Log::info('Confirming existing guardian for child');
            $existingUser = User::find($child->user_id);

            if ($existingUser) {
                \Log::info('Existing guardian found:', ['id' => $existingUser->id, 'name' => $existingUser->name]);

                // Confirm the inscription
                $inscription->update(['confirmado' => true]);
                \Log::info('Inscription confirmed');

                // Send WhatsApp confirmation message
                WhatsAppService::enviarConfirmacionInscripcion(
                    $existingUser->phone,
                    $child->nombres,
                    $subgrupo->nombre,
                    $paquete->nombre,
                    $existingUser->email,
                    $existingUser->dni  // Password is DNI
                );
                \Log::info('WhatsApp confirmation sent');

                return response()->json([
                    'success' => true,
                    'message' => 'Inscripción confirmada exitosamente. Se ha enviado un mensaje de confirmación por WhatsApp.'
                ]);
            }

            \Log::error('Existing guardian not found for user_id:', $child->user_id);
            return response()->json([
                'success' => false,
                'message' => 'No se pudo encontrar el apoderado del niño.'
            ], 400);
        }

        \Log::info('Child needs new guardian assignment');

        try {
            DB::transaction(function () use ($request, $child, $inscription, $userCreationMode, $subgrupo, $paquete) {
                \Log::info('Starting DB transaction for guardian assignment');

                if ($userCreationMode) {
                    \Log::info('Creating new user for guardian assignment', ['request_data' => [
                        'parent_name' => $request->parent_name,
                        'parent_email' => $request->parent_email,
                        'parent_phone' => $request->parent_phone,
                        'parent_dni' => $request->parent_dni
                    ]]);

                    // Validate required fields for new user creation
                    if (!$request->parent_name || !$request->parent_email || !$request->parent_phone || !$request->parent_dni) {
                        throw new \Exception('missing_required_fields');
                    }

                    // Create new user
                    $existingUserByEmail = User::where('email', $request->parent_email)->first();
                    $existingUserByPhone = User::where('phone', $request->parent_phone)->first();
                    $existingUserByDni = User::where('dni', $request->parent_dni)->first();

                    if ($existingUserByEmail) {
                        \Log::error('Email already exists:', $request->parent_email);
                        throw new \Exception('email_exists');
                    }
                    if ($existingUserByPhone) {
                        \Log::error('Phone already exists:', $request->parent_phone);
                        throw new \Exception('phone_exists');
                    }
                    if ($existingUserByDni) {
                        \Log::error('DNI already exists:', $request->parent_dni);
                        throw new \Exception('dni_exists');
                    }

                    $password = $request->parent_dni;

                    $newUser = User::create([
                        'name' => $request->parent_name,
                        'email' => $request->parent_email,
                        'phone' => $request->parent_phone,
                        'dni' => $request->parent_dni,
                        'password' => Hash::make($password),
                        'email_verified_at' => now(),
                        'is_admin' => false,
                    ]);

                    \Log::info('New user created:', ['id' => $newUser->id, 'name' => $newUser->name, 'email' => $newUser->email, 'phone' => $newUser->phone]);

                    // CRITICAL FIX: Update child's user_id to new guardian
                    $child->update([
                        'user_id' => $newUser->id,
                        'nums_emergencia' => [$request->parent_phone] // Update emergency contact
                    ]);
                    \Log::info('Child updated with new guardian ID and emergency contact:', ['child_id' => $child->id, 'old_user_id' => $child->getOriginal('user_id'), 'new_user_id' => $child->user_id]);

                    // Update inscription's usuario_id and confirm it
                    $inscription->update([
                        'usuario_id' => $newUser->id,
                        'confirmado' => true
                    ]);
                    \Log::info('Inscription updated and confirmed:', ['inscription_id' => $inscription->id, 'old_usuario_id' => $inscription->getOriginal('usuario_id'), 'new_usuario_id' => $inscription->usuario_id, 'confirmado' => $inscription->confirmado]);

                    // Send WhatsApp notification
                    if ($newUser) {
                        WhatsAppService::enviarWhatsApp($request->parent_phone, $request->parent_email, $password);
                        \Log::info('Welcome WhatsApp sent');

                        // Also send confirmation message with email and password
                        WhatsAppService::enviarConfirmacionInscripcion(
                            $request->parent_phone,
                            $child->nombres,
                            $subgrupo->nombre,
                            $paquete->nombre,
                            $request->parent_email,
                            $password
                        );
                        \Log::info('Confirmation WhatsApp sent');
                    }
                } else {
                    \Log::info('Using existing user for guardian assignment');

                    // Find existing user by DNI first (more reliable), then by email
                    $existingUser = User::where('dni', $request->parent_dni)->first();
                    if (!$existingUser) {
                        $existingUser = User::where('email', $request->parent_email)->first();
                    }

                    if ($existingUser) {
                        \Log::info('Existing user found:', ['id' => $existingUser->id, 'name' => $existingUser->name]);

                        // Update existing user data if provided
                        $existingUser->update([
                            'name' => $request->parent_name ?: $existingUser->name,
                            'email' => $request->parent_email ?: $existingUser->email,
                            'phone' => $request->parent_phone ?: $existingUser->phone,
                            'dni' => $request->parent_dni ?: $existingUser->dni,
                        ]);

                        // CRITICAL FIX: Update child's user_id to existing guardian
                        $child->update([
                            'user_id' => $existingUser->id,
                            'nums_emergencia' => [$existingUser->phone] // Update emergency contact
                        ]);
                        \Log::info('Child updated with existing guardian ID and emergency contact');

                        // Update inscription's usuario_id and confirm it
                        $inscription->update([
                            'usuario_id' => $existingUser->id,
                            'confirmado' => true
                        ]);
                        \Log::info('Inscription updated and confirmed with existing user');

                        // Send WhatsApp with existing user credentials (password is DNI)
                        $password = $existingUser->dni;
                        WhatsAppService::enviarWhatsApp($existingUser->phone, $existingUser->email, $password);
                        \Log::info('Welcome WhatsApp sent to existing user');

                        // Also send confirmation message with email and password
                        WhatsAppService::enviarConfirmacionInscripcion(
                            $existingUser->phone,
                            $child->nombres,
                            $subgrupo->nombre,
                            $paquete->nombre,
                            $existingUser->email,
                            $password
                        );
                        \Log::info('Confirmation WhatsApp sent to existing user');
                    } else {
                        \Log::error('Existing user not found by DNI or email:', $request->parent_dni, $request->parent_email);
                        throw new \Exception('user_not_found');
                    }
                }
            });

            \Log::info('=== GUARDIAN ASSIGNMENT DEBUG END - SUCCESS ===');

            // Refresh child and inscription data to show updates
            $child->refresh();
            $inscription->refresh();

            \Log::info('Final verification - Child user_id:', ['child_user_id' => $child->user_id]);
            \Log::info('Final verification - Inscription usuario_id:', ['inscription_usuario_id' => $inscription->usuario_id, 'confirmado' => $inscription->confirmado]);

            return redirect()->route('inscripcion.subgrupo.form', [$paquete->id, $grupo->id, $subgrupo->id])
                ->with('success', 'Apoderado asignado exitosamente. El niño ahora tiene un apoderado responsable y se han enviado las credenciales por WhatsApp.');

        } catch (\Exception $e) {
            \Log::error('=== GUARDIAN ASSIGNMENT ERROR ===');
            \Log::error('Exception message: ' . $e->getMessage());
            \Log::error('Exception trace: ' . $e->getTraceAsString());

            if ($e->getMessage() === 'missing_required_fields') {
                return back()->withErrors([
                    'parent_name' => 'Todos los campos del apoderado son obligatorios.'
                ]);
            }
            if ($e->getMessage() === 'email_exists') {
                return back()->withErrors([
                    'parent_email' => 'Ya existe un usuario registrado con este correo electrónico.'
                ]);
            }
            if ($e->getMessage() === 'phone_exists') {
                return back()->withErrors([
                    'parent_phone' => 'Ya existe un usuario registrado con este número de teléfono.'
                ]);
            }
            if ($e->getMessage() === 'dni_exists') {
                return back()->withErrors([
                    'parent_dni' => 'Ya existe un usuario registrado con este DNI.'
                ]);
            }
            if ($e->getMessage() === 'user_not_found') {
                return back()->withErrors([
                    'parent_email' => 'No se pudo encontrar el usuario existente.'
                ]);
            }

            throw $e;
        }
    }

    /**
     * Handle guardian assignment to an existing child at group level
     */
    private function handleGuardianAssignmentGroup(Request $request, Paquete $paquete, Grupo $grupo)
    {
        \Log::info('=== GUARDIAN ASSIGNMENT GROUP DEBUG START ===');
        \Log::info('Full request data:', $request->all());
        \Log::info('Request method:', ['method' => $request->method()]);

        $childId = $request->selected_child_id;
        $userCreationMode = $request->user_creation_mode;
        $confirmExistingGuardian = $request->confirm_existing_guardian;

        // Find the child
        $child = Hijo::findOrFail($childId);
        \Log::info('Child found:', ['id' => $child->id, 'nombres' => $child->nombres, 'user_id' => $child->user_id]);

        // Get all active subgroups for this group
        $subgrupos = $grupo->subgrupos()->activos()->get();

        // Verify the child is enrolled in this group (any of its subgroups)
        $inscription = Inscripcion::where('hijo_id', $childId)
            ->whereIn('subgrupo_id', $subgrupos->pluck('id'))
            ->first();

        if (!$inscription) {
            \Log::error('Child not enrolled in group:', ['child_id' => $childId, 'grupo_id' => $grupo->id]);
            return back()->withErrors([
                'selected_child_id' => 'El niño seleccionado no está inscrito en este grupo.'
            ]);
        }

        \Log::info('Inscription found:', ['id' => $inscription->id, 'subgrupo_id' => $inscription->subgrupo_id, 'confirmado' => $inscription->confirmado ?? 'null']);

        // If just confirming existing guardian, confirm inscription and send WhatsApp message
        if ($confirmExistingGuardian && $child->user_id !== 1) {
            \Log::info('Confirming existing guardian for child');
            $existingUser = User::find($child->user_id);

            if ($existingUser) {
                \Log::info('Existing guardian found:', ['id' => $existingUser->id, 'name' => $existingUser->name]);

                // Get the subgroup for the inscription
                $subgrupo = Subgrupo::find($inscription->subgrupo_id);

                // Confirm the inscription
                $inscription->update(['confirmado' => true]);
                \Log::info('Inscription confirmed');

                // Send WhatsApp confirmation message
                WhatsAppService::enviarConfirmacionInscripcion(
                    $existingUser->phone,
                    $child->nombres,
                    $subgrupo->nombre,
                    $paquete->nombre,
                    $existingUser->email,
                    $existingUser->dni  // Password is DNI
                );
                \Log::info('WhatsApp confirmation sent');

                return response()->json([
                    'success' => true,
                    'message' => 'Inscripción confirmada exitosamente. Se ha enviado un mensaje de confirmación por WhatsApp.'
                ]);
            }

            \Log::error('Existing guardian not found for user_id:', $child->user_id);
            return response()->json([
                'success' => false,
                'message' => 'No se pudo encontrar el apoderado del niño.'
            ], 400);
        }

        \Log::info('Child needs new guardian assignment');

        try {
            DB::transaction(function () use ($request, $child, $inscription, $userCreationMode, $paquete, $grupo) {
                \Log::info('Starting DB transaction for guardian assignment');

                // Get the subgroup for the inscription
                $subgrupo = Subgrupo::find($inscription->subgrupo_id);

                if ($userCreationMode) {
                    \Log::info('Creating new user for guardian assignment');

                    // Validate required fields for new user creation
                    if (!$request->parent_name || !$request->parent_email || !$request->parent_phone || !$request->parent_dni) {
                        throw new \Exception('missing_required_fields');
                    }

                    // Create new user
                    $existingUserByEmail = User::where('email', $request->parent_email)->first();
                    $existingUserByPhone = User::where('phone', $request->parent_phone)->first();
                    $existingUserByDni = User::where('dni', $request->parent_dni)->first();

                    if ($existingUserByEmail) {
                        \Log::error('Email already exists:', $request->parent_email);
                        throw new \Exception('email_exists');
                    }
                    if ($existingUserByPhone) {
                        \Log::error('Phone already exists:', $request->parent_phone);
                        throw new \Exception('phone_exists');
                    }
                    if ($existingUserByDni) {
                        \Log::error('DNI already exists:', $request->parent_dni);
                        throw new \Exception('dni_exists');
                    }

                    $password = $request->parent_dni;

                    $newUser = User::create([
                        'name' => $request->parent_name,
                        'email' => $request->parent_email,
                        'phone' => $request->parent_phone,
                        'dni' => $request->parent_dni,
                        'password' => Hash::make($password),
                        'email_verified_at' => now(),
                        'is_admin' => false,
                    ]);

                    \Log::info('New user created:', ['id' => $newUser->id, 'name' => $newUser->name]);

                    // Update child's user_id to new guardian
                    $child->update([
                        'user_id' => $newUser->id,
                        'nums_emergencia' => [$request->parent_phone]
                    ]);
                    \Log::info('Child updated with new guardian ID');

                    // Update inscription's usuario_id and confirm it
                    $inscription->update([
                        'usuario_id' => $newUser->id,
                        'confirmado' => true
                    ]);
                    \Log::info('Inscription updated and confirmed');

                    // Send WhatsApp notifications
                    if ($newUser) {
                        WhatsAppService::enviarWhatsApp($request->parent_phone, $request->parent_email, $password);
                        \Log::info('Welcome WhatsApp sent');

                        // Also send confirmation message
                        WhatsAppService::enviarConfirmacionInscripcion(
                            $request->parent_phone,
                            $child->nombres,
                            $subgrupo->nombre,
                            $paquete->nombre,
                            $request->parent_email,
                            $password
                        );
                        \Log::info('Confirmation WhatsApp sent');
                    }
                } else {
                    \Log::info('Using existing user for guardian assignment');

                    // Find existing user by DNI first, then by email
                    $existingUser = User::where('dni', $request->parent_dni)->first();
                    if (!$existingUser) {
                        $existingUser = User::where('email', $request->parent_email)->first();
                    }

                    if ($existingUser) {
                        \Log::info('Existing user found:', ['id' => $existingUser->id, 'name' => $existingUser->name]);

                        // Update existing user data if provided
                        $existingUser->update([
                            'name' => $request->parent_name ?: $existingUser->name,
                            'email' => $request->parent_email ?: $existingUser->email,
                            'phone' => $request->parent_phone ?: $existingUser->phone,
                            'dni' => $request->parent_dni ?: $existingUser->dni,
                        ]);

                        // Update child's user_id to existing guardian
                        $child->update([
                            'user_id' => $existingUser->id,
                            'nums_emergencia' => [$existingUser->phone]
                        ]);
                        \Log::info('Child updated with existing guardian ID');

                        // Update inscription's usuario_id and confirm it
                        $inscription->update([
                            'usuario_id' => $existingUser->id,
                            'confirmado' => true
                        ]);
                        \Log::info('Inscription updated and confirmed with existing user');

                        // Send WhatsApp with existing user credentials
                        $password = $existingUser->dni;
                        WhatsAppService::enviarWhatsApp($existingUser->phone, $existingUser->email, $password);
                        \Log::info('Welcome WhatsApp sent to existing user');

                        // Also send confirmation message
                        WhatsAppService::enviarConfirmacionInscripcion(
                            $existingUser->phone,
                            $child->nombres,
                            $subgrupo->nombre,
                            $paquete->nombre,
                            $existingUser->email,
                            $password
                        );
                        \Log::info('Confirmation WhatsApp sent to existing user');
                    } else {
                        \Log::error('Existing user not found by DNI or email:', $request->parent_dni, $request->parent_email);
                        throw new \Exception('user_not_found');
                    }
                }
            });

            \Log::info('=== GUARDIAN ASSIGNMENT GROUP DEBUG END - SUCCESS ===');

            return redirect()->route('inscripcion.form', [$paquete->id, $grupo->id])
                ->with('success', 'Apoderado asignado exitosamente. El niño ahora tiene un apoderado responsable y se han enviado las credenciales por WhatsApp.');

        } catch (\Exception $e) {
            \Log::error('=== GUARDIAN ASSIGNMENT GROUP ERROR ===');
            \Log::error('Exception message: ' . $e->getMessage());
            \Log::error('Exception trace: ' . $e->getTraceAsString());

            if ($e->getMessage() === 'missing_required_fields') {
                return back()->withErrors([
                    'parent_name' => 'Todos los campos del apoderado son obligatorios.'
                ]);
            }
            if ($e->getMessage() === 'email_exists') {
                return back()->withErrors([
                    'parent_email' => 'Ya existe un usuario registrado con este correo electrónico.'
                ]);
            }
            if ($e->getMessage() === 'phone_exists') {
                return back()->withErrors([
                    'parent_phone' => 'Ya existe un usuario registrado con este número de teléfono.'
                ]);
            }
            if ($e->getMessage() === 'dni_exists') {
                return back()->withErrors([
                    'parent_dni' => 'Ya existe un usuario registrado con este DNI.'
                ]);
            }
            if ($e->getMessage() === 'user_not_found') {
                return back()->withErrors([
                    'parent_email' => 'No se pudo encontrar el usuario existente.'
                ]);
            }

            throw $e;
        }
    }

    /**
     * Verificar si existe un usuario por DNI
     */
    public function checkUserExists(Request $request)
    {
        $request->validate([
            'dni' => 'required|string|regex:/^\d{8}$/',
        ]);

        $dni = $request->dni;

        // Buscar usuario SOLO por DNI
        $user = User::where('dni', $dni)->first();

        if ($user) {
            // Si encontramos usuario, obtener sus hijos
            $hijos = $user->hijos()->get(['nombres', 'doc_tipo', 'doc_numero']);
            
            return response()->json([
                'exists' => true,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'dni' => $user->dni,
                ],
                'children' => $hijos->map(function($hijo) {
                    return [
                        'name' => $hijo->nombres,
                        'docType' => $hijo->doc_tipo,
                        'docNumber' => $hijo->doc_numero,
                    ];
                })->toArray()
            ]);
        }

        return response()->json([
            'exists' => false
        ]);
    }
}