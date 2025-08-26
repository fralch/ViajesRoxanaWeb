import { useState, useEffect } from 'react';
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

    const handleRefreshLocation = async () => {
        if (selectedChild && selectedChild.id) {
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

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success && data.location) {
                    setLastLocation(data.location);
                    setLastUpdate(new Date(data.location.timestamp));
                    
                    // Geocodificación inversa
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
        }
    };

    // Marcadores para el mapa usando datos de BD
    const markers = lastLocation ? [{
        longitude: lastLocation.longitude,
        latitude: lastLocation.latitude,
        title: `Ubicación de ${childName}`,
        description: currentAddress,
        color: '#EF4444',
        icon: '📍'
    }] : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
                onClick={onClose}
            ></div>
            <div className="relative bg-white rounded-3xl p-8 w-full max-w-6xl max-h-[90vh] overflow-auto shadow-2xl transform transition-all duration-300 scale-100">
                {/* Header del modal */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Ubicación en Tiempo Real</h2>
                            <p className="text-gray-600">{childName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Error de ubicación */}
                {locationError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-red-800 font-semibold">Error de Ubicación</p>
                                <p className="text-red-700 text-sm">{locationError}</p>
                            </div>
                            <button
                                onClick={handleRefreshLocation}
                                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                disabled={locationLoading}
                            >
                                {locationLoading ? 'Cargando...' : 'Reintentar'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Mapa Interactivo */}
                <div className="mb-6">
                    <ErrorBoundary>
                        <InteractiveMap
                            latitude={lastLocation ? lastLocation.latitude : 4.6097}
                            longitude={lastLocation ? lastLocation.longitude : -74.0817}
                            zoom={lastLocation ? 15 : 12}
                            height="450px"
                            markers={markers}
                            showControls={true}
                            className="rounded-2xl shadow-lg"
                            onMarkerClick={(marker) => {
                                console.log('Marcador clickeado:', marker);
                            }}
                        />
                    </ErrorBoundary>
                </div>

                {/* Grid de información en tiempo real */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-blue-900">Última Actualización</h3>
                        </div>
                        <p className="text-blue-800">
                            {lastUpdate ? (
                                `Hace ${Math.round((new Date() - lastUpdate) / 1000)} segundos`
                            ) : (
                                locationLoading ? 'Obteniendo ubicación...' : 'Sin datos'
                            )}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            {lastLocation ? 'Ubicación desde BD' : (locationLoading ? 'Cargando...' : 'Sin ubicación')}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-green-900">Dirección</h3>
                        </div>
                        <p className="text-green-800 text-sm leading-relaxed">
                            {currentAddress}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-purple-900">Coordenadas</h3>
                        </div>
                        <p className="text-purple-800 text-sm">
                            {lastLocation ? `${lastLocation.latitude.toFixed(6)}, ${lastLocation.longitude.toFixed(6)}` : 'No disponible'}
                        </p>
                        {lastLocation && (
                            <p className="text-xs text-purple-600 mt-1">
                                {lastLocation.human_time}
                            </p>
                        )}
                    </div>
                </div>

                {/* Controles y botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="flex gap-3">
                        <button 
                            onClick={handleRefreshLocation}
                            disabled={locationLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors duration-200 flex items-center gap-2"
                        >
                            {locationLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Actualizar Ubicación
                                </>
                            )}
                        </button>

                        {lastLocation && navigator.share && (
                            <button 
                                onClick={() => {
                                    navigator.share({
                                        title: `Ubicación de ${childName}`,
                                        text: currentAddress,
                                        url: `https://maps.google.com/?q=${lastLocation.latitude},${lastLocation.longitude}`
                                    });
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                            >
                                Compartir
                            </button>
                        )}
                    </div>

                    <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl">
                        Contactar al conductor
                    </button>
                </div>
            </div>
        </div>
    );
}