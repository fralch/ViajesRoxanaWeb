<?php

namespace App\Models\Gimnasio;

use Illuminate\Database\Eloquent\Model;

class GMeta extends Model
{
    protected $table = 'g_metas';
    protected $primaryKey = 'id_meta';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'estado',
    ];

    public function miembro()
    {
        return $this->belongsTo(GMiembro::class, 'id_usuario', 'id_usuario');
    }
}