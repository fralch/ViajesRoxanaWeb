<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'dni',
        'password', 
        'is_admin'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Relaciones
     */
    public function hijos()
    {
        return $this->hasMany(Hijo::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'usuario_id');
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class);
    }

    protected static function booted()
    {
        static::deleting(function ($user) {
            // Eliminar inscripciones asociadas directamente al usuario
            $user->inscripciones()->delete();

            // Eliminar notificaciones asociadas al usuario
            $user->notificaciones()->delete();

            // Eliminar hijos y sus datos relacionados
            $user->hijos()->each(function ($hijo) {
                $hijo->delete();
            });
        });
    }
}
