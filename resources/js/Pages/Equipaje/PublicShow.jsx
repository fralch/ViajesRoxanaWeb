import React from 'react';
import { Head } from '@inertiajs/react';

export default function PublicShow({ hijo, equipajes }) {
    const getTipoMaletaLabel = (tipo) => {
        const tiposMaleta = [
            { value: 'Maleta de 8 kg', label: 'Maleta de 8 kg' },
            { value: 'Maleta de 23 kg', label: 'Maleta de 23 kg' }
        ];
        const t = tiposMaleta.find(tm => tm.value === tipo);
        return t ? t.label : tipo;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            <Head title={`Equipaje de ${hijo.nombres}`} />

            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Equipaje Registrado</h1>
                            <p className="text-lg text-gray-600">
                                {hijo.nombres} - DNI: {hijo.doc_numero}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Equipaje Registrado
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {equipajes.length} {equipajes.length === 1 ? 'item registrado' : 'items registrados'}
                        </p>
                    </div>

                    {equipajes.length === 0 ? (
                        <div className="text-center py-16">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <h3 className="mt-4 text-xl font-medium text-gray-900">No hay equipaje registrado</h3>
                            <p className="mt-2 text-gray-500">
                                Aún no se ha registrado equipaje para {hijo.nombres}.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {equipajes.map((equipaje) => (
                                <div key={equipaje.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-semibold text-xl text-gray-900">Equipaje #{equipaje.id}</h4>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            equipaje.tip_maleta === 'Maleta de 23 kg'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {getTipoMaletaLabel(equipaje.tip_maleta)}
                                        </span>
                                    </div>

                                    <div className="space-y-3 text-sm mb-4">
                                        {equipaje.color && (
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                                </svg>
                                                <span className="text-gray-700">
                                                    <strong className="text-gray-900">Color:</strong> {equipaje.color}
                                                </span>
                                            </div>
                                        )}
                                        {equipaje.peso && (
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                </svg>
                                                <span className="text-gray-700">
                                                    <strong className="text-gray-900">Peso:</strong> {equipaje.peso} kg
                                                </span>
                                            </div>
                                        )}
                                        {equipaje.lugar_regis && (
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-gray-700">
                                                    <strong className="text-gray-900">Lugar:</strong> {equipaje.lugar_regis}
                                                </span>
                                            </div>
                                        )}
                                        {equipaje.caracteristicas && (
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                                <div className="text-gray-700">
                                                    <strong className="text-gray-900">Características:</strong>
                                                    <p className="mt-1">{equipaje.caracteristicas}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fecha de registro */}
                                        <div className="border-t border-gray-200 pt-3 mt-3">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-gray-600 text-xs">
                                                    <strong>Registrado:</strong> {new Date(equipaje.created_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Imágenes */}
                                    {(equipaje.images || equipaje.images1 || equipaje.images2) && (
                                        <div className="mt-4 border-t border-gray-200 pt-4">
                                            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Imágenes
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {equipaje.images && (
                                                    <img
                                                        src={`/${equipaje.images}`}
                                                        alt="Imagen 1"
                                                        className="w-full h-24 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                                        onClick={() => window.open(`/${equipaje.images}`, '_blank')}
                                                    />
                                                )}
                                                {equipaje.images1 && (
                                                    <img
                                                        src={`/${equipaje.images1}`}
                                                        alt="Imagen 2"
                                                        className="w-full h-24 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                                        onClick={() => window.open(`/${equipaje.images1}`, '_blank')}
                                                    />
                                                )}
                                                {equipaje.images2 && (
                                                    <img
                                                        src={`/${equipaje.images2}`}
                                                        alt="Imagen 3"
                                                        className="w-full h-24 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                                        onClick={() => window.open(`/${equipaje.images2}`, '_blank')}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
                <p className="text-gray-500 text-sm">
                    Sistema de Gestión de Equipaje - Viajes Roxana
                </p>
            </div>
        </div>
    );
}
