import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const GrupoCard = ({ grupo, onClick }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div 
      onClick={() => onClick(grupo)}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 group h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">{grupo.nombre}</h3>
        <div className="flex items-center bg-green-100 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs lg:text-sm font-medium text-green-700">Activo</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm lg:text-base text-gray-600">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v0"/>
            </svg>
          </div>
          <div>
            <p className="font-medium">{grupo.paquete?.nombre || 'Sin paquete'}</p>
            <p className="text-xs lg:text-sm text-gray-500">{grupo.paquete?.destino || 'Sin destino'}</p>
          </div>
        </div>
        
        <div className="flex items-center text-sm lg:text-base text-gray-600">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v0"/>
            </svg>
          </div>
          <div>
            <p className="font-medium">Duración del viaje</p>
            <p className="text-xs lg:text-sm text-gray-500">{formatDate(grupo.fecha_inicio)} - {formatDate(grupo.fecha_fin)}</p>
          </div>
        </div>
        
        <div className="flex items-center text-sm lg:text-base text-gray-600">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div>
            <p className="font-medium">Capacidad</p>
            <p className="text-xs lg:text-sm text-gray-500">{grupo.capacidad} personas máximo</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 lg:mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs lg:text-sm text-gray-500 font-medium">Clic para gestionar trazabilidad</span>
          <div className="flex items-center text-blue-500 group-hover:translate-x-1 transition-transform duration-200">
            <span className="hidden lg:inline text-sm font-medium mr-2">Iniciar</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Index({ auth, gruposActivos = [] }) {
  const [loading, setLoading] = useState(false);

  const handleGrupoClick = (grupo) => {
    // Navegar a la interfaz de configuración de mensaje
    router.visit(`/trazabilidad/mensaje/${grupo.id}`);
  };

  return (
    <AuthenticatedLayout header="Trazabilidad">
      <Head title="Trazabilidad - Grupos Activos" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header responsivo */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 lg:top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Grupos Activos HOY</h1>
                <p className="text-sm lg:text-base text-gray-600 mt-1">{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                  <span className="text-sm lg:text-base font-medium text-blue-700">
                    {gruposActivos.length} {gruposActivos.length === 1 ? 'grupo' : 'grupos'}
                  </span>
                </div>
                <div className="hidden lg:flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Tiempo real
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {gruposActivos.length === 0 ? (
            <div className="text-center py-12 lg:py-20">
              <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12 mx-auto max-w-md lg:max-w-lg">
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h3 className="text-lg lg:text-2xl font-semibold text-gray-900 mb-3">No hay grupos activos hoy</h3>
                <p className="text-gray-600 text-sm lg:text-base mb-6 lg:mb-8">No se encontraron grupos con fechas que coincidan con el día de hoy.</p>
                <Link 
                  href={route('grupos.index')} 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm lg:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Ver todos los grupos
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Grid responsivo para desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {gruposActivos.map((grupo) => (
                  <GrupoCard 
                    key={grupo.id} 
                    grupo={grupo} 
                    onClick={handleGrupoClick}
                  />
                ))}
              </div>
              
              {/* Información adicional para desktop */}
              <div className="hidden lg:block mt-8 pt-8 border-t border-gray-200">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Instrucciones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Seleccionar Grupo</h4>
                        <p className="text-sm text-gray-600">Haz clic en cualquier grupo activo para comenzar el proceso de trazabilidad.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-green-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Configurar Mensaje</h4>
                        <p className="text-sm text-gray-600">Define el mensaje que se enviará a los padres como notificación.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-purple-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Escanear NFC</h4>
                        <p className="text-sm text-gray-600">Usa el escáner para registrar ubicaciones y enviar notificaciones automáticas.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
