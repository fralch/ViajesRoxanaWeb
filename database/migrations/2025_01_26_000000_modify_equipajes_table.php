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
        Schema::table('equipajes', function (Blueprint $table) {
            // Verificar si las columnas existen antes de eliminarlas
            $columnsToRemove = ['nombre_item', 'descripcion', 'cantidad', 'categoria', 'es_fragil', 'notas'];
            foreach($columnsToRemove as $column) {
                if (Schema::hasColumn('equipajes', $column)) {
                    $table->dropColumn($column);
                }
            }
            
            // Agregar nuevos campos con la sintaxis correcta
            $table->enum('tip_maleta', ['Maleta de 8 kg', 'Maleta de 23 kg'])->nullable()->after('hijo_id');
            $table->string('num_etiqueta', 100)->nullable()->after('tip_maleta');
            $table->string('color', 50)->nullable()->after('num_etiqueta');
            $table->text('caracteristicas')->nullable()->after('color');
            $table->decimal('peso', 8, 2)->nullable()->after('caracteristicas');
            $table->text('images')->nullable()->after('peso');
            $table->text('images1')->nullable()->after('images');
            $table->text('images2')->nullable()->after('images1');
            $table->string('lugar_regis', 255)->nullable()->after('images2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('equipajes', function (Blueprint $table) {
            // Verificar existencia antes de eliminar
            $columnsToRemove = ['tip_maleta', 'num_etiqueta', 'color', 'caracteristicas', 'peso', 'images', 'images1', 'images2', 'lugar_regis'];
            
            foreach($columnsToRemove as $column) {
                if (Schema::hasColumn('equipajes', $column)) {
                    $table->dropColumn($column);
                }
            }
            
            // Restaurar las columnas originales
            $table->string('nombre_item')->nullable();
            $table->text('descripcion')->nullable();
            $table->integer('cantidad')->nullable();
            $table->string('categoria')->nullable();
            $table->boolean('es_fragil')->default(false);
            $table->text('notas')->nullable();
        });
    }
};
