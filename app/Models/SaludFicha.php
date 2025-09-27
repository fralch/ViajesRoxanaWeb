<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaludFicha extends Model
{
    use HasFactory;

    protected $fillable = [
        'hijo_id',
        'package_id',
        'grupo_sanguineo',
        'factor_rh',
        'tratamientos_actuales',
        'enfermedades_preexistentes',
        'alergias_medicas',
        'vacunas_recibidas',
        'seguros_medicos',
        'informacion_adicional',
        'archivos_adjuntos'
    ];

    protected $casts = [
        'tratamientos_actuales' => 'array',
        'enfermedades_preexistentes' => 'array',
        'alergias_medicas' => 'array',
        'vacunas_recibidas' => 'array',
        'seguros_medicos' => 'array',
        'archivos_adjuntos' => 'array'
    ];

    public function hijo()
    {
        return $this->belongsTo(Hijo::class);
    }

    public function paquete()
    {
        return $this->belongsTo(Paquete::class, 'package_id');
    }

    /**
     * Convertir los datos JSON a estructura individual para el frontend
     */
    public function toArray()
    {
        $array = parent::toArray();

        // Extraer datos de tratamientos actuales
        $tratamiento = $this->tratamientos_actuales[0] ?? [];
        $array['recibe_tratamientos'] = !empty($tratamiento) ? 'Sí' : 'No';
        $array['condicion_medica'] = $tratamiento['condicion_medica'] ?? '';
        $array['nombre_medicamento'] = $tratamiento['medicamento'] ?? '';
        $array['frecuencia'] = $tratamiento['frecuencia'] ?? '';
        $array['quien_administra'] = $tratamiento['administrador'] ?? '';
        $array['observaciones'] = $tratamiento['observaciones'] ?? '';

        // Extraer datos de enfermedades preexistentes
        $enfermedad = $this->enfermedades_preexistentes[0] ?? [];
        $array['detalle_enfermedad'] = $enfermedad['enfermedad'] ?? '';
        $array['medicamento_enfermedad'] = $enfermedad['medicamento'] ?? '';
        $array['frecuencia_enfermedad'] = $enfermedad['frecuencia'] ?? '';
        $array['quien_administra_enfermedad'] = $enfermedad['administrador'] ?? '';
        $array['observaciones_enfermedad'] = $enfermedad['observaciones'] ?? '';

        // Extraer datos de alergias médicas
        $alergia = $this->alergias_medicas[0] ?? [];
        $array['detalle_alergia'] = $alergia['alergia'] ?? '';
        $array['medicamento_control'] = $alergia['medicamento_control'] ?? '';
        $array['frecuencia_alergia'] = $alergia['frecuencia'] ?? '';
        $array['quien_administra_alergia'] = $alergia['administrador'] ?? '';
        $array['observaciones_alergia'] = $alergia['observaciones'] ?? '';

        // Extraer datos de vacunas
        $vacunas = $this->vacunas_recibidas ?? [];
        $array['vacunas_checklist'] = [];
        foreach ($vacunas as $vacuna => $aplicada) {
            if ($aplicada === true && !in_array($vacuna, ['covid_dosis', 'covid_efectos'])) {
                $array['vacunas_checklist'][] = $vacuna;
            }
        }
        $array['dosis_covid'] = $vacunas['covid_dosis'] ?? '';
        $array['efectos_covid'] = $vacunas['covid_efectos'] ?? '';

        // Extraer datos de seguros
        $seguros = $this->seguros_medicos ?? [];
        $seguroParticular = collect($seguros)->first(function($seguro) {
            return $seguro['tipo'] === 'particular';
        });

        $array['tiene_seguro_particular'] = $seguroParticular ? 'Sí' : 'No';
        $array['nombre_seguro'] = $seguroParticular['nombre'] ?? '';
        $array['administradora'] = $seguroParticular['administradora'] ?? '';
        $array['numero_poliza'] = $seguroParticular['numero_poliza'] ?? '';
        $array['telefono_contacto'] = $seguroParticular['telefono_contacto'] ?? '';

        return $array;
    }
}