<?php

namespace App\Http\Controllers;

use App\Models\Hijo;
use App\Models\Geolocalizacion;
use App\Models\Trazabilidad;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HijoLocationController extends Controller
{
    /**
     * Obtiene la última ubicación conocida de un hijo específico
     */
    public function getLastLocation(Hijo $hijo): JsonResponse
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para ver la ubicación de este hijo'
            ], 403);
        }

        try {
            // Obtener la última ubicación registrada desde la tabla Trazabilidad
            $lastLocation = Trazabilidad::where('hijo_id', $hijo->id)
                ->with(['paquete:id,nombre,destino'])
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$lastLocation) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron datos de ubicación para este hijo',
                    'hijo' => [
                        'id' => $hijo->id,
                        'nombres' => $hijo->nombres
                    ]
                ], 404);
            }

            return response()->json([
                'success' => true,
                'location' => [
                    'latitude' => $lastLocation->latitud ? (float) $lastLocation->latitud : null,
                    'longitude' => $lastLocation->longitud ? (float) $lastLocation->longitud : null,
                    'descripcion' => $lastLocation->descripcion,
                    'timestamp' => $lastLocation->created_at->toISOString(),
                    'formatted_time' => $lastLocation->created_at->format('Y-m-d H:i:s'),
                    'minutes_ago' => $lastLocation->created_at->diffInMinutes(now()),
                    'human_time' => $lastLocation->created_at->diffForHumans()
                ],
                'hijo' => [
                    'id' => $hijo->id,
                    'nombres' => $hijo->nombres,
                    'doc_tipo' => $hijo->doc_tipo,
                    'doc_numero' => $hijo->doc_numero
                ],
                'paquete' => $lastLocation->paquete ? [
                    'id' => $lastLocation->paquete->id,
                    'nombre' => $lastLocation->paquete->nombre,
                    'destino' => $lastLocation->paquete->destino
                ] : null
            ]);

        } catch (\Exception $e) {
            \Log::error('Error obteniendo ubicación del hijo: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al obtener la ubicación'
            ], 500);
        }
    }

    /**
     * Obtiene el historial de ubicaciones de un hijo
     */
    public function getLocationHistory(Request $request, Hijo $hijo): JsonResponse
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para ver el historial de este hijo'
            ], 403);
        }

        $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
            'hours' => 'nullable|integer|min:1|max:168' // máximo 1 semana
        ]);

        try {
            $limit = $request->get('limit', 20);
            $hours = $request->get('hours', 24);

            $query = Geolocalizacion::where('hijo_id', $hijo->id)
                ->with(['paquete:id,nombre,destino'])
                ->where('created_at', '>=', now()->subHours($hours))
                ->orderBy('created_at', 'desc')
                ->limit($limit);

            $locations = $query->get();

            $locationData = $locations->map(function ($location) {
                return [
                    'id' => $location->id,
                    'latitude' => (float) $location->latitud,
                    'longitude' => (float) $location->longitud,
                    'timestamp' => $location->created_at->toISOString(),
                    'formatted_time' => $location->created_at->format('H:i:s'),
                    'minutes_ago' => $location->created_at->diffInMinutes(now()),
                    'human_time' => $location->created_at->diffForHumans(),
                    'paquete_nombre' => $location->paquete?->nombre
                ];
            });

            return response()->json([
                'success' => true,
                'locations' => $locationData,
                'total' => $locations->count(),
                'hijo' => [
                    'id' => $hijo->id,
                    'nombres' => $hijo->nombres
                ],
                'filters' => [
                    'limit' => $limit,
                    'hours' => $hours,
                    'from' => now()->subHours($hours)->format('Y-m-d H:i:s'),
                    'to' => now()->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error obteniendo historial de ubicación: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al obtener el historial'
            ], 500);
        }
    }

    /**
     * Obtiene estadísticas de ubicación del hijo
     */
    public function getLocationStats(Hijo $hijo): JsonResponse
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para ver las estadísticas de este hijo'
            ], 403);
        }

        try {
            $today = now()->startOfDay();
            $thisWeek = now()->startOfWeek();
            $thisMonth = now()->startOfMonth();

            $stats = [
                'total_locations' => Geolocalizacion::where('hijo_id', $hijo->id)->count(),
                'today' => Geolocalizacion::where('hijo_id', $hijo->id)
                    ->where('created_at', '>=', $today)->count(),
                'this_week' => Geolocalizacion::where('hijo_id', $hijo->id)
                    ->where('created_at', '>=', $thisWeek)->count(),
                'this_month' => Geolocalizacion::where('hijo_id', $hijo->id)
                    ->where('created_at', '>=', $thisMonth)->count(),
            ];

            // Última y primera ubicación
            $lastLocation = Geolocalizacion::where('hijo_id', $hijo->id)
                ->orderBy('created_at', 'desc')->first();
            
            $firstLocation = Geolocalizacion::where('hijo_id', $hijo->id)
                ->orderBy('created_at', 'asc')->first();

            $stats['last_seen'] = $lastLocation ? [
                'timestamp' => $lastLocation->created_at->toISOString(),
                'human_time' => $lastLocation->created_at->diffForHumans()
            ] : null;

            $stats['first_seen'] = $firstLocation ? [
                'timestamp' => $firstLocation->created_at->toISOString(),
                'human_time' => $firstLocation->created_at->diffForHumans()
            ] : null;

            // Paquetes activos
            $activePaquetes = Geolocalizacion::where('hijo_id', $hijo->id)
                ->with('paquete:id,nombre')
                ->select('paquete_id')
                ->distinct()
                ->get()
                ->pluck('paquete')
                ->filter()
                ->values();

            $stats['active_packages'] = $activePaquetes->map(function ($paquete) {
                return [
                    'id' => $paquete->id,
                    'nombre' => $paquete->nombre
                ];
            });

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'hijo' => [
                    'id' => $hijo->id,
                    'nombres' => $hijo->nombres
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error obteniendo estadísticas de ubicación: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al obtener estadísticas'
            ], 500);
        }
    }

    /**
     * Simula actualización de ubicación para pruebas
     * (En producción esto vendría de un dispositivo GPS real)
     */
    public function simulateLocationUpdate(Request $request, Hijo $hijo): JsonResponse
    {
        // Verificar que el hijo pertenece al usuario autenticado
        if ($hijo->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para actualizar la ubicación de este hijo'
            ], 403);
        }

        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'paquete_id' => 'nullable|exists:paquetes,id'
        ]);

        try {
            // Obtener paquete activo si no se especifica
            $paqueteId = $request->paquete_id;
            if (!$paqueteId) {
                $lastLocation = Geolocalizacion::where('hijo_id', $hijo->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                $paqueteId = $lastLocation?->paquete_id ?? 1;
            }

            $location = Geolocalizacion::create([
                'hijo_id' => $hijo->id,
                'paquete_id' => $paqueteId,
                'latitud' => $request->latitude,
                'longitud' => $request->longitude
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ubicación actualizada correctamente',
                'location' => [
                    'id' => $location->id,
                    'latitude' => (float) $location->latitud,
                    'longitude' => (float) $location->longitud,
                    'timestamp' => $location->created_at->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error simulando actualización de ubicación: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor al actualizar la ubicación'
            ], 500);
        }
    }
}