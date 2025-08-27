/**
 * Utilidades para manejo de fechas
 * Evita problemas de zona horaria al formatear fechas
 */

/**
 * Formatea una fecha de manera segura evitando problemas de zona horaria
 * @param {string} dateString - Fecha en formato string
 * @param {string} locale - Locale para formatear (por defecto 'es-ES')
 * @returns {string} - Fecha formateada
 */
export const formatDateSafe = (dateString, locale = 'es-ES') => {
    if (!dateString) return 'No definida';
    
    // Si la fecha viene en formato YYYY-MM-DD, crear fecha local
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
        return date.toLocaleDateString(locale);
    }
    
    // Para otros formatos, usar el método tradicional
    return new Date(dateString).toLocaleDateString(locale);
};

/**
 * Formatea un rango de fechas
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 * @param {string} locale - Locale para formatear (por defecto 'es-ES')
 * @returns {string} - Rango de fechas formateado
 */
export const formatDateRange = (startDate, endDate, locale = 'es-ES') => {
    const start = formatDateSafe(startDate, locale);
    const end = formatDateSafe(endDate, locale);
    
    if (start === 'No definida' && end === 'No definida') {
        return 'Fechas no definidas';
    }
    
    if (start === end) {
        return start; // Si son la misma fecha, mostrar solo una
    }
    
    return `${start} → ${end}`;
};