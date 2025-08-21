<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    
    protected $fillable = [
        'hijo_id',
        'user_id',
        'mensaje',
        'celular',
        'estado'
    ];

    protected $casts = [
        'estado' => 'string'
    ];

    public function hijo()
    {
        return $this->belongsTo(Hijo::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
