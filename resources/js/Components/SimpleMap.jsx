import React, { useState, useEffect } from 'react';

/**
 * Componente de mapa 2D simple usando tiles estáticos
 * Sin dependencias pesadas como Mapbox GL JS
 */
const SimpleMap = ({ 
    latitude = 4.6097, 
    longitude = -74.0817, 
    zoom = 13,
    width = '100%', 
    height = '400px',
    markers = [],
    showControls = true,
    onMarkerClick = null,
    className = ''
}) => {
    const [currentZoom, setCurrentZoom] = useState(zoom);
    const [center, setCenter] = useState({ lat: latitude, lng: longitude });
    const [mapError, setMapError] = useState(false);

    // Función para generar URL de tile de OpenStreetMap
    const getTileUrl = (x, y, z) => {
        return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    };

    // Función para convertir lat/lng a coordenadas de píxel
    const latLngToPixel = (lat, lng, zoom) => {
        const n = Math.pow(2, zoom);
        const x = (lng + 180) / 360 * n;
        const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n;
        return { x: x * 256, y: y * 256 };
    };

    // Función para generar URL de mapa estático usando Mapbox Static API
    const getStaticMapUrl = () => {
        const baseUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static';
        
        // Construir marcadores para la URL
        let markersParam = '';
        if (markers.length > 0) {
            const markerStrings = markers.map(marker => {
                const color = (marker.color || '#FF0000').replace('#', '');
                return `pin-s+${color}(${marker.longitude},${marker.latitude})`;
            });
            markersParam = markersStrings.join(',') + '/';
        }

        // Si hay marcadores, centrar en el primer marcador, si no usar coordenadas por defecto
        const centerLng = markers.length > 0 ? markers[0].longitude : center.lng;
        const centerLat = markers.length > 0 ? markers[0].latitude : center.lat;

        return `${baseUrl}/${markersParam}${centerLng},${centerLat},${currentZoom}/800x600@2x?access_token=${window.mapboxToken || 'pk.eyJ1IjoiZnJhbGNoIiwiYSI6ImNtZXJ0ZGk1bzBhcDcyaXBxOGpvY3F5bjcifQ.jBkOkpE1eJoYVs-g5BifWA'}`;
    };

    // Función para generar mapa con OpenStreetMap (fallback)
    const getOSMStaticUrl = () => {
        const lat = markers.length > 0 ? markers[0].latitude : center.lat;
        const lng = markers.length > 0 ? markers[0].longitude : center.lng;
        
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
    };

    const handleZoomIn = () => {
        if (currentZoom < 18) {
            setCurrentZoom(currentZoom + 1);
        }
    };

    const handleZoomOut = () => {
        if (currentZoom > 1) {
            setCurrentZoom(currentZoom - 1);
        }
    };

    const handleImageError = () => {
        setMapError(true);
    };

    return (
        <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ width, height }}>
            {/* Mapa principal */}
            {!mapError ? (
                <img 
                    src={getStaticMapUrl()}
                    alt="Mapa de ubicación"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    loading="lazy"
                />
            ) : (
                // Fallback a iframe de OpenStreetMap
                <iframe
                    src={getOSMStaticUrl()}
                    className="w-full h-full border-0"
                    title="Mapa de ubicación"
                ></iframe>
            )}

            {/* Overlay con información de ubicación */}
            {markers.length > 0 && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-gray-800">Ubicación Actual</span>
                    </div>
                    {markers[0].description && (
                        <p className="text-sm text-gray-600 leading-tight">
                            {markers[0].description}
                        </p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                        {markers[0].latitude.toFixed(6)}, {markers[0].longitude.toFixed(6)}
                    </div>
                </div>
            )}

            {/* Controles de zoom */}
            {showControls && (
                <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
                    <button
                        onClick={handleZoomIn}
                        disabled={currentZoom >= 18}
                        className="w-10 h-10 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-200"
                        title="Acercar"
                    >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    <button
                        onClick={handleZoomOut}
                        disabled={currentZoom <= 1}
                        className="w-10 h-10 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-200"
                        title="Alejar"
                    >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Indicador de carga */}
            <div className="absolute bottom-4 right-4 bg-white/80 rounded-lg px-2 py-1 text-xs text-gray-600 z-10">
                Zoom: {currentZoom}
            </div>

            {/* Botón para abrir en Google Maps */}
            {markers.length > 0 && (
                <div className="absolute bottom-4 left-4 z-10">
                    <a
                        href={`https://www.google.com/maps?q=${markers[0].latitude},${markers[0].longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow-lg transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Abrir en Google Maps
                    </a>
                </div>
            )}

            {/* Mensaje de error si no se puede cargar ningún mapa */}
            {mapError && !markers.length && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-6">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-600 font-medium">Mapa no disponible</p>
                        <p className="text-gray-500 text-sm mt-1">No se pudo cargar la vista del mapa</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleMap;