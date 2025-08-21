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
        Schema::create('geolocalizacion', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('paquete_id');
            $table->unsignedBigInteger('hijo_id');
            $table->string('latitud');
            $table->string('longitud');
            
            $table->foreign('paquete_id')->references('id')->on('paquetes')->onDelete('cascade');
            $table->foreign('hijo_id')->references('id')->on('hijos')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('geolocalizacion');
    }
};
