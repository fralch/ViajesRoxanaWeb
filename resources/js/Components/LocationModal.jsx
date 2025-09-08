import { useState, useMemo } from 'react';
import InteractiveMap from '@/Components/InteractiveMap';
import ErrorBoundary from '@/Components/ErrorBoundary';
import mapboxService from '@/services/mapboxService';
import { formatDateSafe } from '@/utils/dateUtils';

export default function LocationModal({ 
  isOpen, 
  onClose, 
  selectedChild,
  lastLocation,
  setLastLocation,
  currentAddress,
  setCurrentAddress,
  lastUpdate,
  setLastUpdate,
  locationLoading,
  setLocationLoading,
  locationError,
  setLocationError
}) {
  const childName = selectedChild?.nombres || 'Tu hijo';
  const [mapCenterOverride, setMapCenterOverride] = useState(null);

  // Función para crear fecha local sin problemas de zona horaria
  const createLocalDate = (dateString) => {
    if (!dateString) return null;
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
    }
    return new Date(dateString);
  };

  // Función para verificar si estamos dentro del rango de fechas del grupo
  const isWithinGroupDates = useMemo(() => {
    if (!selectedChild?.inscripciones || selectedChild.inscripciones.length === 0) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche para comparación de fechas

    // Verificar si alguna inscripción tiene fechas válidas
    return selectedChild.inscripciones.some(inscripcion => {
      const grupo = inscripcion.grupo;
      if (!grupo?.fecha_inicio || !grupo?.fecha_fin) {
        return false;
      }

      const fechaInicio = createLocalDate(grupo.fecha_inicio);
      const fechaFin = createLocalDate(grupo.fecha_fin);
      
      if (!fechaInicio || !fechaFin) {
        return false;
      }
      
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día final

      return today >= fechaInicio && today <= fechaFin;
    });
  }, [selectedChild]);

  const handleRefreshLocation = async () => {
    if (!selectedChild?.id) return;
    setLocationLoading(true);
    setLocationError(null);
    try {
      const response = await fetch(`/hijo-location/${selectedChild.id}/last`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();
      if (data.success && data.location) {
        setLastLocation(data.location);
        setLastUpdate(new Date(data.location.timestamp));

        try {
          const addressData = await mapboxService.reverseGeocode(
            data.location.longitude, 
            data.location.latitude
          );
          setCurrentAddress(addressData.address);
        } catch (geoError) {
          console.error('Error en geocodificación inversa:', geoError);
          setCurrentAddress('Dirección no disponible');
        }
      } else {
        setLocationError(data.message || 'No se encontró ubicación');
      }
    } catch (error) {
      console.error('Error refrescando ubicación:', error);
      setLocationError(error.message || 'Error al refrescar ubicación');
    } finally {
      setLocationLoading(false);
    }
  };

  const markers = useMemo(() => (
    lastLocation ? [{
      longitude: lastLocation.longitude,
      latitude: lastLocation.latitude,
      title: `Ubicación de ${childName}`,
      description: lastLocation.descripcion || currentAddress,
      color: '#EF4444',
      icon: '📍'
    }] : []
  ), [lastLocation, childName, currentAddress]);

  // No mostrar el modal si no está abierto o si no estamos dentro del rango de fechas del grupo
  if (!isOpen) return null;
  
  // Si estamos fuera del rango de fechas, mostrar mensaje informativo
  if (!isWithinGroupDates) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        
        <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ubicación no disponible</h2>
            </div>
            <button 
              onClick={onClose}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M3 7h18l-1 13a2 2 0 01-2 2H6a2 2 0 01-2-2L3 7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fuera del período de viaje</h3>
            <p className="text-gray-600 mb-4">
              La ubicación de <strong>{childName}</strong> solo está disponible durante las fechas del viaje del grupo.
            </p>
            
            {selectedChild?.inscripciones && selectedChild.inscripciones.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Fechas de viaje:</h4>
                {selectedChild.inscripciones.map((inscripcion, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    <strong>{inscripcion.grupo.nombre}:</strong> {' '}
                    {formatDateSafe(inscripcion.grupo.fecha_inicio)} - {' '}
                    {formatDateSafe(inscripcion.grupo.fecha_fin)}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Configuración optimizada para que el mapa ocupe ~90%
  const modalClasses = 'relative bg-white rounded-3xl w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl flex flex-col';
  const mapContainerClasses = 'flex-1 relative w-full';

  // Centro inicial del mapa
  const initialLat = lastLocation ? lastLocation.latitude : 4.6097;
  const initialLng = lastLocation ? lastLocation.longitude : -74.0817;
  const initialZoom = lastLocation ? 15 : 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className={modalClasses}>
        {/* Header compacto - ~10% */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Ubicación de {childName}</h2>
              {lastLocation?.descripcion && (
                <p className="text-sm text-gray-600 mt-1">{lastLocation.descripcion}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* MAPA - ~90% del espacio */}
        <div className={mapContainerClasses}>
          <div className="absolute inset-0 p-3">
            <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/10">
              <ErrorBoundary>
                <InteractiveMap
                  latitude={mapCenterOverride?.lat ?? initialLat}
                  longitude={mapCenterOverride?.lng ?? initialLng}
                  zoom={initialZoom}
                  height="100%"
                  markers={markers}
                  showControls={true}
                  className="!h-full w-full"
                  onMarkerClick={(marker) => {
                    console.log('Marcador clickeado:', marker);
                  }}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Controles flotantes mejorados */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
            {(!lastLocation || locationLoading) && (
              <button
                onClick={handleRefreshLocation}
                disabled={locationLoading}
                className="px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white hover:shadow-xl disabled:opacity-60 transition-all duration-200"
                title="Refrescar ubicación"
              >
                {locationLoading ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <span className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                    Cargando
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0014-7 9 9 0 00-9-9" />
                    </svg>
                    Refrescar
                  </span>
                )}
              </button>
            )}

           

          </div>

          {/* Información de ubicación */}
          {lastLocation && (
            <div className="absolute bottom-6 left-6 z-10 max-w-xs">
              <div className="px-4 py-3 rounded-xl bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${lastLocation ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 mb-1">
                      {lastLocation ? 'Última ubicación' : 'Sin datos'}
                    </div>
                    {lastLocation.descripcion && (
                      <div className="text-xs text-gray-700 font-medium mb-1">
                        {lastLocation.descripcion}
                      </div>
                    )}
                    {currentAddress && (
                      <div className="text-xs text-gray-600 truncate">
                        {currentAddress}
                      </div>
                    )}
                    {lastUpdate && (
                      <div className="text-xs text-gray-500 mt-1">
                        {lastUpdate.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estado de conexión discreto para cuando no hay ubicación */}
          {!lastLocation && (
            <div className="absolute bottom-6 left-6 z-10">
              <div className="px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-xs font-medium text-gray-700">Sin datos</span>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de error flotante */}
          {locationError && (
            <div className="absolute left-6 top-6 max-w-[90%] md:max-w-sm z-10">
              <div className="px-4 py-3 rounded-xl bg-red-50/95 backdrop-blur-sm border border-red-200 shadow-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-800 text-sm">Error de ubicación</p>
                    <p className="text-red-700 text-xs mt-1">{locationError}</p>
                  </div>
                  <button
                    onClick={() => setLocationError(null)}
                    className="flex-shrink-0 text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
