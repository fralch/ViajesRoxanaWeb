import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';

export default function Confirmacion({ hijo, padre, mensaje, grupo, ubicacion }) {
  const [countdown, setCountdown] = useState(10);
  const [processing, setProcessing] = useState(true);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState(ubicacion || null);

  useEffect(() => {
    // Obtener ubicación GPS y enviar datos al backend
    const obtenerUbicacionYEnviar = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            setLocation({ latitud: lat, longitud: lng });
            
            // Enviar datos al backend si no se han enviado ya
            if (!ubicacion || (ubicacion.latitud === 0 && ubicacion.longitud === 0)) {
              enviarDatosUbicacion(lat, lng);
            } else {
              // Ya se tienen coordenadas válidas, marcar como procesado
              setTimeout(() => {
                setProcessing(false);
                setSent(true);
              }, 2000);
            }
          },
          (error) => {
            console.error('Error obteniendo ubicación:', error);
            // Si no se puede obtener ubicación, usar datos existentes
            setTimeout(() => {
              setProcessing(false);
              setSent(true);
            }, 2000);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        // Geolocalización no soportada, usar datos existentes
        setTimeout(() => {
          setProcessing(false);
          setSent(true);
        }, 2000);
      }
    };

    // Función para enviar datos de ubicación al backend
    const enviarDatosUbicacion = (lat, lng) => {
      const url = window.location.pathname; // /nfc/{dni_hijo}
      const descripcion = mensaje ? mensaje.split('\n')[0] : ''; // Tomar solo la primera línea del mensaje
      
      router.reload({
        data: {
          lat: lat,
          lng: lng,
          descripcion: descripcion
        },
        onSuccess: () => {
          setProcessing(false);
          setSent(true);
        },
        onError: () => {
          setProcessing(false);
          setSent(true);
        }
      });
    };

    // Iniciar proceso de obtención de ubicación
    obtenerUbicacionYEnviar();

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

              {/* Ubicación GPS */}
              {location && location.latitud !== 0 && location.longitud !== 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 mb-1">Ubicación GPS capturada:</p>
                      <p className="text-xs text-green-700 mb-2">
                        Lat: {parseFloat(location.latitud).toFixed(6)}, Lng: {parseFloat(location.longitud).toFixed(6)}
                      </p>
                      <a 
                        href={`https://maps.google.com/maps?q=${location.latitud},${location.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        📍 Ver en Google Maps
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje */}
              {mensaje && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Mensaje enviado por WhatsApp:</p>
                      <p className="text-sm text-blue-800 whitespace-pre-line">{mensaje}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estado del proceso */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${(location && location.latitud !== 0 && location.longitud !== 0) ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}></div>
                    <span className="text-gray-700">Ubicación GPS registrada</span>
                  </div>
                  {(location && location.latitud !== 0 && location.longitud !== 0) && (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${sent ? 'bg-green-500' : processing ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-700">Notificación WhatsApp enviada</span>
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