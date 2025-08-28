<?php

namespace App\Http\Controllers;

use App\Models\Trazabilidad;
use App\Models\Grupo;
use App\Models\Notificacion;
use App\Models\Inscripcion;
use App\Models\Hijo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class TrazabilidadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Obtener grupos activos (cuyo rango de fechas incluye la fecha actual)
        $gruposActivos = Grupo::with(['paquete:id,nombre,destino'])
            ->whereDate('fecha_inicio', '<=', Carbon::today())
            ->whereDate('fecha_fin', '>=', Carbon::today())
            ->get();

        return Inertia::render('Trazabilidad/Index', [
            'gruposActivos' => $gruposActivos
        ]);
    }

    /**
     * Mostrar interfaz para configurar mensaje de notificación
     */
    public function mensaje($grupoId)
    {
        $grupo = Grupo::with(['paquete:id,nombre,destino'])->findOrFail($grupoId);
        
        return Inertia::render('Trazabilidad/Mensaje', [
            'grupo' => $grupo
        ]);
    }

    /**
     * Mostrar interfaz de escáner NFC
     */
    public function scanner($grupoId)
    {
        $grupo = Grupo::with(['paquete:id,nombre,destino'])->findOrFail($grupoId);
        $mensaje = session('mensaje_notificacion', '');
        
        return Inertia::render('Trazabilidad/Scanner', [
            'grupo' => $grupo,
            'mensaje' => $mensaje
        ]);
    }

    /**
     * Procesar escaneo NFC y registrar trazabilidad
     */
    public function procesarEscaneo(Request $request)
    {
        $validated = $request->validate([
            'grupo_id' => 'required|exists:grupos,id',
            'hijo_id' => 'required|exists:hijos,id',
            'descripcion' => 'required|string|max:500',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'nfc_id' => 'nullable|string|max:100'
        ]);

        try {
            DB::beginTransaction();

            // Obtener información del grupo y paquete
            $grupo = Grupo::with('paquete')->findOrFail($validated['grupo_id']);
            
            // Crear registro de trazabilidad
            $trazabilidad = Trazabilidad::create([
                'paquete_id' => $grupo->paquete_id,
                'grupo_id' => $validated['grupo_id'],
                'hijo_id' => $validated['hijo_id'],
                'descripcion' => $validated['descripcion'],
                'latitud' => $validated['latitud'],
                'longitud' => $validated['longitud']
            ]);

            // Obtener información del hijo y su padre
            $hijo = Hijo::with('user')->findOrFail($validated['hijo_id']);
            
            // Crear notificación para el padre
            if ($hijo->user) {
                Notificacion::create([
                    'hijo_id' => $validated['hijo_id'],
                    'user_id' => $hijo->user->id,
                    'mensaje' => $validated['descripcion'],
                    'celular' => $hijo->user->phone,
                    'estado' => 'pendiente'
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Escaneo registrado exitosamente',
                'trazabilidad' => $trazabilidad
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el escaneo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener hijos inscritos en un grupo
     */
    public function obtenerHijosGrupo($grupoId)
    {
        $hijos = Hijo::whereHas('inscripciones', function($query) use ($grupoId) {
            $query->where('grupo_id', $grupoId);
        })->select('id', 'nombres', 'doc_numero')->get();

        return response()->json($hijos);
    }

    /**
     * Mostrar confirmación de trazabilidad por DNI del hijo
     */
    public function confirmacionTrazabilidad($dni_hijo)
    {
        // Buscar el hijo por DNI
        $hijo = Hijo::where('doc_numero', $dni_hijo)->first();
        
        if (!$hijo) {
            abort(404, 'Niño no encontrado');
        }

        // Obtener el padre del hijo
        $padre = $hijo->user; // El padre es el usuario relacionado con el hijo
        
        if (!$padre) {
            abort(404, 'Padre no encontrado');
        }

        // Obtener el grupo activo del hijo (si existe) a través de las inscripciones
        $grupo = Grupo::whereHas('inscripciones', function($query) use ($hijo) {
                $query->where('hijo_id', $hijo->id);
            })
            ->whereDate('fecha_inicio', '<=', now())
            ->whereDate('fecha_fin', '>=', now())
            ->with('paquete')
            ->first();

        // Obtener el último mensaje configurado para el grupo (si existe)
        $mensaje = null;
        if ($grupo) {
            $ultimaTrazabilidad = Trazabilidad::where('grupo_id', $grupo->id)
                ->whereNotNull('descripcion')
                ->latest()
                ->first();
            
            if ($ultimaTrazabilidad) {
                $mensaje = $ultimaTrazabilidad->descripcion;
            }
        }

        // Si no hay mensaje del grupo, usar mensaje por defecto
        if (!$mensaje) {
            $mensaje = "Su hijo {$hijo->nombres} {$hijo->apellidos} ha sido registrado en el sistema de trazabilidad.";
        }

        // Registrar la trazabilidad automáticamente
        if ($grupo) {
            Trazabilidad::create([
                'paquete_id' => $grupo->paquete_id, // Agregar paquete_id que es requerido
                'grupo_id' => $grupo->id,
                'hijo_id' => $hijo->id,
                'descripcion' => $mensaje,
                'latitud' => request()->input('lat', 0), // Se puede obtener por JavaScript
                'longitud' => request()->input('lng', 0),
            ]);

            // Crear notificación para el padre usando el esquema correcto
            Notificacion::create([
                'hijo_id' => $hijo->id,
                'user_id' => $padre->id,
                'mensaje' => $mensaje,
                'celular' => $padre->phone,
                'estado' => 'pendiente'
            ]);
        }

        return Inertia::render('Trazabilidad/Confirmacion', [
            'hijo' => $hijo,
            'padre' => $padre,
            'mensaje' => $mensaje,
            'grupo' => $grupo,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Trazabilidad/Create');
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
    public function show(Trazabilidad $trazabilidad)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Trazabilidad $trazabilidad)
    {
        return Inertia::render('Trazabilidad/Edit', [
            'trazabilidad' => $trazabilidad
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trazabilidad $trazabilidad)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trazabilidad $trazabilidad)
    {
        //
    }
}