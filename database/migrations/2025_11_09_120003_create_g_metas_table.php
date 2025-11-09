<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('g_metas', function (Blueprint $table) {
            $table->increments('id_meta');
            $table->unsignedInteger('id_usuario');
            $table->string('descripcion');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->string('estado'); // Completada/En progreso

            $table->index('id_usuario');
            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('g_miembros')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('g_metas');
    }
};