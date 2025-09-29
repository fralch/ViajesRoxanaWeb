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
        if (count === 1) return "grid grid-cols-1 max-w-sm mx-auto gap-6";
        if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-6";
        if (count === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto gap-6";
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
    };

    // Función para determinar el padding del contenedor según la cantidad de elementos
    const getContainerPadding = (documentosCount, asistenciaCount) => {
        const totalItems = documentosCount + asistenciaCount;
        if (totalItems <= 2) return "py-8 px-6";
        if (totalItems <= 4) return "py-6 px-6";
        return "py-6 px-4";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className={`bg-white rounded-lg shadow-lg w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto ${getContainerPadding(documentosDisponibles.length, asistenciaMedicaDisponible.length)}`}>
                {/* Header del Modal */}
                <div className="flex justify-between items-center pb-4 sm:pb-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        Documentos del Viaje - {trip?.paquete?.nombre}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Contenido del Modal */}
                <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6">
                    {/* Documentos del viaje */}
                    {documentosDisponibles.length > 0 && (
                        <div>
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Documentos del viaje</h3>
                            <div className={getGridClasses(documentosDisponibles.length)}>
                                {documentosDisponibles.map((doc, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 text-center hover:shadow-md transition-all duration-200 hover:border-gray-300">
                                        <div className="mb-3">
                                            <div className="mx-auto w-12 h-16 sm:w-16 sm:h-20 bg-gray-100 rounded border-2 border-gray-300 flex flex-col items-center justify-center">
                                                <DocumentIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mb-1" />
                                                <span className="text-xs font-bold text-red-500 bg-red-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                                    {doc.tipo}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-3 sm:mb-4 leading-tight px-1">{doc.titulo}</h4>
                                        <a 
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 inline-block text-center font-medium"
                                        >
                                            Ver
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tarjeta de Asistencia Médica del viaje */}
                    {asistenciaMedicaDisponible.length > 0 && (
                        <div>
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Tarjeta de Asistencia Médica del viaje</h3>
                            <div className={getGridClasses(asistenciaMedicaDisponible.length)}>
                                {asistenciaMedicaDisponible.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 text-center hover:shadow-md transition-all duration-200 hover:border-gray-300">
                                        <div className="mb-3">
                                            <div className="mx-auto w-12 h-16 sm:w-16 sm:h-20 bg-gray-100 rounded border-2 border-gray-300 flex flex-col items-center justify-center">
                                                {item.tipo === 'voucher' ? (
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded flex items-center justify-center mb-1">
                                                        <span className="text-green-600 font-bold text-sm sm:text-lg">$</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded flex items-center justify-center mb-1">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-3 sm:mb-4 leading-tight px-1">{item.titulo}</h4>
                                        <a 
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm border border-gray-300 rounded hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 inline-block text-center font-medium"
                                        >
                                            Ver
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 overflow-hidden">
                <img 
                    src="/imgs/viajebaner.jpg"
                    alt={`Imagen de ${trip.paquete.nombre} - ${trip.paquete.destino}`}
                    className="w-full h-full object-cover"
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
                        className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 text-sm font-medium ${
                            trip.status === 'en_curso' 
                                ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={trip.status !== 'en_curso'}
                    >
                        Descargar Info
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
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                            filtroActivo === 'todos'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        onClick={() => setFiltroActivo('en_curso')}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                            filtroActivo === 'en_curso'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        En Curso
                                    </button>
                                    <button
                                        onClick={() => setFiltroActivo('proximo')}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                            filtroActivo === 'proximo'
                                                ? 'bg-blue-600 text-white'
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