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
        Schema::table('nutricion_fichas', function (Blueprint $table) {
            // Eliminar los campos antiguos que ya no se usan
            $table->dropColumn([
                'restricciones',
                'preferencias',
                'alergias_alimentarias',
                'intolerancias',
                'otras_notas'
            ]);

            // Agregar los nuevos campos
            $table->text('alimento_alergia')->nullable()->after('package_id'); // Visible en pulsera
            $table->text('reaccion_alergia')->nullable()->after('alimento_alergia'); // Visible en pulsera
            $table->text('alimento_evitar')->nullable()->after('reaccion_alergia'); // Visible en pulsera
            $table->text('especificar_dieta')->nullable()->after('alimento_evitar'); // Visible en pulsera
            $table->text('detalle_preferencia_alimentaria')->nullable()->after('especificar_dieta'); // No visible en pulsera
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nutricion_fichas', function (Blueprint $table) {
            // Volver a agregar los campos antiguos
            $table->text('restricciones')->nullable()->after('package_id');
            $table->text('preferencias')->nullable();
            $table->text('alergias_alimentarias')->nullable();
            $table->text('intolerancias')->nullable();
            $table->text('otras_notas')->nullable();

            // Eliminar los nuevos campos
            $table->dropColumn([
                'alimento_alergia',
                'reaccion_alergia',
                'alimento_evitar',
                'especificar_dieta',
                'detalle_preferencia_alimentaria'
            ]);
        });
    }
};