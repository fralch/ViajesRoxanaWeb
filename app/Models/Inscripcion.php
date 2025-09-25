<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    protected $table = 'inscripciones';
    
    protected $fillable = [
        'hijo_id',
        'paquete_id',
        'grupo_id',
        'subgrupo_id',
        'usuario_id',
        'confirmado'
    ];

    public function hijo()
    {
        return $this->belongsTo(Hijo::class);
    }

    public function paquete()
    {
        return $this->belongsTo(Paquete::class);
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function subgrupo()
    {
        return $this->belongsTo(Subgrupo::class);
    }
}
