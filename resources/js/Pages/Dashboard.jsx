import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect } from 'react';

const StatCard = ({ title, value, icon, color = 'red' }) => (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                <div className={`w-6 h-6 text-${color}-600`}>{icon}</div>
            </div>
        </div>
    </div>
);

const QuickActionCard = ({ title, description, href, icon, color = 'red' }) => (
    <Link href={href} className="group">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 group-hover:scale-[1.02]">
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-${color}-200 transition-colors duration-200`}>
                    <div className={`w-5 h-5 text-${color}-600`}>{icon}</div>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-red-600 transition-colors duration-200">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    </Link>
);

export default function Dashboard() {
    const { auth } = usePage().props;
    
    useEffect(() => {
        // Si el usuario no es admin, redirigir a welcome
        if (!auth.user.is_admin) {
            window.location.href = '/';
        }
    }, [auth.user.is_admin]);
    
    // Si no es admin, no renderizar nada mientras se redirige
    if (!auth.user.is_admin) {
        return null;
    }
    
    return (
        <AuthenticatedLayout
            header="Panel de Control"
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta!</h1>
                        <p className="text-gray-600">Gestiona tus viajes y aventuras desde aquí</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title="Paquetes Activos"
                            value="12"
                            icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        />
                        <StatCard 
                            title="Inscripciones"
                            value="48"
                            icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
                        />
                        <StatCard 
                            title="Grupos"
                            value="8"
                            icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                        <StatCard 
                            title="Notificaciones"
                            value="3"
                            icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a1 1 0 011-1h2a1 1 0 011 1v5z" /></svg>}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <QuickActionCard 
                                title="🏠 Inicio"
                                description="Volver a la página principal"
                                href="/"
                                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                            />
                            <QuickActionCard 
                                title="Gestionar Paquetes"
                                description="Crear, editar y administrar paquetes de viaje"
                                href={route('paquetes.index')}
                                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                            />
                            <QuickActionCard 
                                title="Administrar Grupos"
                                description="Organizar y gestionar grupos de viajeros"
                                href={route('grupos.index')}
                                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            />
                            <QuickActionCard 
                                title="Ver Inscripciones"
                                description="Revisar y gestionar inscripciones de usuarios"
                                href={route('inscripciones.index')}
                                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            />
                            <QuickActionCard 
                                title="Seguimiento GPS"
                                description="Monitorear ubicación y trazabilidad"
                                href={route('geolocalizacion.index')}
                                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            />
                            <QuickActionCard 
                                title="Gestionar Hijos"
                                description="Administrar información de menores"
                                href={route('hijos.index')}
                                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                            />
                            <QuickActionCard 
                                title="Notificaciones"
                                description="Centro de mensajes y alertas"
                                href={route('notificaciones.index')}
                                icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a1 1 0 011-1h2a1 1 0 011 1v5z" /></svg>}
                            />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Nueva inscripción recibida</p>
                                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Paquete "Aventura en Cusco" actualizado</p>
                                    <p className="text-xs text-gray-500">Hace 4 horas</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Nuevo grupo creado: "Exploradores Junior"</p>
                                    <p className="text-xs text-gray-500">Hace 1 día</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
