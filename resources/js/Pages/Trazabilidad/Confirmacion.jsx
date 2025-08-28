import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function Confirmacion({ hijo, padre, mensaje }) {
  const [countdown, setCountdown] = useState(10);
  const [processing, setProcessing] = useState(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Simular envío de notificación
    const sendTimer = setTimeout(() => {
      setProcessing(false);
      setSent(true);
    }, 3000);

    // Cuenta regresiva para cerrar la pestaña
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(sendTimer);
      clearInterval(countdownTimer);
    };
  }, []);

  return (
    <>
      <Head title="Enviando Trazabilidad" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Tarjeta principal */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header con animación */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {processing ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {processing ? 'Enviando Trazabilidad' : 'Trazabilidad Enviada'}
                </h1>
                <p className="text-green-100 text-sm">
                  {processing ? 'Procesando ubicación...' : 'Notificación enviada exitosamente'}
                </p>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Información del niño */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{hijo?.nombres || 'Nombre del Niño'}</h2>
                <p className="text-sm text-gray-500">DNI: {hijo?.doc_numero || 'Documento'}</p>
              </div>

              {/* Información del padre */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Enviando a:</p>
                    <p className="text-lg font-semibold text-green-700">{padre?.nombres || 'Nombre del Padre'}</p>
                    <p className="text-sm text-gray-500">{padre?.telefono || 'Teléfono'}</p>
                  </div>
                  {sent && (
                    <div className="text-green-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Mensaje */}
              {mensaje && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Mensaje enviado:</p>
                      <p className="text-sm text-blue-800">{mensaje}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estado del proceso */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${sent ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                    <span className="text-gray-700">Ubicación GPS registrada</span>
                  </div>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${sent ? 'bg-green-500' : processing ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-700">Notificación SMS enviada</span>
                  </div>
                  {sent && (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* Cuenta regresiva */}
              <div className="text-center pt-4 border-t border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                  <span className="text-2xl font-bold text-gray-700">{countdown}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Esta ventana se cerrará automáticamente en <span className="font-semibold">{countdown}</span> segundos
                </p>
                <button 
                  onClick={() => window.close()}
                  className="mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Cerrar ahora
                </button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Registro de trazabilidad • {new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}