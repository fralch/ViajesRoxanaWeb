<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notificacion::query();

        // If not admin, filter notifications by user
        if (!Auth::user()->is_admin) {
            $query->where('user_id', Auth::id());
        }

        $notificaciones = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $notificaciones
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'titulo' => 'required|string|max:255',
            'mensaje' => 'required|string',
            'tipo' => 'required|in:info,warning,error,success',
            'leida' => 'boolean'
        ]);

        $validated['leida'] = $request->boolean('leida', false);

        $notificacion = Notificacion::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Notification created successfully',
            'data' => $notificacion
        ], 201);
    }

    public function show(Notificacion $notificacion): JsonResponse
    {
        // Check permissions
        if (!Auth::user()->is_admin && $notificacion->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $notificacion
        ]);
    }

    public function update(Request $request, Notificacion $notificacion): JsonResponse
    {
        // Check permissions
        if (!Auth::user()->is_admin && $notificacion->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this notification'
            ], 403);
        }

        $validated = $request->validate([
            'leida' => 'boolean'
        ]);

        $notificacion->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Notification updated successfully',
            'data' => $notificacion
        ]);
    }

    public function destroy(Notificacion $notificacion): JsonResponse
    {
        // Check permissions
        if (!Auth::user()->is_admin && $notificacion->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this notification'
            ], 403);
        }

        $notificacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully'
        ]);
    }
}