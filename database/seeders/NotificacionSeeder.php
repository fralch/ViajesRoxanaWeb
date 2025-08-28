<?php

namespace Database\Seeders;

use App\Models\Notificacion;
use App\Models\Hijo;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NotificacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hijos = Hijo::with('user')->get();
        
        $tiposMensajes = [
            'Su hijo {nombre} ha llegado seguro al destino.',
            '{nombre} está participando en las actividades programadas.',
            'Recordatorio: {nombre} debe tomar su medicamento.',
            '{nombre} se encuentra bien y disfrutando del viaje.',
            'Actualización: {nombre} ha completado la actividad matutina.',
            '{nombre} está almorzando con el grupo.',
            'Su hijo {nombre} se encuentra descansando en el hotel.',
            '{nombre} participó exitosamente en la excursión de hoy.',
            'Recordatorio de emergencia para {nombre}.',
            '{nombre} regresará según el horario programado.'
        ];
        
        $estados = ['pendiente', 'enviado', 'fallo'];
        
        foreach ($hijos as $hijo) {
            // Crear 2-5 notificaciones por hijo
            $numNotificaciones = rand(2, 5);
            
            for ($i = 0; $i < $numNotificaciones; $i++) {
                $mensaje = $tiposMensajes[array_rand($tiposMensajes)];
                $mensajePersonalizado = str_replace('{nombre}', $hijo->nombres, $mensaje);
                
                // Obtener números de emergencia del hijo
                $numerosEmergencia = $hijo->nums_emergencia;
                $celular = is_array($numerosEmergencia) && count($numerosEmergencia) > 0 
                    ? $numerosEmergencia[array_rand($numerosEmergencia)]
                    : $hijo->user->phone;
                
                Notificacion::create([
                    'hijo_id' => $hijo->id,
                    'user_id' => $hijo->user_id,
                    'mensaje' => $mensajePersonalizado,
                    'celular' => $celular,
                    'estado' => $estados[array_rand($estados)],
                ]);
            }
        }
    }
}
