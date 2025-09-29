import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';

const TripCard = ({ trip }) => {
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
                    
                    <div className="flex items-center text-gray-600">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm">Capacidad: {trip.capacidad} personas</span>
                    </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {trip.paquete.descripcion}
                </p>
                
                <div className="flex space-x-2">
                    <button 
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
                                        <TripCard key={viaje.id} trip={viaje} />
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
        </AuthenticatedLayout>
    );
}