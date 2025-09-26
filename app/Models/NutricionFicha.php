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
}