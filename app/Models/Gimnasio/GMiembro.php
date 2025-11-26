<?php

namespace App\Models\Gimnasio;

use Illuminate\Database\Eloquent\Model;

class GMiembro extends Model
{
    protected $table = 'g_miembros';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'dni',
        'celular',
        'fecha_nacimiento',
        'genero',
        'foto_perfil',
        'historial_fotos',
        'estado',
        'fecha_registro',
    ];

    protected $casts = [
        'historial_fotos' => 'array',
    ];

    public function asistencias()
    {
        return $this->hasMany(GAsistencia::class, 'id_usuario', 'id_usuario');
    }

    public function membresias()
    {
        return $this->hasMany(GMembresia::class, 'id_usuario', 'id_usuario');
    }

    public function metas()
    {
        return $this->hasMany(GMeta::class, 'id_usuario', 'id_usuario');
    }
}