<?php

namespace Database\Seeders;

use App\Models\NutricionFicha;
use App\Models\Hijo;
use App\Models\Paquete;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NutricionFichaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hijos = Hijo::all();
        $paquetes = Paquete::all();
        
        $restricciones = [
            'Sin restricciones alimentarias',
            'Dieta vegetariana',
            'Dieta vegana',
            'Sin gluten (celiaquía)',
            'Dieta baja en sodio',
            'Sin azúcar refinada (diabetes)',
            'Dieta blanda por problemas digestivos',
            'Sin lácteos (intolerancia a la lactosa)'
        ];
        
        $preferencias = [
            'Le gusta todo tipo de comida',
            'Prefiere comida casera y tradicional',
            'Le gustan las frutas y verduras frescas',
            'Prefiere carnes blancas (pollo, pescado)',
            'Le encantan los postres y dulces',
            'Prefiere comida italiana (pasta, pizza)',
            'Le gusta la comida mexicana (tacos, quesadillas)',
            'Prefiere comidas simples y conocidas',
            'Le gustan los jugos naturales y batidos',
            'Prefiere comida sin muchas especias'
        ];
        
        $alergiasAlimentarias = [
            'Sin alergias alimentarias conocidas',
            'Alérgico a los mariscos y crustáceos',
            'Alergia a los frutos secos (nueces, almendras)',
            'Alérgico al huevo',
            'Alergia a la leche de vaca',
            'Alérgico al trigo y derivados',
            'Alergia a la soja',
            'Alérgico a ciertos colorantes artificiales',
            'Alergia a las fresas y frutas rojas',
            'Alérgico al chocolate'
        ];
        
        $intolerancias = [
            'Sin intolerancias conocidas',
            'Intolerancia a la lactosa',
            'Intolerancia al gluten',
            'Intolerancia a la fructosa',
            'Sensibilidad a alimentos muy condimentados',
            'Intolerancia a alimentos muy grasos',
            'Sensibilidad a conservantes artificiales',
            'Intolerancia a bebidas con cafeína',
            'Sensibilidad a alimentos ácidos'
        ];
        
        $otrasNotas = [
            'Come bien y no es selectivo con la comida.',
            'Necesita recordatorios para comer, a veces se olvida por estar jugando.',
            'Come despacio, necesita tiempo extra durante las comidas.',
            'Le gusta ayudar en la cocina y aprender sobre los alimentos.',
            'Prefiere comer en grupo, es más sociable durante las comidas.',
            'Tiene buen apetito pero se llena rápido, prefiere porciones pequeñas.',
            'Es muy curioso con comidas nuevas, le gusta probar sabores diferentes.',
            'Necesita supervisión para no comer demasiado dulce.',
            'Bebe mucha agua durante el día, mantener hidratación.',
            'Prefiere comidas tibias, no muy calientes ni muy frías.'
        ];
        
        foreach ($hijos as $hijo) {
            // Crear ficha nutricional general (sin paquete específico)
            NutricionFicha::create([
                'hijo_id' => $hijo->id,
                'package_id' => null,
                'restricciones' => $restricciones[array_rand($restricciones)],
                'preferencias' => $preferencias[array_rand($preferencias)],
                'alergias_alimentarias' => $alergiasAlimentarias[array_rand($alergiasAlimentarias)],
                'intolerancias' => $intolerancias[array_rand($intolerancias)],
                'otras_notas' => $otrasNotas[array_rand($otrasNotas)]
            ]);
            
            // 25% de probabilidad de tener fichas específicas para paquetes
            if (rand(1, 100) <= 25) {
                $paqueteAleatorio = $paquetes->random();
                
                // Verificar que no exista ya una ficha para este hijo y paquete
                $existeFicha = NutricionFicha::where('hijo_id', $hijo->id)
                    ->where('package_id', $paqueteAleatorio->id)
                    ->exists();
                
                if (!$existeFicha) {
                    NutricionFicha::create([
                        'hijo_id' => $hijo->id,
                        'package_id' => $paqueteAleatorio->id,
                        'restricciones' => $restricciones[array_rand($restricciones)],
                        'preferencias' => $preferencias[array_rand($preferencias)] . ' Especialmente durante el viaje a ' . $paqueteAleatorio->destino,
                        'alergias_alimentarias' => $alergiasAlimentarias[array_rand($alergiasAlimentarias)],
                        'intolerancias' => $intolerancias[array_rand($intolerancias)],
                        'otras_notas' => 'Notas específicas para el viaje: ' . $otrasNotas[array_rand($otrasNotas)]
                    ]);
                }
            }
        }
    }
}