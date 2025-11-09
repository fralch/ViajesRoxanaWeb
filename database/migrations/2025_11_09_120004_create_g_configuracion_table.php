<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('g_configuracion', function (Blueprint $table) {
            $table->increments('id');
            $table->string('clave', 50)->unique();
            $table->text('valor');
            $table->string('descripcion', 255)->nullable();
        });

        // Seed initial QR token config
        DB::table('g_configuracion')->insert([
            'clave' => 'qr_checkin_token',
            'valor' => 'GYM_TOKEN_2025',
            'descripcion' => 'Token QR gimnasio',
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('g_configuracion');
    }
};