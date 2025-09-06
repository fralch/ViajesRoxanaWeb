<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HijoController;
use App\Http\Controllers\Api\GeolocalizacionController;
use App\Http\Controllers\Api\TrazabilidadController;

Route::prefix('v1')->group(function () {
    // Authentication routes (no auth required)
    Route::post('/endpoint/login', [AuthController::class, 'login']);

    // Protected routes (require authentication) - using web guard for testing
    Route::middleware('auth:web')->group(function () {
        // Auth user info and logout
        Route::get('/endpoint/user', function (Request $request) {
            return $request->user()->load(['hijos.inscripciones.grupo.paquete']);
        });
        Route::post('/endpoint/logout', [AuthController::class, 'logout']);

        // Children (hijos) management
        Route::apiResource('endpoint/hijos', HijoController::class)->names([
            'index' => 'api.endpoint.hijos.index',
            'store' => 'api.endpoint.hijos.store',
            'show' => 'api.endpoint.hijos.show',
            'update' => 'api.endpoint.hijos.update',
            'destroy' => 'api.endpoint.hijos.destroy'
        ]);
        Route::delete('/endpoint/hijos/{user}', [HijoController::class, 'destroyParent']);
        Route::get('/endpoint/hijos/by-dni/{dni}', [HijoController::class, 'getHijoByDni']);



        // Geolocation
        Route::apiResource('endpoint/geolocalizacion', GeolocalizacionController::class)->names([
            'index' => 'api.endpoint.geolocalizacion.index',
            'store' => 'api.endpoint.geolocalizacion.store',
            'show' => 'api.endpoint.geolocalizacion.show',
            'update' => 'api.endpoint.geolocalizacion.update',
            'destroy' => 'api.endpoint.geolocalizacion.destroy'
        ]);
        Route::get('/endpoint/geolocalizacion/{grupo}/history', [GeolocalizacionController::class, 'getGroupHistory']);

        // Tracking (Trazabilidad)
        Route::apiResource('endpoint/trazabilidad', TrazabilidadController::class)->names([
            'index' => 'api.endpoint.trazabilidad.index',
            'store' => 'api.endpoint.trazabilidad.store',
            'show' => 'api.endpoint.trazabilidad.show',
            'update' => 'api.endpoint.trazabilidad.update',
            'destroy' => 'api.endpoint.trazabilidad.destroy'
        ]);

        Route::post('/endpoint/trazabilidad/mensaje/{grupo}', [TrazabilidadController::class, 'guardarMensaje']);



        // Child location tracking
        Route::prefix('endpoint/hijo-location')->group(function () {
            Route::get('/{hijo}/last', [\App\Http\Controllers\HijoLocationController::class, 'getLastLocation']);
            Route::get('/{hijo}/history', [\App\Http\Controllers\HijoLocationController::class, 'getLocationHistory']);
            Route::get('/{hijo}/stats', [\App\Http\Controllers\HijoLocationController::class, 'getLocationStats']);
            Route::post('/{hijo}/simulate', [\App\Http\Controllers\HijoLocationController::class, 'simulateLocationUpdate']);
        });


    });
});