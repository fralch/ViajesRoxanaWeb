import axios from 'axios';

/**
 * Servicio para interactuar con Mapbox a través del backend Laravel
 */
class MapboxService {
    constructor() {
        this.baseURL = window.location.origin;
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        // Agregar token CSRF automáticamente
        const token = document.head.querySelector('meta[name="csrf-token"]');
        if (token) {
            this.axiosInstance.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        }
    }

    /**
     * Obtiene el token público de Mapbox de forma segura
     */
    async getAccessToken() {
        try {
            const response = await this.axiosInstance.get('/api/mapbox/token');
            return response.data.access_token;
        } catch (error) {
            console.error('Error obteniendo token de Mapbox:', error);
            throw new Error('No se pudo obtener el token de Mapbox');
        }
    }

    /**
     * Geocodificación inversa: convierte coordenadas en dirección
     * 
     * @param {number} longitude - Longitud
     * @param {number} latitude - Latitud
     * @returns {Promise<Object>} Información de la dirección
     */
    async reverseGeocode(longitude, latitude) {
        try {
            const response = await this.axiosInstance.post('/api/mapbox/reverse-geocode', {
                longitude,
                latitude
            });

            if (response.data.success) {
                return {
                    address: response.data.address,
                    components: response.data.components,
                    coordinates: response.data.coordinates
                };
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error en geocodificación inversa:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener la dirección');
        }
    }

    /**
     * Busca lugares usando Mapbox Search API
     * 
     * @param {string} query - Término de búsqueda
     * @param {Object} options - Opciones adicionales
     * @param {number} options.longitude - Longitud para proximidad
     * @param {number} options.latitude - Latitud para proximidad
     * @param {number} options.limit - Límite de resultados
     * @returns {Promise<Array>} Lista de lugares encontrados
     */
    async searchPlaces(query, options = {}) {
        try {
            const params = {
                query,
                ...options
            };

            const response = await this.axiosInstance.post('/api/mapbox/search-places', params);

            if (response.data.success) {
                return response.data.places;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error buscando lugares:', error);
            throw new Error(error.response?.data?.message || 'Error al buscar lugares');
        }
    }

    /**
     * Calcula la distancia entre dos puntos
     * 
     * @param {Object} from - Punto de origen {longitude, latitude}
     * @param {Object} to - Punto de destino {longitude, latitude}
     * @returns {Promise<Object>} Información de distancia
     */
    async calculateDistance(from, to) {
        try {
            const response = await this.axiosInstance.post('/api/mapbox/calculate-distance', {
                from,
                to
            });

            if (response.data.success) {
                return response.data.distance;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error calculando distancia:', error);
            throw new Error(error.response?.data?.message || 'Error al calcular distancia');
        }
    }

    /**
     * Obtiene la ruta entre dos puntos
     * 
     * @param {Object} from - Punto de origen {longitude, latitude}
     * @param {Object} to - Punto de destino {longitude, latitude}
     * @param {string} profile - Perfil de transporte (driving, walking, cycling)
     * @returns {Promise<Object>} Información de la ruta
     */
    async getRoute(from, to, profile = 'driving') {
        try {
            const response = await this.axiosInstance.post('/api/mapbox/get-route', {
                from,
                to,
                profile
            });

            if (response.data.success) {
                return response.data.route;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error obteniendo ruta:', error);
            throw new Error(error.response?.data?.message || 'Error al calcular la ruta');
        }
    }

    /**
     * Utilidades para formateo y cálculos locales
     */

    /**
     * Formatea distancia para mostrar
     * 
     * @param {number} meters - Distancia en metros
     * @returns {string} Distancia formateada
     */
    formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)} metros`;
        } else if (meters < 10000) {
            return `${(meters / 1000).toFixed(1)} km`;
        } else {
            return `${Math.round(meters / 1000)} km`;
        }
    }

    /**
     * Formatea duración para mostrar
     * 
     * @param {number} seconds - Duración en segundos
     * @returns {string} Duración formateada
     */
    formatDuration(seconds) {
        const minutes = Math.round(seconds / 60);
        
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            
            if (remainingMinutes === 0) {
                return `${hours}h`;
            } else {
                return `${hours}h ${remainingMinutes}min`;
            }
        }
    }

    /**
     * Calcula el centro de un conjunto de coordenadas
     * 
     * @param {Array} coordinates - Array de coordenadas [{longitude, latitude}, ...]
     * @returns {Object} Centro calculado {longitude, latitude}
     */
    calculateCenter(coordinates) {
        if (!coordinates || coordinates.length === 0) {
            return null;
        }

        if (coordinates.length === 1) {
            return coordinates[0];
        }

        let totalLat = 0;
        let totalLng = 0;

        coordinates.forEach(coord => {
            totalLat += coord.latitude;
            totalLng += coord.longitude;
        });

        return {
            latitude: totalLat / coordinates.length,
            longitude: totalLng / coordinates.length
        };
    }

    /**
     * Calcula los límites (bounds) de un conjunto de coordenadas
     * 
     * @param {Array} coordinates - Array de coordenadas
     * @returns {Object} Límites {north, south, east, west}
     */
    calculateBounds(coordinates) {
        if (!coordinates || coordinates.length === 0) {
            return null;
        }

        let north = coordinates[0].latitude;
        let south = coordinates[0].latitude;
        let east = coordinates[0].longitude;
        let west = coordinates[0].longitude;

        coordinates.forEach(coord => {
            if (coord.latitude > north) north = coord.latitude;
            if (coord.latitude < south) south = coord.latitude;
            if (coord.longitude > east) east = coord.longitude;
            if (coord.longitude < west) west = coord.longitude;
        });

        return { north, south, east, west };
    }

    /**
     * Valida si las coordenadas son válidas
     * 
     * @param {number} longitude - Longitud
     * @param {number} latitude - Latitud
     * @returns {boolean} Si las coordenadas son válidas
     */
    isValidCoordinates(longitude, latitude) {
        return (
            typeof longitude === 'number' &&
            typeof latitude === 'number' &&
            longitude >= -180 &&
            longitude <= 180 &&
            latitude >= -90 &&
            latitude <= 90 &&
            !isNaN(longitude) &&
            !isNaN(latitude)
        );
    }

    /**
     * Genera un color aleatorio para marcadores
     * 
     * @returns {string} Color en formato hexadecimal
     */
    generateRandomColor() {
        const colors = [
            '#FF5722', '#E91E63', '#9C27B0', '#673AB7',
            '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
            '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
            '#FFC107', '#FF9800', '#FF5722', '#795548'
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Convierte grados a radianes
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convierte radianes a grados
     */
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
}

// Crear instancia singleton
const mapboxService = new MapboxService();

export default mapboxService;