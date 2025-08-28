import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import axios from 'axios';

export default function Scanner({ auth, grupo, mensaje, errors = {} }) {
  const [scanning, setScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [mensajeActual, setMensajeActual] = useState(mensaje || '');
  const [mostrarTablaHijos, setMostrarTablaHijos] = useState(false);
  const [hijosGrupo, setHijosGrupo] = useState([]);
  const [cargandoHijos, setCargandoHijos] = useState(false);

  useEffect(() => {
    // Obtener mensaje de la sesión si no viene del backend
    if (!mensaje) {
      const mensajeSesion = sessionStorage.getItem('mensaje_notificacion');
      if (mensajeSesion) {
        setMensajeActual(mensajeSesion);
      }
    }

    // Verificar soporte NFC
    if ('NDEFReader' in window) {
      setNfcSupported(true);
      // Iniciar escaneo automáticamente si NFC está soportado
      iniciarEscaneoAutomatico();
    }

    // Obtener ubicación actual
    obtenerUbicacion();
    
    // Obtener hijos del grupo
    obtenerHijosGrupo();
  }, [grupo.id, mensaje]);

  const iniciarEscaneoAutomatico = async () => {
    if (!location) {
      // Esperar a que la ubicación esté disponible
      const intervalId = setInterval(() => {
        if (location && nfcSupported && !scanning) {
          iniciarEscaneoNFC();
          clearInterval(intervalId);
        }
      }, 1000);
      
      // Limpiar el intervalo después de 30 segundos para evitar bucles infinitos
      setTimeout(() => {
        clearInterval(intervalId);
      }, 30000);
      return;
    }

    if (nfcSupported && !scanning) {
      await iniciarEscaneoNFC();
    }
  };

  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError('No se pudo obtener la ubicación. Verifica los permisos.');
          console.error('Error obteniendo ubicación:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError('Geolocalización no soportada en este dispositivo.');
    }
  };

  const iniciarEscaneoNFC = async () => {
    if (!nfcSupported) {
      alert('NFC no está soportado en este dispositivo.');
      return;
    }

    if (!location) {
      alert('Esperando ubicación GPS...');
      return;
    }

    try {
      setScanning(true);
      const ndef = new NDEFReader();
      
      await ndef.scan();
      
      ndef.addEventListener('reading', ({ message, serialNumber }) => {
        console.log('NFC tag detectado:', serialNumber);
        procesarEscaneoNFC(serialNumber);
        setScanning(false); // Detener escaneo después de detectar un tag
      });
      
    } catch (error) {
      console.error('Error iniciando escaneo NFC:', error);
      alert('Error al iniciar el escaneo NFC. Verifica los permisos.');
      setScanning(false);
    }
  };

  const procesarEscaneoNFC = async (nfcId) => {
    if (!location) {
      alert('Ubicación no disponible');
      return;
    }

    setProcessing(true);

    try {
      const dniFromNfc = nfcId.replace('NFC_', ''); // Extraer DNI del ID NFC

      // Obtener el hijo_id a partir del DNI
      const response = await axios.get(`/api/hijos/by-dni/${dniFromNfc}`);
      const hijo = response.data;

      if (!hijo) {
        alert('No se encontró un hijo con el DNI proporcionado.');
        return;
      }

      const nuevoRegistro = {
        id: Date.now(),
        nfc_id: nfcId,
        dni: dniFromNfc,
        timestamp: new Date().toLocaleTimeString('es-ES'),
        latitud: location.latitud,
        longitud: location.longitud,
        descripcion: mensajeActual || 'Ubicación registrada',
        estado: 'procesando'
      };

      setRegistros(prev => [nuevoRegistro, ...prev]);

      await axios.post('/trazabilidad/procesar-escaneo', {
        grupo_id: grupo.id,
        hijo_id: hijo.id,
        descripcion: mensajeActual || 'Ubicación registrada',
        latitud: location.latitud,
        longitud: location.longitud,
        nfc_id: nfcId
      });

      // Actualizar estado del registro
      setTimeout(() => {
        setRegistros(prev =>
          prev.map(reg =>
            reg.id === nuevoRegistro.id
              ? { ...reg, estado: 'completado' }
              : reg
          )
        );
      }, 1000);

    } catch (error) {
      console.error('Error procesando escaneo:', error);
      alert('Error al procesar el escaneo: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const detenerEscaneo = () => {
    setScanning(false);
    // Aquí se detendría el escaneo NFC real
  };

  const obtenerHijosGrupo = async () => {
    setCargandoHijos(true);
    try {
      const response = await axios.get(`/trazabilidad/${grupo.id}/hijos`);
      console.log('Datos de hijos obtenidos:', response.data);
      setHijosGrupo(response.data);
    } catch (error) {
      console.error('Error obteniendo hijos del grupo:', error);
      alert('Error al cargar los hijos del grupo');
    } finally {
      setCargandoHijos(false);
    }
  };

  const handleBack = () => {
    router.visit(`/trazabilidad/mensaje/${grupo?.id || ''}`);
  };

  const handleFinish = () => {
    router.visit('/trazabilidad');
  };



  return (
    <AuthenticatedLayout header="Escáner NFC">
      <Head title="Trazabilidad - Escáner NFC" />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        {/* Header responsivo */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 lg:top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                <span className="font-medium">Cambiar mensaje</span>
              </button>
              <div className="text-center">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900">Escáner NFC</h1>
                <p className="text-sm lg:text-base text-gray-600 mt-1">Registra ubicaciones y envía notificaciones</p>
              </div>
              <button
                onClick={handleFinish}
                className="flex items-center text-green-600 hover:text-green-700 transition-colors duration-200 group"
              >
                <span className="font-medium">Finalizar</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
                {/* Área de escaneo NFC */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200 p-8 text-center">
                <div className="mb-6">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    {scanning && (
                      <div className="absolute inset-0 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin"></div>
                    )}
                    <div className={`${scanning ? 'animate-pulse' : ''} z-10`}>
                      <svg className="w-16 h-16 lg:w-20 lg:h-20 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {scanning ? (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.5c3.5 0 6.5-3 6.5-6.5s-3-6.5-6.5-6.5-6.5 3-6.5 6.5 3 6.5 6.5 6.5z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                          </>
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                            <circle cx="12" cy="12" r="3" strokeWidth={2}/>
                          </>
                        )}
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                    {scanning ? 'Escáner NFC Activo' : 'Escáner NFC Listo'}
                  </h3>
                  
                  <p className="text-sm lg:text-base text-gray-600 mb-6 max-w-md mx-auto">
                    {scanning 
                      ? 'Escáner activo - Acerca cualquier pulsera NFC para registrar automáticamente la ubicación'
                      : nfcSupported 
                        ? 'El escáner se activará automáticamente cuando tengas ubicación GPS disponible' 
                        : 'NFC no está disponible en este dispositivo'
                    }
                  </p>
                </div>

                <div className="text-center">
                    {!nfcSupported ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                                <span className="text-sm font-medium text-yellow-800">
                                    NFC no está disponible en este dispositivo
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={`inline-flex items-center px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 ${
                                scanning 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : processing
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                        : !location
                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                                            : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                            }`}>
                                {scanning ? (
                                    <>
                                        <div className="animate-pulse w-6 h-6 bg-white rounded-full mr-3 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                        </div>
                                        Escáner Activo - Acerca una pulsera NFC
                                    </>
                                ) : processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                                        Procesando...
                                    </>
                                ) : !location ? (
                                    <>
                                        <div className="animate-pulse w-6 h-6 bg-white rounded-full mr-3 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            </svg>
                                        </div>
                                        Esperando ubicación GPS...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                        </svg>
                                        Escáner Listo - Sistema Preparado
                                    </>
                                )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-3">
                                {scanning 
                                    ? 'El escáner detectará automáticamente cualquier pulsera NFC que se acerque al dispositivo'
                                    : processing
                                        ? 'Enviando notificación y registrando ubicación...'
                                        : !location
                                            ? 'El escáner se activará automáticamente cuando la ubicación GPS esté disponible'
                                            : 'El escáner está listo y se activará automáticamente'
                                }
                            </p>
                            
                            {scanning && (
                                <button
                                    onClick={detenerEscaneo}
                                    className="mt-4 inline-flex items-center px-6 py-3 rounded-lg text-base font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6L9 15"/>
                                    </svg>
                                    Detener Escáner
                                </button>
                            )}
                        </>
                    )}
                </div>
              </div>
              
              {/* Información del grupo */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{grupo?.nombre || 'Grupo Ejemplo'}</h2>
                    <p className="text-sm lg:text-base text-gray-600">
                      {grupo?.paquete?.nombre} - {grupo?.paquete?.destino}
                    </p>
                  </div>
                  <div className="mt-4 lg:mt-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                      Escáner activo
                    </span>
                  </div>
                </div>
              </div>

              {/* Mensaje personalizable */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Mensaje de Notificación</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje configurado para enviar a los padres:
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 min-h-[100px] flex items-center">
                    {mensajeActual || 'No hay mensaje configurado'}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Este mensaje se enviará junto con la ubicación GPS actual
                    </p>
                    <span className="text-xs text-gray-400">
                      {mensajeActual.length} caracteres
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    💡 Para cambiar este mensaje, regresa a la pantalla anterior
                  </p>
                </div>
                
                {/* Vista previa del mensaje */}
                {mensajeActual && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">Vista previa del mensaje:</p>
                        <p className="text-sm text-blue-800 leading-relaxed">{mensajeActual}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Estado de ubicación */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Ubicación GPS</h3>
                  </div>
                  <button 
                    onClick={obtenerUbicacion}
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Actualizar
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  {location ? (
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-green-800 mb-1">Ubicación GPS obtenida</p>
                        <p className="text-sm text-green-600">Precisión: ±{Math.round(location.precision)} metros</p>
                        <p className="text-xs text-gray-500 mt-1">Lat: {location.latitud.toFixed(6)}, Lng: {location.longitud.toFixed(6)}</p>
                      </div>
                    </div>
                  ) : locationError ? (
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-red-800 mb-1">Error de ubicación</p>
                        <p className="text-sm text-red-600">{locationError}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-600"></div>
                      </div>
                      <div>
                        <p className="font-medium text-yellow-800 mb-1">Obteniendo ubicación GPS</p>
                        <p className="text-sm text-yellow-600">Por favor, permite el acceso a la ubicación</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            
            </div>

            {/* Columna lateral - Solo desktop */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-32">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-800">GPS</span>
                    </div>
                    <span className="text-xs text-green-600">{location ? 'Conectado' : 'Obteniendo...'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 ${nfcSupported ? 'bg-purple-500' : 'bg-gray-400'} rounded-full mr-2`}></div>
                      <span className="text-sm font-medium text-purple-800">NFC</span>
                    </div>
                    <span className="text-xs text-purple-600">{nfcSupported ? 'Disponible' : 'No soportado'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-blue-800">Escáner</span>
                    </div>
                    <span className="text-xs text-blue-600">{scanning ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-900 mb-3">Estadísticas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registros hoy:</span>
                      <span className="font-medium">{registros.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completados:</span>
                      <span className="font-medium">{registros.filter(r => r.estado === 'completado').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de registros */}
          {registros.length > 0 && (
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Registros de Hoy</h3>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {registros.length} {registros.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {registros.map((registro) => (
                    <div key={registro.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center flex-1">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold text-gray-900 text-base mr-3">DNI: {registro.dni}</span>
                            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">{registro.timestamp}</span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>NFC ID: {registro.nfc_id}</div>
                            <div>Ubicación: {registro.latitud?.toFixed(6)}, {registro.longitud?.toFixed(6)}</div>
                            <div>Mensaje: {registro.descripcion}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        {registro.estado === 'procesando' ? (
                          <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent mr-2"></div>
                            <span className="text-sm font-medium">Procesando...</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                            <span className="text-sm font-medium">Completado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabla de hijos del grupo */}
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div 
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setMostrarTablaHijos(!mostrarTablaHijos)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Hijos en este Grupo {cargandoHijos ? '(Cargando...)' : `(${hijosGrupo.length})`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Ver información de contacto de los padres
                    </p>
                  </div>
                </div>
                <div className={`transform transition-transform duration-200 ${mostrarTablaHijos ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
              
              {mostrarTablaHijos && (
                <div className="border-t border-gray-200">
                  {cargandoHijos ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Cargando información de los hijos...</p>
                    </div>
                  ) : hijosGrupo.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hijo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              DNI
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Padre/Madre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Teléfono
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {hijosGrupo.map((hijo) => (
                            <tr key={hijo.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {hijo.nombres}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {hijo.doc_numero}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {hijo.user ? hijo.user.name : 'No asignado'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {hijo.user?.phone ? (
                                    <div className="flex items-center">
                                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                      </svg>
                                      <span className="font-medium">{hijo.user.phone}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 italic">Sin teléfono</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {hijo.user?.email || 'Sin email'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      <p className="text-gray-500">No hay hijos inscritos en este grupo</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones de navegación - Solo móvil */}
          <div className="flex lg:hidden gap-4 mt-8 pt-6 border-t border-gray-200">
            <SecondaryButton 
              onClick={handleBack}
              className="flex-1 justify-center py-4 text-base"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"/>
              </svg>
              Cambiar Mensaje
            </SecondaryButton>
            
            <PrimaryButton 
              onClick={handleFinish}
              className="flex-1 justify-center py-4 text-base bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-900"
            >
              Finalizar
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            </PrimaryButton>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}