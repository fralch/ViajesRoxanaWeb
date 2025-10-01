import React, { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function PublicShow({ hijo, equipajes }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getTipoMaletaLabel = (tipo) => {
        const tiposMaleta = [
            { value: 'Maleta de 8 kg', label: 'Maleta de 8 kg' },
            { value: 'Maleta de 23 kg', label: 'Maleta de 23 kg' }
        ];
        const t = tiposMaleta.find(tm => tm.value === tipo);
        return t ? t.label : tipo;
    };

    const openImageModal = (imageSrc, altText) => {
        setSelectedImage({ src: imageSrc, alt: altText });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    const downloadImage = async () => {
        if (!selectedImage) return;
        
        try {
            const response = await fetch(selectedImage.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `equipaje-${hijo.nombres}-${selectedImage.alt}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
            <Head title={`Equipaje de ${hijo.nombres}`} />

            {/* Header */}
            <div className="bg-white shadow-lg border-b-4 border-red-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-200">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Equipaje Registrado</h1>
                            <p className="text-xl text-gray-600 flex items-center">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {hijo.nombres} - DNI: {hijo.doc_numero}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                    <div className="mb-8">
                        <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
                            <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Equipaje Registrado
                        </h2>
                        <div className="flex items-center mt-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                            <p className="text-gray-600 text-lg">
                                {equipajes.length} {equipajes.length === 1 ? 'item registrado' : 'items registrados'}
                            </p>
                        </div>
                    </div>

                    {equipajes.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-3">No hay equipaje registrado</h3>
                            <p className="text-lg text-gray-500 max-w-md mx-auto">
                                Aún no se ha registrado equipaje para <span className="font-semibold text-red-600">{hijo.nombres}</span>.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {equipajes.map((equipaje) => (
                                <div key={equipaje.id} className="border border-red-100 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-red-50 hover:border-red-200 transform hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="font-bold text-2xl text-gray-900 mb-1">Equipaje #{equipaje.id}</h4>
                                            <div className="w-12 h-1 bg-red-500 rounded-full"></div>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                                            equipaje.tip_maleta === 'Maleta de 23 kg'
                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                : 'bg-pink-100 text-pink-800 border border-pink-200'
                                        }`}>
                                            {getTipoMaletaLabel(equipaje.tip_maleta)}
                                        </span>
                                    </div>

                                    <div className="space-y-4 text-sm mb-6">
                                        {equipaje.color && (
                                            <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-red-50">
                                                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                                </svg>
                                                <span className="text-gray-700">
                                                    <strong className="text-gray-900">Color:</strong> {equipaje.color}
                                                </span>
                                            </div>
                                        )}
                                        {equipaje.peso && (
                                            <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-red-50">
                                                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                </svg>
                                                <span className="text-gray-700">
                                                    <strong className="text-gray-900">Peso:</strong> {equipaje.peso} kg
                                                </span>
                                            </div>
                                        )}
                                        {equipaje.lugar_regis && (
                                            <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-red-50">
                                                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-gray-700">
                                                    <strong className="text-gray-900">Lugar:</strong> {equipaje.lugar_regis}
                                                </span>
                                            </div>
                                        )}
                                        {equipaje.caracteristicas && (
                                            <div className="bg-white rounded-lg p-3 shadow-sm border border-red-50">
                                                <div className="flex items-start">
                                                    <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                    </svg>
                                                    <div className="text-gray-700">
                                                        <strong className="text-gray-900">Características:</strong>
                                                        <p className="mt-1 leading-relaxed">{equipaje.caracteristicas}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fechas de creación y actualización */}
                                        <div className="border-t border-red-100 pt-4 mt-4">
                                            <div className="flex items-center bg-red-50 rounded-lg p-3 mb-2">
                                                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                <span className="text-gray-600 text-xs">
                                                    <strong>Creado:</strong> {new Date(equipaje.created_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {equipaje.updated_at !== equipaje.created_at && (
                                                <div className="flex items-center bg-red-50 rounded-lg p-3">
                                                    <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    <span className="text-gray-600 text-xs">
                                                        <strong>Actualizado:</strong> {new Date(equipaje.updated_at).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Imágenes */}
                                    {(equipaje.images || equipaje.images1 || equipaje.images2) && (
                                        <div className="mt-6 border-t border-red-100 pt-6">
                                            <p className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Imágenes del Equipaje
                                            </p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {equipaje.images && (
                                                    <div className="relative group">
                                                        <img
                                                            src={`/${equipaje.images}`}
                                                            alt="Imagen 1"
                                                            className="w-full h-28 object-cover rounded-xl border-2 border-red-100 cursor-pointer hover:border-red-300 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                                                            onClick={() => openImageModal(`/${equipaje.images}`, 'Imagen 1')}
                                                        />
                                                        <div className="pointer-events-none absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                                {equipaje.images1 && (
                                                    <div className="relative group">
                                                        <img
                                                            src={`/${equipaje.images1}`}
                                                            alt="Imagen 2"
                                                            className="w-full h-28 object-cover rounded-xl border-2 border-red-100 cursor-pointer hover:border-red-300 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                                                            onClick={() => openImageModal(`/${equipaje.images1}`, 'Imagen 2')}
                                                        />
                                                        <div className="pointer-events-none absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                                {equipaje.images2 && (
                                                    <div className="relative group">
                                                        <img
                                                            src={`/${equipaje.images2}`}
                                                            alt="Imagen 3"
                                                            className="w-full h-28 object-cover rounded-xl border-2 border-red-100 cursor-pointer hover:border-red-300 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                                                            onClick={() => openImageModal(`/${equipaje.images2}`, 'Imagen 3')}
                                                        />
                                                        <div className="pointer-events-none absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                            </svg>
                                                        </div>
                                                    </div>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <div className="border-t border-red-100 pt-6">
                    <p className="text-gray-500 text-sm flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Sistema de Gestión de Equipaje - Viajes Roxana
                    </p>
                </div>
            </div>

            {/* Image Modal */}
            {isModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-0 sm:p-4" onClick={closeModal}>
                    <div
                        className="relative w-full h-full bg-white sm:max-w-4xl sm:h-auto sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {selectedImage.alt} - {hijo.nombres}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-white hover:text-red-200 transition-colors duration-200 p-2 rounded-full hover:bg-red-600"
                                aria-label="Cerrar modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 flex flex-col px-4 sm:px-6 py-4 sm:py-6 overflow-auto">
                            <div className="flex-1 flex items-center justify-center">
                                <img
                                    src={selectedImage.src}
                                    alt={selectedImage.alt}
                                    className="w-full max-h-[80vh] sm:max-h-[32rem] object-contain rounded-none sm:rounded-2xl sm:border sm:border-red-100 shadow-none sm:shadow-lg"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
                                <button
                                    onClick={downloadImage}
                                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-3 sm:px-6 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Descargar Imagen
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 sm:px-6 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border border-gray-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

