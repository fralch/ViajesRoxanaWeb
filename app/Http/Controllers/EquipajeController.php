<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Hijo;
use App\Models\Equipaje;
use Barryvdh\DomPDF\Facade\Pdf;

class EquipajeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $selectedHijo = null;

        // Si se pasa el parámetro hijo (doc_numero), filtrar por ese hijo específico
        if ($request->has('hijo')) {
            $selectedHijo = $user->hijos()->where('doc_numero', $request->hijo)->first();

            if (!$selectedHijo) {
                abort(404, 'Hijo no encontrado o no autorizado');
            }

            // Obtener solo el hijo seleccionado con sus equipajes
            $hijos = collect([$selectedHijo->load(['equipajes' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])]);
        } else {
            // Obtener todos los hijos del usuario con sus equipajes
            $hijos = $user->hijos()->with(['equipajes' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])->get();
        }

        return Inertia::render('Equipaje/Index', [
            'hijos' => $hijos,
            'selectedHijo' => $selectedHijo,
            'hijoParam' => $request->hijo,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();
        $hijos = $user->hijos;

        return Inertia::render('Equipaje/Create', [
            'hijos' => $hijos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        \Log::info('=== EQUIPAJE CONTROLLER STORE METHOD DEBUG ===');
        \Log::info('Request method: ' . $request->method());
        \Log::info('Request URL: ' . $request->fullUrl());
        \Log::info('All request data:', $request->all());
        \Log::info('Files in request:', $request->allFiles());
        \Log::info('Headers:', $request->headers->all());
        
        $user = auth()->user();
        \Log::info('Authenticated user ID: ' . $user->id);

        // Obtener el hijo_id basado en el número de documento enviado desde el frontend
        $hijoId = null;
        if ($request->has('hijo_doc_numero') && $request->hijo_doc_numero) {
            \Log::info('Processing with hijo_doc_numero from form data: ' . $request->hijo_doc_numero);
            $hijo = $user->hijos()->where('doc_numero', $request->hijo_doc_numero)->first();
            if (!$hijo) {
                \Log::error('Hijo not found with doc_numero: ' . $request->hijo_doc_numero);
                return back()->withErrors(['hijo_doc_numero' => 'Hijo no encontrado o no autorizado']);
            }
            $hijoId = $hijo->id;
            \Log::info('Found hijo ID: ' . $hijoId);
        } elseif ($request->has('hijo') && $request->hijo) {
            \Log::info('Processing with hijo parameter from URL: ' . $request->hijo);
            $hijo = $user->hijos()->where('doc_numero', $request->hijo)->first();
            if (!$hijo) {
                \Log::error('Hijo not found with doc_numero: ' . $request->hijo);
                return back()->withErrors(['hijo' => 'Hijo no encontrado o no autorizado']);
            }
            $hijoId = $hijo->id;
            \Log::info('Found hijo ID: ' . $hijoId);
        } elseif ($request->has('hijo_id') && $request->hijo_id) {
            \Log::info('Processing with hijo_id: ' . $request->hijo_id);
            $hijoId = $request->hijo_id;
        } else {
            \Log::error('No hijo information provided');
            return back()->withErrors(['hijo' => 'Debe seleccionar un hijo']);
        }

        \Log::info('Final hijo ID to use: ' . $hijoId);

        // Validación actualizada - ya no necesitamos validar hijo_id porque lo obtenemos del doc_numero
        $validationRules = [
            'tip_maleta' => 'required|string|in:Maleta de 8 kg,Maleta de 23 kg',
            'num_etiqueta' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'caracteristicas' => 'nullable|string',
            'peso' => 'nullable|numeric|min:0',
            'images' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'lugar_regis' => 'nullable|string|max:255',
        ];

        \Log::info('Validation rules:', $validationRules);

        try {
            $request->validate($validationRules);
            \Log::info('✅ Validation passed');
        } catch (\Exception $e) {
            \Log::error('❌ Validation failed: ' . $e->getMessage());
            throw $e;
        }

        // Usar el hijoId determinado anteriormente
        $finalHijoId = $hijoId;

        if (!$finalHijoId) {
            \Log::error('❌ No hijo ID could be determined');
            abort(400, 'No se pudo determinar el hijo para el equipaje');
        }

        // Verificar que el hijo pertenece al usuario autenticado
        $hijo = Hijo::where('id', $finalHijoId)
                    ->where('user_id', auth()->id())
                    ->firstOrFail();

        \Log::info('✅ Hijo verification passed for ID: ' . $finalHijoId);

        // Procesar las imágenes
        $imagePaths = [];
        $imageFields = ['images', 'images1', 'images2'];

        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                \Log::info('Processing image field: ' . $field);
                $image = $request->file($field);
                $filename = time() . '_' . uniqid() . '_' . $field . '.' . $image->getClientOriginalExtension();
                
                // Mover la imagen a public/img/equipaje
                $image->move(public_path('img/equipaje'), $filename);
                $path = 'img/equipaje/' . $filename;
                $imagePaths[$field] = $path;
                \Log::info('Image saved: ' . $path);
            }
        }

        \Log::info('Image paths:', $imagePaths);

        $equipajeData = [
            'hijo_id' => $finalHijoId,
            'tip_maleta' => $request->tip_maleta,
            'num_etiqueta' => $request->num_etiqueta,
            'color' => $request->color,
            'caracteristicas' => $request->caracteristicas,
            'peso' => $request->peso,
            'images' => $imagePaths['images'] ?? null,
            'images1' => $imagePaths['images1'] ?? null,
            'images2' => $imagePaths['images2'] ?? null,
            'lugar_regis' => $request->lugar_regis,
        ];

        \Log::info('Creating equipaje with data:', $equipajeData);

        try {
            $equipaje = Equipaje::create($equipajeData);
            \Log::info('✅ Equipaje created successfully with ID: ' . $equipaje->id);
        } catch (\Exception $e) {
            \Log::error('❌ Failed to create equipaje: ' . $e->getMessage());
            throw $e;
        }

        // Mantener el parámetro hijo en la redirección si existe
        $redirectRoute = 'equipaje.index';
        $redirectParams = [];
        if ($request->has('hijo_doc_numero')) {
            $redirectParams['hijo'] = $request->hijo_doc_numero;
        }

        \Log::info('Redirecting to: ' . $redirectRoute . ' with params:', $redirectParams);
        \Log::info('=== END EQUIPAJE CONTROLLER DEBUG ===');

        return redirect()->route($redirectRoute, $redirectParams)->with('success', 'Equipaje agregado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $equipaje = Equipaje::with('hijo')->findOrFail($id);
        
        // Verificar que el equipaje pertenece a un hijo del usuario autenticado
        if ($equipaje->hijo->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Equipaje/Show', [
            'equipaje' => $equipaje,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $equipaje = Equipaje::with('hijo')->findOrFail($id);
        
        // Verificar que el equipaje pertenece a un hijo del usuario autenticado
        if ($equipaje->hijo->user_id !== auth()->id()) {
            abort(403);
        }

        $user = auth()->user();
        $hijos = $user->hijos;

        return Inertia::render('Equipaje/Edit', [
            'equipaje' => $equipaje,
            'hijos' => $hijos,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $equipaje = Equipaje::with('hijo')->findOrFail($id);

        // Verificar que el equipaje pertenece a un hijo del usuario autenticado
        if ($equipaje->hijo->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'hijo_id' => 'sometimes|exists:hijos,id', // Not required for updates
            'tip_maleta' => 'required|string|in:Maleta de 8 kg,Maleta de 23 kg',
            'num_etiqueta' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'caracteristicas' => 'nullable|string',
            'peso' => 'nullable|numeric|min:0',
            'images' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'lugar_regis' => 'nullable|string|max:255',
        ]);

        // Verificar que el hijo pertenece al usuario si se proporciona uno nuevo
        if ($request->has('hijo_id')) {
            $hijo = Hijo::where('id', $request->hijo_id)
                         ->where('user_id', auth()->id())
                         ->firstOrFail();
        }

        // Procesar las imágenes
        $imagePaths = [];
        $imageFields = ['images', 'images1', 'images2'];

        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                // Eliminar imagen anterior si existe
                if ($equipaje->$field && file_exists(public_path($equipaje->$field))) {
                    unlink(public_path($equipaje->$field));
                }

                $image = $request->file($field);
                $filename = time() . '_' . uniqid() . '_' . $field . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('img/equipaje'), $filename);
                $path = 'img/equipaje/' . $filename;
                $imagePaths[$field] = $path;
            } else {
                // Mantener la imagen existente si no se sube una nueva
                $imagePaths[$field] = $equipaje->$field;
            }
        }

        $updateData = [
            'tip_maleta' => $request->tip_maleta,
            'color' => $request->color,
            'caracteristicas' => $request->caracteristicas,
            'peso' => $request->peso,
            'images' => $imagePaths['images'],
            'images1' => $imagePaths['images1'],
            'images2' => $imagePaths['images2'],
            'lugar_regis' => $request->lugar_regis,
        ];

        // Solo actualizar hijo_id si se proporciona
        if ($request->has('hijo_id')) {
            $updateData['hijo_id'] = $request->hijo_id;
        }

        $equipaje->update($updateData);

        // Mantener el parámetro hijo en la redirección si existe en la URL actual
        $redirectRoute = 'equipaje.index';
        $redirectParams = [];
        if (request()->has('hijo')) {
            $redirectParams['hijo'] = request()->hijo;
        }

        return redirect()->route($redirectRoute, $redirectParams)->with('success', 'Equipaje actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $equipaje = Equipaje::with('hijo')->findOrFail($id);

        // Verificar que el equipaje pertenece a un hijo del usuario autenticado
        if ($equipaje->hijo->user_id !== auth()->id()) {
            abort(403);
        }

        // Eliminar imágenes asociadas
        $imageFields = ['images', 'images1', 'images2'];
        foreach ($imageFields as $field) {
            if ($equipaje->$field && file_exists(public_path($equipaje->$field))) {
                unlink(public_path($equipaje->$field));
            }
        }

        $equipaje->delete();

        // Mantener el parámetro hijo en la redirección si existe en la URL actual
        $redirectRoute = 'equipaje.index';
        $redirectParams = [];
        if (request()->has('hijo')) {
            $redirectParams['hijo'] = request()->hijo;
        }

        return redirect()->route($redirectRoute, $redirectParams)->with('success', 'Equipaje eliminado correctamente.');
    }

    /**
     * Export equipajes to PDF
     */
    public function exportPdf(Request $request)
    {
        $user = auth()->user();
        $selectedHijo = null;

        // Si se pasa el parámetro hijo (doc_numero), filtrar por ese hijo específico
        if ($request->has('hijo')) {
            $selectedHijo = $user->hijos()->where('doc_numero', $request->hijo)->first();

            if (!$selectedHijo) {
                abort(404, 'Hijo no encontrado o no autorizado');
            }

            // Obtener solo el hijo seleccionado con sus equipajes
            $hijos = collect([$selectedHijo->load(['equipajes' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])]);
        } else {
            // Obtener todos los hijos del usuario con sus equipajes
            $hijos = $user->hijos()->with(['equipajes' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])->get();
        }

        // Generar el PDF
        $pdf = Pdf::loadView('equipaje.pdf', [
            'hijos' => $hijos,
            'selectedHijo' => $selectedHijo,
            'user' => $user,
            'fecha_generacion' => now()->format('d/m/Y H:i')
        ]);

        // Configurar el PDF
        $pdf->setPaper('A4', 'portrait');
        
        // Nombre del archivo
        $filename = 'equipajes_' . ($selectedHijo ? $selectedHijo->doc_numero : 'todos') . '_' . now()->format('Y-m-d_H-i-s') . '.pdf';

        return $pdf->download($filename);
    }
}