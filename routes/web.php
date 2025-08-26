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
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;

Route::get('/', function () {
    $user = auth()->user();
    $userData = null;
    
    if ($user) {
        $userData = $user->load('hijos');
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
    Route::resource('paquetes', PaqueteController::class);
    Route::resource('grupos', GrupoController::class);
    Route::resource('inscripciones', InscripcionController::class)->parameters(['inscripciones' => 'inscripcion']);
    Route::resource('recorrido-paquetes', RecorridoPaqueteController::class);
    Route::resource('geolocalizacion', GeolocalizacionController::class);
    Route::resource('trazabilidad', TrazabilidadController::class);
    Route::resource('notificaciones', NotificacionController::class)->parameters(['notificaciones' => 'notificacion']);

    // Rutas para perfil del hijo
    Route::get('/perfil/hijo/{hijo}', [PerfilHijoController::class, 'show'])->name('perfil.hijo');
    Route::post('/perfil/hijo/{hijo}/update', [PerfilHijoController::class, 'update'])->name('perfil.hijo.update');
    
    // Rutas API para Mapbox
    Route::prefix('api/mapbox')->group(function () {
        Route::get('/token', [App\Http\Controllers\MapboxController::class, 'getMapboxToken'])->name('mapbox.token');
        Route::post('/reverse-geocode', [App\Http\Controllers\MapboxController::class, 'reverseGeocode'])->name('mapbox.reverse-geocode');
        Route::post('/search-places', [App\Http\Controllers\MapboxController::class, 'searchPlaces'])->name('mapbox.search-places');
        Route::post('/calculate-distance', [App\Http\Controllers\MapboxController::class, 'calculateDistance'])->name('mapbox.calculate-distance');
        Route::post('/get-route', [App\Http\Controllers\MapboxController::class, 'getRoute'])->name('mapbox.get-route');
    });
    
    // Rutas API para ubicación de hijos
    Route::prefix('api/hijo-location')->group(function () {
        Route::get('/{hijo}/last', [App\Http\Controllers\HijoLocationController::class, 'getLastLocation'])->name('hijo.location.last');
        Route::get('/{hijo}/history', [App\Http\Controllers\HijoLocationController::class, 'getLocationHistory'])->name('hijo.location.history');
        Route::get('/{hijo}/stats', [App\Http\Controllers\HijoLocationController::class, 'getLocationStats'])->name('hijo.location.stats');
        Route::post('/{hijo}/simulate', [App\Http\Controllers\HijoLocationController::class, 'simulateLocationUpdate'])->name('hijo.location.simulate');
    });

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
