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
        Schema::create('grupos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('paquete_id');
            $table->string('nombre');
            $table->unsignedBigInteger('capacidad')->nullable();
            $table->string('tipo_encargado')->nullable();
            $table->string('nombre_encargado')->nullable();
            $table->string('celular_encargado')->nullable();
            $table->string('nombre_encargado_agencia')->nullable();
            $table->string('celular_encargado_agencia')->nullable();
            $table->boolean('activo');
            $table->foreign('paquete_id')->references('id')->on('paquetes')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grupos');
    }
};
