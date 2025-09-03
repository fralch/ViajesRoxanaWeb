import { Link, Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import SimpleMap from '@/Components/SimpleMap';
import LocationModal from '@/Components/LocationModal';
import { useGeolocation } from '@/hooks/useGeolocation';
import mapboxService from '@/services/mapboxService';
import { formatDateSafe, formatDateRange } from '@/utils/dateUtils';

export default function Welcome({ auth, laravelVersion, phpVersion, user_with_children }) {
    const user = usePage().props.auth.user;
    const userWithChildren = user_with_children || user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    
    // Estados para geolocalización
    const [currentAddress, setCurrentAddress] = useState('Obteniendo ubicación...');
    const [lastUpdate, setLastUpdate] = useState(null);
    const [locationAccuracy, setLocationAccuracy] = useState(null);
    const [lastLocation, setLastLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    
    // Hook de geolocalización
    const { 
        location, 
        loading: geoLoading, 
        error: geoError, 
        getCurrentPosition,
        getAccuracyInfo,
        formatCoordinates 
    } = useGeolocation();

    // Redirección a login si no está autenticado
    useEffect(() => {
        if (!user) {
            window.location.href = route('login');
        }
    }, [user]);

    // Inicializar hijo seleccionado
    useEffect(() => {
        if (userWithChildren && userWithChildren.hijos && userWithChildren.hijos.length > 0) {
            setSelectedChild(userWithChildren.hijos[0]);
        }
    }, [userWithChildren]);

    // Inicializar grupo seleccionado cuando cambia el hijo
    useEffect(() => {
        if (selectedChild && selectedChild.inscripciones && selectedChild.inscripciones.length > 0) {
            setSelectedGroup(selectedChild.inscripciones[0].grupo);
        } else {
            setSelectedGroup(null);
        }
    }, [selectedChild]);

    // Si no hay usuario, no renderizar nada mientras se redirige
    if (!user) {
        return null;
    }

    // Efecto para animaciones de carga
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Cargar última ubicación del hijo seleccionado desde BD
    useEffect(() => {
        if (selectedChild && selectedChild.id) {
            const fetchLastLocation = async () => {
                setLocationLoading(true);
                setLocationError(null);
                
                try {
                    const response = await fetch(`/api/hijo-location/${selectedChild.id}/last`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        credentials: 'same-origin'
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    
                    if (data.success && data.location) {
                        setLastLocation(data.location);
                        setLastUpdate(new Date(data.location.timestamp));
                        
                        // Geocodificación inversa con las coordenadas de la BD
                        try {
                            const addressData = await mapboxService.reverseGeocode(
                                data.location.longitude, 
                                data.location.latitude
                            );
                            setCurrentAddress(addressData.address);
                        } catch (geoError) {
                            console.error('Error en geocodificación inversa:', geoError);
                            setCurrentAddress('Dirección no disponible');
                        }
                    } else {
                        setLocationError(data.message || 'No se encontró ubicación');
                        setCurrentAddress('Sin datos de ubicación');
                        setLastLocation(null);
                    }
                } catch (error) {
                    console.error('Error cargando ubicación del hijo:', error);
                    setLocationError(error.message || 'Error al cargar ubicación');
                    setCurrentAddress('Error al obtener ubicación');
                    setLastLocation(null);
                } finally {
                    setLocationLoading(false);
                }
            };

            fetchLastLocation();
        }
    }, [selectedChild]);

    // Asignar token globalmente para SimpleMap
    useEffect(() => {
        window.mapboxToken = 'pk.eyJ1IjoiZnJhbGNoIiwiYSI6ImNtZXJ0ZGk1bzBhcDcyaXBxOGpvY3F5bjcifQ.jBkOkpE1eJoYVs-g5BifWA';
    }, []);


    // Componente de tarjeta mejorado
    const ServiceCard = ({ icon, title, description, status, link, color = "red", badge = null, onClick = null }) => {
        const colorClasses = {
            red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
            orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
            blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
            green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
            purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        };

        const bgColorClasses = {
            red: "from-red-100 to-red-200",
            orange: "from-orange-100 to-orange-200",
            blue: "from-blue-100 to-blue-200",
            green: "from-green-100 to-green-200",
            purple: "from-purple-100 to-purple-200"
        };

        if (status === 'disabled') {
            return (
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-lg border border-gray-200 cursor-not-allowed">
                    <div className="absolute inset-0 bg-gray-200/30"></div>
                    <div className="absolute top-4 right-4 transform rotate-12">
                        <div className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                            PRÓXIMAMENTE
                        </div>
                    </div>
                    <div className="relative z-10 opacity-40">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center shadow-lg">
                                {typeof icon === 'string' ? 
                                    <img src={icon} alt={title} className="w-12 h-12 object-contain" /> : 
                                    icon
                                }
                            </div>
                            <h2 className="text-2xl font-bold text-gray-600">{title}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                            <div className="px-6 py-3 bg-gray-300 rounded-2xl text-gray-600 font-semibold text-sm">
                                No Disponible
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const handleClick = () => {
            if (onClick) {
                onClick();
            }
        };

        return (
            <div className={`group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 cursor-pointer ${badge ? 'ring-4 ring-opacity-50 ring-' + color + '-200' : ''}`}>
                {/* Fondo decorativo animado */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgColorClasses[color]} rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:opacity-70 transition-opacity duration-500`}></div>
                
                {/* Badge si existe */}
                {badge && (
                    <div className="absolute top-4 right-4">
                        <div className={`bg-${color}-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg animate-pulse`}>
                            {badge}
                        </div>
                    </div>
                )}
                
                <div className="relative z-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className={`w-20 h-20 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                            {typeof icon === 'string' ? 
                                <img src={icon} alt={title} className="w-12 h-12 object-contain filter brightness-0 invert" /> : 
                                icon
                            }
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">{title}</h2>
                            <p className="text-gray-600 text-sm leading-relaxed px-2">{description}</p>
                        </div>
                        
                        {link ? (
                            <Link
                                href={link}
                                className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${colorClasses[color]} px-8 py-3 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                            >
                                Entrar
                                <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ) : (
                            <button
                                onClick={handleClick}
                                className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${colorClasses[color]} px-8 py-3 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                            >
                                {title === 'Ubicación' ? 'Ver Mapa' : 'Entrar'}
                                <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
                                    {title === 'Ubicación' ? 
                                        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /> :
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    }
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Efecto hover adicional */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            </div>
        );
    };

    return (
        <>
            <Head title="Bienvenido - Viajes Roxana" />
            
            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-gray-600 font-medium">Cargando tu experiencia...</p>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
                
                {/* Header original simple (SIN banda azul) */}
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

                            {/* Mobile menu button */}
                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white focus:outline-none transition duration-150 ease-in-out"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path
                                            className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                        <div className="space-y-1 pb-3 pt-2">
                            {/* Mobile user info */}
                            {auth.user && (
                                <div className="border-t border-red-400 pb-1 pt-4">
                                    <div className="px-4">
                                        <div className="text-base font-medium text-white">{user?.name}</div>
                                        <div className="text-sm font-medium text-red-200">{user?.email}</div>
                                    </div>

                                    <div className="mt-3 space-y-1">
                                        {/* Admin navigation for mobile */}
                                        {auth.user.is_admin && (
                                            <>
                                                <ResponsiveNavLink href={route('dashboard')} className="text-white hover:bg-red-500">
                                                    Dashboard
                                                </ResponsiveNavLink>
                                                <ResponsiveNavLink href={route('paquetes.index')} className="text-white hover:bg-red-500">
                                                    Paquetes
                                                </ResponsiveNavLink>
                                                <ResponsiveNavLink href={route('grupos.index')} className="text-white hover:bg-red-500">
                                                    Grupos
                                                </ResponsiveNavLink>
                                                <ResponsiveNavLink href={route('inscripciones.index')} className="text-white hover:bg-red-500">
                                                    Inscripciones
                                                </ResponsiveNavLink>
                                                <ResponsiveNavLink href={route('hijos.index')} className="text-white hover:bg-red-500">
                                                    Hijos
                                                </ResponsiveNavLink>
                                                <ResponsiveNavLink href={route('geolocalizacion.index')} className="text-white hover:bg-red-500">
                                                    GPS
                                                </ResponsiveNavLink>
                                            </>
                                        )}
                                        
                                        <ResponsiveNavLink href={route('profile.edit')} className="text-white hover:bg-red-500">
                                            Perfil
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-white hover:bg-red-500">
                                            Cerrar sesión
                                        </ResponsiveNavLink>
                                    </div>
                                </div>
                            )}
                            
                            {/* Mobile guest links */}
                            {!auth.user && (
                                <div className="space-y-1 px-4 pt-2">
                                    <ResponsiveNavLink href={route('login')} className="text-white hover:bg-red-500">
                                        Iniciar Sesión
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('register')} className="text-white hover:bg-red-500">
                                        Registrarse
                                    </ResponsiveNavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section completamente rediseñado */}
                <section className="relative overflow-hidden">
                    {/* Elementos decorativos animados */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="relative mx-auto max-w-7xl px-6 py-20">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8 text-center lg:text-left">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        {/* Selector de hijo con animación */}
                                        {userWithChildren && userWithChildren.hijos && userWithChildren.hijos.length > 1 ? (
                                            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                                <select 
                                                    value={selectedChild?.id || ''} 
                                                    onChange={(e) => {
                                                        const child = userWithChildren.hijos.find(hijo => hijo.id == e.target.value);
                                                        setSelectedChild(child);
                                                    }}
                                                    className="text-blue-700 font-semibold text-sm bg-transparent border-none focus:outline-none cursor-pointer"
                                                >
                                                    {userWithChildren.hijos.map(hijo => (
                                                        <option key={hijo.id} value={hijo.id}>
                                                            Seleccionar hijo: {hijo.nombres}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : userWithChildren && userWithChildren.hijos && userWithChildren.hijos.length === 1 ? (
                                            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-green-700 font-semibold text-sm">Hijo: {selectedChild?.nombres}</span>
                                            </div>
                                        ) : null}

                                        
                                    </div>
                                    
                                    <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-red-600 bg-clip-text text-transparent leading-tight">
                                        ¡Hola {user?.name || 'Usuario'}!
                                    </h1>
                                    
                                    <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                                        Bienvenido a tu <span className="font-semibold text-red-600">portal de apoderado</span>. <br />
                                        Aquí accedes a la información y al viaje de tu hijo(a).
                                    </p>

                                   

                                    {/* Stats rápidas */}
                                    <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
                                        {/* Selector/Información de grupo */}
                                        {selectedChild && selectedChild.inscripciones && selectedChild.inscripciones.length > 0 && (
                                            selectedChild.inscripciones.length > 1 ? (
                                                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                                                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                                                    <select 
                                                        value={selectedGroup?.id || ''} 
                                                        onChange={(e) => {
                                                            const group = selectedChild.inscripciones.find(insc => insc.grupo.id == e.target.value)?.grupo;
                                                            setSelectedGroup(group);
                                                        }}
                                                        className="text-purple-700 font-semibold text-sm bg-transparent border-none focus:outline-none cursor-pointer"
                                                    >
                                                        {selectedChild.inscripciones.map(inscripcion => (
                                                            <option key={inscripcion.grupo.id} value={inscripcion.grupo.id}>
                                                                Grupo: {inscripcion.grupo.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="inline-flex flex-col items-start gap-1 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                        <span className="text-red-500 font-semibold text-sm">
                                                            Grupo: {selectedChild.inscripciones[0].grupo.nombre}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 ml-6">
                                                        Paquete: {selectedChild.inscripciones[0].grupo.paquete?.nombre}
                                                    </div>
                                                    <div className="text-xs text-gray-600 ml-6">
                                                        Fecha: {formatDateSafe(selectedChild.inscripciones[0].grupo.fecha_inicio)} - {formatDateSafe(selectedChild.inscripciones[0].grupo.fecha_fin)}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                                            <div className="text-2xl font-bold text-green-600">100%</div>
                                            <div className="text-sm text-gray-600">Satisfacción</div>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                                            <div className="text-2xl font-bold text-blue-600">24/7</div>
                                            <div className="text-sm text-gray-600">Soporte</div>
                                        </div>
                                        
                                    </div>
                                     {/* Información detallada del grupo para múltiples grupos */}
                                    {selectedChild && selectedChild.inscripciones && selectedChild.inscripciones.length > 1 && selectedGroup && (
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-blue-200">
                                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 7a3 3 0 11-6 0 3 3 0 016 0zM6 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                </svg>
                                                Información del Grupo Seleccionado
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700">Paquete:</span>
                                                    <span className="text-gray-600">{selectedGroup.paquete?.nombre}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700">Fechas:</span>
                                                    <span className="text-gray-600">
                                                        {formatDateSafe(selectedGroup.fecha_inicio)} - {formatDateSafe(selectedGroup.fecha_fin)}
                                                    </span>
                                                </div>
                                              
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Roxana con mejor presentación */}
                            <div className="flex-shrink-0 lg:w-96">
                                <div className="relative">
                                    {/* Anillos decorativos animados */}
                                    <div className="absolute inset-0 rounded-full border-4 border-red-200/50 animate-ping"></div>
                                    <div className="absolute inset-4 rounded-full border-2 border-orange-200/50 animate-pulse delay-500"></div>
                                    
                                    {/* Imagen principal */}
                                    <div className="relative z-10">
                                        <img 
                                            src="/imgs/rox.png" 
                                            alt="Roxana - Tu asistente de viajes" 
                                            className="h-72 w-72 lg:h-96 lg:w-96 rounded-full border-8 border-white shadow-2xl object-cover mx-auto hover:scale-105 transition-transform duration-500"
                                        />
                                        
                                        {/* Badge de estado */}
                                        <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-400 to-green-500 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>

                                        {/* Floating elements */}
                                        <div className="absolute -top-6 -left-6 bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                        </div>

                                        <div className="absolute -top-2 -right-8 bg-yellow-400 w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-300">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Grid mejorada */}
                <section className="mx-auto max-w-7xl px-6 pb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Servicios de <span className="text-red-600">{selectedChild?.nombres || "hijo"}</span></h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Accede rápidamente a todas las funciones disponibles para hacer tu experiencia más cómoda
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <ServiceCard
                            icon="/imgs/perfilvr.png"
                            title={selectedChild ? `Perfil` : "Perfil hijo"}
                            description="Gestiona tus datos personales, ficha médica y nutricional de forma segura."
                            link={selectedChild ? route('perfil.hijo', selectedChild.id) : "#"}
                            color="red"
                            status="active"
                        />

                        <ServiceCard
                            icon={
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                            title={selectedChild ? `Ubicación` : "Ubicación"}
                            description="Rastrea la ubicación de tu hijo  durante el viaje con GPS de precisión."
                            onClick={() => setShowLocationModal(true)}
                            color="orange"
                            status="active"
                            badge="LIVE"
                        />

                        <ServiceCard
                            icon="/imgs/avion.png"
                            title="Mis Viajes"
                            description="Consulta itinerarios, horarios, destinos y toda la información de tus viajes."
                            color="blue"
                            status="disabled"
                        />

                        <ServiceCard
                            icon="/imgs/maletavr.png"
                            title="Equipaje"
                            description="Registra y consulta el equipaje para tus próximos destinos de manera digital."
                            color="green"
                            status="disabled"
                        />

                        <ServiceCard
                            icon="/imgs/pagovr.png"
                            title="Mis Pagos"
                            description="Gestiona pagos, consulta estados, descarga comprobantes y facturas."
                            color="purple"
                            status="disabled"
                        />
                    </div>

                    {/* CTA Section */}
                    <div className="mt-20 text-center">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-12 text-white relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="w-full h-full bg-repeat" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                                }}></div>
                            </div>
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <h3 className="text-3xl font-bold mb-4">¿Necesitas ayuda?</h3>
                                <p className="text-xl text-red-100 mb-8">
                                    Nuestro equipo está disponible 24/7 para asistirte en todo lo que necesites
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a 
                                        href="https://wa.me/51988868250?text=Hola,%20me%20gustaría%20obtener%20más%20información"
                                        target="_blank"
                                        rel="noopener noreferrer" 
                                        className="bg-white text-red-600 px-8 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
                                    >
                                        Chat en vivo
                                    </a>
                                    <a 
                                        href="tel:988868250"
                                        className="border-2 border-white text-white px-8 py-3 rounded-2xl font-semibold hover:bg-white hover:text-red-600 transition-all duration-200 inline-flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Llamar ahora
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Location Modal */}
                <LocationModal 
                    isOpen={showLocationModal}
                    onClose={() => setShowLocationModal(false)}
                    selectedChild={selectedChild}
                    lastLocation={lastLocation}
                    setLastLocation={setLastLocation}
                    currentAddress={currentAddress}
                    setCurrentAddress={setCurrentAddress}
                    lastUpdate={lastUpdate}
                    setLastUpdate={setLastUpdate}
                    locationLoading={locationLoading}
                    setLocationLoading={setLocationLoading}
                    locationError={locationError}
                    setLocationError={setLocationError}
                />

             
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translate3d(100%, 0, 0); }
                    100% { transform: translate3d(-100%, 0, 0); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </>
    );
}
