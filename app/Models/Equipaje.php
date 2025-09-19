<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Equipaje extends Model
{
    protected $table = 'equipajes';

    protected $fillable = [
        'hijo_id',
        'nombre_item',
        'descripcion',
        'cantidad',
        'categoria',
        'peso_estimado',
        'es_fragil',
        'notas',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'peso_estimado' => 'decimal:2',
        'es_fragil' => 'boolean',
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
     * Obtener las categorías disponibles
     */
    public static function getCategorias(): array
    {
        return [
            'ropa' => 'Ropa',
            'calzado' => 'Calzado',
            'higiene' => 'Higiene Personal',
            'medicamentos' => 'Medicamentos',
            'electronica' => 'Electrónicos',
            'documentos' => 'Documentos',
            'otros' => 'Otros',
        ];
    }

    /**
     * Obtener el nombre de la categoría
     */
    public function getCategoriaNameAttribute(): string
    {
        $categorias = self::getCategorias();
        return $categorias[$this->categoria] ?? $this->categoria;
    }

    /**
     * Scope para filtrar por categoría
     */
    public function scopeByCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    /**
     * Scope para filtrar por hijo
     */
    public function scopeByHijo($query, $hijoId)
    {
        return $query->where('hijo_id', $hijoId);
    }

    /**
     * Scope para items frágiles
     */
    public function scopeFragiles($query)
    {
        return $query->where('es_fragil', true);
    }
}