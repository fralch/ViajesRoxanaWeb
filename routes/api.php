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
    Route::post('/endpoint-login', [AuthController::class, 'login']);
    Route::post('/endpoint-register', [AuthController::class, 'register']);
    Route::post('/endpoint-forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/endpoint-reset-password', [AuthController::class, 'resetPassword']);
    
    // Public routes
    Route::get('/endpoint-paquetes', [PaqueteController::class, 'index']);
    Route::get('/endpoint-paquetes/{paquete}', [PaqueteController::class, 'show']);
    Route::get('/endpoint-paquetes/{paquete}/grupos', [GrupoController::class, 'getByPaquete']);
    
    // Public inscription form routes
    Route::post('/endpoint-paquete/{paquete}/grupo/{grupo}/inscripcion', [InscripcionController::class, 'store']);
    Route::post('/endpoint-check-user-exists', [InscripcionController::class, 'checkUserExists']);
    
    // Public NFC route for tracking confirmation
    Route::get('/endpoint-nfc/{dni_hijo}', [TrazabilidadController::class, 'confirmacionTrazabilidad'])
        ->where('dni_hijo', '[0-9]+');
    
    // Protected routes (require authentication) - using web guard for testing
    Route::middleware('auth:web')->group(function () {
        // Auth user info and logout
        Route::get('/endpoint-user', function (Request $request) {
            return $request->user()->load(['hijos.inscripciones.grupo.paquete']);
        });
        Route::post('/endpoint-logout', [AuthController::class, 'logout']);
        
        // Children (hijos) management
        Route::apiResource('endpoint-hijos', HijoController::class)->names([
            'index' => 'api.endpoint-hijos.index',
            'store' => 'api.endpoint-hijos.store',
            'show' => 'api.endpoint-hijos.show',
            'update' => 'api.endpoint-hijos.update',
            'destroy' => 'api.endpoint-hijos.destroy'
        ]);
        Route::delete('/endpoint-hijos/{user}', [HijoController::class, 'destroyParent']);
        Route::get('/endpoint-hijos/by-dni/{dni}', [HijoController::class, 'getHijoByDni']);
        
        // Packages and groups management
        Route::apiResource('endpoint-paquetes', PaqueteController::class)->except(['index', 'show'])->names([
            'store' => 'api.endpoint-paquetes.store',
            'show' => 'api.endpoint-paquetes.show',
            'update' => 'api.endpoint-paquetes.update',
            'destroy' => 'api.endpoint-paquetes.destroy'
        ]);
        Route::apiResource('endpoint-grupos', GrupoController::class)->names([
            'index' => 'api.endpoint-grupos.index',
            'store' => 'api.endpoint-grupos.store',
            'show' => 'api.endpoint-grupos.show',
            'update' => 'api.endpoint-grupos.update',
            'destroy' => 'api.endpoint-grupos.destroy'
        ]);
        
        // Inscriptions management
        Route::apiResource('endpoint-inscripciones', InscripcionController::class)->names([
            'index' => 'api.endpoint-inscripciones.index',
            'store' => 'api.endpoint-inscripciones.store',
            'show' => 'api.endpoint-inscripciones.show',
            'update' => 'api.endpoint-inscripciones.update',
            'destroy' => 'api.endpoint-inscripciones.destroy'
        ]);
        
        // Geolocation
        Route::apiResource('endpoint-geolocalizacion', GeolocalizacionController::class)->names([
            'index' => 'api.endpoint-geolocalizacion.index',
            'store' => 'api.endpoint-geolocalizacion.store',
            'show' => 'api.endpoint-geolocalizacion.show',
            'update' => 'api.endpoint-geolocalizacion.update',
            'destroy' => 'api.endpoint-geolocalizacion.destroy'
        ]);
        Route::get('/endpoint-geolocalizacion/{grupo}/history', [GeolocalizacionController::class, 'getGroupHistory']);
        
        // Tracking (Trazabilidad)
        Route::apiResource('endpoint-trazabilidad', TrazabilidadController::class)->names([
            'index' => 'api.endpoint-trazabilidad.index',
            'store' => 'api.endpoint-trazabilidad.store',
            'show' => 'api.endpoint-trazabilidad.show',
            'update' => 'api.endpoint-trazabilidad.update',
            'destroy' => 'api.endpoint-trazabilidad.destroy'
        ]);
        Route::get('/endpoint-trazabilidad/{grupo}/hijos', [TrazabilidadController::class, 'obtenerHijosGrupo']);
        Route::post('/endpoint-trazabilidad/procesar-escaneo', [TrazabilidadController::class, 'procesarEscaneo']);
        Route::post('/endpoint-trazabilidad/mensaje/{grupo}', [TrazabilidadController::class, 'guardarMensaje']);
        
        // Notifications
        Route::apiResource('endpoint-notificaciones', NotificacionController::class)->names([
            'index' => 'api.endpoint-notificaciones.index',
            'store' => 'api.endpoint-notificaciones.store',
            'show' => 'api.endpoint-notificaciones.show',
            'update' => 'api.endpoint-notificaciones.update',
            'destroy' => 'api.endpoint-notificaciones.destroy'
        ]);
        
        // Child location tracking
        Route::prefix('endpoint-hijo-location')->group(function () {
            Route::get('/{hijo}/last', [\App\Http\Controllers\HijoLocationController::class, 'getLastLocation']);
            Route::get('/{hijo}/history', [\App\Http\Controllers\HijoLocationController::class, 'getLocationHistory']);
            Route::get('/{hijo}/stats', [\App\Http\Controllers\HijoLocationController::class, 'getLocationStats']);
            Route::post('/{hijo}/simulate', [\App\Http\Controllers\HijoLocationController::class, 'simulateLocationUpdate']);
        });
        
        // Mapbox integration
        Route::prefix('endpoint-mapbox')->group(function () {
            Route::get('/token', [\App\Http\Controllers\MapboxController::class, 'getMapboxToken']);
            Route::post('/reverse-geocode', [\App\Http\Controllers\MapboxController::class, 'reverseGeocode']);
            Route::post('/search-places', [\App\Http\Controllers\MapboxController::class, 'searchPlaces']);
            Route::post('/calculate-distance', [\App\Http\Controllers\MapboxController::class, 'calculateDistance']);
            Route::post('/get-route', [\App\Http\Controllers\MapboxController::class, 'getRoute']);
        });
    });
});