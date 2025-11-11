<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Gimnasio\GMiembro;
use App\Models\Gimnasio\GMembresia;
use App\Models\Gimnasio\GAsistencia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CheckinControllerTest extends TestCase
{
    private function setQrToken(string $token): void
    {
        DB::table('g_configuracion')->updateOrInsert(
            ['clave' => 'qr_checkin_token'],
            ['valor' => $token, 'descripcion' => 'Token QR de pruebas']
        );
    }

    private function createUserAndMember(): User
    {
        $user = User::factory()->create();

        // Crear miembro del gimnasio con el mismo id_usuario que el id del usuario autenticado
        GMiembro::create([
            'id_usuario' => $user->id,
            'nombre' => $user->name ?? 'Usuario Gimnasio',
            'dni' => str_pad((string)random_int(0, 99999999), 8, '0', STR_PAD_LEFT),
            'fecha_nacimiento' => '1990-01-01',
            'genero' => 'M',
            'estado' => 'Activo',
            'fecha_registro' => Carbon::today()->toDateString(),
            'foto_perfil' => null,
        ]);

        return $user;
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
        $this->setQrToken('TEST_TOKEN');
        $user = $this->createUserAndMember();
        $this->createActiveMembershipFor($user);

        $response = $this->postJson('/api/v1/endpoint/gimnasio/marcar-asistencia', [
            'id_usuario' => $user->id,
            'qr_token' => 'TEST_TOKEN',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['mensaje' => 'Asistencia registrada'])
            ->assertJsonStructure(['mensaje', 'hora']);

        $responseJson = $response->json();
        $this->assertArrayHasKey('hora', $responseJson);

        $this->assertDatabaseHas('g_asistencias', [
            'id_usuario' => $user->id,
            'fecha_asistencia' => Carbon::today()->toDateString(),
        ]);
    }

    public function test_checkin_invalid_qr_returns_403(): void
    {
        $this->setQrToken('TEST_TOKEN');
        $user = $this->createUserAndMember();
        $this->createActiveMembershipFor($user);

        $response = $this->postJson('/api/v1/endpoint/gimnasio/marcar-asistencia', [
            'id_usuario' => $user->id,
            'qr_token' => 'WRONG_TOKEN',
        ]);

        $response->assertStatus(403)
                 ->assertJsonFragment(['error' => 'QR inválido']);
    }

    public function test_checkin_inactive_membership_returns_403(): void
    {
        $this->setQrToken('TEST_TOKEN');
        $user = $this->createUserAndMember();

        // Crear membresía inactiva
        GMembresia::create([
            'id_usuario' => $user->id,
            'tipo_plan' => 'Mensual',
            'fecha_inicio' => Carbon::today()->subDays(15)->toDateString(),
            'fecha_fin' => Carbon::today()->addDays(15)->toDateString(),
            'estado' => 'Inactiva',
        ]);

        $response = $this->postJson('/api/v1/endpoint/gimnasio/marcar-asistencia', [
            'id_usuario' => $user->id,
            'qr_token' => 'TEST_TOKEN',
        ]);

        $response->assertStatus(403)
                 ->assertJsonFragment(['error' => 'Membresía inactiva']);
    }

    public function test_checkin_duplicate_today_returns_message(): void
    {
        $this->setQrToken('TEST_TOKEN');
        $user = $this->createUserAndMember();
        $this->createActiveMembershipFor($user);

        // Precrear asistencia de hoy
        GAsistencia::create([
            'id_usuario' => $user->id,
            'fecha_asistencia' => Carbon::today()->toDateString(),
            'hora_entrada' => '08:30:00',
        ]);

        $response = $this->postJson('/api/v1/endpoint/gimnasio/marcar-asistencia', [
            'id_usuario' => $user->id,
            'qr_token' => 'TEST_TOKEN',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['mensaje' => 'Ya registrado hoy'])
                 ->assertJsonFragment(['hora' => '08:30:00']);
    }
}