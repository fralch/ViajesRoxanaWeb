<?php

namespace App\Http\Controllers;

use App\Models\Trazabilidad;
use App\Models\Grupo;
use App\Models\Notificacion;
use App\Models\Inscripcion;
use App\Models\Hijo;
use App\Services\WhatsAppService;
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
     * Guardar mensaje de trazabilidad para todos los hijos del grupo
     */
    public function guardarMensaje(Request $request, $grupoId)
    {
        $validated = $request->validate([
            'descripcion' => 'required|string|max:500',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180'
        ]);

        try {
            DB::beginTransaction();

            $grupo = Grupo::with('paquete')->findOrFail($grupoId);
            
            // Obtener todos los hijos inscritos en el grupo
            $inscripciones = $grupo->inscripciones()->with('hijo')->get();
            
            if ($inscripciones->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay niños inscritos en este grupo'
                ], 400);
            }

            // Crear registros de trazabilidad para todos los hijos del grupo
            $registrosTrazabilidad = [];
            foreach ($inscripciones as $inscripcion) {
                $registrosTrazabilidad[] = [
                    'paquete_id' => $grupo->paquete_id,
                    'grupo_id' => $grupo->id,
                    'hijo_id' => $inscripcion->hijo->id,
                    'descripcion' => $validated['descripcion'],
                    'latitud' => $validated['latitud'],
                    'longitud' => $validated['longitud'],
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }

            // Insertar todos los registros de una vez (bulk insert)
            Trazabilidad::insert($registrosTrazabilidad);

            DB::commit();

            // Guardar también en sesión para compatibilidad con el scanner actual
            session(['mensaje_notificacion' => $validated['descripcion']]);

            // Redirigir al scanner con mensaje de éxito
            return redirect()->route('trazabilidad.scanner', $grupoId)->with([
                'success' => true,
                'message' => 'Mensaje configurado exitosamente para todos los niños del grupo',
                'children_count' => count($registrosTrazabilidad)
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error('Error al guardar mensaje de trazabilidad: ' . $e->getMessage(), [
                'grupo_id' => $grupoId,
                'descripcion' => $validated['descripcion'],
                'latitud' => $validated['latitud'] ?? 'no_provided',
                'longitud' => $validated['longitud'] ?? 'no_provided',
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors([
                'descripcion' => 'Error al configurar el mensaje: ' . $e->getMessage()
            ])->withInput();
        }
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
        $grupo = Grupo::findOrFail($grupoId);
        
        $inscripciones = $grupo->inscripciones()->with(['hijo', 'user'])->get();
        
        // Formatear los datos para el frontend
        $hijosConPadres = $inscripciones->map(function($inscripcion) {
            return [
                'id' => $inscripcion->hijo->id,
                'nombres' => $inscripcion->hijo->nombres,
                'doc_numero' => $inscripcion->hijo->doc_numero,
                'user' => $inscripcion->user ? [
                    'id' => $inscripcion->user->id,
                    'name' => $inscripcion->user->name,
                    'email' => $inscripcion->user->email,
                    'phone' => $inscripcion->user->phone,
                ] : null
            ];
        });

        return response()->json($hijosConPadres);
    }

    /**
     * Mostrar confirmación de trazabilidad por DNI del hijo
     */
    public function confirmacionTrazabilidad($dni_hijo)
    {
        try {
            DB::beginTransaction();
            
            // Buscar el hijo por DNI
            $hijo = Hijo::where('doc_numero', $dni_hijo)->first();
            
            if (!$hijo) {
                abort(404, 'Niño no encontrado');
            }

            // Obtener el padre del hijo
            $padre = $hijo->user;
            
            if (!$padre) {
                abort(404, 'Padre no encontrado para este niño');
            }

            // Buscar el grupo activo según la fecha actual
            $grupo = Grupo::whereHas('inscripciones', function($query) use ($hijo) {
                    $query->where('hijo_id', $hijo->id);
                })
                ->whereDate('fecha_inicio', '<=', Carbon::today())
                ->whereDate('fecha_fin', '>=', Carbon::today())
                ->with('paquete')
                ->first();

            if (!$grupo) {
                abort(404, 'No se encontró grupo activo para este niño en la fecha actual');
            }

            // Obtener descripción desde la solicitud si se proporciona
            $descripcion = request()->input('descripcion', '');
            
            // SIEMPRE buscar la ubicación más reciente de la tabla trazabilidad para este hijo y grupo
            $ubicacionReciente = Trazabilidad::where('hijo_id', $hijo->id)
                ->where('grupo_id', $grupo->id)
                ->where(function($query) {
                    $query->where('latitud', '!=', '0')
                          ->where('latitud', '!=', 0)
                          ->where('longitud', '!=', '0')
                          ->where('longitud', '!=', 0);
                })
                ->orderBy('created_at', 'desc')
                ->first();
            
            // Usar coordenadas de la tabla trazabilidad si están disponibles
            if ($ubicacionReciente) {
                $latitud = $ubicacionReciente->latitud;
                $longitud = $ubicacionReciente->longitud;
                
                \Log::info('Usando ubicación de tabla trazabilidad', [
                    'latitud' => $latitud,
                    'longitud' => $longitud,
                    'dni_hijo' => $dni_hijo,
                    'grupo_id' => $grupo->id,
                    'registro_fecha' => $ubicacionReciente->created_at,
                    'registro_id' => $ubicacionReciente->id
                ]);
            } else {
                // Si no hay coordenadas en la tabla, usar valores por defecto
                $latitud = 0;
                $longitud = 0;
                
                \Log::warning('No se encontró ubicación en tabla trazabilidad', [
                    'dni_hijo' => $dni_hijo,
                    'grupo_id' => $grupo->id,
                    'hijo_id' => $hijo->id
                ]);
            }

            // Obtener el último mensaje (más reciente) de la tabla trazabilidad para este grupo
            if (empty($descripcion)) {
                $ultimaTrazabilidad = Trazabilidad::where('grupo_id', $grupo->id)
                    ->whereNotNull('descripcion')
                    ->where('descripcion', '!=', '')
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                if ($ultimaTrazabilidad) {
                    $descripcion = $ultimaTrazabilidad->descripcion;
                }
            }

            // Si no hay mensaje del grupo, usar mensaje por defecto
            if (empty($descripcion)) {
                $descripcion = "Su hijo {$hijo->nombres} {$hijo->apellidos} ha sido registrado en el sistema de trazabilidad del grupo {$grupo->nombre}.";
            }

            // Crear mensaje completo con información de ubicación para WhatsApp
            $mensajeWhatsApp = "Sr(a) {$padre->name}, {$descripcion} con su hijo(a) {$hijo->nombres}";
            
            // Incluir ubicación si está disponible en la tabla trazabilidad
            if ($latitud != 0 && $longitud != 0 && $latitud != '0' && $longitud != '0') {
                $mensajeWhatsApp .= "\n\n📍 Ubicación registrada: https://maps.google.com/maps?q={$latitud},{$longitud}";
                $mensajeWhatsApp .= "\nCoordenadas: Lat {$latitud}, Lng {$longitud}";
                
                if ($ubicacionReciente) {
                    $mensajeWhatsApp .= "\n⏱️ Registrado: " . $ubicacionReciente->created_at->format('d/m/Y H:i:s');
                }
                
                // Log para confirmar que se incluye la ubicación
                \Log::info('Ubicación incluida en mensaje WhatsApp desde tabla trazabilidad', [
                    'latitud' => $latitud,
                    'longitud' => $longitud,
                    'dni_hijo' => $dni_hijo,
                    'grupo_id' => $grupo->id,
                    'registro_id' => $ubicacionReciente ? $ubicacionReciente->id : null
                ]);
            } else {
                // Log cuando no se incluye ubicación
                \Log::warning('Ubicación no incluida en mensaje WhatsApp', [
                    'latitud' => $latitud,
                    'longitud' => $longitud,
                    'dni_hijo' => $dni_hijo,
                    'grupo_id' => $grupo->id,
                    'razon' => 'No se encontraron coordenadas válidas en tabla trazabilidad'
                ]);
            }
            
            $mensajeWhatsApp .= "\n\n🌎 Grupo: {$grupo->nombre}";
            $mensajeWhatsApp .= "\n⏰ Fecha y hora: " . now('America/Lima')->format('d/m/Y H:i:s');
            $mensajeWhatsApp .= "\n\n Sistema de Trazabilidad - Viajes Roxana";

            // Para el nuevo registro, usar coordenadas del request si están disponibles, sino usar las de la tabla
            $latitudNuevoRegistro = request()->input('lat', 0);
            $longitudNuevoRegistro = request()->input('lng', 0);
            
            // Si no hay coordenadas nuevas, usar las encontradas en la tabla
            if (($latitudNuevoRegistro == 0 || $latitudNuevoRegistro == '0') && ($longitudNuevoRegistro == 0 || $longitudNuevoRegistro == '0')) {
                $latitudNuevoRegistro = $latitud;
                $longitudNuevoRegistro = $longitud;
            }
            
            // Registrar la trazabilidad automáticamente
            $trazabilidad = Trazabilidad::create([
                'paquete_id' => $grupo->paquete_id,
                'grupo_id' => $grupo->id,
                'hijo_id' => $hijo->id,
                'descripcion' => $descripcion,
                'latitud' => (string)$latitudNuevoRegistro,
                'longitud' => (string)$longitudNuevoRegistro,
            ]);

            // Crear notificación en la tabla notificaciones para envío por WhatsApp (solo descripción)
            $notificacion = Notificacion::create([
                'hijo_id' => $hijo->id,
                'user_id' => $padre->id,
                'mensaje' => $descripcion,
                'celular' => $padre->phone,
                'estado' => 'pendiente'
            ]);

            // Log del mensaje completo antes de enviarlo
            \Log::info('Enviando mensaje WhatsApp trazabilidad', [
                'phone' => $padre->phone,
                'mensaje_completo' => $mensajeWhatsApp,
                'longitud_mensaje' => strlen($mensajeWhatsApp),
                'dni_hijo' => $dni_hijo
            ]);
            
            // Enviar WhatsApp directamente
            $whatsappEnviado = WhatsAppService::enviarMensajeTrazabilidad($padre->phone, $mensajeWhatsApp);
            
            // Actualizar el estado de la notificación según el resultado del envío
            if ($whatsappEnviado) {
                $notificacion->update(['estado' => 'enviado']);
            } else {
                $notificacion->update(['estado' => 'fallido']);
            }

            DB::commit();

            return Inertia::render('Trazabilidad/Confirmacion', [
                'hijo' => [
                    'id' => $hijo->id,
                    'nombres' => $hijo->nombres,
                    'apellidos' => $hijo->apellidos,
                    'doc_numero' => $hijo->doc_numero,
                ],
                'padre' => [
                    'id' => $padre->id,
                    'nombres' => $padre->name,
                    'telefono' => $padre->phone,
                    'email' => $padre->email,
                ],
                'mensaje' => $mensajeWhatsApp,
                'grupo' => $grupo,
                'trazabilidad' => $trazabilidad,
                'notificacion' => $notificacion,
                'ubicacion' => [
                    'latitud' => $latitud,
                    'longitud' => $longitud
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            // Log del error para debugging
            \Log::error('Error en confirmacionTrazabilidad: ' . $e->getMessage(), [
                'dni_hijo' => $dni_hijo,
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(500, 'Error interno del servidor: ' . $e->getMessage());
        }
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