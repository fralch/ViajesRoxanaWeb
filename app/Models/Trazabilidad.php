<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trazabilidad extends Model
{
    protected $table = 'trazabilidad';
    
    protected $fillable = [
        'paquete_id',
        'grupo_id',
        'hijo_id',
        'descripcion',
        'latitud',
        'longitud'
    ];

    public function paquete()
    {
        return $this->belongsTo(Paquete::class);
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    public function hijo()
    {
        return $this->belongsTo(Hijo::class);
    }
}
