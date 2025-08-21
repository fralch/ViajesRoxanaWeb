<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use App\Models\Paquete;
use App\Models\Grupo;
use App\Models\User;
use App\Models\Hijo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InscripcionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Inscripciones/Index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Inscripciones/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Inscripcion $inscripcion)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inscripcion $inscripcion)
    {
        //
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
    public function storeForm(Request $request, Paquete $paquete, Grupo $grupo)
    {
        // Verificar que el grupo pertenece al paquete
        if ($grupo->paquete_id !== $paquete->id) {
            abort(404, 'El grupo no pertenece a este paquete');
        }

        // Validar datos
        $validated = $request->validate([
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|regex:/^9\d{8}$/',
            'parent_email' => 'required|email|max:255',
            'children' => 'required|array|min:1',
            'children.*.name' => 'required|string|max:255',
            'children.*.docType' => 'required|string|in:DNI,Pasaporte,C. E.',
            'children.*.docNumber' => 'required|string|max:20',
        ]);

        // Verificar capacidad disponible
        $inscritosCount = Inscripcion::where('grupo_id', $grupo->id)->count();
        $capacidadDisponible = $grupo->capacidad ? $grupo->capacidad - $inscritosCount : 999;
        
        if ($capacidadDisponible < count($validated['children'])) {
            return back()->withErrors([
                'capacity' => 'No hay suficientes cupos disponibles para todos los niños.'
            ]);
        }

        DB::transaction(function () use ($validated, $paquete, $grupo) {
            // Crear o encontrar usuario
            $user = User::where('email', $validated['parent_email'])->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $validated['parent_name'],
                    'email' => $validated['parent_email'],
                    'phone' => $validated['parent_phone'],
                    'password' => Hash::make('password123'), // Password temporal
                    'email_verified_at' => now(),
                ]);
            }

            // Crear hijos e inscripciones
            foreach ($validated['children'] as $childData) {
                $hijo = Hijo::create([
                    'nombres' => $childData['name'],
                    'doc_tipo' => $childData['docType'],
                    'doc_numero' => $childData['docNumber'],
                    'user_id' => $user->id,
                ]);

                Inscripcion::create([
                    'hijo_id' => $hijo->id,
                    'paquete_id' => $paquete->id,
                    'grupo_id' => $grupo->id,
                    'usuario_id' => $user->id,
                ]);
            }
        });

        return redirect()->route('inscripcion.form', [$paquete->id, $grupo->id])
            ->with('success', 'Inscripción realizada exitosamente. Recibirás un correo con los detalles.');
    }
}