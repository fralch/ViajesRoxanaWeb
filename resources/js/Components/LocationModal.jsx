import { useState, useMemo } from 'react';
import InteractiveMap from '@/Components/InteractiveMap';
import ErrorBoundary from '@/Components/ErrorBoundary';
import mapboxService from '@/services/mapboxService';

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

  const handleRefreshLocation = async () => {
    if (!selectedChild?.id) return;
    setLocationLoading(true);
    setLocationError(null);
    try {
      const response = await fetch(`/api/hijo-location/${selectedChild.id}/last`, {
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
      description: currentAddress,
      color: '#EF4444',
      icon: '📍'
    }] : []
  ), [lastLocation, childName, currentAddress]);

  if (!isOpen) return null;

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
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Ubicación de {childName} </h2>
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

          {/* Estado de conexión discreto */}
          <div className="absolute bottom-6 left-6 z-10">
            <div className="px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${lastLocation ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs font-medium text-gray-700">
                  {lastLocation ? 'Conectado' : 'Sin datos'}
                </span>
              </div>
            </div>
          </div>

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
