// COMPONENTE DESHABILITADO - USO SimpleMap EN SU LUGAR
// Este componente causaba errores con forwardRef y dependencias pesadas
import React from 'react';

/**
 * COMPONENTE DESHABILITADO
 * Reemplazado por SimpleMap para evitar errores y dependencias pesadas
 */
const MapboxMap = (props) => {
    console.warn('MapboxMap está deshabilitado. Usa SimpleMap en su lugar.');
    return (
        <div className="p-8 text-center bg-gray-100 rounded-lg">
            <p className="text-gray-600">
                MapboxMap deshabilitado. Usa SimpleMap para mapas 2D simples.
            </p>
        </div>
    );
};

export default MapboxMap;