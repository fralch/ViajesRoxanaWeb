<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Subgrupo extends Model
{
    use HasFactory;

    protected $table = 'subgrupos';

    protected $fillable = [
        'grupo_id',
        'nombre',
        'descripcion',
        'tipo_encargado_principal',
        'nombre_encargado_principal',
        'celular_encargado_principal',
        'email_encargado_principal',
        'tipo_encargado_secundario',
        'nombre_encargado_secundario',
        'celular_encargado_secundario',
        'email_encargado_secundario',
        'capacidad_maxima',
        'activo',
        'observaciones'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'capacidad_maxima' => 'integer'
    ];

    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    public function hijos()
    {
        return $this->hasManyThrough(Hijo::class, Inscripcion::class, 'subgrupo_id', 'id', 'id', 'hijo_id');
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeConCapacidad($query)
    {
        return $query->whereRaw('(SELECT COUNT(*) FROM inscripciones WHERE subgrupo_id = subgrupos.id) < capacidad_maxima');
    }

    public function getInscripcionesCountAttribute()
    {
        return $this->inscripciones()->count();
    }

    public function getCapacidadDisponibleAttribute()
    {
        return $this->capacidad_maxima - $this->inscripciones_count;
    }

    public function tieneCapacidad()
    {
        return $this->inscripciones_count < $this->capacidad_maxima;
    }

    public function getEncargadoPrincipalCompletoAttribute()
    {
        return [
            'tipo' => $this->tipo_encargado_principal,
            'nombre' => $this->nombre_encargado_principal,
            'celular' => $this->celular_encargado_principal,
            'email' => $this->email_encargado_principal
        ];
    }

    public function getEncargadoSecundarioCompletoAttribute()
    {
        if (!$this->nombre_encargado_secundario) {
            return null;
        }

        return [
            'tipo' => $this->tipo_encargado_secundario,
            'nombre' => $this->nombre_encargado_secundario,
            'celular' => $this->celular_encargado_secundario,
            'email' => $this->email_encargado_secundario
        ];
    }
}