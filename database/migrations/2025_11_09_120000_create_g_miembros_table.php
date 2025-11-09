<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('g_miembros', function (Blueprint $table) {
            $table->increments('id_usuario');
            $table->string('nombre');
            $table->string('dni');
            $table->date('fecha_nacimiento');
            $table->string('genero');
            $table->string('foto_perfil')->nullable();
            $table->string('estado'); // Activo/Inactivo
            $table->date('fecha_registro');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('g_miembros');
    }
};