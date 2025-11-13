<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Gimnasio\GMiembro;
use App\Models\Gimnasio\GMembresia;
use App\Models\Gimnasio\GAsistencia;
use Carbon\Carbon;
use Tests\TestCase;

class CheckinControllerTest extends TestCase
{
    private function createUserAndMember(): array
    {
        $user = User::factory()->create();
        $dni = str_pad((string)random_int(10000000, 99999999), 8, '0', STR_PAD_LEFT);

        // Crear miembro del gimnasio con el mismo id_usuario que el id del usuario autenticado
        $miembro = GMiembro::create([
            'id_usuario' => $user->id,
            'nombre' => $user->name ?? 'Usuario Gimnasio',
            'dni' => $dni,
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
            'estado' => 'Activo',
            'fecha_registro' => Carbon::today()->toDateString(),
            'foto_perfil' => null,
        ]);

        return ['user' => $user, 'dni' => $dni, 'miembro' => $miembro];
    }

    private function createActiveMembershipFor(User $user): GMembresia
    {
        return GMembresia::create([
            'id_usuario' => $user->id,
            'tipo_plan' => 'Mensual',
            'fecha_inicio' => Carbon::today()->subDays(3)->toDateString(),
            'fecha_fin' => Carbon::today()->addDays(10)->toDateString(),
            'estado' => 'Activa',
        ]);
    }

    public function test_checkin_success_records_attendance(): void
    {
        $data = $this->createUserAndMember();
        $this->createActiveMembershipFor($data['user']);

        $response = $this->getJson('/api/v1/endpoint/gimnasio/verificar-membresia/' . $data['dni']);

        $response->assertStatus(200)
            ->assertJsonFragment(['mensaje' => 'Asistencia registrada exitosamente'])
            ->assertJsonStructure(['mensaje', 'nombre', 'hora']);

        $responseJson = $response->json();
        $this->assertArrayHasKey('hora', $responseJson);
        $this->assertArrayHasKey('nombre', $responseJson);

        $this->assertDatabaseHas('g_asistencias', [
            'id_usuario' => $data['user']->id,
            'fecha_asistencia' => Carbon::today()->toDateString(),
        ]);
    }

    public function test_checkin_member_not_found_returns_404(): void
    {
        $response = $this->getJson('/api/v1/endpoint/gimnasio/verificar-membresia/99999999');

        $response->assertStatus(404)
                 ->assertJsonFragment(['error' => 'Miembro no encontrado']);
    }

    public function test_checkin_inactive_membership_returns_403(): void
    {
        $data = $this->createUserAndMember();

        // Crear membresía inactiva
        GMembresia::create([
            'id_usuario' => $data['user']->id,
            'tipo_plan' => 'Mensual',
            'fecha_inicio' => Carbon::today()->subDays(15)->toDateString(),
            'fecha_fin' => Carbon::today()->addDays(15)->toDateString(),
            'estado' => 'Inactiva',
        ]);

        $response = $this->getJson('/api/v1/endpoint/gimnasio/verificar-membresia/' . $data['dni']);

        $response->assertStatus(403)
                 ->assertJsonFragment(['error' => 'Membresía inactiva o fuera de rango de fechas']);
    }

    public function test_checkin_duplicate_today_returns_message(): void
    {
        $data = $this->createUserAndMember();
        $this->createActiveMembershipFor($data['user']);

        // Precrear asistencia de hoy
        GAsistencia::create([
            'id_usuario' => $data['user']->id,
            'fecha_asistencia' => Carbon::today()->toDateString(),
            'hora_entrada' => '08:30:00',
        ]);

        $response = $this->getJson('/api/v1/endpoint/gimnasio/verificar-membresia/' . $data['dni']);

        $response->assertStatus(200)
                 ->assertJsonFragment(['mensaje' => 'Ya registrado hoy'])
                 ->assertJsonFragment(['hora' => '08:30:00']);
    }

    public function test_checkin_membership_not_started_returns_403(): void
    {
        $data = $this->createUserAndMember();

        // Crear membresía que aún no ha comenzado
        GMembresia::create([
            'id_usuario' => $data['user']->id,
            'tipo_plan' => 'Mensual',
            'fecha_inicio' => Carbon::today()->addDays(5)->toDateString(),
            'fecha_fin' => Carbon::today()->addDays(35)->toDateString(),
            'estado' => 'Activa',
        ]);

        $response = $this->getJson('/api/v1/endpoint/gimnasio/verificar-membresia/' . $data['dni']);

        $response->assertStatus(403)
                 ->assertJsonFragment(['error' => 'Membresía inactiva o fuera de rango de fechas']);
    }
}