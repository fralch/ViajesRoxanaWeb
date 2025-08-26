import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejo de geolocalización HTML5
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.enableHighAccuracy - Precisión alta
 * @param {number} options.timeout - Timeout en milisegundos
 * @param {number} options.maximumAge - Edad máxima del cache en milisegundos
 * @param {boolean} options.watch - Si debe observar cambios de posición
 * 
 * @returns {Object} Estado y funciones de geolocalización
 */
export const useGeolocation = (options = {}) => {
    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 60000,
        watch = false
    } = options;

    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [supported, setSupported] = useState(false);
    
    // Verificar soporte de geolocalización
    useEffect(() => {
        setSupported('geolocation' in navigator);
    }, []);

    // Opciones para la API de geolocalización
    const geoOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge
    };

    // Callback de éxito
    const onSuccess = useCallback((position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        const timestamp = position.timestamp;

        setLocation({
            latitude,
            longitude,
            accuracy,
            altitude,
            heading,
            speed,
            timestamp: new Date(timestamp)
        });
        setError(null);
        setLoading(false);
    }, []);

    // Callback de error
    const onError = useCallback((err) => {
        let errorMessage = 'Error desconocido de geolocalización';
        
        switch (err.code) {
            case err.PERMISSION_DENIED:
                errorMessage = 'Acceso a la ubicación denegado por el usuario';
                break;
            case err.POSITION_UNAVAILABLE:
                errorMessage = 'Información de ubicación no disponible';
                break;
            case err.TIMEOUT:
                errorMessage = 'Tiempo de espera agotado para obtener la ubicación';
                break;
            default:
                errorMessage = `Error de geolocalización: ${err.message}`;
                break;
        }

        setError({
            code: err.code,
            message: errorMessage,
            originalError: err
        });
        setLoading(false);
    }, []);

    // Función para obtener la ubicación actual
    const getCurrentPosition = useCallback(() => {
        if (!supported) {
            setError({
                code: 'NOT_SUPPORTED',
                message: 'Geolocalización no soportada por el navegador',
                originalError: null
            });
            return Promise.reject(new Error('Geolocalización no soportada'));
        }

        setLoading(true);
        setError(null);

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    onSuccess(position);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: new Date(position.timestamp)
                    });
                },
                (err) => {
                    onError(err);
                    reject(err);
                },
                geoOptions
            );
        });
    }, [supported, onSuccess, onError, geoOptions]);

    // Observar cambios de posición
    useEffect(() => {
        if (!supported || !watch) return;

        setLoading(true);
        setError(null);

        const watchId = navigator.geolocation.watchPosition(
            onSuccess,
            onError,
            geoOptions
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [supported, watch, onSuccess, onError, geoOptions]);

    // Función para calcular distancia usando fórmula Haversine
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Radio de la Tierra en metros
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }, []);

    // Función para calcular distancia desde la ubicación actual
    const getDistanceFromCurrent = useCallback((latitude, longitude) => {
        if (!location) return null;
        return calculateDistance(location.latitude, location.longitude, latitude, longitude);
    }, [location, calculateDistance]);

    // Función para verificar si está dentro de un radio
    const isWithinRadius = useCallback((latitude, longitude, radiusInMeters) => {
        const distance = getDistanceFromCurrent(latitude, longitude);
        return distance !== null && distance <= radiusInMeters;
    }, [getDistanceFromCurrent]);

    // Función para obtener información de precisión
    const getAccuracyInfo = useCallback(() => {
        if (!location || !location.accuracy) return null;

        let level = 'baja';
        if (location.accuracy <= 5) level = 'excelente';
        else if (location.accuracy <= 20) level = 'buena';
        else if (location.accuracy <= 100) level = 'moderada';

        return {
            meters: Math.round(location.accuracy),
            level,
            description: `Precisión ${level} (±${Math.round(location.accuracy)}m)`
        };
    }, [location]);

    // Función para formatear coordenadas
    const formatCoordinates = useCallback((decimals = 6) => {
        if (!location) return null;

        return {
            latitude: location.latitude.toFixed(decimals),
            longitude: location.longitude.toFixed(decimals),
            formatted: `${location.latitude.toFixed(decimals)}, ${location.longitude.toFixed(decimals)}`
        };
    }, [location]);

    // Función para obtener información de velocidad
    const getSpeedInfo = useCallback(() => {
        if (!location || location.speed === null) return null;

        const speedMs = location.speed; // m/s
        const speedKmh = speedMs * 3.6; // km/h

        return {
            metersPerSecond: Math.round(speedMs * 100) / 100,
            kilometersPerHour: Math.round(speedKmh * 100) / 100,
            formatted: `${Math.round(speedKmh)} km/h`
        };
    }, [location]);

    // Función para limpiar el estado
    const clearLocation = useCallback(() => {
        setLocation(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        // Estado
        location,
        error,
        loading,
        supported,
        
        // Funciones
        getCurrentPosition,
        calculateDistance,
        getDistanceFromCurrent,
        isWithinRadius,
        getAccuracyInfo,
        formatCoordinates,
        getSpeedInfo,
        clearLocation,
        
        // Estado derivado
        hasLocation: location !== null,
        hasError: error !== null,
        isAccurate: location && location.accuracy && location.accuracy <= 20,
        coordinates: location ? [location.longitude, location.latitude] : null,
        
        // Información adicional
        lastUpdated: location?.timestamp,
        accuracy: location?.accuracy,
        altitude: location?.altitude,
        heading: location?.heading,
        speed: location?.speed
    };
};