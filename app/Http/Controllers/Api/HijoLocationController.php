<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
        // No authentication required - show any child's location

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
                    'latitude' => (float) $lastLocation->latitud,
                    'longitude' => (float) $lastLocation->longitud,
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
        // No authentication required - show any child's location history

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
        // No authentication required - show any child's location stats

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
}