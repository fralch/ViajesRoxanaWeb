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
        Schema::create('equipajes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hijo_id');
            $table->string('nombre_item');
            $table->text('descripcion')->nullable();
            $table->integer('cantidad')->default(1);
            $table->enum('categoria', ['ropa', 'calzado', 'higiene', 'medicamentos', 'electronica', 'documentos', 'otros'])->default('otros');
            $table->decimal('peso_estimado', 8, 2)->nullable();
            $table->boolean('es_fragil')->default(false);
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->foreign('hijo_id')->references('id')->on('hijos')->onDelete('cascade');
            $table->index(['hijo_id', 'categoria']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipajes');
    }
};