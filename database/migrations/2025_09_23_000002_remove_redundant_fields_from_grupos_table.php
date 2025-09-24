<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('grupos', function (Blueprint $table) {
            // Eliminar campos de encargados que ahora se manejan en subgrupos
            $table->dropColumn([
                'tipo_encargado',
                'nombre_encargado',
                'celular_encargado',
                'tipo_encargado_agencia',
                'nombre_encargado_agencia',
                'celular_encargado_agencia'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grupos', function (Blueprint $table) {
            // Restaurar campos en caso de rollback
            $table->json('tipo_encargado')->nullable();
            $table->json('nombre_encargado')->nullable();
            $table->json('celular_encargado')->nullable();
            $table->json('tipo_encargado_agencia')->nullable();
            $table->json('nombre_encargado_agencia')->nullable();
            $table->json('celular_encargado_agencia')->nullable();
        });
    }
};