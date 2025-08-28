<?php

namespace Database\Seeders;

use App\Models\SaludFicha;
use App\Models\Hijo;
use App\Models\Paquete;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SaludFichaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hijos = Hijo::all();
        $paquetes = Paquete::all();
        
        $alergias = [
            'Ninguna alergia conocida',
            'Alérgico al polen y ácaros',
            'Alergia a los mariscos',
            'Alérgico a los frutos secos',
            'Alergia al látex',
            'Alérgico a ciertos medicamentos (penicilina)',
            'Alergia estacional (primavera)',
            'Alérgico a picaduras de insectos'
        ];
        
        $medicamentos = [
            'No toma medicamentos',
            'Inhalador para asma (Salbutamol) - 2 puff cada 8 horas',
            'Antihistamínico (Loratadina) - 1 tableta diaria',
            'Vitaminas multivitamínicas - 1 cápsula en el desayuno',
            'Medicamento para TDAH (Metilfenidato) - 1 tableta en la mañana',
            'Insulina para diabetes tipo 1 - según indicación médica',
            'Anticonvulsivo (Carbamazepina) - 2 veces al día',
            'Suplemento de hierro - 1 tableta con las comidas'
        ];
        
        $seguros = [
            'EPS Sura',
            'EPS Sanitas',
            'EPS Compensar',
            'EPS Famisanar',
            'EPS Nueva EPS',
            'EPS Salud Total',
            'EPS Coomeva',
            'Medicina Prepagada Colsanitas'
        ];
        
        $contactosEmergencia = [
            'Dr. María González - Pediatra',
            'Dra. Ana Martínez - Médico Familiar',
            'Dr. Carlos Rodríguez - Alergólogo',
            'Dra. Laura Pérez - Endocrinóloga',
            'Dr. José Hernández - Neumólogo',
            'Dra. Patricia López - Neuróloga'
        ];
        
        $telefonosEmergencia = [
            '601-2345678',
            '601-3456789',
            '601-4567890',
            '601-5678901',
            '601-6789012',
            '601-7890123'
        ];
        
        $observaciones = [
            'Niño muy activo, requiere supervisión constante durante actividades físicas.',
            'Tiene tendencia a marearse en transportes largos, llevar medicamento preventivo.',
            'Es muy sociable pero puede ser tímido al principio con nuevas personas.',
            'Requiere recordatorios para tomar medicamentos a tiempo.',
            'Debe evitar exposición prolongada al sol, usar protector solar frecuentemente.',
            'Tiene miedo a las alturas, considerar en actividades de aventura.',
            'Duerme profundamente, puede necesitar ayuda para despertar en emergencias.',
            'Es alérgico a ciertos alimentos, verificar menús antes de las comidas.'
        ];
        
        foreach ($hijos as $hijo) {
            // Crear ficha de salud general (sin paquete específico)
            SaludFicha::create([
                'hijo_id' => $hijo->id,
                'package_id' => null,
                'alergias' => $alergias[array_rand($alergias)],
                'medicamentos' => $medicamentos[array_rand($medicamentos)],
                'seguros' => $seguros[array_rand($seguros)],
                'emergencia_contacto' => $contactosEmergencia[array_rand($contactosEmergencia)],
                'emergencia_telefono' => $telefonosEmergencia[array_rand($telefonosEmergencia)],
                'observaciones' => $observaciones[array_rand($observaciones)]
            ]);
            
            // 30% de probabilidad de tener fichas específicas para paquetes
            if (rand(1, 100) <= 30) {
                $paqueteAleatorio = $paquetes->random();
                
                // Verificar que no exista ya una ficha para este hijo y paquete
                $existeFicha = SaludFicha::where('hijo_id', $hijo->id)
                    ->where('package_id', $paqueteAleatorio->id)
                    ->exists();
                
                if (!$existeFicha) {
                    SaludFicha::create([
                        'hijo_id' => $hijo->id,
                        'package_id' => $paqueteAleatorio->id,
                        'alergias' => $alergias[array_rand($alergias)],
                        'medicamentos' => $medicamentos[array_rand($medicamentos)],
                        'seguros' => $seguros[array_rand($seguros)],
                        'emergencia_contacto' => $contactosEmergencia[array_rand($contactosEmergencia)],
                        'emergencia_telefono' => $telefonosEmergencia[array_rand($telefonosEmergencia)],
                        'observaciones' => 'Observaciones específicas para el viaje a ' . $paqueteAleatorio->destino . '. ' . $observaciones[array_rand($observaciones)]
                    ]);
                }
            }
        }
    }
}