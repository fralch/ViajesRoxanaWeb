<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\HijoController;
use App\Http\Controllers\PaqueteController;
use App\Http\Controllers\GrupoController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\RecorridoPaqueteController;
use App\Http\Controllers\GeolocalizacionController;
use App\Http\Controllers\TrazabilidadController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\PerfilHijoController;
use App\Http\Controllers\SendMessageController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Services\WhatsAppService;

Route::get('/', function () {
    $user = auth()->user();
    $userData = null;
    
    if ($user) {
        $userData = $user->load(['hijos.inscripciones.grupo.paquete']);
    }
    
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'user_with_children' => $userData,
    ]);
});

// Ruta pública para formulario de inscripción
Route::get('/paquete/{paquete}/grupo/{grupo}/form', [InscripcionController::class, 'showForm'])->name('inscripcion.form');
Route::post('/paquete/{paquete}/grupo/{grupo}/form', [InscripcionController::class, 'storeForm'])->name('inscripcion.store');

// Ruta para verificar si existe un usuario
Route::post('/check-user-exists', [InscripcionController::class, 'checkUserExists'])->name('check.user.exists');

// Ruta pública para pre-confirmación de trazabilidad por DNI (NFC)
Route::get('/nfc/{dni_hijo}', [TrazabilidadController::class, 'preConfirmacionTrazabilidad'])
    ->name('trazabilidad.preconfirmacion')
    ->where('dni_hijo', '[0-9]+');

// Ruta pública para confirmación final de trazabilidad por DNI (NFC)
Route::get('/nfc/{dni_hijo}/confirmar', [TrazabilidadController::class, 'confirmacionTrazabilidad'])
    ->name('trazabilidad.confirmacion')
    ->where('dni_hijo', '[0-9]+');

