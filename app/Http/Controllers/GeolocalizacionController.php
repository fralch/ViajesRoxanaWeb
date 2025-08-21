<?php

namespace App\Http\Controllers;

use App\Models\Geolocalizacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeolocalizacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Geolocalizacion/Index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Geolocalizacion/Create');
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
    public function show(Geolocalizacion $geolocalizacion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Geolocalizacion $geolocalizacion)
    {
        return Inertia::render('Geolocalizacion/Edit', [
            'geolocalizacion' => $geolocalizacion
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Geolocalizacion $geolocalizacion)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Geolocalizacion $geolocalizacion)
    {
        //
    }
}