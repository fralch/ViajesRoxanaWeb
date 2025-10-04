<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Hijo;
use App\Models\User;
use App\Models\Grupo;
use App\Models\Inscripcion;
use App\Models\Paquete;

// Crear usuarios de prueba
$user1 = User::firstOrCreate(
    ['email' => 'padre1@test.com'],
    [
        'name' => 'Padre Test 1',
        'phone' => '123456789',
        'password' => bcrypt('password')
    ]
);

$user2 = User::firstOrCreate(
    ['email' => 'padre2@test.com'],
    [
        'name' => 'Padre Test 2', 
        'phone' => '987654321',
        'password' => bcrypt('password')
    ]
);

// Crear hijos de prueba
$hijo1 = Hijo::firstOrCreate(
    ['doc_numero' => '12345678'],
    [
        'nombres' => 'Juan Test',
        'apellidos' => 'Prueba',
        'doc_tipo' => 'DNI',
        'fecha_nacimiento' => '2010-01-01',
        'ver_fichas' => true,
        'user_id' => $user1->id
    ]
);

$hijo2 = Hijo::firstOrCreate(
    ['doc_numero' => '87654321'],
    [
        'nombres' => 'Maria Test',
        'apellidos' => 'Prueba',
        'doc_tipo' => 'DNI',
        'fecha_nacimiento' => '2011-01-01',
        'ver_fichas' => false,
        'user_id' => $user2->id
    ]
);

// Crear paquete de prueba
$paquete = Paquete::firstOrCreate(
    ['nombre' => 'Paquete Test'],
    [
        'destino' => 'Destino Test',
        'descripcion' => 'Paquete para pruebas',
        'activo' => true
    ]
);

// Crear grupo de prueba
$grupo = Grupo::firstOrCreate(
    ['nombre' => 'Grupo Test'],
    [
        'paquete_id' => $paquete->id,
        'descripcion' => 'Grupo para pruebas',
        'fecha_inicio' => now(),
        'fecha_fin' => now()->addDays(7),
        'activo' => true
    ]
);

// Crear inscripciones
Inscripcion::firstOrCreate([
    'hijo_id' => $hijo1->id,
    'grupo_id' => $grupo->id,
    'paquete_id' => $paquete->id,
    'usuario_id' => $user1->id
]);

Inscripcion::firstOrCreate([
    'hijo_id' => $hijo2->id,
    'grupo_id' => $grupo->id,
    'paquete_id' => $paquete->id,
    'usuario_id' => $user2->id
]);

echo "Datos de prueba creados:\n";
echo "- Hijo 1: {$hijo1->nombres} {$hijo1->apellidos} (DNI: {$hijo1->doc_numero}) - ver_fichas: " . ($hijo1->ver_fichas ? 'true' : 'false') . "\n";
echo "- Hijo 2: {$hijo2->nombres} {$hijo2->apellidos} (DNI: {$hijo2->doc_numero}) - ver_fichas: " . ($hijo2->ver_fichas ? 'true' : 'false') . "\n";
echo "- Grupo: {$grupo->nombre}\n";
echo "- URLs de prueba:\n";
echo "  - Preconfirmación hijo 1: http://localhost:5173/nfc/{$hijo1->doc_numero}/preconfirmacion\n";
echo "  - Preconfirmación hijo 2: http://localhost:5173/nfc/{$hijo2->doc_numero}/preconfirmacion\n";
echo "  - Fichas hijo 1: http://localhost:5173/nfc/{$hijo1->doc_numero}/fichas\n";
echo "  - Fichas hijo 2: http://localhost:5173/nfc/{$hijo2->doc_numero}/fichas\n";