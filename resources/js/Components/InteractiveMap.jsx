import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapControls from './MapControls';

/**
 * Componente de mapa interactivo usando Mapbox GL JS
 * Permite navegación completa, zoom, pan y marcadores interactivos
 */
const InteractiveMap = ({
    latitude = 4.6097,
    longitude = -74.0817,
    zoom = 13,
    width = '100%',
    height = '400px',
    markers = [],
    showControls = true,
    onMarkerClick = null,
    className = '',
    accessToken = null
}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const currentLocationMarkerRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Token de Mapbox
    const token = accessToken || window.mapboxToken || 'pk.eyJ1IjoiZnJhbGNoIiwiYSI6ImNtZXJ0ZGk1bzBhcDcyaXBxOGpvY3F5bjcifQ.jBkOkpE1eJoYVs-g5BifWA';

    useEffect(() => {
        if (map.current) return; // Inicializar mapa solo una vez

        try {
            mapboxgl.accessToken = token;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [longitude, latitude],
                zoom: zoom,
                attributionControl: false
            });

            // Agregar controles de navegación si están habilitados
            if (showControls) {
                map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
                map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
            }

            // Agregar control de geolocalización
            map.current.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true,
                    showUserHeading: true
                }),
                'top-right'
            );

            // Evento cuando el mapa se carga completamente
            map.current.on('load', () => {
                setMapLoaded(true);
                setMapError(null);
            });

            // Manejo de errores
            map.current.on('error', (e) => {
                console.error('Error del mapa:', e);
                setMapError('Error al cargar el mapa');
            });

        } catch (error) {
            console.error('Error inicializando mapa:', error);
            setMapError('Error al inicializar el mapa');
        }

        // Cleanup al desmontar el componente
        return () => {
            if (currentLocationMarkerRef.current) {
                currentLocationMarkerRef.current.remove();
            }
            markersRef.current.forEach(marker => marker.remove());
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    // Actualizar centro del mapa cuando cambian las coordenadas
    useEffect(() => {
        if (map.current && mapLoaded) {
            map.current.flyTo({
                center: [longitude, latitude],
                zoom: zoom,
                duration: 1000
            });
        }
    }, [latitude, longitude, zoom, mapLoaded]);

    // Crear marcador de ubicación actual
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Remover marcador de ubicación anterior si existe
        if (currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current.remove();
        }

        // Crear elemento para el marcador de ubicación actual
        const currentLocationEl = document.createElement('div');
        currentLocationEl.className = 'current-location-marker';
        currentLocationEl.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #3B82F6;
            border: 3px solid white;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 2px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            position: relative;
            animation: currentLocationPulse 2s infinite;
        `;

        // Agregar animación CSS para el marcador de ubicación
        if (!document.getElementById('current-location-styles')) {
            const style = document.createElement('style');
            style.id = 'current-location-styles';
            style.textContent = `
                @keyframes currentLocationPulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7), 0 2px 10px rgba(0,0,0,0.3);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0), 0 2px 10px rgba(0,0,0,0.3);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0), 0 2px 10px rgba(0,0,0,0.3);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Crear marcador de ubicación actual
        const currentLocationMarker = new mapboxgl.Marker(currentLocationEl)
            .setLngLat([longitude, latitude])
            .addTo(map.current);

        // Agregar popup para ubicación actual
        const currentLocationPopup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <div class="p-3">
                    <h3 class="font-semibold text-blue-600 mb-1">📍 Tu ubicación actual</h3>
                    <p class="text-sm text-gray-600">Lat: ${latitude.toFixed(6)}</p>
                    <p class="text-sm text-gray-600">Lng: ${longitude.toFixed(6)}</p>
                </div>
            `);
        currentLocationMarker.setPopup(currentLocationPopup);

        currentLocationMarkerRef.current = currentLocationMarker;
    }, [latitude, longitude, mapLoaded]);

    // Gestionar marcadores adicionales
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Limpiar marcadores existentes
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Agregar nuevos marcadores
        markers.forEach((markerData, index) => {
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.cssText = `
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background-color: ${markerData.color || '#EF4444'};
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                animation: pulse 2s infinite;
            `;
            
            if (markerData.icon) {
                el.textContent = markerData.icon;
            }

            const marker = new mapboxgl.Marker(el)
                .setLngLat([markerData.longitude, markerData.latitude])
                .addTo(map.current);

            // Agregar popup si hay título o descripción
            if (markerData.title || markerData.description) {
                const popup = new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                        <div class="p-2">
                            ${markerData.title ? `<h3 class="font-semibold text-gray-900 mb-1">${markerData.title}</h3>` : ''}
                            ${markerData.description ? `<p class="text-sm text-gray-600">${markerData.description}</p>` : ''}
                        </div>
                    `);
                marker.setPopup(popup);
            }

            // Evento click en marcador
            el.addEventListener('click', () => {
                if (onMarkerClick) {
                    onMarkerClick(markerData, index);
                }
            });

            markersRef.current.push(marker);
        });
    }, [markers, mapLoaded, onMarkerClick]);

    // Estilos CSS para animación de marcadores
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Función para centrar el mapa en la ubicación actual
    const handleCenterLocation = () => {
        if (map.current) {
            map.current.flyTo({
                center: [longitude, latitude],
                zoom: 15,
                duration: 1000
            });
        }
    };

    // Función para cambiar el estilo del mapa
    const handleToggleStyle = () => {
        const styles = [
            'mapbox://styles/mapbox/streets-v12',
            'mapbox://styles/mapbox/light-v11'
        ];
        
        const currentIndex = styles.indexOf(mapStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        const newStyle = styles[nextIndex];
        
        setMapStyle(newStyle);
        if (map.current) {
            map.current.setStyle(newStyle);
        }
    };

    // Función para refrescar la ubicación
    const handleRefreshLocation = () => {
        setIsRefreshing(true);
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude: newLat, longitude: newLng } = position.coords;
                    if (map.current) {
                        // Actualizar vista del mapa
                        map.current.flyTo({
                            center: [newLng, newLat],
                            zoom: 15,
                            duration: 1000
                        });
                        
                        // Actualizar marcador de ubicación actual
                        if (currentLocationMarkerRef.current) {
                            currentLocationMarkerRef.current.setLngLat([newLng, newLat]);
                            
                            // Actualizar popup con nuevas coordenadas
                            const newPopup = new mapboxgl.Popup({ offset: 25 })
                                .setHTML(`
                                    <div class="p-3">
                                        <h3 class="font-semibold text-blue-600 mb-1">📍 Tu ubicación actual</h3>
                                        <p class="text-sm text-gray-600">Lat: ${newLat.toFixed(6)}</p>
                                        <p class="text-sm text-gray-600">Lng: ${newLng.toFixed(6)}</p>
                                    </div>
                                `);
                            currentLocationMarkerRef.current.setPopup(newPopup);
                        }
                    }
                    setIsRefreshing(false);
                },
                (error) => {
                    console.error('Error obteniendo ubicación:', error);
                    setIsRefreshing(false);
                }
            );
        } else {
            setIsRefreshing(false);
        }
    };

    if (mapError) {
        return (
            <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ width, height }}>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-6">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600 font-medium">Error del Mapa</p>
                        <p className="text-gray-500 text-sm mt-1">{mapError}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Recargar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ width, height }}>
            <div ref={mapContainer} className="w-full h-full" />
            
            {/* Controles personalizados */}
            {showControls && (
                <MapControls
                    onCenterLocation={handleCenterLocation}
                    onToggleStyle={handleToggleStyle}
                    onRefreshLocation={handleRefreshLocation}
                    isLoading={isRefreshing}
                    hasLocation={latitude && longitude}
                />
            )}
            
            {/* Indicador de carga */}
            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Cargando mapa...</p>
                    </div>
                </div>
            )}

           

            {/* Botón para abrir en Google Maps */}
            {markers.length > 0 && mapLoaded && (
                <div className="absolute bottom-4 right-4 z-10">
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
        </div>
    );
};

export default InteractiveMap;