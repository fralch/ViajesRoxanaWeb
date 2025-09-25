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
        Schema::create('subgrupos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grupo_id')->constrained('grupos')->cascadeOnDelete();
            $table->string('nombre');
            $table->text('descripcion')->nullable();

            // Información del encargado principal
            $table->enum('tipo_encargado_principal', ['padre', 'madre', 'tutor_legal', 'familiar', 'otro']);
            $table->string('nombre_encargado_principal');
            $table->string('celular_encargado_principal');
            $table->string('email_encargado_principal')->nullable();

            // Información del encargado secundario (opcional)
            $table->enum('tipo_encargado_secundario', ['padre', 'madre', 'tutor_legal', 'familiar', 'otro'])->nullable();
            $table->string('nombre_encargado_secundario')->nullable();
            $table->string('celular_encargado_secundario')->nullable();
            $table->string('email_encargado_secundario')->nullable();

            // Configuración del subgrupo
            $table->integer('capacidad_maxima')->default(10);
            $table->boolean('activo')->default(true);
            $table->text('observaciones')->nullable();

            $table->timestamps();

            // Índices
            $table->index(['grupo_id', 'activo']);
            $table->index('nombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subgrupos');
    }
};