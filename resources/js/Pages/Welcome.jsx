import { Link, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);

    // Componente Modal para Ubicación
    const LocationModal = () => (
        <div className={`fixed inset-0 z-50 ${showLocationModal ? 'block' : 'hidden'}`}>
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowLocationModal(false)}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-11/12 max-w-4xl max-h-[80vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Ubicación en Tiempo Real</h2>
                    <button 
                        onClick={() => setShowLocationModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>
                <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600">Mapa de ubicación en tiempo real</p>
                        <p className="text-sm text-gray-500 mt-2">(Aquí se integrará el mapa con la ubicación del hijo)</p>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-2">Información de Ubicación:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Última actualización: Hace 2 minutos</li>
                        <li>• Coordenadas: 4.6097° N, 74.0817° W</li>
                        <li>• Estado: En tránsito</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
                {/* Header con navegación completa del AuthenticatedLayout */}
                <nav className="bg-[#d52e27] backdrop-blur border-b border-gray-200 shadow-sm sticky top-0 z-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
                                        <img 
                                            src="/imgs/logo-roxana-blanco.png"  
                                            alt="Viajes Roxana" 
                                            className="h-12 w-auto" 
                                        />
                                    </Link>
                                </div>

                                {/* Navegación solo si el usuario está autenticado y es admin */}
                                {auth.user && auth.user.is_admin && (
                                    <>
                                        {/* Desktop XL - Todos con texto */}
                                        <div className="hidden 2xl:ms-6 2xl:flex 2xl:space-x-1">
                                            <Link
                                                href={route('dashboard')}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                                                </svg>
                                                Dashboard
                                            </Link>
                                            <Link
                                                href={route('paquetes.index')}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                Paquetes
                                            </Link>
                                            <Link
                                                href={route('grupos.index')}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Grupos
                                            </Link>
                                            <Link
                                                href={route('inscripciones.index')}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Inscripciones
                                            </Link>
                                            <Link
                                                href={route('hijos.index')}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                Hijos
                                            </Link>
                                            <Link
                                                href={route('geolocalizacion.index')}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                GPS
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                {auth.user ? (
                                    <div className="relative ms-3">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-4 py-2 border border-red-200 text-sm leading-4 font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                                                    >
                                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
                                                            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        {user?.name || 'Usuario'}

                                                        <svg
                                                            className="-me-0.5 ms-2 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content>
                                                <Dropdown.Link href={route('profile.edit')}>
                                                    Perfil
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                >
                                                    Cerrar sesión
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                ) : (
                                    <div className="flex space-x-4">
                                        <Link
                                            href={route('login')}
                                            className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-white text-[#d52e27] hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Registrarse
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section mejorado con imagen más grande */}
                <section className="mx-auto max-w-7xl px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 py-16">
                        <div className="flex-1 space-y-8">
                            <div className="space-y-6">
                                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                    ¡Hola Leonardo Calderon!
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Bienvenido a Viajes Roxana. Gestiona tu perfil, consulta tus viajes, registra tu equipaje y realiza tus pagos en un solo lugar.
                                </p>
                                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Disponible 24 horas antes del viaje
                                </div>
                            </div>
                        </div>
                        
                        {/* Imagen de Roxana más grande y prominente */}
                        <div className="flex-shrink-0 lg:w-80">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-red-200 to-pink-200 rounded-full opacity-20 blur-xl"></div>
                                <img 
                                    src="/imgs/rox.png" 
                                    alt="Roxana - Tu asistente de viajes" 
                                    className="relative h-64 w-64 lg:h-80 lg:w-80 rounded-full border-8 border-white shadow-2xl object-cover mx-auto"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-green-500 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center mt-6">
                                <h3 className="text-xl font-semibold text-gray-900">Roxana</h3>
                                <p className="text-gray-600">Tu asistente personal de viajes</p>
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas principales con mejores espaciados y nueva sección de Ubicación */}
                    <div className="grid gap-8 pb-20 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Mi Perfil - ACTIVA */}
                        <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <img 
                                            src="/imgs/perfilvr.png" 
                                            alt="Mi Perfil" 
                                            className="w-12 h-12 object-contain"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Gestiona y accede a tus datos, ficha médica y ficha nutricional.
                                    </p>
                                    <Link
                                        href="/perfil"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Entrar
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* UBICACIÓN - NUEVA SECCIÓN */}
                        <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-orange-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Ubicación</h2>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Localiza a tu hijo en tiempo real durante el viaje.
                                    </p>
                                    <button
                                        onClick={() => setShowLocationModal(true)}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-3 text-white font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Ver Mapa
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-2 right-2 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Mis Viajes - DESHABILITADA/COMENTADA */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gray-100 p-8 shadow-lg opacity-50 cursor-not-allowed">
                            <div className="absolute inset-0 bg-gray-200 opacity-70"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12">
                                <div className="bg-red-500 text-white px-4 py-1 text-sm font-bold transform -rotate-12 shadow-lg">
                                    PRÓXIMAMENTE
                                </div>
                            </div>
                            <div className="relative z-10 filter blur-sm">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center">
                                        <img 
                                            src="/imgs/avion.png" 
                                            alt="Mis Viajes" 
                                            className="w-12 h-12 object-contain opacity-50"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-500">Mis Viajes</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Accede a la información de tus viajes, horarios, destinos y más.
                                    </p>
                                    <div className="px-6 py-3 bg-gray-300 rounded-2xl text-gray-500 font-semibold">
                                        No Disponible
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Equipaje - DESHABILITADA/COMENTADA */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gray-100 p-8 shadow-lg opacity-50 cursor-not-allowed">
                            <div className="absolute inset-0 bg-gray-200 opacity-70"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12">
                                <div className="bg-red-500 text-white px-4 py-1 text-sm font-bold transform -rotate-12 shadow-lg">
                                    PRÓXIMAMENTE
                                </div>
                            </div>
                            <div className="relative z-10 filter blur-sm">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center">
                                        <img 
                                            src="/imgs/maletavr.png" 
                                            alt="Equipaje" 
                                            className="w-12 h-12 object-contain opacity-50"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-500">Equipaje</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Consulta y registra los equipajes para tus próximos viajes.
                                    </p>
                                    <div className="px-6 py-3 bg-gray-300 rounded-2xl text-gray-500 font-semibold">
                                        No Disponible
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mis Pagos - DESHABILITADA/COMENTADA */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gray-100 p-8 shadow-lg opacity-50 cursor-not-allowed">
                            <div className="absolute inset-0 bg-gray-200 opacity-70"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12">
                                <div className="bg-red-500 text-white px-4 py-1 text-sm font-bold transform -rotate-12 shadow-lg">
                                    PRÓXIMAMENTE
                                </div>
                            </div>
                            <div className="relative z-10 filter blur-sm">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center">
                                        <img 
                                            src="/imgs/pagovr.png" 
                                            alt="Mis Pagos" 
                                            className="w-12 h-12 object-contain opacity-50"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-500">Mis Pagos</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Registra tus pagos, consulta estados, comprobantes y facturas.
                                    </p>
                                    <div className="px-6 py-3 bg-gray-300 rounded-2xl text-gray-500 font-semibold">
                                        No Disponible
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modal de Ubicación */}
                <LocationModal />

                {/* Footer mejorado */}
                <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid gap-12 md:grid-cols-4">
                            <div className="space-y-6 md:col-span-2">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src="/imgs/logo-roxana-blanco.png" 
                                        alt="Viajes Roxana" 
                                        className="h-12 w-auto"
                                    />
                                    <span className="text-2xl font-bold">VIAJES ROXANA</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed max-w-md">
                                    Tu compañía de confianza para viajes seguros y cómodos. Más de 20 años de experiencia nos respaldan en cada aventura.
                                </p>
                                <div className="flex space-x-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                                        <span className="text-white font-bold">f</span>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                                        <span className="text-white font-bold">T</span>
                                    </div>
                                    <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                                        <span className="text-white font-bold">I</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold">Contacto</h3>
                                <div className="space-y-3 text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <p>+57 300 123 4567</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <p>info@viajesroxana.com</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p>Calle 123 #45-67, Bogotá</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold">Horarios</h3>
                                <div className="space-y-3 text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Lun - Vie</p>
                                            <p className="text-sm">7:00 AM - 7:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Sábados</p>
                                            <p className="text-sm">8:00 AM - 5:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Domingos</p>
                                            <p className="text-sm">9:00 AM - 3:00 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
                            <p className="text-gray-400">
                                © 2024 Viajes Roxana. Todos los derechos reservados. | Desarrollado con ❤️ para familias viajeras
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