// Ruta de prueba para WhatsApp
Route::get('/probarwhatsapp/{numero}', function ($numero) {
    $resultado = WhatsAppService::enviarMensajeTrazabilidad($numero, "🧪 Mensaje de prueba de WhatsApp\n\nEste es un mensaje de prueba para verificar que el servicio de WhatsApp está funcionando correctamente.\n\n✅ Si recibiste este mensaje, el servicio está operativo.");
    
    if ($resultado) {
        return response()->json([
            'success' => true,
            'message' => 'Mensaje de WhatsApp enviado exitosamente al número: ' . $numero,
            'timestamp' => now()
        ]);
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Error al enviar el mensaje de WhatsApp al número: ' . $numero,
            'timestamp' => now()
        ], 500);
    }
})->where('numero', '[0-9]+');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('hijos', HijoController::class);
    Route::delete('/hijos/parent/{user}', [HijoController::class, 'destroyParent'])->name('hijos.destroy-parent');
    Route::resource('paquetes', PaqueteController::class);
    Route::resource('grupos', GrupoController::class);
    Route::resource('inscripciones', InscripcionController::class)->parameters(['inscripciones' => 'inscripcion']);
    Route::patch('recorrido-paquetes/update-order', [RecorridoPaqueteController::class, 'updateOrder'])->name('recorrido-paquetes.update-order');
    Route::resource('recorrido-paquetes', RecorridoPaqueteController::class);
    Route::resource('geolocalizacion', GeolocalizacionController::class);
    Route::get('geolocalizacion/{grupo}/history', [GeolocalizacionController::class, 'getGroupHistory'])->name('geolocalizacion.group.history');
    
    Route::resource('trazabilidad', TrazabilidadController::class);
    
    // Rutas específicas para interfaces móviles de trazabilidad
    Route::get('trazabilidad/mensaje/{grupo}', [TrazabilidadController::class, 'mensaje'])->name('trazabilidad.mensaje');
    Route::post('trazabilidad/mensaje/{grupo}', [TrazabilidadController::class, 'guardarMensaje'])->name('trazabilidad.guardar-mensaje');
    Route::get('trazabilidad/scanner/{grupo}', [TrazabilidadController::class, 'scanner'])->name('trazabilidad.scanner');
    Route::post('trazabilidad/procesar-escaneo', [TrazabilidadController::class, 'procesarEscaneo'])->name('trazabilidad.procesar-escaneo');
    Route::get('trazabilidad/{grupo}/hijos', [TrazabilidadController::class, 'obtenerHijosGrupo'])->name('trazabilidad.hijos-grupo');
    
    Route::resource('notificaciones', NotificacionController::class)->parameters(['notificaciones' => 'notificacion']);

    // Rutas para envío masivo de mensajes
    Route::get('/send-message/bulk', [SendMessageController::class, 'bulkMessage'])->name('send-message.bulk');
    Route::post('/send-message/bulk/send', [SendMessageController::class, 'sendBulkMessage'])->name('send-message.bulk.send');
    Route::post('/send-message/bulk/users-by-groups', [SendMessageController::class, 'getUsersByGroups'])->name('send-message.bulk.users-by-groups');

    // Rutas para perfil del hijo
    Route::get('/perfil/hijo/{hijo}', [PerfilHijoController::class, 'show'])->name('perfil.hijo');
    Route::post('/perfil/hijo/{hijo}/update', [PerfilHijoController::class, 'update'])->name('perfil.hijo.update');

    // Rutas para ficha de salud usando PerfilHijoController
    Route::post('/perfil/hijo/{hijo}/salud', [PerfilHijoController::class, 'storeSaludFicha'])->name('salud.ficha.store');
    Route::put('/perfil/hijo/{hijo}/salud', [PerfilHijoController::class, 'updateSaludFicha'])->name('salud.ficha.update');
    Route::delete('/perfil/hijo/{hijo}/salud', [PerfilHijoController::class, 'destroySaludFicha'])->name('salud.ficha.destroy');

    // Rutas para ficha nutricional usando PerfilHijoController
    Route::post('/perfil/hijo/{hijo}/nutricion', [PerfilHijoController::class, 'storeNutricionFicha'])->name('nutricion.ficha.store');
    Route::put('/perfil/hijo/{hijo}/nutricion', [PerfilHijoController::class, 'updateNutricionFicha'])->name('nutricion.ficha.update');
    Route::delete('/perfil/hijo/{hijo}/nutricion', [PerfilHijoController::class, 'destroyNutricionFicha'])->name('nutricion.ficha.destroy');
    
    // Rutas API para Mapbox - COMENTADAS TEMPORALMENTE (MapboxController no existe)
    /*
    Route::prefix('api/mapbox')->group(function () {
        Route::get('/token', [App\Http\Controllers\MapboxController::class, 'getMapboxToken'])->name('mapbox.token');
        Route::post('/reverse-geocode', [App\Http\Controllers\MapboxController::class, 'reverseGeocode'])->name('mapbox.reverse-geocode');
        Route::post('/search-places', [App\Http\Controllers\MapboxController::class, 'searchPlaces'])->name('mapbox.search-places');
        Route::post('/calculate-distance', [App\Http\Controllers\MapboxController::class, 'calculateDistance'])->name('mapbox.calculate-distance');
        Route::post('/get-route', [App\Http\Controllers\MapboxController::class, 'getRoute'])->name('mapbox.get-route');
    });
    */
    
    // Rutas API para ubicación de hijos
    Route::prefix('api/hijo-location')->group(function () {
        Route::get('/{hijo:id}/last', [App\Http\Controllers\HijoLocationController::class, 'getLastLocation'])->name('hijo.location.last');
        Route::get('/{hijo:id}/history', [App\Http\Controllers\HijoLocationController::class, 'getLocationHistory'])->name('hijo.location.history');
        Route::get('/{hijo:id}/stats', [App\Http\Controllers\HijoLocationController::class, 'getLocationStats'])->name('hijo.location.stats');
        Route::post('/{hijo:id}/simulate', [App\Http\Controllers\HijoLocationController::class, 'simulateLocationUpdate'])->name('hijo.location.simulate');
    });

    // Rutas web para ubicación de hijos (para componentes frontend)
    Route::get('/hijo-location/{hijo:id}/last', [App\Http\Controllers\HijoLocationController::class, 'getLastLocation'])->name('web.hijo.location.last');
    Route::get('/hijo-location/{hijo:id}/history', [App\Http\Controllers\HijoLocationController::class, 'getLocationHistory'])->name('web.hijo.location.history');
    Route::get('/hijo-location/{hijo:id}/stats', [App\Http\Controllers\HijoLocationController::class, 'getLocationStats'])->name('web.hijo.location.stats');
    Route::post('/hijo-location/{hijo:id}/simulate', [App\Http\Controllers\HijoLocationController::class, 'simulateLocationUpdate'])->name('web.hijo.location.simulate');

    Route::get('/api/hijos/by-dni/{dni}', [HijoController::class, 'getHijoByDni']);

    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
