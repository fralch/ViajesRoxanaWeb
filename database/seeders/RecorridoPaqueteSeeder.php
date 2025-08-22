<?php

namespace Database\Seeders;

use App\Models\RecorridoPaquete;
use App\Models\Paquete;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RecorridoPaqueteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paquetes = Paquete::all();
        
        $recorridos = [
            'Aventura en Cartagena' => [
                'Llegada y check-in en hotel',
                'Tour por la Ciudad Amurallada',
                'Visita al Castillo San Felipe',
                'Paseo en chiva por la ciudad',
                'Día de playa en Bocagrande',
                'Visita a las Islas del Rosario',
                'Despedida y traslado al aeropuerto'
            ],
            'Naturaleza en San Andrés' => [
                'Llegada y bienvenida',
                'Tour por la isla en chiva',
                'Snorkel en el acuario natural',
                'Visita a Johnny Cay',
                'Excursión a Providencia',
                'Actividades acuáticas',
                'Regreso a casa'
            ],
            'Cultura en Bogotá' => [
                'Llegada y city tour',
                'Visita a La Candelaria',
                'Museo del Oro y Botero',
                'Subida al Cerro de Monserrate',
                'Parque Simón Bolívar',
                'Centro Comercial y gastronomía',
                'Despedida'
            ],
            'Aventura en Medellín' => [
                'Llegada y recorrido urbano',
                'Parque Explora y Planetario',
                'Guatapé y Piedra del Peñol',
                'Parque Arví en Metrocable',
                'Comuna 13 y arte urbano',
                'Parques temáticos',
                'Regreso'
            ],
            'Ecoturismo en Eje Cafetero' => [
                'Llegada a la región cafetera',
                'Tour por finca cafetera',
                'Parque Nacional del Café',
                'Actividades de aventura',
                'Valle de Cocora y palmas de cera',
                'Termales y relajación',
                'Despedida'
            ],
            'Playa y Diversión en Santa Marta' => [
                'Llegada y instalación',
                'Playa El Rodadero',
                'Parque Tayrona',
                'Ciudad Perdida (trekking)',
                'Taganga y buceo',
                'Quinta de San Pedro Alejandrino',
                'Regreso a casa'
            ]
        ];
        
        foreach ($paquetes as $paquete) {
            if (isset($recorridos[$paquete->nombre])) {
                $actividades = $recorridos[$paquete->nombre];
                
                foreach ($actividades as $index => $actividad) {
                    RecorridoPaquete::create([
                        'paquete_id' => $paquete->id,
                        'nombre' => $actividad,
                        'orden' => $index + 1,
                        'activo' => true,
                    ]);
                }
            }
        }
    }
}
