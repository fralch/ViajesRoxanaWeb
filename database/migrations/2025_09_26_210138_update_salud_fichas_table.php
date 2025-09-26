<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Esta migración modifica la tabla 'salud_fichas' existente para:
     * 1. Eliminar campos antiguos que ya no se necesitan
     * 2. Agregar nuevos campos con estructura JSON para mayor flexibilidad
     * 3. Organizar la información según la nueva ficha médica requerida
     */
    public function up(): void
    {
        Schema::table('salud_fichas', function (Blueprint $table) {
            // =============================================
            // ELIMINAR CAMPOS ANTIGUOS
            // =============================================
            // Estos campos se eliminan porque la nueva estructura usa JSON
            // y organiza la información de manera más específica
            $table->dropColumn([
                'alergias',           // Se reemplaza por 'alergias_medicas' JSON
                'medicamentos',       // Se reemplaza por 'tratamientos_actuales' JSON
                'seguros',            // Se reemplaza por 'seguros_medicos' JSON
                'emergencia_contacto',// Ahora va en la tabla de contactos de emergencia
                'emergencia_telefono',// Ahora va en la tabla de contactos de emergencia
                'observaciones'       // Se reemplaza por 'informacion_adicional' e 'observaciones' en JSON
            ]);
            
            // =============================================
            // AGREGAR NUEVOS CAMPOS CON ESTRUCTURA MODERNA
            // =============================================
            

            
            // 🩸 DATOS BÁSICOS DE SALUD (visibles en pulsera 🟢)
                // Grupo sanguíneo del alumno para emergencias médicas
                $table->enum('grupo_sanguineo', ['O', 'A', 'B', 'AB'])->nullable();
                // Factor RH para completar la información sanguínea
                $table->enum('factor_rh', ['+', '-'])->nullable()->after('grupo_sanguineo');
            
            // 💊 TRATAMIENTOS ACTUALES (estructura JSON para múltiples tratamientos)
                // Almacena array de tratamientos médicos que el alumno recibe actualmente
                // Ejemplo: [{"condicion_medica": "Asma", "medicamento": "Salbutamol", "frecuencia": "Cada 8 horas", "administrador": "Enfermera", "observaciones": "Se agita al correr"}]
                $table->json('tratamientos_actuales')->nullable()->after('factor_rh');
                
            // 🏥 ENFERMEDADES PREEXISTENTES (estructura JSON para múltiples enfermedades)
                // Almacena array de condiciones médicas preexistentes del alumno
                // Ejemplo: [{"enfermedad": "Epilepsia", "medicamento": "Ácido valproico", "frecuencia": "1 vez al día", "administrador": "Mamá", "observaciones": "Crisis controladas"}]
                $table->json('enfermedades_preexistentes')->nullable()->after('tratamientos_actuales');
            
            // 🤧 ALERGIAS MÉDICAS (estructura JSON para múltiples alergias)
                // Almacena array de alergias a medicamentos o sustancias médicas
                // Ejemplo: [{"alergia": "Penicilina", "medicamento_control": "Loratadina", "frecuencia": "Cada 12 horas", "administrador": "Mamá", "observaciones": "Ronchas leves"}]
                $table->json('alergias_medicas')->nullable()->after('enfermedades_preexistentes');
            
            // 💉 VACUNAS RECIBIDAS (estructura JSON flexible)
                // Almacena objeto con el estado de todas las vacunas requeridas
                // Ejemplo: {"tetano": true, "rubeola": true, "covid": true}
                $table->json('vacunas_recibidas')->nullable()->after('alergias_medicas');
            
            // 🛡️ SEGUROS MÉDICOS (estructura JSON para múltiples seguros)
                // Almacena array de seguros médicos (agencia + particulares)
                // Estructura: [{"tipo": "agencia", "nombre": "Medix Travel", "administradora": "Medix", "numero_poliza": "VIAJE-2024-001", "telefono_contacto": "01 400 0000", "editable": false, "tooltip": "Seguro ya incluido en el viaje, no editable por los padres"}]
                $table->json('seguros_medicos')->nullable()->after('vacunas_recibidas');
            
            // 📝 INFORMACIÓN ADICIONAL (campo libre para observaciones)
                // Información médica adicional que no encaja en las categorías anteriores
                // Ejemplo: "Usa inhalador en las mañanas, antecedentes familiares de asma"
                $table->text('informacion_adicional')->nullable()->after('seguros_medicos');
            
            // 📎 ARCHIVOS ADJUNTOS (estructura JSON para múltiples archivos)
                // Rutas de archivos adjuntos como historial médico, recetas, etc.
                // Ejemplo: ["archivos/historial.pdf", "archivos/receta.jpg"]
                $table->json('archivos_adjuntos')->nullable()->after('informacion_adicional');
        });
    }

    /**
     * Reverse the migrations.
     * 
     * Esta función revierte todos los cambios realizados en la migración up()
     * Restaura la tabla a su estado original antes de la modificación
     */
    public function down(): void
    {
        Schema::table('salud_fichas', function (Blueprint $table) {
            // =============================================
            // REVERTIR: ELIMINAR NUEVOS CAMPOS AGREGADOS
            // =============================================
            $table->dropColumn([
                'foto_alumno',              // Eliminar campo de foto
                'grupo_sanguineo',          // Eliminar grupo sanguíneo
                'factor_rh',                // Eliminar factor RH
                'tratamientos_actuales',    // Eliminar tratamientos en JSON
                'enfermedades_preexistentes',// Eliminar enfermedades en JSON
                'alergias_medicas',         // Eliminar alergias en JSON
                'vacunas_recibidas',        // Eliminar vacunas en JSON
                'seguros_medicos',          // Eliminar seguros en JSON
                'informacion_adicional',    // Eliminar información adicional
                'archivos_adjuntos'         // Eliminar archivos adjuntos
            ]);
            
            // =============================================
            // REVERTIR: RECREAR CAMPOS ORIGINALES
            // =============================================
            $table->text('alergias')->nullable();                    // Alergias en texto plano
            $table->text('medicamentos')->nullable();                // Medicamentos en texto plano
            $table->string('seguros')->nullable();                   // Seguros en texto plano
            $table->string('emergencia_contacto')->nullable();       // Contacto de emergencia
            $table->string('emergencia_telefono')->nullable();       // Teléfono de emergencia
            $table->text('observaciones')->nullable();               // Observaciones generales
        });
    }
};