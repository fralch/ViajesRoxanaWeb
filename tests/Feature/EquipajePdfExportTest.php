<?php

namespace Tests\Feature;

use App\Models\Equipaje;
use App\Models\Hijo;
use App\Models\User;
use Tests\TestCase;

class EquipajePdfExportTest extends TestCase
{

    public function test_pdf_export_returns_successful_response()
    {
        // Usar usuario existente de los seeders
        $user = User::where('email', 'test@example.com')->first();

        if (!$user) {
            // Crear usuario si no existe
            $user = User::factory()->create([
                'email' => 'test@example.com',
                'name' => 'Test User'
            ]);
        }

        // Crear hijo para el usuario
        $hijo = Hijo::create([
            'user_id' => $user->id,
            'nombres' => 'Test Hijo',
            'doc_tipo' => 'CC',
            'doc_numero' => '1234567890',
            'password_hijo' => bcrypt('password'),
            'nums_emergencia' => ['3101234567'],
            'fecha_nacimiento' => '2010-01-01',
        ]);

        // Crear equipaje para el hijo
        Equipaje::create([
            'hijo_id' => $hijo->id,
            'tip_maleta' => 'Maleta de 23 kg',
            'num_etiqueta' => 'ABC123',
            'color' => 'Azul',
            'caracteristicas' => 'Maleta grande',
            'peso' => 15.5,
            'lugar_regis' => 'Bogotá',
        ]);

        // Hacer la petición como usuario autenticado
        $response = $this->actingAs($user)
                        ->get('/equipaje/export-pdf');

        // Verificar que la respuesta es exitosa
        $response->assertStatus(200);

        // Verificar que el contenido es un PDF
        $response->assertHeader('Content-Type', 'application/pdf');
    }
}