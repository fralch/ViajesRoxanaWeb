<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $defaultHash = Hash::make('12345678');
        
        Schema::table('g_miembros', function (Blueprint $table) use ($defaultHash) {
            $table->string('password')->default($defaultHash)->after('dni');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('g_miembros', function (Blueprint $table) {
            $table->dropColumn('password');
        });
    }
};
