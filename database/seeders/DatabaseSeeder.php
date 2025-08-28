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
        // Crear usuarios de prueba
        User::firstOrCreate(
            ['email' => 'admin@viajesroxana.com'],
            [
                'name' => 'Administrador',
                'phone' => '3001234567',
                'is_admin' => true,
                'password' => bcrypt('password'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Usuario Test',
                'phone' => '3007654321',
                'is_admin' => false,
                'password' => bcrypt('password'),
            ]
        );

        // Crear usuarios adicionales
        User::factory(8)->create();

        $this->call([
            PaqueteSeeder::class,
            GrupoSeeder::class,
            HijoSeeder::class,
            SaludFichaSeeder::class,
            NutricionFichaSeeder::class,
            InscripcionSeeder::class,
            GeolocalizacionSeeder::class,
            RecorridoPaqueteSeeder::class,
            TrazabilidadSeeder::class,
            NotificacionSeeder::class,
        ]);
    }
}