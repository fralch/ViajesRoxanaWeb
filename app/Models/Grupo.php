<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    protected $table = 'grupos';
    
    protected $fillable = [
        'paquete_id',
        'nombre',
        'fecha_inicio',
        'fecha_fin', 
        'capacidad',
        'tipo_encargado',
        'nombre_encargado',
        'celular_encargado',
        'tipo_encargado_agencia',
        'nombre_encargado_agencia',
        'celular_encargado_agencia',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'capacidad' => 'integer',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'tipo_encargado' => 'array',
        'nombre_encargado' => 'array',
        'celular_encargado' => 'array',
        'tipo_encargado_agencia' => 'array',
        'nombre_encargado_agencia' => 'array',
        'celular_encargado_agencia' => 'array'
    ];

    public function paquete()
    {
        return $this->belongsTo(Paquete::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    public function trazabilidades()
    {
        return $this->hasMany(Trazabilidad::class);
    }
}
