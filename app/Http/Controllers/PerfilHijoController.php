<?php

namespace App\Http\Controllers;

use App\Models\Hijo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerfilHijoController extends Controller
{
    public function show(Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403, 'No tienes permisos para ver este perfil.');
        }

        return Inertia::render('PerfilHijo', [
            'hijo' => $hijo
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
            'doc_tipo' => 'required|string|in:CC,TI,RC,CE,PP',
            'doc_numero' => 'required|string|max:20',
            'fecha_nacimiento' => 'nullable|date|before_or_equal:today',
            'foto' => 'nullable|string',
            'pasatiempos' => 'nullable|string|max:500',
            'deportes' => 'nullable|string|max:500',
            'plato_favorito' => 'nullable|string|max:200',
            'color_favorito' => 'nullable|string|max:100',
            'informacion_adicional' => 'nullable|string|max:1000',
            'nums_emergencia' => 'nullable|array|max:5',
            'nums_emergencia.*' => 'required|string|regex:/^[\d\s\+\-\(\)]+$/|max:20'
        ], [
            'nombres.required' => 'El nombre es obligatorio',
            'doc_tipo.required' => 'Debe seleccionar un tipo de documento',
            'doc_tipo.in' => 'El tipo de documento seleccionado no es válido',
            'doc_numero.required' => 'El número de documento es obligatorio',
            'fecha_nacimiento.before_or_equal' => 'La fecha de nacimiento no puede ser futura',
            'nums_emergencia.max' => 'Máximo 5 números de emergencia permitidos',
            'nums_emergencia.*.regex' => 'Los números de teléfono solo pueden contener dígitos, espacios y símbolos +, -, (, )',
            'pasatiempos.max' => 'Los pasatiempos no pueden exceder 500 caracteres',
            'deportes.max' => 'Los deportes no pueden exceder 500 caracteres',
            'informacion_adicional.max' => 'La información adicional no puede exceder 1000 caracteres'
        ]);

        $data = $request->all();
        
        // Convertir array de números de emergencia a JSON si existe
        if (isset($data['nums_emergencia'])) {
            // Filtrar números vacíos y limpiar espacios
            $data['nums_emergencia'] = array_filter($data['nums_emergencia'], function($num) {
                return !empty(trim($num));
            });
            
            // Reindexar array y convertir a JSON
            $data['nums_emergencia'] = json_encode(array_values($data['nums_emergencia']));
        } else {
            // Si no hay números, guardar array vacío
            $data['nums_emergencia'] = json_encode([]);
        }

        $hijo->update($data);

        return redirect()->back()->with('message', '✅ Perfil actualizado correctamente');
    }
}