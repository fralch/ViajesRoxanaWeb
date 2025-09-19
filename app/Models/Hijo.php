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
        'password_hijo',
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

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'doc_numero';
    }

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

    public function equipajes()
    {
        return $this->hasMany(Equipaje::class);
    }

    protected static function booted()
    {
        static::deleting(function ($hijo) {
            $hijo->inscripciones()->delete();
            $hijo->saludFichas()->delete();
            $hijo->nutricionFichas()->delete();
            $hijo->equipajes()->delete();
        });
    }

    // Accessor para asegurar que nums_emergencia siempre sea un array
    public function getNumsEmergenciaAttribute($value)
    {
        if (is_null($value) || $value === '') {
            return [];
        }
        
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return is_array($value) ? $value : [];
    }
}
