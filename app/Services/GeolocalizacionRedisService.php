<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;

class GeolocalizacionRedisService
{
    private const TTL_SECONDS = 600; // 10 minutes
    private const KEY_PREFIX = 'location:hijo:';

    public function storeLocation(int $hijoId, float $latitud, float $longitud, int $paqueteId): array
    {
        $locationData = [
            'hijo_id' => $hijoId,
            'paquete_id' => $paqueteId,
            'latitud' => $latitud,
            'longitud' => $longitud,
            'timestamp' => Carbon::now('America/Lima')->toISOString(),
            'unix_timestamp' => time()
        ];

        $key = self::KEY_PREFIX . $hijoId;

        // Store with TTL of 10 minutes
        Redis::setex($key, self::TTL_SECONDS, json_encode($locationData));

        return $locationData;
    }

    public function getLocation(int $hijoId): ?array
    {
        $key = self::KEY_PREFIX . $hijoId;
        $data = Redis::get($key);

        if (!$data) {
            return null;
        }

        $locationData = json_decode($data, true);

        // Add real-time info
        $timestamp = Carbon::parse($locationData['timestamp']);
        $minutesAgo = $timestamp->diffInMinutes(Carbon::now('America/Lima'));

        $locationData['is_recent'] = $minutesAgo <= 5;
        $locationData['minutes_ago'] = $minutesAgo;
        $locationData['last_update'] = $locationData['timestamp'];

        return $locationData;
    }

    public function getAllActiveLocations(): array
    {
        $pattern = self::KEY_PREFIX . '*';
        $keys = Redis::keys($pattern);
        $locations = [];

        foreach ($keys as $key) {
            $data = Redis::get($key);
            if ($data) {
                $hijoId = str_replace(self::KEY_PREFIX, '', $key);
                $locations[$hijoId] = json_decode($data, true);
            }
        }

        return $locations;
    }

    public function deleteLocation(int $hijoId): bool
    {
        $key = self::KEY_PREFIX . $hijoId;
        return Redis::del($key) > 0;
    }

    public function getLocationsByDocNumber(string $docNumber): ?array
    {
        // This requires a lookup in the database to get hijo_id first
        $hijo = \App\Models\Hijo::where('doc_numero', $docNumber)->first();

        if (!$hijo) {
            return null;
        }

        $locationData = $this->getLocation($hijo->id);
        
        if ($locationData) {
            // Add hijo data to the response
            $locationData['hijo'] = [
                'nombres' => $hijo->nombres,
                'doc_tipo' => $hijo->doc_tipo,
                'doc_numero' => $hijo->doc_numero
            ];
        }

        return $locationData;
    }
}