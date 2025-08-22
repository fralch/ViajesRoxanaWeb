<?php

namespace Database\Seeders;

use App\Models\Paquete;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaqueteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paquetes = [
            [
                'nombre' => 'Aventura en Cartagena',
                'destino' => 'Cartagena, Colombia',
                'descripcion' => 'Explora la ciudad amurallada, disfruta de las playas y conoce la historia colonial de Cartagena.',
                'activo' => true,
            ],
            [
                'nombre' => 'Naturaleza en San Andrés',
                'destino' => 'San Andrés, Colombia',
                'descripcion' => 'Descubre las aguas cristalinas del Caribe, practica snorkel y relájate en playas paradisíacas.',
                'activo' => true,
            ],
            [
                'nombre' => 'Cultura en Bogotá',
                'destino' => 'Bogotá, Colombia',
                'descripcion' => 'Visita museos, el centro histórico de La Candelaria y disfruta de la gastronomía capitalina.',
                'activo' => true,
            ],
            [
                'nombre' => 'Aventura en Medellín',
                'destino' => 'Medellín, Colombia',
                'descripcion' => 'Conoce la ciudad de la eterna primavera, sus parques temáticos y la innovación urbana.',
                'activo' => true,
            ],
            [
                'nombre' => 'Ecoturismo en Eje Cafetero',
                'destino' => 'Eje Cafetero, Colombia',
                'descripcion' => 'Aprende sobre el proceso del café, disfruta de paisajes montañosos y actividades al aire libre.',
                'activo' => true,
            ],
            [
                'nombre' => 'Playa y Diversión en Santa Marta',
                'destino' => 'Santa Marta, Colombia',
                'descripcion' => 'Combina playa, historia y naturaleza en la bahía más linda de América.',
                'activo' => false,
            ],
        ];

        foreach ($paquetes as $paquete) {
            Paquete::create($paquete);
        }
    }
}
