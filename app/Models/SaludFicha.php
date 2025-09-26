<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaludFicha extends Model
{
    use HasFactory;

    protected $fillable = [
        'hijo_id',
        'package_id',
        'grupo_sanguineo',
        'factor_rh',
        'tratamientos_actuales',
        'enfermedades_preexistentes',
        'alergias_medicas',
        'vacunas_recibidas',
        'seguros_medicos',
        'informacion_adicional',
        'archivos_adjuntos'
    ];

    protected $casts = [
        'tratamientos_actuales' => 'array',
        'enfermedades_preexistentes' => 'array',
        'alergias_medicas' => 'array',
        'vacunas_recibidas' => 'array',
        'seguros_medicos' => 'array',
        'archivos_adjuntos' => 'array'
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