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
        Schema::create('hijos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('nombres');
            $table->string('doc_tipo');
            $table->string('doc_numero');
            $table->json('nums_emergencia')->nullable(); 
            $table->date('fecha_nacimiento')->nullable();
            $table->string('foto')->nullable();
            $table->string('pasatiempos')->nullable();
            $table->string('deportes')->nullable();
            $table->string('plato_favorito')->nullable();
            $table->string('color_favorito')->nullable();
            $table->text('informacion_adicional')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hijos');
    }
};
