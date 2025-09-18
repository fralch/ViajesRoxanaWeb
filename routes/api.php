<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HijoController;
use App\Http\Controllers\Api\GeolocalizacionController;
use App\Http\Controllers\Api\TrazabilidadController;
use App\Http\Controllers\Api\HijoLocationController;
use App\Http\Controllers\Api\NotificacionController;

Route::prefix('v1')->group(function () {
    // Authentication routes (no auth required)
    Route::post('/endpoint/login', [AuthController::class, 'login']);
    Route::post('/endpoint/hijo-login', [AuthController::class, 'hijoLogin']);

    // Simplified routes (no authentication required, read-only)
    
    // Children (hijos) - only read operations
    Route::get('/endpoint/hijos', [HijoController::class, 'index']);
    Route::get('/endpoint/hijos/{hijo}', [HijoController::class, 'show']);
    Route::get('/endpoint/hijos/by-dni/{dni}', [HijoController::class, 'getHijoByDni']);

    // Geolocation operations
    Route::get('/endpoint/geolocalizacion', [GeolocalizacionController::class, 'index']);
    Route::post('/endpoint/geolocalizacion', [GeolocalizacionController::class, 'store']);
    Route::get('/endpoint/geolocalizacion/{geolocalizacion}', [GeolocalizacionController::class, 'show']);
    Route::get('/endpoint/geolocalizacion/{grupo}/history', [GeolocalizacionController::class, 'getGroupHistory']);
    Route::get('/endpoint/geolocalizacion/hijo/location', [GeolocalizacionController::class, 'getLocationByHijo']);
    Route::get('/endpoint/geolocalizacion/hijo/history', [GeolocalizacionController::class, 'getLocationHistory']);

    // Tracking (Trazabilidad) - only read operations
    Route::get('/endpoint/trazabilidad', [TrazabilidadController::class, 'index']);
    Route::get('/endpoint/trazabilidad/{trazabilidad}', [TrazabilidadController::class, 'show']);

    // Child location tracking - only read operations
    Route::get('/endpoint/hijo-location/{hijo}/last', [HijoLocationController::class, 'getLastLocation']);
    Route::get('/endpoint/hijo-location/{hijo}/history', [HijoLocationController::class, 'getLocationHistory']);
    Route::get('/endpoint/hijo-location/{hijo}/stats', [HijoLocationController::class, 'getLocationStats']);

       Route::get('/endpoint/user/notificaciones/{dni}', [NotificacionController::class, 'index']);
});

