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
        Schema::create('salud_fichas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hijo_id')->constrained('hijos');
            $table->foreignId('package_id')->nullable()->constrained('paquetes')->nullOnDelete();
            $table->text('alergias')->nullable();
            $table->text('medicamentos')->nullable();
            $table->string('seguros')->nullable();
            $table->string('emergencia_contacto')->nullable();
            $table->string('emergencia_telefono')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['hijo_id', 'package_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salud_fichas');
    }
};