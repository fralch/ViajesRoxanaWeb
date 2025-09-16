<?php

namespace Tests\Feature\Api;

use App\Models\Hijo;
use App\Models\Paquete;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeolocalizacionEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_geolocalizacion_endpoint_creates_record_and_returns_201(): void
    {
        $user = User::factory()->create();

        $hijo = Hijo::create([
            'user_id' => $user->id,
            'nombres' => 'Juan Perez',
            'doc_tipo' => 'DNI',
            'doc_numero' => '12345678',
        ]);

        $paquete = Paquete::create([
            'nombre' => 'Paquete A',
            'destino' => 'Cusco',
            'descripcion' => 'Prueba',
            'activo' => true,
        ]);

        $payload = [
            'paquete_id' => $paquete->id,
            'hijo_id' => $hijo->id,
            'latitud' => -12.0464,
            'longitud' => -77.0428,
        ];

        $response = $this->postJson('/api/v1/endpoint/geolocalizacion', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Location saved successfully',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'paquete_id',
                    'hijo_id',
                    'latitud',
                    'longitud',
                    'created_at',
                    'updated_at',
                    'paquete',
                    'hijo',
                ],
            ]);

        $this->assertDatabaseHas('geolocalizacion', [
            'paquete_id' => $paquete->id,
            'hijo_id' => $hijo->id,
            'latitud' => (string) $payload['latitud'],
            'longitud' => (string) $payload['longitud'],
        ]);
    }
}
