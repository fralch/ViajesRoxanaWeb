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
        Schema::create('nutricion_fichas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hijo_id')->constrained('hijos');
            $table->foreignId('package_id')->nullable()->constrained('paquetes')->nullOnDelete();
            $table->text('restricciones')->nullable();
            $table->text('preferencias')->nullable();
            $table->text('alergias_alimentarias')->nullable();
            $table->text('intolerancias')->nullable();
            $table->text('otras_notas')->nullable();
            $table->timestamps();

            $table->unique(['hijo_id', 'package_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nutricion_fichas');
    }
};