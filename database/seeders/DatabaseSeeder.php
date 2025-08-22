<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PaqueteSeeder::class,
            GrupoSeeder::class,
            HijoSeeder::class,
            InscripcionSeeder::class,
            GeolocalizacionSeeder::class,
            RecorridoPaqueteSeeder::class,
            TrazabilidadSeeder::class,
            NotificacionSeeder::class,
        ]);

        // Crear usuarios de prueba
        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@viajesroxana.com',
            'phone' => '3001234567',
            'is_admin' => true,
        ]);

        User::factory()->create([
            'name' => 'Usuario Test',
            'email' => 'test@example.com',
            'phone' => '3007654321',
            'is_admin' => false,
        ]);

        // Crear usuarios adicionales
        User::factory(8)->create();
    }
}
