<?php

namespace App\Http\Controllers;

use App\Models\Hijo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HijoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Hijos/Index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Hijos/Create');
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
    public function show(Hijo $hijo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Hijo $hijo)
    {
        return Inertia::render('Hijos/Edit', [
            'hijo' => $hijo
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Hijo $hijo)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Hijo $hijo)
    {
        //
    }
}