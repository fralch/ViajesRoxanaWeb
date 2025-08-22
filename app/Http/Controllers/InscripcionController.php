<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use App\Models\Paquete;
use App\Models\Grupo;
use App\Models\User;
use App\Models\Hijo;
use App\Http\Requests\StoreInscripcionFormRequest;
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
        $query = Inscripcion::with(['hijo', 'paquete', 'grupo', 'usuario']);
        
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
        
        // Si no es admin, solo mostrar sus hijos
        if (Auth::user()->is_admin) {
            $hijos = Hijo::with('user')->get();
        } else {
            $hijos = Hijo::where('user_id', Auth::id())->get();
        }
        
        return Inertia::render('Inscripciones/Create', [
            'paquetes' => $paquetes,
            'grupos' => $grupos,
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
            $validated['usuario_id'] = Auth::id();
        }
        
        // Verificar capacidad del grupo
        $inscritosCount = Inscripcion::where('grupo_id', $validated['grupo_id'])->count();
        if ($grupo->capacidad && $inscritosCount >= $grupo->capacidad) {
            return back()->withErrors(['grupo_id' => 'El grupo ya no tiene cupos disponibles.']);
        }
        
        // Verificar que no exista inscripción duplicada
        $existeInscripcion = Inscripcion::where('hijo_id', $validated['hijo_id'])
                                      ->where('grupo_id', $validated['grupo_id'])
                                      ->exists();
        if ($existeInscripcion) {
            return back()->withErrors(['hijo_id' => 'Este hijo ya está inscrito en el grupo seleccionado.']);
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
            'inscripcion' => $inscripcion->load(['hijo', 'paquete', 'grupo', 'usuario'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inscripcion $inscripcion)
    {
        return Inertia::render('Inscripciones/Edit', [
            'inscripcion' => $inscripcion
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
        
        // Verificar que no exista inscripción duplicada (excluyendo la actual)
        $existeInscripcion = Inscripcion::where('hijo_id', $validated['hijo_id'])
                                      ->where('grupo_id', $validated['grupo_id'])
                                      ->where('id', '!=', $inscripcion->id)
                                      ->exists();
        if ($existeInscripcion) {
            return back()->withErrors(['hijo_id' => 'Este hijo ya está inscrito en el grupo seleccionado.']);
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
     * Mostrar formulario público de inscripción
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
                'capacidadDisponible' => 0,
                'error' => 'Este paquete o grupo no está disponible para inscripciones.'
            ]);
        }

        // Calcular capacidad disponible
        $inscritosCount = Inscripcion::where('grupo_id', $grupo->id)->count();
        $capacidadDisponible = $grupo->capacidad ? $grupo->capacidad - $inscritosCount : 999;

        if ($capacidadDisponible <= 0) {
            return Inertia::render('Inscripciones/form', [
                'paquete' => $paquete,
                'grupo' => $grupo,
                'capacidadDisponible' => 0,
                'error' => 'Este grupo ya no tiene cupos disponibles.'
            ]);
        }

        return Inertia::render('Inscripciones/form', [
            'paquete' => $paquete,
            'grupo' => $grupo,
            'capacidadDisponible' => $capacidadDisponible,
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

        // Verificar capacidad disponible
        $inscritosCount = Inscripcion::where('grupo_id', $grupo->id)->count();
        $capacidadDisponible = $grupo->capacidad ? $grupo->capacidad - $inscritosCount : 999;
        
        if ($capacidadDisponible < count($validated['children'])) {
            return back()->withErrors([
                'capacity' => 'No hay suficientes cupos disponibles para todos los niños.'
            ]);
        }

        // Verificar duplicados de documentos antes de la transacción
        foreach ($validated['children'] as $childData) {
            $existeDocumento = Hijo::where('doc_tipo', $childData['docType'])
                                  ->where('doc_numero', $childData['docNumber'])
                                  ->exists();
            if ($existeDocumento) {
                return back()->withErrors([
                    'children' => "Ya existe un niño registrado con el documento {$childData['docType']} {$childData['docNumber']}."
                ]);
            }
        }

        DB::transaction(function () use ($validated, $paquete, $grupo) {
            // Buscar usuario existente por DNI (prioridad), email, teléfono o nombre similar
            $user = User::where('dni', $validated['parent_dni'])
                        ->orWhere('email', $validated['parent_email'])
                        ->orWhere('phone', $validated['parent_phone'])
                        ->orWhere('name', 'LIKE', trim($validated['parent_name']))
                        ->first();
            
            if (!$user) {
                // Crear contraseña con primer nombre + 123
                $primerNombre = explode(' ', trim($validated['parent_name']))[0];
                $password = $primerNombre . '123';
                
                $user = User::create([
                    'name' => $validated['parent_name'],
                    'email' => $validated['parent_email'],
                    'phone' => $validated['parent_phone'],
                    'dni' => $validated['parent_dni'],
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                    'is_admin' => false,
                ]);
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
                        'usuario_id' => $user->id,
                    ]);
                }
            }
        });

        return redirect()->route('inscripcion.form', [$paquete->id, $grupo->id])
            ->with('success', 'Inscripción realizada exitosamente. Recibirás un correo con los detalles.');
    }

    /**
     * Verificar si existe un usuario por nombre y teléfono
     */
    public function checkUserExists(Request $request)
    {
        $request->validate([
            'name' => 'string|min:1',
            'phone' => 'string|min:1',
            'dni' => 'nullable|string|regex:/^\d{8}$/',
        ]);

        $name = trim($request->name);
        $phone = $request->phone;
        $dni = $request->dni;

        // Buscar usuario primordialmente por DNI
        $user = null;
        
        if ($dni) {
            // Prioridad 1: Buscar por DNI exacto
            $user = User::where('dni', $dni)->first();
        }
        
        if (!$user) {
            // Prioridad 2: Buscar por teléfono o nombre si no se encontró por DNI
            $user = User::where(function($query) use ($name, $phone) {
                $query->where('phone', $phone)
                      ->orWhere('name', 'LIKE', $name);
            })->first();
        }

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