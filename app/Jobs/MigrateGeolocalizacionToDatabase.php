<?php

namespace App\Jobs;

use App\Models\Geolocalizacion;
use App\Services\GeolocalizacionRedisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MigrateGeolocalizacionToDatabase implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        //
    }

    public function handle(GeolocalizacionRedisService $redisService): void
    {
        Log::info('Starting geolocation data migration from Redis to MySQL at 3am Peru time');

        $startTime = microtime(true);
        $migratedCount = 0;
        $errorCount = 0;

        try {
            // Get all active locations from Redis
            $activeLocations = $redisService->getAllActiveLocations();

            foreach ($activeLocations as $hijoId => $locationData) {
                try {
                    // Create a permanent record in the database
                    $geolocalizacion = Geolocalizacion::create([
                        'paquete_id' => $locationData['paquete_id'],
                        'hijo_id' => $locationData['hijo_id'],
                        'latitud' => $locationData['latitud'],
                        'longitud' => $locationData['longitud'],
                        'created_at' => Carbon::parse($locationData['timestamp']),
                        'updated_at' => Carbon::now('America/Lima')
                    ]);

                    // Clean up old records for this hijo (keep only last 50 for history)
                    $this->cleanupOldRecords($locationData['hijo_id']);

                    $migratedCount++;

                    Log::debug("Migrated location for hijo_id: {$hijoId}", [
                        'geolocalizacion_id' => $geolocalizacion->id,
                        'timestamp' => $locationData['timestamp']
                    ]);

                } catch (\Exception $e) {
                    $errorCount++;
                    Log::error("Failed to migrate location for hijo_id: {$hijoId}", [
                        'error' => $e->getMessage(),
                        'location_data' => $locationData
                    ]);
                }
            }

            $executionTime = round(microtime(true) - $startTime, 2);

            Log::info('Geolocation migration completed', [
                'migrated_count' => $migratedCount,
                'error_count' => $errorCount,
                'execution_time_seconds' => $executionTime,
                'total_locations_processed' => count($activeLocations)
            ]);

        } catch (\Exception $e) {
            Log::error('Geolocation migration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    private function cleanupOldRecords(int $hijoId): void
    {
        $recordsToKeep = 30; // Keep last 30 records for historical purposes (1 week at 1 per day)

        // Only cleanup if we have more than 35 records to avoid running this too often
        $totalRecords = Geolocalizacion::where('hijo_id', $hijoId)->count();

        if ($totalRecords > 35) {
            $recordsDeleted = Geolocalizacion::where('hijo_id', $hijoId)
                ->whereNotIn('id', function($query) use ($hijoId, $recordsToKeep) {
                    $query->select('id')
                        ->from('geolocalizacion')
                        ->where('hijo_id', $hijoId)
                        ->orderBy('created_at', 'desc')
                        ->limit($recordsToKeep);
                })
                ->delete();

            if ($recordsDeleted > 0) {
                Log::debug("Cleaned up {$recordsDeleted} old records for hijo_id: {$hijoId} (kept {$recordsToKeep})");
            }
        }
    }
}