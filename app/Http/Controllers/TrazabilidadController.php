<?php

namespace App\Http\Controllers;

use App\Models\Trazabilidad;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrazabilidadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Trazabilidad/Index');
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