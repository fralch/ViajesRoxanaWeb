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
        'activo',
        'documentos_links'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'capacidad' => 'integer',
        'fecha_inicio' => 'date:Y-m-d',
        'fecha_fin' => 'date:Y-m-d',
        'documentos_links' => 'array'
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

    public function subgrupos()
    {
        return $this->hasMany(Subgrupo::class);
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
