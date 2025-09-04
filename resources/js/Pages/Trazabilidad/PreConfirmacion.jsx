import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function PreConfirmacion({ hijo, padre, grupo }) {
  const [loading, setLoading] = useState(false);

  const handleConfirmarEnvio = () => {
    setLoading(true);
    
    // Obtener ubicación GPS y proceder con la confirmación
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Redirigir a la confirmación con las coordenadas
          router.get(window.location.pathname + '/confirmar', {
            lat: lat,
            lng: lng
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Proceder sin ubicación GPS
          router.get(window.location.pathname + '/confirmar');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      // Proceder sin ubicación GPS
      router.get(window.location.pathname + '/confirmar');
    }
  };

  return (
    <>
      <Head title="Confirmar Trazabilidad" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Tarjeta principal */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center" style={{background: 'linear-gradient(to right, #d52e27, #b91c1c)'}}>
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Confirmar Trazabilidad
              </h1>
              <p className="text-red-100 text-sm">
                Verificar datos antes de enviar
              </p>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Información del niño */}
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{hijo?.nombres || 'Nombre del Niño'}</h2>
                <p className="text-sm text-gray-500 mb-1">DNI: {hijo?.doc_numero || 'Documento'}</p>
              </div>

              {/* Información del grupo */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Grupo:</p>
                    <p className="text-lg font-semibold text-red-700">{grupo?.nombre || 'Nombre del Grupo'}</p>
                    {grupo?.paquete && (
                      <p className="text-sm text-red-600">{grupo.paquete.nombre} - {grupo.paquete.destino}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del padre */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">Se enviará notificación a:</p>
                    <p className="text-lg font-semibold text-green-700">{padre?.nombres || 'Nombre del Padre'}</p>
                    <p className="text-sm text-green-600">{padre?.telefono || 'Teléfono'}</p>
                  </div>
                </div>
              </div>

              {/* Botón de confirmación */}
              <div className="pt-4">
                <button 
                  onClick={handleConfirmarEnvio}
                  disabled={loading}
                  className="w-full text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{
                    background: loading ? '#9ca3af' : 'linear-gradient(to right, #d52e27, #b91c1c)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.background = 'linear-gradient(to right, #b91c1c, #991b1b)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.background = 'linear-gradient(to right, #d52e27, #b91c1c)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                      Enviar Trazabilidad al Papa
                    </>
                  )}
                </button>
              </div>

              {/* Información adicional */}
              <div className="text-center pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Se enviará una notificación por WhatsApp con la ubicación actual
                </p>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Sistema de Trazabilidad • {new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}