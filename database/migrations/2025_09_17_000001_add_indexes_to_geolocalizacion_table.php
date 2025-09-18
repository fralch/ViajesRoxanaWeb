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
        Schema::table('geolocalizacion', function (Blueprint $table) {
            // Composite index for frequent queries
            $table->index(['hijo_id', 'created_at'], 'idx_hijo_created');

            // Index for cleanup operations
            $table->index('created_at', 'idx_created_at');
        });

        // Add index to hijos table for doc_numero searches
        Schema::table('hijos', function (Blueprint $table) {
            $table->index('doc_numero', 'idx_doc_numero');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('geolocalizacion', function (Blueprint $table) {
            $table->dropIndex('idx_hijo_created');
            $table->dropIndex('idx_created_at');
        });

        Schema::table('hijos', function (Blueprint $table) {
            $table->dropIndex('idx_doc_numero');
        });
    }
};