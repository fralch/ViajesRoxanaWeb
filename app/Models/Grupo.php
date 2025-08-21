<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    protected $table = 'grupos';
    
    protected $fillable = [
        'paquete_id',
        'nombre',
        'capacidad',
        'tipo_encargado',
        'nombre_encargado',
        'celular_encargado',
        'nombre_encargado_agencia',
        'celular_encargado_agencia',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'capacidad' => 'integer'
    ];

    public function paquete()
    {
        return $this->belongsTo(Paquete::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }
}
