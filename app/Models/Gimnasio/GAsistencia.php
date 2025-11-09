<?php

namespace App\Models\Gimnasio;

use Illuminate\Database\Eloquent\Model;

class GAsistencia extends Model
{
    protected $table = 'g_asistencias';
    protected $primaryKey = 'id_asistencia';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'fecha_asistencia',
        'hora_entrada',
    ];

    public function miembro()
    {
        return $this->belongsTo(GMiembro::class, 'id_usuario', 'id_usuario');
    }
}