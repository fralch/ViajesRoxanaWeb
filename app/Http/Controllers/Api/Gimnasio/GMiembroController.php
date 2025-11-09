<?php

namespace App\Http\Controllers\Api\Gimnasio;

use App\Http\Controllers\Controller;
use App\Models\Gimnasio\GMiembro;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GMiembroController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GMiembro::query();

        if ($request->has('search') && $request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nombre', 'like', "%{$s}%")
                  ->orWhere('dni', 'like', "%{$s}%");
            });
        }

        $miembros = $query->orderBy('id_usuario', 'desc')->get();

        return response()->json(['success' => true, 'data' => $miembros]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'dni' => 'required|string|max:50',
            'fecha_nacimiento' => 'required|date',
            'genero' => 'required|string|max:50',
            'foto_perfil' => 'nullable|string|max:1024',
            'estado' => 'required|string|max:50',
            'fecha_registro' => 'required|date',
        ]);

        $miembro = GMiembro::create($data);
        return response()->json(['success' => true, 'data' => $miembro], 201);
    }

    public function show($miembro): JsonResponse
    {
        $found = GMiembro::with(['membresias', 'asistencias', 'metas'])->findOrFail($miembro);
        return response()->json(['success' => true, 'data' => $found]);
    }

    public function update(Request $request, $miembro): JsonResponse
    {
        $found = GMiembro::findOrFail($miembro);
        $data = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'dni' => 'sometimes|required|string|max:50',
            'fecha_nacimiento' => 'sometimes|required|date',
            'genero' => 'sometimes|required|string|max:50',
            'foto_perfil' => 'nullable|string|max:1024',
            'estado' => 'sometimes|required|string|max:50',
            'fecha_registro' => 'sometimes|required|date',
        ]);

        $found->update($data);
        return response()->json(['success' => true, 'data' => $found]);
    }

    public function destroy($miembro): JsonResponse
    {
        $found = GMiembro::findOrFail($miembro);
        $found->delete();
        return response()->json(['success' => true]);
    }
}