import React from 'react';

/**
 * Componente de controles personalizados para el mapa interactivo
 * Proporciona funcionalidades adicionales como centrar en ubicación, cambiar estilo, etc.
 */
const MapControls = ({ 
    onCenterLocation, 
    onToggleStyle, 
    onRefreshLocation, 
    isLoading = false,
    hasLocation = false,
    className = '' 
}) => {
    return (
        <div className={`absolute top-4 left-4 flex flex-col gap-2 z-20 ${className}`}>
            {/* Control para centrar en ubicación */}
            {hasLocation && (
                <button
                    onClick={onCenterLocation}
                    className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-200"
                    title="Centrar en ubicación"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            )}

            {/* Control para refrescar ubicación */}
            <button
                onClick={onRefreshLocation}
                disabled={isLoading}
                className="w-10 h-10 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-200"
                title="Actualizar ubicación"
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                )}
            </button>

            {/* Control para cambiar estilo de mapa */}
            <button
                onClick={onToggleStyle}
                className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-200"
                title="Cambiar estilo de mapa"
            >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            </button>
        </div>
    );
};

export default MapControls;