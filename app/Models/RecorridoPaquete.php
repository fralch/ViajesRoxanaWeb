<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecorridoPaquete extends Model
{
    protected $table = 'recorrido_paquetes';
    
    protected $fillable = [
        'paquete_id',
        'nombre',
        'orden',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer'
    ];

    public function paquete()
    {
        return $this->belongsTo(Paquete::class);
    }
}
