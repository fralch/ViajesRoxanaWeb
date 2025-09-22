<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Equipaje extends Model
{
    protected $table = 'equipajes';

    protected $fillable = [
        'hijo_id',
        'tip_maleta',
        'num_etiqueta',
        'color',
        'caracteristicas',
        'peso',
        'images',
        'images1',
        'images2',
        'lugar_regis',
    ];

    protected $casts = [
        'peso' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el modelo Hijo
     */
    public function hijo(): BelongsTo
    {
        return $this->belongsTo(Hijo::class);
    }

    /**
     * Obtener los tipos de maleta disponibles
     */
    public static function getTiposMaleta(): array
    {
        return [
            'Maleta de 8 kg' => 'Maleta de 8 kg',
            'Maleta de 23 kg' => 'Maleta de 23 kg',
        ];
    }

    /**
     * Scope para filtrar por hijo
     */
    public function scopeByHijo($query, $hijoId)
    {
        return $query->where('hijo_id', $hijoId);
    }

    /**
     * Scope para filtrar por tipo de maleta
     */
    public function scopeByTipoMaleta($query, $tipo)
    {
        return $query->where('tip_maleta', $tipo);
    }

    /**
     * Obtener las imágenes como array
     */
    public function getImagenesAttribute()
    {
        $imagenes = [];
        if ($this->images) $imagenes[] = $this->images;
        if ($this->images1) $imagenes[] = $this->images1;
        if ($this->images2) $imagenes[] = $this->images2;
        return array_filter($imagenes);
    }
}