<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hijo extends Model
{
    protected $table = 'hijos';
    
    protected $fillable = [
        'user_id',
        'nombres',
        'doc_tipo',
        'doc_numero',
        'nums_emergencia',
        'fecha_nacimiento',
        'foto',
        'pasatiempos',
        'deportes',
        'plato_favorito',
        'color_favorito',
        'informacion_adicional'
    ];

    protected $casts = [
        'nums_emergencia' => 'array',
        'fecha_nacimiento' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    public function saludFichas()
    {
        return $this->hasMany(SaludFicha::class);
    }

    public function nutricionFichas()
    {
        return $this->hasMany(NutricionFicha::class);
    }
}
