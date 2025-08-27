<?php

namespace App\Http\Controllers;

use App\Models\Geolocalizacion;
use App\Models\Grupo;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class GeolocalizacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $grupos = Grupo::all();

        return Inertia::render('Geolocalizacion/Index', [
            'grupos' => $grupos
        ]);
    }

    public function getGroupHistory(Grupo $grupo)
    {
        $hijosIds = Inscripcion::where('grupo_id', $grupo->id)->pluck('hijo_id');
        $locations = Geolocalizacion::whereIn('hijo_id', $hijosIds)
            ->with('hijo:id,nombres')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($locations);
    }
}