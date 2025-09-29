import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

// Componente Modal para documentos del viaje
const DocumentosModal = ({ isOpen, onClose, trip }) => {
    if (!isOpen) return null;

    const documentos = [
        {
            titulo: "Equipaje Latam",
            tipo: "PDF",
            url: "https://drive.google.com/file/d/1EKL9hhpe7YXyo1036UzfAQqaTRDD4o9r/view?usp=sharing"
        },
        {
            titulo: "Hospitales Cuzco",
            tipo: "PDF",
            url: "https://drive.google.com/file/d/1dv7n-4MDc-fnB6e3rvdj4tzdPMh0TTSu/view?usp=sharing"
        },
        {
            titulo: "Guia de ropa Cuzco",
            tipo: "PDF",
            url: "https://drive.google.com/file/d/1ak3hG58Ro3Frxxx7-0Mn6L_bENq-8Dss/view?usp=sharing"
        },
        {
            titulo: "Permiso Notarial",
            tipo: "PDF",
            url: ""  // URL vacía - no se mostrará
        }
    ];

    const asistenciaMedica = [
        {
            titulo: "Voucher",
            tipo: "voucher",
            url: ""
        },
        {
            titulo: "Lista de Clínicas Cercanas al Hotel",
            tipo: "clinicas",
            url: ""  // URL vacía - no se mostrará
        }
    ];

    // Filtrar documentos disponibles
    const documentosDisponibles = documentos.filter(doc => doc.url && doc.url.trim() !== '');
    const asistenciaMedicaDisponible = asistenciaMedica.filter(item => item.url && item.url.trim() !== '');

    // Función para determinar las clases del grid según la cantidad de elementos
    const getGridClasses = (count) => {
        if (count === 1) return "grid grid-cols-1 max-w-sm mx-auto gap-4";
        if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-4";
        if (count === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto gap-4";
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm transition-opacity duration-300">
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header del Modal */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            Documentos del Viaje
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">{trip?.paquete?.nombre}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-lg group"
                    >
                        <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Contenido del Modal */}
                <div className="p-4 sm:p-6 space-y-8">
                    {/* Documentos del viaje */}
                    {documentosDisponibles.length > 0 && (
                        <div className="space-y-4">
                           
                            <div className={getGridClasses(documentosDisponibles.length)}>
                                {documentosDisponibles.map((doc, index) => (
                                    <div 
                                        key={index} 
                                        className="group relative bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:border-red-200 hover:translate-y-[-2px]"
                                    >
                                        <div className="mb-3 relative">
                                            <div className="mx-auto w-14 h-18 sm:w-16 sm:h-20 bg-gradient-to-br from-red-50 to-white rounded-lg border-2 border-red-100 flex flex-col items-center justify-center group-hover:border-red-200 transition-colors duration-300">
                                                <DocumentIcon className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-300" />
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                                                    {doc.tipo}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 text-sm mb-4 leading-tight px-2 group-hover:text-gray-700 transition-colors duration-200">
                                            {doc.titulo}
                                        </h4>
                                        <a 
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 px-4 text-sm font-medium bg-white text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 inline-flex items-center justify-center space-x-2 group/btn"
                                        >
                                            <span>Ver documento</span>
                                            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tarjeta de Asistencia Médica del viaje */}
                    {asistenciaMedicaDisponible.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Asistencia Médica</h3>
                            </div>
                            <div className={getGridClasses(asistenciaMedicaDisponible.length)}>
                                {asistenciaMedicaDisponible.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className="group relative bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:border-green-200 hover:translate-y-[-2px]"
                                    >
                                        <div className="mb-3 relative">
                                            <div className="mx-auto w-14 h-18 sm:w-16 sm:h-20 bg-gradient-to-br from-green-50 to-white rounded-lg border-2 border-green-100 flex flex-col items-center justify-center group-hover:border-green-200 transition-colors duration-300">
                                                {item.tipo === 'voucher' ? (
                                                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                        <span className="text-green-600 font-bold text-base">$</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                                    {item.tipo}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 text-sm mb-4 leading-tight px-2 group-hover:text-gray-700 transition-colors duration-200">
                                            {item.titulo}
                                        </h4>
                                        <a 
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 px-4 text-sm font-medium bg-white text-green-600 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 inline-flex items-center justify-center space-x-2 group/btn"
                                        >
                                            <span>Ver documento</span>
                                            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mensaje informativo */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-blue-800 font-medium">
                                    Todos los documentos están disponibles para su descarga
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Haz clic en "Ver documento" para acceder al PDF correspondiente
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TripCard = ({ trip, onOpenModal }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'en_curso':
                return 'bg-green-100 text-green-800';
            case 'proximo':
                return 'bg-blue-100 text-blue-800';
            case 'finalizado':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'en_curso':
                return 'En Curso';
            case 'proximo':
                return 'Próximo';
            case 'finalizado':
                return 'Finalizado';
            default:
                return 'Pendiente';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
            <div className="relative h-48 overflow-hidden">
                <img 
                    src="/imgs/viajebaner.jpg"
                    alt={`Imagen de ${trip.paquete.nombre} - ${trip.paquete.destino}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                        {getStatusText(trip.status)}
                    </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold drop-shadow-lg">{trip.paquete.nombre}</h3>
                    <p className="text-sm opacity-90 flex items-center drop-shadow-lg">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {trip.paquete.destino}
                    </p>
                </div>
            </div>
            
            <div className="p-6">
                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                        <UsersIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm">Grupo: {trip.nombre}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm">
                            {new Date(trip.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(trip.fecha_fin).toLocaleDateString('es-ES')}
                        </span>
                    </div>
                   
                </div>
                
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {trip.paquete.descripcion}
                </p>
                
                <div className="flex space-x-2">
                    <button 
                        onClick={() => onOpenModal(trip)}
                        className="flex-1 py-2.5 px-4 rounded-lg transition-all duration-200 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <span className="flex items-center justify-center space-x-2">
                            <DocumentIcon className="w-4 h-4" />
                            <span>Ver Documentos</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function MisViajes({ auth, viajes = [] }) {
    const [filtroActivo, setFiltroActivo] = useState('todos');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);

    const filtrarViajes = (viajes, filtro) => {
        let viajesFiltrados;
        if (filtro === 'todos') {
            viajesFiltrados = viajes;
        } else {
            viajesFiltrados = viajes.filter(viaje => viaje.status === filtro);
        }
        
        // Ordenar por prioridad de estado: en_curso primero, luego proximo, finalmente finalizado
        return viajesFiltrados.sort((a, b) => {
            const statusPriority = {
                'en_curso': 1,
                'proximo': 2,
                'finalizado': 3
            };
            
            const priorityA = statusPriority[a.status] || 4;
            const priorityB = statusPriority[b.status] || 4;
            
            return priorityA - priorityB;
        });
    };

    const viajesFiltrados = filtrarViajes(viajes, filtroActivo);

    const handleOpenModal = (trip) => {
        setSelectedTrip(trip);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTrip(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mis Viajes</h2>}
        >
            <Head title="Mis Viajes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">Mis Viajes</h1>
                                <p className="text-gray-600 max-w-2xl">
                                    En esta área puedes descargar todos los documentos para tu próximo viaje. Además, 
                                    asegúrate de actualizar tu agenda con los consejos prácticos que hemos preparado 
                                    para ti. <span className="text-red-600 font-medium">¡Explora y prepárate para una experiencia de viaje inolvidable!</span>
                                </p>
                            </div>

                            {/* Filtros */}
                            <div className="mb-8">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setFiltroActivo('todos')}
                                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                            filtroActivo === 'todos'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        onClick={() => setFiltroActivo('en_curso')}
                                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                            filtroActivo === 'en_curso'
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        En Curso
                                    </button>
                                    <button
                                        onClick={() => setFiltroActivo('proximo')}
                                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                            filtroActivo === 'proximo'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Próximos Viajes
                                    </button>
                                </div>
                            </div>

                            {/* Lista de viajes */}
                            {viajesFiltrados.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {viajesFiltrados.map((viaje) => (
                                        <TripCard key={viaje.id} trip={viaje} onOpenModal={handleOpenModal} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <MapPinIcon className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay viajes disponibles</h3>
                                    <p className="text-gray-500">
                                        {filtroActivo === 'todos' 
                                            ? 'Aún no tienes viajes registrados.' 
                                            : `No tienes viajes ${filtroActivo === 'en_curso' ? 'en curso' : 'próximos'}.`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Documentos */}
            <DocumentosModal 
                isOpen={modalOpen} 
                onClose={handleCloseModal} 
                trip={selectedTrip} 
            />
        </AuthenticatedLayout>
    );
}