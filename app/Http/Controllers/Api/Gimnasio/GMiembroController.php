<?php

namespace App\Http\Controllers\Api\Gimnasio;

use App\Http\Controllers\Controller;
use App\Models\Gimnasio\GMiembro;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class GMiembroController extends Controller
{


    public function index(Request $request): JsonResponse
    {
        $query = GMiembro::query();

        if ($request->has('search') && $request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nombre', 'like', "%{$s}%")
                  ->orWhere('dni', 'like', "%{$s}%")
                  ->orWhere('celular', 'like', "%{$s}%");
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
            'password' => 'nullable|string|min:6',
            'celular' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'required|date',
            'genero' => 'required|string|max:50',
            'foto_perfil' => 'nullable|string|max:1024',
            'estado' => 'required|string|max:50',
            'fecha_registro' => 'required|date',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

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
            'celular' => 'sometimes|nullable|string|max:20',
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

    /**
     * POST /endpoint/gimnasio/miembros/{id_usuario}/foto-perfil
     * Actualizar la foto de perfil y agregar al historial
     */
    public function actualizarFotoPerfil(Request $request, $miembro): JsonResponse
    {
        $found = GMiembro::findOrFail($miembro);

        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB
        ]);

        // Subir la nueva foto
        $foto = $request->file('foto');
        $nombreArchivo = 'miembro_' . $found->id_usuario . '_' . time() . '.' . $foto->getClientOriginalExtension();
        $rutaFoto = $foto->storeAs('gimnasio/fotos_perfil', $nombreArchivo, 'public');

        // Obtener el historial actual o crear uno nuevo
        $historial = $found->historial_fotos ?? [];

        // Si ya tiene una foto de perfil actual, agregarla al historial
        if ($found->foto_perfil) {
            $historial[] = [
                'ruta' => $found->foto_perfil,
                'fecha_cambio' => Carbon::now()->toDateTimeString(),
            ];
        }

        // Actualizar el miembro con la nueva foto y el historial
        $found->update([
            'foto_perfil' => $rutaFoto,
            'historial_fotos' => $historial,
        ]);

        return response()->json([
            'success' => true,
            'mensaje' => 'Foto de perfil actualizada exitosamente',
            'data' => [
                'foto_perfil' => url('storage/' . $rutaFoto),
                'historial' => array_map(function($item) {
                    return [
                        'url' => url('storage/' . $item['ruta']),
                        'fecha_cambio' => $item['fecha_cambio'],
                    ];
                }, $historial),
            ],
        ], 200);
    }
    /**
     * POST /endpoint/gimnasio/miembros/login
     * Identificar miembro por DNI y Contraseña y retornar sus datos completos
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'dni' => 'required|string',
            'password' => 'required|string',
        ]);

        $miembro = GMiembro::where('dni', $request->dni)
            ->with([
                'membresias' => function ($query) {
                    $query->orderBy('fecha_fin', 'desc');
                },
                'asistencias' => function ($query) {
                    $query->orderBy('fecha_asistencia', 'desc')->orderBy('hora_entrada', 'desc')->take(20); // Limitamos a las últimas 20 asistencias
                },
                'metas'
            ])
            ->first();

        if (!$miembro || !Hash::check($request->password, $miembro->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        // Calculamos información adicional de la membresía activa si existe
        $membresiaActiva = $miembro->membresias->where('estado', 'Activo')->first();
        if (!$membresiaActiva) {
            // Si no hay activa, buscamos la última aunque esté vencida
            $membresiaActiva = $miembro->membresias->first();
        }

        $tiempoRestante = null;
        if ($membresiaActiva && $membresiaActiva->fecha_fin && Carbon::parse($membresiaActiva->fecha_fin)->isFuture()) {
            $tiempoRestante = Carbon::now()->diffInDays(Carbon::parse($membresiaActiva->fecha_fin), false);
        }

        // Añadimos datos calculados al objeto respuesta (no persistimos)
        $miembro->setAttribute('membresia_actual', $membresiaActiva);
        $miembro->setAttribute('dias_restantes', $tiempoRestante);

        return response()->json([
            'success' => true,
            'data' => $miembro,
        ]);
    }
}