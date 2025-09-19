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
            'alergias' => 'nullable|string',
            'medicamentos' => 'nullable|string',
            'seguros' => 'nullable|string|max:255',
            'emergencia_contacto' => 'nullable|string|max:255',
            'emergencia_telefono' => 'nullable|string|max:20',
            'observaciones' => 'nullable|string'
        ]);

        $validated['hijo_id'] = $hijo->id;

        // Usar updateOrCreate para actualizar si existe o crear si no existe
        SaludFicha::updateOrCreate(
            ['hijo_id' => $hijo->id],
            $validated
        );

        return Redirect::back()->with('message', 'Ficha de salud guardada exitosamente.');
    }

    /**
     * Update health record
     */
    public function updateSaludFicha(Request $request, Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para editar esta ficha.');
        }

        $saludFicha = SaludFicha::where('hijo_id', $hijo->id)->firstOrFail();

        $validated = $request->validate([
            'alergias' => 'nullable|string',
            'medicamentos' => 'nullable|string',
            'seguros' => 'nullable|string|max:255',
            'emergencia_contacto' => 'nullable|string|max:255',
            'emergencia_telefono' => 'nullable|string|max:20',
            'observaciones' => 'nullable|string'
        ]);

        $saludFicha->update($validated);

        return Redirect::back()->with('message', 'Ficha de salud actualizada exitosamente.');
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
            'restricciones' => 'nullable|string',
            'preferencias' => 'nullable|string',
            'alergias_alimentarias' => 'nullable|string',
            'intolerancias' => 'nullable|string',
            'otras_notas' => 'nullable|string'
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
            'restricciones' => 'nullable|string',
            'preferencias' => 'nullable|string',
            'alergias_alimentarias' => 'nullable|string',
            'intolerancias' => 'nullable|string',
            'otras_notas' => 'nullable|string'
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