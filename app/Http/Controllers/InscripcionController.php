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
    public function store(Request $request)
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
                'error' => 'Este paquete o grupo no está disponible para inscripciones.'
            ]);
        }

        // Obtener subgrupos activos del grupo con conteos
        $subgrupos = $grupo->subgrupos()->activos()->withCount('inscripciones')->get();

        // Si no hay subgrupos, mostrar error
        if ($subgrupos->isEmpty()) {
            return Inertia::render('Inscripciones/SubgrupoSelection', [
                'paquete' => $paquete,
                'grupo' => $grupo,
                'subgrupos' => [],
                'error' => 'Este grupo no tiene subgrupos activos disponibles para inscripciones.'
            ]);
        }

        // Mostrar página de selección de subgrupos
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
            ->with('user:id,name,email')
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
                        'email' => $hijo->user->email
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
    public function storeForm(StoreInscripcionFormRequest $request, Paquete $paquete, Grupo $grupo)
    {
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

        // Validar datos (ya validados por el FormRequest)
        $validated = $request->validated();

        // Este método ya no debe procesar inscripciones directas
        // Redirigir a la página de selección de subgrupos
        return back()->withErrors([
            'capacity' => 'Debe seleccionar un subgrupo específico para completar la inscripción.'
        ]);

        // Nota: Solo verificamos por DNI del padre. Los hijos pueden tener documentos duplicados entre diferentes padres.

        try {
            DB::transaction(function () use ($validated, $paquete, $grupo) {
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
                $usuarioCreado = true; // Marcar que se creó un nuevo usuario
            
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

                // Verificar que no exista inscripción duplicada
                $existeInscripcion = Inscripcion::where('hijo_id', $hijo->id)
                                              ->where('grupo_id', $grupo->id)
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

            return redirect()->route('inscripcion.form', [$paquete->id, $grupo->id])
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
     * Procesar inscripción desde formulario público para subgrupo específico
     */
    public function storeFormSubgrupo(StoreInscripcionFormRequest $request, Paquete $paquete, Grupo $grupo, Subgrupo $subgrupo)
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
            return back()->withErrors([
                'capacity' => 'Este paquete, grupo o subgrupo no está disponible para inscripciones.'
            ]);
        }

        // Validar datos (ya validados por el FormRequest)
        $validated = $request->validated();

        // Check if this is a guardian assignment request
        if ($request->has('assign_guardian') && $request->assign_guardian) {
            return $this->handleGuardianAssignment($request, $paquete, $grupo, $subgrupo);
        }

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
        $childId = $request->selected_child_id;
        $userCreationMode = $request->user_creation_mode;
        $confirmExistingGuardian = $request->confirm_existing_guardian;

        // Find the child
        $child = Hijo::findOrFail($childId);

        // Verify the child is enrolled in this subgroup
        $inscription = Inscripcion::where('hijo_id', $childId)
            ->where('subgrupo_id', $subgrupo->id)
            ->first();

        if (!$inscription) {
            return back()->withErrors([
                'selected_child_id' => 'El niño seleccionado no está inscrito en este subgrupo.'
            ]);
        }

        // If just confirming existing guardian, no changes needed
        if ($confirmExistingGuardian && $child->user_id !== 1) {
            return redirect()->route('inscripcion.subgrupo.form', [$paquete->id, $grupo->id, $subgrupo->id])
                ->with('success', 'Apoderado confirmado exitosamente.');
        }

        try {
            DB::transaction(function () use ($request, $child, $inscription, $userCreationMode) {
                if ($userCreationMode) {
                    // Create new user
                    $existingUserByEmail = User::where('email', $request->parent_email)->first();
                    $existingUserByPhone = User::where('phone', $request->parent_phone)->first();
                    $existingUserByDni = User::where('dni', $request->parent_dni)->first();

                    if ($existingUserByEmail) {
                        throw new \Exception('email_exists');
                    }
                    if ($existingUserByPhone) {
                        throw new \Exception('phone_exists');
                    }
                    if ($existingUserByDni) {
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

                    // Update child's user_id
                    $child->update(['user_id' => $newUser->id]);

                    // Update inscription's usuario_id
                    $inscription->update(['usuario_id' => $newUser->id]);

                    // Send WhatsApp notification
                    if ($newUser) {
                        WhatsAppService::enviarWhatsApp($request->parent_phone, $request->parent_email, $password);
                    }
                } else {
                    // Find existing user by email (since we loaded their data)
                    $existingUser = User::where('email', $request->parent_email)->first();
                    if ($existingUser) {
                        // Update child's user_id
                        $child->update(['user_id' => $existingUser->id]);

                        // Update inscription's usuario_id
                        $inscription->update(['usuario_id' => $existingUser->id]);
                    } else {
                        throw new \Exception('user_not_found');
                    }
                }
            });

            return redirect()->route('inscripcion.subgrupo.form', [$paquete->id, $grupo->id, $subgrupo->id])
                ->with('success', 'Apoderado asignado exitosamente al niño.');

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