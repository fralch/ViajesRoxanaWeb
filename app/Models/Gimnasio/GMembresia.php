<?php

namespace App\Models\Gimnasio;

use Illuminate\Database\Eloquent\Model;

class GMembresia extends Model
{
    protected $table = 'g_membresias';
    protected $primaryKey = 'id_membresia';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'tipo_plan',
        'fecha_inicio',
        'fecha_fin',
        'estado',
    ];

    public function miembro()
    {
        return $this->belongsTo(GMiembro::class, 'id_usuario', 'id_usuario');
    }
}