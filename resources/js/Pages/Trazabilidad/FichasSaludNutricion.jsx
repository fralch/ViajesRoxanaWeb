import React from 'react';
import { Head, router } from '@inertiajs/react';

export default function FichasSaludNutricion({ hijo, padre, grupo, fichasSalud, fichasNutricion }) {
  const handleVolver = () => {
    router.get(`/nfc/${hijo?.doc_numero}`);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderFichaSalud = (ficha, index) => (
    <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Ficha de Salud #{index + 1}</h3>
      </div>

      {/* Datos básicos */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
          Datos Básicos de Salud
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-xl">
          <div>
            <label className="text-sm font-medium text-gray-600">Grupo Sanguíneo</label>
            <p className="text-gray-900 font-semibold text-lg">{ficha.grupo_sanguineo || 'No especificado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Factor RH</label>
            <p className="text-gray-900 font-semibold text-lg">{ficha.factor_rh || 'No especificado'}</p>
          </div>
        </div>
      </div>

      {/* Tratamientos actuales */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Tratamientos Actuales
        </h4>
        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600">¿Recibe tratamientos?</label>
            <p className="text-gray-900 font-semibold">{ficha.recibe_tratamientos || 'No especificado'}</p>
          </div>
          {ficha.recibe_tratamientos === 'Sí' && (
            <div className="space-y-3 mt-3 pt-3 border-t border-purple-200">
              {ficha.condicion_medica && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Condición Médica</label>
                  <p className="text-gray-900">{ficha.condicion_medica}</p>
                </div>
              )}
              {ficha.nombre_medicamento && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Medicamento</label>
                  <p className="text-gray-900">{ficha.nombre_medicamento}</p>
                </div>
              )}
              {ficha.frecuencia && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Frecuencia</label>
                  <p className="text-gray-900">{ficha.frecuencia}</p>
                </div>
              )}
              {ficha.quien_administra && (
                <div>
                  <label className="text-sm font-medium text-gray-600">¿Quién lo administra?</label>
                  <p className="text-gray-900">{ficha.quien_administra}</p>
                </div>
              )}
              {ficha.observaciones && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Observaciones</label>
                  <p className="text-gray-900 text-sm">{ficha.observaciones}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enfermedades preexistentes */}
      {ficha.detalle_enfermedad && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Enfermedades Preexistentes
          </h4>
          <div className="bg-blue-50 p-4 rounded-xl space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Detalle</label>
              <p className="text-gray-900">{ficha.detalle_enfermedad}</p>
            </div>
            {ficha.medicamento_enfermedad && (
              <div>
                <label className="text-sm font-medium text-gray-600">Medicamento</label>
                <p className="text-gray-900">{ficha.medicamento_enfermedad}</p>
              </div>
            )}
            {ficha.frecuencia_enfermedad && (
              <div>
                <label className="text-sm font-medium text-gray-600">Frecuencia</label>
                <p className="text-gray-900">{ficha.frecuencia_enfermedad}</p>
              </div>
            )}
            {ficha.quien_administra_enfermedad && (
              <div>
                <label className="text-sm font-medium text-gray-600">¿Quién lo administra?</label>
                <p className="text-gray-900">{ficha.quien_administra_enfermedad}</p>
              </div>
            )}
            {ficha.observaciones_enfermedad && (
              <div>
                <label className="text-sm font-medium text-gray-600">Observaciones</label>
                <p className="text-gray-900 text-sm">{ficha.observaciones_enfermedad}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alergias */}
      {ficha.detalle_alergia && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Alergias Médicas
          </h4>
          <div className="bg-amber-50 p-4 rounded-xl space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Detalle de Alergia</label>
              <p className="text-gray-900">{ficha.detalle_alergia}</p>
            </div>
            {ficha.medicamento_control && (
              <div>
                <label className="text-sm font-medium text-gray-600">Medicamento de Control</label>
                <p className="text-gray-900">{ficha.medicamento_control}</p>
              </div>
            )}
            {ficha.frecuencia_alergia && (
              <div>
                <label className="text-sm font-medium text-gray-600">Frecuencia</label>
                <p className="text-gray-900">{ficha.frecuencia_alergia}</p>
              </div>
            )}
            {ficha.quien_administra_alergia && (
              <div>
                <label className="text-sm font-medium text-gray-600">¿Quién lo administra?</label>
                <p className="text-gray-900">{ficha.quien_administra_alergia}</p>
              </div>
            )}
            {ficha.observaciones_alergia && (
              <div>
                <label className="text-sm font-medium text-gray-600">Observaciones</label>
                <p className="text-gray-900 text-sm">{ficha.observaciones_alergia}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vacunas */}
      {ficha.vacunas_checklist && Array.isArray(ficha.vacunas_checklist) && ficha.vacunas_checklist.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Vacunas Recibidas
          </h4>
          <div className="bg-indigo-50 p-4 rounded-xl">
            <div className="flex flex-wrap gap-2 mb-3">
              {ficha.vacunas_checklist.map((vacuna, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-sm font-medium">
                  ✓ {vacuna}
                </span>
              ))}
            </div>
            {ficha.vacunas_checklist.includes('COVID-19') && (
              <div className="mt-3 pt-3 border-t border-indigo-200 space-y-2">
                {ficha.dosis_covid && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Dosis COVID-19</label>
                    <p className="text-gray-900">{ficha.dosis_covid}</p>
                  </div>
                )}
                {ficha.efectos_covid && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Efectos Secundarios</label>
                    <p className="text-gray-900">{ficha.efectos_covid}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seguro médico */}
      {ficha.tiene_seguro_particular && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Seguro Médico
          </h4>
          <div className="bg-cyan-50 p-4 rounded-xl space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">¿Tiene seguro particular?</label>
              <p className="text-gray-900 font-semibold">{ficha.tiene_seguro_particular}</p>
            </div>
            {ficha.tiene_seguro_particular === 'Sí' && (
              <div className="space-y-3 mt-3 pt-3 border-t border-cyan-200">
                {ficha.nombre_seguro && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre del Seguro</label>
                    <p className="text-gray-900">{ficha.nombre_seguro}</p>
                  </div>
                )}
                {ficha.administradora && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Administradora</label>
                    <p className="text-gray-900">{ficha.administradora}</p>
                  </div>
                )}
                {ficha.numero_poliza && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nº de Póliza</label>
                    <p className="text-gray-900">{ficha.numero_poliza}</p>
                  </div>
                )}
                {ficha.telefono_contacto && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Teléfono de Contacto</label>
                    <p className="text-gray-900">{ficha.telefono_contacto}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Información adicional */}
      {ficha.informacion_adicional && (
        <div className="mt-6 pt-4 border-t border-gray-300">
          <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Información Adicional
          </h4>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-900 text-sm">{ficha.informacion_adicional}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderFichaNutricion = (ficha, index) => (
    <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Ficha de Nutrición #{index + 1}</h3>
      </div>

      {/* Alergias alimentarias */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          Alergias Alimentarias
        </h4>
        <div className="bg-orange-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600">¿Tiene alergias alimentarias?</label>
            <p className="text-gray-900 font-semibold">{ficha.tiene_alergia_alimentaria || 'No especificado'}</p>
          </div>
          {ficha.tiene_alergia_alimentaria === 'Sí' && (
            <div className="space-y-3 mt-3 pt-3 border-t border-orange-200">
              {ficha.alimento_alergia && ficha.alimento_alergia !== '__NO_APLICA__' && (
                <div>
                  <label className="text-sm font-medium text-gray-600">¿A qué alimento?</label>
                  <p className="text-gray-900">{ficha.alimento_alergia}</p>
                </div>
              )}
              {ficha.reaccion_alergia && (
                <div>
                  <label className="text-sm font-medium text-gray-600">¿Qué reacción le produce?</label>
                  <p className="text-gray-900">{ficha.reaccion_alergia}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alimentos que evita */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
          Restricciones Alimentarias
        </h4>
        <div className="bg-red-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600">¿Evita algún alimento?</label>
            <p className="text-gray-900 font-semibold">{ficha.evita_alimentos || 'No especificado'}</p>
          </div>
          {ficha.evita_alimentos === 'Sí' && ficha.alimento_evitar && ficha.alimento_evitar !== '__NO_APLICA__' && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <label className="text-sm font-medium text-gray-600">Alimento(s) que evita</label>
              <p className="text-gray-900">{ficha.alimento_evitar}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dieta especial */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Dieta Especial
        </h4>
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600">¿Sigue alguna dieta especial?</label>
            <p className="text-gray-900 font-semibold">{ficha.tiene_dieta_especial || 'No especificado'}</p>
          </div>
          {ficha.tiene_dieta_especial === 'Sí' && ficha.especificar_dieta && ficha.especificar_dieta !== '__NO_APLICA__' && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <label className="text-sm font-medium text-gray-600">Tipo de dieta</label>
              <p className="text-gray-900">{ficha.especificar_dieta}</p>
            </div>
          )}
        </div>
      </div>

      {/* Preferencias alimentarias */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          Preferencias Alimentarias
        </h4>
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-600">¿Tiene preferencias alimentarias importantes?</label>
            <p className="text-gray-900 font-semibold">{ficha.tiene_preferencia_alimentaria || 'No especificado'}</p>
          </div>
          {ficha.tiene_preferencia_alimentaria === 'Sí' && ficha.detalle_preferencia_alimentaria && ficha.detalle_preferencia_alimentaria !== '__NO_APLICA__' && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <label className="text-sm font-medium text-gray-600">Detalle</label>
              <p className="text-gray-900">{ficha.detalle_preferencia_alimentaria}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head title="Fichas de Salud y Nutrición" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Fichas de Salud y Nutrición
              </h1>
              <p className="text-blue-100 text-sm">
                Información médica y nutricional de {hijo?.nombres}
              </p>
            </div>

            {/* Información del niño */}
            <div className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{hijo?.nombres} {hijo?.apellidos}</h2>
                <p className="text-sm text-gray-500 mb-1">DNI: {hijo?.doc_numero}</p>
                <p className="text-sm text-gray-500">Fecha de Nacimiento: {formatearFecha(hijo?.fecha_nacimiento)}</p>
              </div>

              {/* Información del grupo */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Grupo:</p>
                    <p className="text-lg font-semibold text-blue-700">{grupo?.nombre || 'Nombre del Grupo'}</p>
                    {grupo?.paquete && (
                      <p className="text-sm text-blue-600">{grupo.paquete.nombre} - {grupo.paquete.destino}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fichas de Salud */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              Fichas de Salud
            </h2>
            {fichasSalud && fichasSalud.length > 0 ? (
              fichasSalud.map((ficha, index) => renderFichaSalud(ficha, index))
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p className="text-gray-500 text-lg">No hay fichas de salud registradas</p>
              </div>
            )}
          </div>

          {/* Fichas de Nutrición */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
              </svg>
              Fichas de Nutrición
            </h2>
            {fichasNutricion && fichasNutricion.length > 0 ? (
              fichasNutricion.map((ficha, index) => renderFichaNutricion(ficha, index))
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                </svg>
                <p className="text-gray-500 text-lg">No hay fichas de nutrición registradas</p>
              </div>
            )}
          </div>

          {/* Botón para volver */}
          <div className="text-center">
            <button 
              onClick={handleVolver}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:from-gray-600 hover:to-gray-700 flex items-center justify-center mx-auto"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Volver a Trazabilidad
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Sistema de Trazabilidad • {new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}