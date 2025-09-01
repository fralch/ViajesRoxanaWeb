import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Swal from 'sweetalert2';

export default function Mensaje({ auth, grupo, errors = {} }) {
  const [data, setData] = useState({
    descripcion: '',
    grupo_id: grupo?.id || '',
    latitud: null,
    longitud: null
  });
  const [processing, setProcessing] = useState(false);
  const [geoloading, setGeoloading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalización no soportada por este navegador');
      return;
    }

    setGeoloading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setData(prev => ({
          ...prev,
          latitud: position.coords.latitude,
          longitud: position.coords.longitude
        }));
        setGeoloading(false);
      },
      (error) => {
        let errorMessage = 'Error obteniendo ubicación';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo agotado obteniendo ubicación';
            break;
        }
        setGeoError(errorMessage);
        setGeoloading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Pedir geolocalización automáticamente al cargar el componente
  useEffect(() => {
    getGeolocation();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!data.descripcion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa un mensaje para enviar.',
        confirmButtonColor: '#059669'
      });
      return;
    }

    if (!data.latitud || !data.longitud) {
      Swal.fire({
        icon: 'warning',
        title: 'Ubicación requerida',
        text: 'Por favor, obtén tu ubicación antes de enviar el mensaje.',
        confirmButtonColor: '#059669'
      });
      return;
    }

    setProcessing(true);
    
    // Enviar mensaje al backend para guardarlo en la tabla trazabilidad para todos los hijos del grupo
    router.post(`/trazabilidad/mensaje/${grupo.id}`, {
      descripcion: data.descripcion,
      latitud: data.latitud,
      longitud: data.longitud
    }, {
      onError: (errors) => {
        console.error('Error al guardar mensaje:', errors);
        
        if (errors.descripcion) {
          Swal.fire({
            icon: 'error',
            title: 'Error de validación',
            text: errors.descripcion,
            confirmButtonColor: '#059669'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al configurar el mensaje. Por favor, intenta nuevamente.',
            confirmButtonColor: '#059669'
          });
        }
        
        setProcessing(false);
      }
    });
  };

  const handleBack = () => {
    router.visit('/trazabilidad');
  };

  return (
    <AuthenticatedLayout header="Configurar Mensaje">
      <Head title="Trazabilidad - Configurar Mensaje" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Header responsivo */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 lg:top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                <span className="font-medium">Volver a grupos</span>
              </button>
              <div className="text-center">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900">Configurar Mensaje</h1>
                <p className="text-sm lg:text-base text-gray-600 mt-1">Define el mensaje para los padres</p>
              </div>
              <div className="w-32 lg:w-40"></div> {/* Spacer para centrar el título */}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Información del grupo */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{grupo?.nombre || 'Grupo Ejemplo'}</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-green-100 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-700">Activo</span>
                  </div>
                  <span className="text-sm text-gray-500">ID: {grupo?.id}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v0"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Paquete</p>
                  <p className="text-sm text-gray-600">{grupo?.paquete?.nombre || 'Paquete de ejemplo'}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v0"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Duración</p>
                  <p className="text-sm text-gray-600">
                    {grupo?.fecha_inicio && grupo?.fecha_fin 
                      ? `${formatDate(grupo.fecha_inicio)} - ${formatDate(grupo.fecha_fin)}`
                      : 'Fechas de ejemplo'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Campo de mensaje personalizado - MOVIDO AQUÍ */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6 lg:mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <InputLabel htmlFor="descripcion" value="Mensaje personalizado" className="text-lg font-semibold" />
            </div>
            
            <textarea
              id="descripcion"
              value={data.descripcion}
              onChange={(e) => setData(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
              rows={5}
              placeholder="Escribe tu mensaje personalizado aquí... Ejemplo: Los niños han llegado de forma segura a [ubicación] y están participando en las actividades programadas."
            />
            
            <InputError message={errors.descripcion} className="mt-2" />
            
            <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
              <span>Este mensaje se enviará junto con la ubicación GPS</span>
              <span className={`font-medium ${
                (data.descripcion?.length || 0) > 450 ? 'text-red-500' : 
                (data.descripcion?.length || 0) > 400 ? 'text-orange-500' : 'text-gray-500'
              }`}>{data.descripcion?.length || 0}/500</span>
            </div>
          </div>

          {/* Sección de Geolocalización */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6 lg:mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Ubicación GPS</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-4 sm:mb-0 flex-1">
                {data.latitud && data.longitud ? (
                  <div className="flex items-center text-green-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="font-medium">Ubicación obtenida</span>
                    <span className="ml-2 text-sm text-gray-600">
                      ({data.latitud.toFixed(6)}, {data.longitud.toFixed(6)})
                    </span>
                  </div>
                ) : geoError ? (
                  <div className="flex items-center text-red-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span className="font-medium">{geoError}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <span className="font-medium">Ubicación requerida para continuar</span>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={getGeolocation}
                disabled={geoloading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
              >
                {geoloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Obteniendo...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Obtener Ubicación
                  </>
                )}
              </button>
            </div>
            
            {geoError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  {geoError}. Por favor, permite el acceso a la ubicación en tu navegador e intenta nuevamente.
                </p>
              </div>
            )}
          </div>

          {/* Descripción del proceso */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-blue-900 mb-2">Configurar Mensaje de Notificación</h3>
                <p className="text-blue-700 text-sm lg:text-base mb-4">Este mensaje se enviará automáticamente a todos los padres cada vez que escanees una pulsera o tarjeta NFC.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-blue-700">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    Incluye ubicación GPS automática
                  </div>
                  <div className="flex items-center text-blue-700">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    Envío instantáneo por Whatsapp
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario con botones de acción */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <SecondaryButton 
                    type="button" 
                    onClick={handleBack}
                    className="flex-1 justify-center py-4 text-base"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Cancelar
                  </SecondaryButton>
                  
                  <PrimaryButton 
                    type="submit" 
                    disabled={processing || !data.descripcion.trim() || !data.latitud || !data.longitud}
                    className="flex-1 justify-center py-4 text-base bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-900"
                  >
                    {processing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Continuar al Escáner
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </div>
                    )}
                  </PrimaryButton>
                </div>
              </form>
            </div>

            {/* Panel lateral con información adicional - Solo desktop */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-32">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proceso</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-blue-600 font-bold text-xs">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Configura mensaje</p>
                      <p className="text-xs text-gray-600">Define qué información recibirán los padres</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-green-600 font-bold text-xs">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Escanea NFC</p>
                      <p className="text-xs text-gray-600">Registra ubicación y envía notificaciones</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-purple-600 font-bold text-xs">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Notificación enviada</p>
                      <p className="text-xs text-gray-600">Los padres reciben Whatsapp con ubicación</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Consejos</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Sé específico sobre la ubicación</li>
                    <li>• Incluye estado de seguridad</li>
                    <li>• Menciona actividad actual</li>
                    <li>• Mantén un tono tranquilizador</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
