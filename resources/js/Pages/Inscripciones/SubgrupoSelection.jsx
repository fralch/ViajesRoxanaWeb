import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function SubgrupoSelection({ paquete, grupo, subgrupos, error }) {
  const getCapacidadInfo = (subgrupo) => {
    const disponible = subgrupo.capacidad_maxima - (subgrupo.inscripciones_count || 0);
    const porcentajeOcupado = ((subgrupo.inscripciones_count || 0) / subgrupo.capacidad_maxima) * 100;

    return {
      disponible,
      ocupado: subgrupo.inscripciones_count || 0,
      total: subgrupo.capacidad_maxima,
      porcentajeOcupado: Math.round(porcentajeOcupado),
      lleno: disponible <= 0
    };
  };

  const getEncargadoInfo = (subgrupo) => {
    const principal = {
      nombre: subgrupo.nombre_encargado_principal,
      tipo: subgrupo.tipo_encargado_principal,
      celular: subgrupo.celular_encargado_principal
    };

    const secundario = subgrupo.nombre_encargado_secundario ? {
      nombre: subgrupo.nombre_encargado_secundario,
      tipo: subgrupo.tipo_encargado_secundario,
      celular: subgrupo.celular_encargado_secundario
    } : null;

    return { principal, secundario };
  };

  const getTipoEncargadoLabel = (tipo) => {
    const tipos = {
      padre: 'Padre',
      madre: 'Madre',
      tutor_legal: 'Tutor Legal',
      familiar: 'Familiar',
      otro: 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Head title={`Seleccionar Subgrupo - ${paquete?.nombre}`} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/imgs/logo-viajesroxana.png"
              alt="Viajes Roxana"
              className="h-16 w-auto"
              loading="lazy"
            />
          </div>

          {paquete && grupo && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Selecciona un Subgrupo
              </h1>
              <div className="text-gray-600">
                <p className="text-lg font-semibold text-blue-600">{paquete.nombre}</p>
                <p className="text-md">Grupo: {grupo.nombre}</p>
                {paquete.fecha_inicio && (
                  <p className="text-sm mt-2">
                    {paquete.fecha_inicio === paquete.fecha_fin ? (
                      `Fecha: ${new Date(paquete.fecha_inicio).toLocaleDateString('es-PE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}`
                    ) : (
                      `Del ${new Date(paquete.fecha_inicio).toLocaleDateString('es-PE')} al ${new Date(paquete.fecha_fin).toLocaleDateString('es-PE')}`
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-800 mb-2">No hay subgrupos disponibles</h2>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Subgroups Grid */}
        {subgrupos && subgrupos.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subgrupos.map((subgrupo) => {
                const capacidad = getCapacidadInfo(subgrupo);
                const encargados = getEncargadoInfo(subgrupo);

                return (
                  <div key={subgrupo.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{subgrupo.nombre}</h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          capacidad.lleno
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {capacidad.lleno ? 'Lleno' : 'Disponible'}
                        </span>
                      </div>

                      {subgrupo.descripcion && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{subgrupo.descripcion}</p>
                      )}

                      {/* Capacity Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Capacidad</span>
                          <span className="text-sm text-gray-600">
                            {capacidad.ocupado}/{capacidad.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              capacidad.porcentajeOcupado >= 90 ? 'bg-red-500' :
                              capacidad.porcentajeOcupado >= 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${capacidad.porcentajeOcupado}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {capacidad.disponible} cupos disponibles
                        </p>
                      </div>
                    </div>

                    {/* Encargados */}
                    <div className="p-6 bg-gray-50">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Encargados</h4>

                      {/* Encargado Principal */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs text-blue-600 font-medium">Principal</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{encargados.principal.nombre}</p>
                        <p className="text-xs text-gray-600">{getTipoEncargadoLabel(encargados.principal.tipo)}</p>
                        <p className="text-xs text-gray-500">{encargados.principal.celular}</p>
                      </div>

                      {/* Encargado Secundario */}
                      {encargados.secundario && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs text-gray-500 font-medium">Secundario</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{encargados.secundario.nombre}</p>
                          <p className="text-xs text-gray-600">{getTipoEncargadoLabel(encargados.secundario.tipo)}</p>
                          <p className="text-xs text-gray-500">{encargados.secundario.celular}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="p-6 pt-4">
                      {capacidad.lleno ? (
                        <button
                          disabled
                          className="w-full bg-gray-100 text-gray-400 py-3 px-4 rounded-xl font-semibold cursor-not-allowed"
                        >
                          Sin cupos disponibles
                        </button>
                      ) : (
                        <a
                          href={`/paquete/${paquete.id}/grupo/${grupo.id}/subgrupo/${subgrupo.id}/form`}
                          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Inscribirse en este subgrupo
                        </a>
                      )}
                    </div>

                    {/* Observaciones */}
                    {subgrupo.observaciones && (
                      <div className="px-6 pb-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <h5 className="text-xs font-medium text-yellow-800 mb-1">Observaciones</h5>
                              <p className="text-xs text-yellow-700">{subgrupo.observaciones}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 mb-4">
            ¿Necesitas ayuda? Contáctanos por WhatsApp
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://wa.me/51999999999"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}