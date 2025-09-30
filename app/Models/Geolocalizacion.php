<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Geolocalizacion extends Model
{
    protected $table = 'geolocalizacion';

    protected $fillable = [
        'paquete_id',
        'hijo_id',
        'latitud',
        'longitud'
    ];

    protected $casts = [
        'latitud' => 'float',
        'longitud' => 'float',
    ];

    public function paquete()
    {
        return $this->belongsTo(Paquete::class);
    }

    public function hijo()
    {
        return $this->belongsTo(Hijo::class);
    }
}
