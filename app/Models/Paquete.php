<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paquete extends Model
{
    protected $table = 'paquetes';
    
    protected $fillable = [
        'nombre',
        'destino', 
        'descripcion',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    public function grupos()
    {
        return $this->hasMany(Grupo::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    public function recorridos()
    {
        return $this->hasMany(RecorridoPaquete::class)->orderBy('orden');
    }
}
