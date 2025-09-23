<?php

namespace Tests\Feature;

use App\Models\Equipaje;
use App\Models\Hijo;
use App\Models\User;
use Tests\TestCase;

class EquipajePdfExportWithHijoTest extends TestCase
{
    public function test_pdf_export_with_specific_hijo_returns_successful_response()
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
            'nombres' => 'Test Hijo PDF',
            'doc_tipo' => 'CC',
            'doc_numero' => '9876543210',
            'password_hijo' => bcrypt('password'),
            'nums_emergencia' => ['3109876543'],
            'fecha_nacimiento' => '2010-01-01',
        ]);

        // Crear equipaje para el hijo
        Equipaje::create([
            'hijo_id' => $hijo->id,
            'tip_maleta' => 'Maleta de 23 kg',
            'num_etiqueta' => 'XYZ789',
            'color' => 'Rojo',
            'caracteristicas' => 'Maleta con ruedas',
            'peso' => 20.0,
            'lugar_regis' => 'Medellín',
        ]);

        // Hacer la petición con parámetro hijo específico
        $response = $this->actingAs($user)
                        ->get('/equipaje/export-pdf?hijo=' . $hijo->doc_numero);

        // Verificar que la respuesta es exitosa
        $response->assertStatus(200);

        // Verificar que el contenido es un PDF
        $response->assertHeader('Content-Type', 'application/pdf');
        
        // Verificar que el nombre del archivo contiene el doc_numero del hijo
        $contentDisposition = $response->headers->get('Content-Disposition');
        $this->assertStringContainsString($hijo->doc_numero, $contentDisposition);
    }

    public function test_pdf_export_with_nonexistent_hijo_returns_404()
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

        // Hacer la petición con un hijo que no existe
        $response = $this->actingAs($user)
                        ->get('/equipaje/export-pdf?hijo=nonexistent123');

        // Verificar que retorna 404
        $response->assertStatus(404);
    }
}