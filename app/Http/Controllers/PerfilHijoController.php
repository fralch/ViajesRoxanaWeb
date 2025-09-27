<?php

namespace App\Http\Controllers;

use App\Models\Hijo;
use App\Models\SaludFicha;
use App\Models\NutricionFicha;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PerfilHijoController extends Controller
{
    public function show(Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para ver este perfil.');
        }

        // Formatear datos para la vista
        $hijoArray = $hijo->toArray();

        // Asegurar que fecha_nacimiento esté en formato Y-m-d para el input date
        if ($hijo->fecha_nacimiento) {
            $hijoArray['fecha_nacimiento'] = $hijo->fecha_nacimiento->format('Y-m-d');
        }

        // Cargar las fichas de salud y nutrición si existen
        $saludFicha = SaludFicha::where('hijo_id', $hijo->id)->first();
        $nutricionFicha = NutricionFicha::where('hijo_id', $hijo->id)->first();

        return Inertia::render('PerfilHijo', [
            'hijo' => $hijoArray,
            'saludFicha' => $saludFicha,
            'nutricionFicha' => $nutricionFicha
        ]);
    }

    public function update(Request $request, Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para actualizar este perfil.');
        }

        $request->validate([
            'nombres' => 'required|string|max:255',

            'doc_numero' => 'required|string|max:20',
            'fecha_nacimiento' => 'nullable|date|before_or_equal:today',
            'foto' => 'nullable|string',
            'pasatiempos' => 'nullable|string|max:500',
            'deportes' => 'nullable|string|max:500',
            'plato_favorito' => 'nullable|string|max:200',
            'color_favorito' => 'nullable|string|max:100',
            'informacion_adicional' => 'nullable|string|max:1000',
            'nums_emergencia' => 'nullable|array|max:2',
            'nums_emergencia.*' => 'required|string|regex:/^[\d\s\+\-\(\)]+$/|max:20'
        ], [
            'nombres.required' => 'El nombre es obligatorio',

            'doc_numero.required' => 'El número de documento es obligatorio',
            'fecha_nacimiento.before_or_equal' => 'La fecha de nacimiento no puede ser futura',
            'nums_emergencia.max' => 'Máximo 2 números de emergencia permitidos',
            'nums_emergencia.*.regex' => 'Los números de emergencia solo admiten números',
            'pasatiempos.max' => 'Los pasatiempos no pueden exceder 500 caracteres',
            'deportes.max' => 'Los deportes no pueden exceder 500 caracteres',
            'informacion_adicional.max' => 'La información adicional no puede exceder 1000 caracteres'
        ]);

        $data = $request->except(['doc_tipo']);
        
        // Filtrar números de emergencia vacíos si existen
        if (isset($data['nums_emergencia'])) {
            // Filtrar números vacíos y limpiar espacios
            $data['nums_emergencia'] = array_filter($data['nums_emergencia'], function($num) {
                return !empty(trim($num));
            });
            
            // Reindexar array para evitar índices faltantes
            $data['nums_emergencia'] = array_values($data['nums_emergencia']);
        } else {
            // Si no hay números, guardar array vacío
            $data['nums_emergencia'] = [];
        }

        $hijo->update($data);
        
        // Refrescar el modelo para obtener los datos actualizados de la base de datos
        $hijo->refresh();
        
        // El cast automático del modelo ya maneja la conversión a array
        $hijoArray = $hijo->toArray();

        return redirect()->back()->with([
            'message' => '✅ Perfil actualizado correctamente',
            'hijo' => $hijoArray
        ]);
    }

    // ===========================================
    // HEALTH RECORD (Ficha de Salud) CRUD
    // ===========================================

    /**
     * Store or update health record
     */
    public function storeSaludFicha(Request $request, Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para gestionar esta ficha.');
        }

        $validated = $request->validate([
            'grupo_sanguineo' => 'required|in:O,A,B,AB',
            'factor_rh' => 'required|in:+,-',
            'recibe_tratamientos' => 'required|in:Sí,No',
            'condicion_medica' => 'nullable|string|max:255',
            'nombre_medicamento' => 'nullable|string|max:255',
            'frecuencia' => 'nullable|string|max:255',
            'quien_administra' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string|max:500',
            'detalle_enfermedad' => 'nullable|string|max:255',
            'medicamento_enfermedad' => 'nullable|string|max:255',
            'frecuencia_enfermedad' => 'nullable|string|max:255',
            'quien_administra_enfermedad' => 'nullable|string|max:255',
            'observaciones_enfermedad' => 'nullable|string|max:500',
            'detalle_alergia' => 'nullable|string|max:255',
            'medicamento_control' => 'nullable|string|max:255',
            'frecuencia_alergia' => 'nullable|string|max:255',
            'quien_administra_alergia' => 'nullable|string|max:255',
            'observaciones_alergia' => 'nullable|string|max:500',
            'vacunas_checklist' => 'nullable|array',
            'vacunas_checklist.*' => 'string',
            'dosis_covid' => 'nullable|string|max:255',
            'efectos_covid' => 'nullable|string|max:255',
            'tiene_seguro_particular' => 'required|in:Sí,No',
            'nombre_seguro' => 'nullable|string|max:255',
            'administradora' => 'nullable|string|max:255',
            'numero_poliza' => 'nullable|string|max:255',
            'telefono_contacto' => 'nullable|string|max:20',
            'informacion_adicional' => 'nullable|string|max:2000',
            'archivo_adjunto' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048'
        ]);

        // Convertir los datos del frontend a la estructura JSON esperada por la base de datos
        $dataToSave = [
            'hijo_id' => $hijo->id,
            'grupo_sanguineo' => $validated['grupo_sanguineo'],
            'factor_rh' => $validated['factor_rh'],
            'informacion_adicional' => $validated['informacion_adicional']
        ];

        // Procesar tratamientos actuales
        $tratamientos = [];
        if ($validated['recibe_tratamientos'] === 'Sí' && !empty($validated['condicion_medica'])) {
            $tratamientos[] = [
                'condicion_medica' => $validated['condicion_medica'],
                'medicamento' => $validated['nombre_medicamento'],
                'frecuencia' => $validated['frecuencia'],
                'administrador' => $validated['quien_administra'],
                'observaciones' => $validated['observaciones']
            ];
        }
        $dataToSave['tratamientos_actuales'] = $tratamientos;

        // Procesar enfermedades preexistentes
        $enfermedades = [];
        if (!empty($validated['detalle_enfermedad'])) {
            $enfermedades[] = [
                'enfermedad' => $validated['detalle_enfermedad'],
                'medicamento' => $validated['medicamento_enfermedad'],
                'frecuencia' => $validated['frecuencia_enfermedad'],
                'administrador' => $validated['quien_administra_enfermedad'],
                'observaciones' => $validated['observaciones_enfermedad']
            ];
        }
        $dataToSave['enfermedades_preexistentes'] = $enfermedades;

        // Procesar alergias médicas
        $alergias = [];
        if (!empty($validated['detalle_alergia'])) {
            $alergias[] = [
                'alergia' => $validated['detalle_alergia'],
                'medicamento_control' => $validated['medicamento_control'],
                'frecuencia' => $validated['frecuencia_alergia'],
                'administrador' => $validated['quien_administra_alergia'],
                'observaciones' => $validated['observaciones_alergia']
            ];
        }
        $dataToSave['alergias_medicas'] = $alergias;

        // Procesar vacunas recibidas
        $vacunas = [];
        if (!empty($validated['vacunas_checklist'])) {
            foreach ($validated['vacunas_checklist'] as $vacuna) {
                $vacunas[$vacuna] = true;
            }
            // Agregar información específica de COVID si existe
            if (in_array('COVID-19', $validated['vacunas_checklist'])) {
                $vacunas['covid_dosis'] = $validated['dosis_covid'] ?? '';
                $vacunas['covid_efectos'] = $validated['efectos_covid'] ?? '';
            }
        }
        $dataToSave['vacunas_recibidas'] = $vacunas;

        // Procesar seguros médicos
        $seguros = [];
        // Seguro de la agencia (siempre presente)
        $seguros[] = [
            'tipo' => 'agencia',
            'nombre' => 'Medix Travel',
            'administradora' => 'Medix',
            'numero_poliza' => 'VIAJE-' . date('Y') . '-' . str_pad($hijo->id, 3, '0', STR_PAD_LEFT),
            'telefono_contacto' => '01 400 0000',
            'editable' => false,
            'tooltip' => 'Seguro ya incluido en el viaje, no editable por los padres'
        ];
        // Seguro particular si existe
        if ($validated['tiene_seguro_particular'] === 'Sí' && !empty($validated['nombre_seguro'])) {
            $seguros[] = [
                'tipo' => 'particular',
                'nombre' => $validated['nombre_seguro'],
                'administradora' => $validated['administradora'],
                'numero_poliza' => $validated['numero_poliza'],
                'telefono_contacto' => $validated['telefono_contacto'],
                'editable' => true,
                'tooltip' => ''
            ];
        }
        $dataToSave['seguros_medicos'] = $seguros;

        // Procesar archivos adjuntos
        $archivos = [];
        if (isset($validated['archivo_adjunto']) && $validated['archivo_adjunto']) {
            $archivo = $validated['archivo_adjunto'];
            $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
            $rutaArchivo = $archivo->storeAs('health_records', $nombreArchivo, 'public');
            $archivos[] = $rutaArchivo;
        }
        $dataToSave['archivos_adjuntos'] = $archivos;

        // Usar updateOrCreate para actualizar si existe o crear si no existe
        SaludFicha::updateOrCreate(
            ['hijo_id' => $hijo->id],
            $dataToSave
        );

        return Redirect::back()->with('message', 'Ficha de salud guardada exitosamente.');
    }

    /**
     * Update health record
     */
    public function updateSaludFicha(Request $request, Hijo $hijo)
    {
        // El método updateSaludFicha ahora redirige al storeSaludFicha que maneja tanto crear como actualizar
        return $this->storeSaludFicha($request, $hijo);
    }

    /**
     * Delete health record
     */
    public function destroySaludFicha(Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para eliminar esta ficha.');
        }

        $saludFicha = SaludFicha::where('hijo_id', $hijo->id)->first();

        if ($saludFicha) {
            $saludFicha->delete();
            return Redirect::back()->with('message', 'Ficha de salud eliminada exitosamente.');
        }

        return Redirect::back()->with('error', 'No se encontró la ficha de salud.');
    }

    // ===========================================
    // NUTRITION RECORD (Ficha de Nutrición) CRUD
    // ===========================================

    /**
     * Store or update nutrition record
     */
    public function storeNutricionFicha(Request $request, Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para gestionar esta ficha.');
        }

        $validated = $request->validate([
            'alimento_alergia' => 'nullable|string|max:500',
            'reaccion_alergia' => 'nullable|string|max:500',
            'alimento_evitar' => 'nullable|string|max:500',
            'especificar_dieta' => 'nullable|string|max:500',
            'detalle_preferencia_alimentaria' => 'nullable|string|max:1000'
        ]);

        $validated['hijo_id'] = $hijo->id;

        // Usar updateOrCreate para actualizar si existe o crear si no existe
        NutricionFicha::updateOrCreate(
            ['hijo_id' => $hijo->id],
            $validated
        );

        return Redirect::back()->with('message', 'Ficha nutricional guardada exitosamente.');
    }

    /**
     * Update nutrition record
     */
    public function updateNutricionFicha(Request $request, Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para editar esta ficha.');
        }

        $nutricionFicha = NutricionFicha::where('hijo_id', $hijo->id)->firstOrFail();

        $validated = $request->validate([
            'alimento_alergia' => 'nullable|string|max:500',
            'reaccion_alergia' => 'nullable|string|max:500',
            'alimento_evitar' => 'nullable|string|max:500',
            'especificar_dieta' => 'nullable|string|max:500',
            'detalle_preferencia_alimentaria' => 'nullable|string|max:1000'
        ]);

        $nutricionFicha->update($validated);

        return Redirect::back()->with('message', 'Ficha nutricional actualizada exitosamente.');
    }

    /**
     * Delete nutrition record
     */
    public function destroyNutricionFicha(Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para eliminar esta ficha.');
        }

        $nutricionFicha = NutricionFicha::where('hijo_id', $hijo->id)->first();

        if ($nutricionFicha) {
            $nutricionFicha->delete();
            return Redirect::back()->with('message', 'Ficha nutricional eliminada exitosamente.');
        }

        return Redirect::back()->with('error', 'No se encontró la ficha nutricional.');
    }
}