<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NutricionFicha extends Model
{
    use HasFactory;

    protected $fillable = [
        'hijo_id',
        'package_id',
        'alimento_alergia',
        'reaccion_alergia',
        'alimento_evitar',
        'especificar_dieta',
        'detalle_preferencia_alimentaria'
    ];

    public function hijo()
    {
        return $this->belongsTo(Hijo::class);
    }

    public function paquete()
    {
        return $this->belongsTo(Paquete::class, 'package_id');
    }

    /**
     * Convertir los datos a estructura individual para el frontend
     */
    public function toArray()
    {
        $array = parent::toArray();

        // Determinar las respuestas basándose en si los campos contienen el valor especial
        $array['tiene_alergia_alimentaria'] = ($this->alimento_alergia === '__NO_APLICA__') ? 'No' :
            (!empty($this->alimento_alergia) ? 'Sí' : '');

        $array['evita_alimentos'] = ($this->alimento_evitar === '__NO_APLICA__') ? 'No' :
            (!empty($this->alimento_evitar) ? 'Sí' : '');

        $array['tiene_dieta_especial'] = ($this->especificar_dieta === '__NO_APLICA__') ? 'No' :
            (!empty($this->especificar_dieta) ? 'Sí' : '');

        $array['tiene_preferencia_alimentaria'] = ($this->detalle_preferencia_alimentaria === '__NO_APLICA__') ? 'No' :
            (!empty($this->detalle_preferencia_alimentaria) ? 'Sí' : '');

        // Limpiar los valores especiales para mostrar campos vacíos en el frontend
        if ($array['alimento_alergia'] === '__NO_APLICA__') {
            $array['alimento_alergia'] = '';
        }
        if ($array['reaccion_alergia'] === '__NO_APLICA__') {
            $array['reaccion_alergia'] = '';
        }
        if ($array['alimento_evitar'] === '__NO_APLICA__') {
            $array['alimento_evitar'] = '';
        }
        if ($array['especificar_dieta'] === '__NO_APLICA__') {
            $array['especificar_dieta'] = '';
        }
        if ($array['detalle_preferencia_alimentaria'] === '__NO_APLICA__') {
            $array['detalle_preferencia_alimentaria'] = '';
        }

        return $array;
    }
}