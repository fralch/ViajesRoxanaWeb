<?php

namespace App\Http\Controllers;

use App\Models\RecorridoPaquete;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;

class RecorridoPaqueteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('RecorridoPaquetes/Index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('RecorridoPaquetes/Create');
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
    public function show(RecorridoPaquete $recorridoPaquete)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RecorridoPaquete $recorridoPaquete)
    {
        return Inertia::render('RecorridoPaquetes/Edit', [
            'recorridoPaquete' => $recorridoPaquete
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RecorridoPaquete $recorridoPaquete)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RecorridoPaquete $recorridoPaquete)
    {
        //
    }

    /**
     * Update the order of routes for a package
     */
    public function updateOrder(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'routes' => 'required|array',
                'routes.*.id' => 'required|integer|exists:recorrido_paquetes,id',
                'routes.*.orden' => 'required|integer|min:1'
            ]);

            foreach ($validated['routes'] as $routeData) {
                RecorridoPaquete::where('id', $routeData['id'])
                    ->update(['orden' => $routeData['orden']]);
            }

            return response()->json(['message' => 'Orden actualizado exitosamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al actualizar el orden: ' . $e->getMessage()], 500);
        }
    }
}