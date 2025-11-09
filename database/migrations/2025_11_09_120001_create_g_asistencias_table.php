<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('g_asistencias', function (Blueprint $table) {
            $table->increments('id_asistencia');
            $table->unsignedInteger('id_usuario');
            $table->date('fecha_asistencia');
            $table->time('hora_entrada');

            $table->index('id_usuario');
            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('g_miembros')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('g_asistencias');
    }
};