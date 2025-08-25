<?php

namespace App\Http\Controllers;

use App\Models\Hijo;
use App\Models\SaludFicha;
use App\Models\NutricionFicha;
use App\Models\Paquete;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerfilHijoController extends Controller
{
    public function show(Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403);
        }

        // Obtener fichas existentes (generales, sin paquete específico)
        $saludFicha = SaludFicha::where('hijo_id', $hijo->id)
            ->whereNull('package_id')
            ->first();
            
        $nutricionFicha = NutricionFicha::where('hijo_id', $hijo->id)
            ->whereNull('package_id')
            ->first();

        // Obtener paquetes activos para las fichas específicas
        $paquetes = Paquete::where('activo', true)->get();

        return Inertia::render('PerfilHijo', [
            'hijo' => $hijo,
            'saludFicha' => $saludFicha,
            'nutricionFicha' => $nutricionFicha,
            'paquetes' => $paquetes
        ]);
    }

    public function update(Request $request, Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'nombres' => 'required|string|max:255',
            'doc_tipo' => 'required|string|in:CC,TI,RC,CE',
            'doc_numero' => 'required|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
            'foto' => 'nullable|string',
            'pasatiempos' => 'nullable|string',
            'deportes' => 'nullable|string',
            'plato_favorito' => 'nullable|string',
            'color_favorito' => 'nullable|string',
            'informacion_adicional' => 'nullable|string',
            'nums_emergencia' => 'nullable|array',
            'nums_emergencia.*' => 'string|max:20'
        ]);

        $data = $request->all();
        
        // Convertir array de números de emergencia a JSON si existe
        if (isset($data['nums_emergencia'])) {
            // Filtrar números vacíos
            $data['nums_emergencia'] = array_filter($data['nums_emergencia'], function($num) {
                return !empty(trim($num));
            });
            $data['nums_emergencia'] = json_encode(array_values($data['nums_emergencia']));
        }

        $hijo->update($data);

        return redirect()->back()->with('message', 'Perfil actualizado correctamente');
    }

    public function storeSalud(Request $request, Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'package_id' => 'nullable|exists:paquetes,id',
            'alergias' => 'nullable|string',
            'medicamentos' => 'nullable|string',
            'seguros' => 'nullable|string',
            'emergencia_contacto' => 'nullable|string|max:255',
            'emergencia_telefono' => 'nullable|string|max:20',
            'observaciones' => 'nullable|string'
        ]);

        // Crear o actualizar la ficha de salud
        SaludFicha::updateOrCreate(
            [
                'hijo_id' => $hijo->id,
                'package_id' => $request->package_id
            ],
            $request->all()
        );

        return redirect()->back()->with('message', 'Ficha de salud guardada correctamente');
    }

    public function storeNutricion(Request $request, Hijo $hijo)
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'package_id' => 'nullable|exists:paquetes,id',
            'restricciones' => 'nullable|string',
            'preferencias' => 'nullable|string',
            'alergias_alimentarias' => 'nullable|string',
            'intolerancias' => 'nullable|string',
            'otras_notas' => 'nullable|string'
        ]);

        // Crear o actualizar la ficha nutricional
        NutricionFicha::updateOrCreate(
            [
                'hijo_id' => $hijo->id,
                'package_id' => $request->package_id
            ],
            $request->all()
        );

        return redirect()->back()->with('message', 'Ficha nutricional guardada correctamente');
    }
}