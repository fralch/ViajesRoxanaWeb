<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HijoController;
use App\Http\Controllers\Api\PaqueteController;
use App\Http\Controllers\Api\GrupoController;
use App\Http\Controllers\Api\InscripcionController;
use App\Http\Controllers\Api\GeolocalizacionController;
use App\Http\Controllers\Api\TrazabilidadController;
use App\Http\Controllers\Api\NotificacionController;

Route::prefix('v1')->group(function () {
    // Authentication routes (no auth required)
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // Public routes
    Route::get('/paquetes', [PaqueteController::class, 'index']);
    Route::get('/paquetes/{paquete}', [PaqueteController::class, 'show']);
    Route::get('/paquetes/{paquete}/grupos', [GrupoController::class, 'getByPaquete']);
    
    // Public inscription form routes
    Route::post('/paquete/{paquete}/grupo/{grupo}/inscripcion', [InscripcionController::class, 'store']);
    Route::post('/check-user-exists', [InscripcionController::class, 'checkUserExists']);
    
    // Public NFC route for tracking confirmation
    Route::get('/nfc/{dni_hijo}', [TrazabilidadController::class, 'confirmacionTrazabilidad'])
        ->where('dni_hijo', '[0-9]+');
    
    // Protected routes (require authentication) - using web guard for testing
    Route::middleware('auth:web')->group(function () {
        // Auth user info and logout
        Route::get('/user', function (Request $request) {
            return $request->user()->load(['hijos.inscripciones.grupo.paquete']);
        });
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Children (hijos) management
        Route::apiResource('hijos', HijoController::class);
        Route::delete('/hijos/parent/{user}', [HijoController::class, 'destroyParent']);
        Route::get('/hijos/by-dni/{dni}', [HijoController::class, 'getHijoByDni']);
        
        // Packages and groups management
        Route::apiResource('paquetes', PaqueteController::class)->except(['index', 'show']);
        Route::apiResource('grupos', GrupoController::class);
        
        // Inscriptions management
        Route::apiResource('inscripciones', InscripcionController::class);
        
        // Geolocation
        Route::apiResource('geolocalizacion', GeolocalizacionController::class);
        Route::get('/geolocalizacion/{grupo}/history', [GeolocalizacionController::class, 'getGroupHistory']);
        
        // Tracking (Trazabilidad)
        Route::apiResource('trazabilidad', TrazabilidadController::class);
        Route::get('/trazabilidad/{grupo}/hijos', [TrazabilidadController::class, 'obtenerHijosGrupo']);
        Route::post('/trazabilidad/procesar-escaneo', [TrazabilidadController::class, 'procesarEscaneo']);
        Route::post('/trazabilidad/mensaje/{grupo}', [TrazabilidadController::class, 'guardarMensaje']);
        
        // Notifications
        Route::apiResource('notificaciones', NotificacionController::class);
        
        // Child location tracking
        Route::prefix('hijo-location')->group(function () {
            Route::get('/{hijo}/last', [\App\Http\Controllers\HijoLocationController::class, 'getLastLocation']);
            Route::get('/{hijo}/history', [\App\Http\Controllers\HijoLocationController::class, 'getLocationHistory']);
            Route::get('/{hijo}/stats', [\App\Http\Controllers\HijoLocationController::class, 'getLocationStats']);
            Route::post('/{hijo}/simulate', [\App\Http\Controllers\HijoLocationController::class, 'simulateLocationUpdate']);
        });
        
        // Mapbox integration
        Route::prefix('mapbox')->group(function () {
            Route::get('/token', [\App\Http\Controllers\MapboxController::class, 'getMapboxToken']);
            Route::post('/reverse-geocode', [\App\Http\Controllers\MapboxController::class, 'reverseGeocode']);
            Route::post('/search-places', [\App\Http\Controllers\MapboxController::class, 'searchPlaces']);
            Route::post('/calculate-distance', [\App\Http\Controllers\MapboxController::class, 'calculateDistance']);
            Route::post('/get-route', [\App\Http\Controllers\MapboxController::class, 'getRoute']);
        });
    });
});