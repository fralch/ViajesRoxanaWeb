<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MapboxController extends Controller
{
    private string $accessToken;

    public function __construct()
    {
        $this->accessToken = config('services.mapbox.access_token');
    }

    /**
     * Obtiene el token público de Mapbox de forma segura
     */
    public function getMapboxToken(): JsonResponse
    {
        return response()->json([
            'access_token' => $this->accessToken
        ]);
    }

    /**
     * Geocodificación inversa: convierte coordenadas en dirección
     */
    public function reverseGeocode(Request $request): JsonResponse
    {
        $request->validate([
            'longitude' => 'required|numeric|between:-180,180',
            'latitude' => 'required|numeric|between:-90,90'
        ]);

        $lng = $request->longitude;
        $lat = $request->latitude;

        try {
            $response = Http::get("https://api.mapbox.com/geocoding/v5/mapbox.places/{$lng},{$lat}.json", [
                'access_token' => $this->accessToken,
                'language' => 'es',
                'limit' => 1
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['features']) && count($data['features']) > 0) {
                    $place = $data['features'][0];
                    
                    return response()->json([
                        'success' => true,
                        'address' => $place['place_name'],
                        'components' => $this->parseAddressComponents($place['context'] ?? []),
                        'coordinates' => [
                            'longitude' => $lng,
                            'latitude' => $lat
                        ]
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'No se pudo obtener la dirección para estas coordenadas'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error en geocodificación inversa: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la geocodificación'
            ], 500);
        }
    }

    /**
     * Búsqueda de lugares usando Mapbox Search API
     */
    public function searchPlaces(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:3|max:100',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
            'limit' => 'nullable|integer|between:1,10'
        ]);

        $query = $request->query;
        $limit = $request->limit ?? 5;
        $proximity = '';

        // Si se proporcionan coordenadas, usarlas como proximidad
        if ($request->has('longitude') && $request->has('latitude')) {
            $proximity = "&proximity={$request->longitude},{$request->latitude}";
        }

        try {
            $response = Http::get("https://api.mapbox.com/geocoding/v5/mapbox.places/{$query}.json", [
                'access_token' => $this->accessToken,
                'language' => 'es',
                'limit' => $limit,
                'country' => 'CO', // Limitar a Colombia
                'types' => 'poi,address,place'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $places = collect($data['features'])->map(function ($feature) {
                    return [
                        'id' => $feature['id'],
                        'name' => $feature['text'],
                        'address' => $feature['place_name'],
                        'coordinates' => [
                            'longitude' => $feature['center'][0],
                            'latitude' => $feature['center'][1]
                        ],
                        'category' => $feature['properties']['category'] ?? null,
                        'relevance' => $feature['relevance']
                    ];
                });

                return response()->json([
                    'success' => true,
                    'places' => $places
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No se encontraron lugares para la búsqueda'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error en búsqueda de lugares: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar lugares'
            ], 500);
        }
    }

    /**
     * Calcula la distancia entre dos puntos usando la fórmula de Haversine
     */
    public function calculateDistance(Request $request): JsonResponse
    {
        $request->validate([
            'from.longitude' => 'required|numeric|between:-180,180',
            'from.latitude' => 'required|numeric|between:-90,90',
            'to.longitude' => 'required|numeric|between:-180,180',
            'to.latitude' => 'required|numeric|between:-90,90'
        ]);

        $from = $request->from;
        $to = $request->to;

        $distance = $this->haversineDistance(
            $from['latitude'],
            $from['longitude'],
            $to['latitude'],
            $to['longitude']
        );

        return response()->json([
            'success' => true,
            'distance' => [
                'meters' => round($distance),
                'kilometers' => round($distance / 1000, 2),
                'formatted' => $this->formatDistance($distance)
            ],
            'from' => $from,
            'to' => $to
        ]);
    }

    /**
     * Obtiene la ruta entre dos puntos usando Mapbox Directions API
     */
    public function getRoute(Request $request): JsonResponse
    {
        $request->validate([
            'from.longitude' => 'required|numeric|between:-180,180',
            'from.latitude' => 'required|numeric|between:-90,90',
            'to.longitude' => 'required|numeric|between:-180,180',
            'to.latitude' => 'required|numeric|between:-90,90',
            'profile' => 'nullable|in:driving,walking,cycling'
        ]);

        $from = $request->from;
        $to = $request->to;
        $profile = $request->profile ?? 'driving';

        $coordinates = "{$from['longitude']},{$from['latitude']};{$to['longitude']},{$to['latitude']}";

        try {
            $response = Http::get("https://api.mapbox.com/directions/v5/mapbox/{$profile}/{$coordinates}", [
                'access_token' => $this->accessToken,
                'geometries' => 'geojson',
                'language' => 'es',
                'overview' => 'full'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['routes']) && count($data['routes']) > 0) {
                    $route = $data['routes'][0];
                    
                    return response()->json([
                        'success' => true,
                        'route' => [
                            'geometry' => $route['geometry'],
                            'distance' => round($route['distance']),
                            'duration' => round($route['duration']),
                            'formatted_distance' => $this->formatDistance($route['distance']),
                            'formatted_duration' => $this->formatDuration($route['duration'])
                        ]
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'No se pudo calcular la ruta'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error al calcular ruta: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al calcular la ruta'
            ], 500);
        }
    }

    /**
     * Calcula la distancia usando la fórmula de Haversine
     */
    private function haversineDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371000; // Radio de la Tierra en metros

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Formatea la distancia para mostrar
     */
    private function formatDistance($meters): string
    {
        if ($meters < 1000) {
            return round($meters) . ' metros';
        } else {
            return round($meters / 1000, 1) . ' km';
        }
    }

    /**
     * Formatea la duración para mostrar
     */
    private function formatDuration($seconds): string
    {
        $minutes = round($seconds / 60);
        
        if ($minutes < 60) {
            return $minutes . ' min';
        } else {
            $hours = floor($minutes / 60);
            $remainingMinutes = $minutes % 60;
            return $hours . 'h ' . $remainingMinutes . 'min';
        }
    }

    /**
     * Parsea los componentes de dirección de Mapbox
     */
    private function parseAddressComponents($context): array
    {
        $components = [
            'neighborhood' => null,
            'locality' => null,
            'place' => null,
            'region' => null,
            'country' => null
        ];

        foreach ($context as $item) {
            $id = $item['id'];
            
            if (str_contains($id, 'neighborhood')) {
                $components['neighborhood'] = $item['text'];
            } elseif (str_contains($id, 'locality')) {
                $components['locality'] = $item['text'];
            } elseif (str_contains($id, 'place')) {
                $components['place'] = $item['text'];
            } elseif (str_contains($id, 'region')) {
                $components['region'] = $item['text'];
            } elseif (str_contains($id, 'country')) {
                $components['country'] = $item['text'];
            }
        }

        return $components;
    }
}