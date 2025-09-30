<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MapboxController extends Controller
{
    /**
     * Token de acceso público de Mapbox
     * En producción, esto debería estar en .env
     */
    private function getMapboxToken(): string
    {
        return env('MAPBOX_PUBLIC_TOKEN', 'pk.eyJ1IjoiZnJhbGNoIiwiYSI6ImNtZXJ0ZGk1bzBhcDcyaXBxOGpvY3F5bjcifQ.jBkOkpE1eJoYVs-g5BifWA');
    }

    /**
     * Devuelve el token público de Mapbox al frontend
     */
    public function getMapboxTokenPublic(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'access_token' => $this->getMapboxToken()
        ]);
    }

    /**
     * Geocodificación inversa: convierte coordenadas en dirección
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function reverseGeocode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'longitude' => 'required|numeric|between:-180,180',
            'latitude' => 'required|numeric|between:-90,90'
        ]);

        try {
            $longitude = $validated['longitude'];
            $latitude = $validated['latitude'];
            $token = $this->getMapboxToken();

            // Llamar a la API de Mapbox Geocoding
            $url = "https://api.mapbox.com/geocoding/v5/mapbox.places/{$longitude},{$latitude}.json";

            $response = Http::get($url, [
                'access_token' => $token,
                'types' => 'address,place,locality,neighborhood',
                'limit' => 1
            ]);

            if (!$response->successful()) {
                Log::error('Mapbox reverse geocode error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Error al obtener la dirección desde Mapbox'
                ], 500);
            }

            $data = $response->json();

            if (empty($data['features'])) {
                return response()->json([
                    'success' => true,
                    'address' => 'Dirección no disponible',
                    'components' => [],
                    'coordinates' => [
                        'longitude' => $longitude,
                        'latitude' => $latitude
                    ]
                ]);
            }

            $feature = $data['features'][0];
            $placeName = $feature['place_name'] ?? 'Dirección no disponible';

            // Extraer componentes de la dirección
            $components = [];
            if (isset($feature['context'])) {
                foreach ($feature['context'] as $context) {
                    $id = explode('.', $context['id'])[0];
                    $components[$id] = $context['text'];
                }
            }

            return response()->json([
                'success' => true,
                'address' => $placeName,
                'components' => $components,
                'coordinates' => [
                    'longitude' => $longitude,
                    'latitude' => $latitude
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en geocodificación inversa', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno al procesar la solicitud'
            ], 500);
        }
    }

    /**
     * Busca lugares usando Mapbox Search API
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchPlaces(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|max:255',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
            'limit' => 'nullable|integer|min:1|max:10'
        ]);

        try {
            $query = urlencode($validated['query']);
            $token = $this->getMapboxToken();
            $limit = $validated['limit'] ?? 5;

            $url = "https://api.mapbox.com/geocoding/v5/mapbox.places/{$query}.json";

            $params = [
                'access_token' => $token,
                'limit' => $limit
            ];

            // Agregar proximidad si se proporcionan coordenadas
            if (isset($validated['longitude']) && isset($validated['latitude'])) {
                $params['proximity'] = "{$validated['longitude']},{$validated['latitude']}";
            }

            $response = Http::get($url, $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al buscar lugares'
                ], 500);
            }

            $data = $response->json();
            $places = [];

            foreach ($data['features'] ?? [] as $feature) {
                $places[] = [
                    'name' => $feature['place_name'],
                    'coordinates' => [
                        'longitude' => $feature['geometry']['coordinates'][0],
                        'latitude' => $feature['geometry']['coordinates'][1]
                    ],
                    'type' => $feature['place_type'][0] ?? 'unknown'
                ];
            }

            return response()->json([
                'success' => true,
                'places' => $places
            ]);

        } catch (\Exception $e) {
            Log::error('Error buscando lugares', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno al buscar lugares'
            ], 500);
        }
    }

    /**
     * Calcula la distancia entre dos puntos usando fórmula Haversine
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function calculateDistance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from.longitude' => 'required|numeric|between:-180,180',
            'from.latitude' => 'required|numeric|between:-90,90',
            'to.longitude' => 'required|numeric|between:-180,180',
            'to.latitude' => 'required|numeric|between:-90,90'
        ]);

        try {
            $from = $validated['from'];
            $to = $validated['to'];

            // Fórmula Haversine para calcular distancia en la esfera
            $earthRadius = 6371000; // metros

            $lat1 = deg2rad($from['latitude']);
            $lat2 = deg2rad($to['latitude']);
            $deltaLat = deg2rad($to['latitude'] - $from['latitude']);
            $deltaLng = deg2rad($to['longitude'] - $from['longitude']);

            $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
                 cos($lat1) * cos($lat2) *
                 sin($deltaLng / 2) * sin($deltaLng / 2);

            $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
            $distance = $earthRadius * $c; // en metros

            return response()->json([
                'success' => true,
                'distance' => [
                    'meters' => round($distance, 2),
                    'kilometers' => round($distance / 1000, 2)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error calculando distancia', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al calcular distancia'
            ], 500);
        }
    }

    /**
     * Obtiene la ruta entre dos puntos usando Mapbox Directions API
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getRoute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from.longitude' => 'required|numeric|between:-180,180',
            'from.latitude' => 'required|numeric|between:-90,90',
            'to.longitude' => 'required|numeric|between:-180,180',
            'to.latitude' => 'required|numeric|between:-90,90',
            'profile' => 'nullable|in:driving,walking,cycling'
        ]);

        try {
            $from = $validated['from'];
            $to = $validated['to'];
            $profile = $validated['profile'] ?? 'driving';
            $token = $this->getMapboxToken();

            $coordinates = "{$from['longitude']},{$from['latitude']};{$to['longitude']},{$to['latitude']}";
            $url = "https://api.mapbox.com/directions/v5/mapbox/{$profile}/{$coordinates}";

            $response = Http::get($url, [
                'access_token' => $token,
                'geometries' => 'geojson',
                'overview' => 'full'
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al obtener la ruta'
                ], 500);
            }

            $data = $response->json();

            if (empty($data['routes'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró una ruta'
                ], 404);
            }

            $route = $data['routes'][0];

            return response()->json([
                'success' => true,
                'route' => [
                    'distance' => [
                        'meters' => $route['distance'],
                        'kilometers' => round($route['distance'] / 1000, 2)
                    ],
                    'duration' => [
                        'seconds' => $route['duration'],
                        'minutes' => round($route['duration'] / 60, 2)
                    ],
                    'geometry' => $route['geometry']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo ruta', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al calcular la ruta'
            ], 500);
        }
    }
}