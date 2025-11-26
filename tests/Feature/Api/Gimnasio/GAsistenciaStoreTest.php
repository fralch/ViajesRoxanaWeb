<?php

namespace Tests\Feature\Api\Gimnasio;

use App\Models\Gimnasio\GAsistencia;
use App\Models\Gimnasio\GMiembro;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class GAsistenciaStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_store_asistencia_with_id_usuario()
    {
        // Create a user and member
        $user = \App\Models\User::factory()->create();
        $dni = (string) rand(10000000, 99999999);
        $miembro = GMiembro::create([
            'id_usuario' => $user->id,
            'nombre' => 'Test User',
            'dni' => $dni,
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        $data = [
            'id_usuario' => $miembro->id_usuario,
            'fecha_asistencia' => now()->toDateString(),
            'hora_entrada' => now()->format('H:i:s'),
        ];

        $response = $this->postJson('/api/v1/endpoint/gimnasio/asistencias', $data);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);
        
        $this->assertDatabaseHas('g_asistencias', [
            'id_usuario' => $miembro->id_usuario,
            'fecha_asistencia' => $data['fecha_asistencia'],
        ]);
    }

    public function test_store_asistencia_with_dni()
    {
        // Create a user and member
        $user = \App\Models\User::factory()->create();
        $dni = (string) rand(10000000, 99999999);
        $miembro = GMiembro::create([
            'id_usuario' => $user->id,
            'nombre' => 'Test User DNI',
            'dni' => $dni,
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'F',
            'estado' => 'Activo',
            'fecha_registro' => now(),
        ]);

        $data = [
            'dni' => $dni,
            'fecha_asistencia' => now()->toDateString(),
            'hora_entrada' => now()->format('H:i:s'),
        ];

        $response = $this->postJson('/api/v1/endpoint/gimnasio/asistencias', $data);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);

        $this->assertDatabaseHas('g_asistencias', [
            'id_usuario' => $miembro->id_usuario,
            'fecha_asistencia' => $data['fecha_asistencia'],
        ]);
    }

    public function test_store_asistencia_fails_without_id_or_dni()
    {
        $data = [
            'fecha_asistencia' => now()->toDateString(),
            'hora_entrada' => now()->format('H:i:s'),
        ];

        $response = $this->postJson('/api/v1/endpoint/gimnasio/asistencias', $data);

        $response->assertStatus(422);
        // Depending on Laravel version and validation response format, exact error structure might vary, 
        // but status 422 is standard.
    }

    public function test_store_asistencia_fails_with_invalid_dni()
    {
        $data = [
            'dni' => 'nonexistent',
            'fecha_asistencia' => now()->toDateString(),
            'hora_entrada' => now()->format('H:i:s'),
        ];

        $response = $this->postJson('/api/v1/endpoint/gimnasio/asistencias', $data);

        $response->assertStatus(422);
    }
}
