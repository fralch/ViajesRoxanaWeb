import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
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

                            {/* Navegación adaptativa por tamaño de pantalla - Solo para administradores */}
                            {user.is_admin && (
                            <>
                            {/* Desktop XL - Todos con texto */}
                            <div className="hidden 2xl:ms-6 2xl:flex 2xl:space-x-1">
                                <Link
                                    href={route('dashboard')}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('dashboard') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                                    </svg>
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('paquetes.index')}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('paquetes.*') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Paquetes
                                </Link>
                                <Link
                                    href={route('grupos.index')}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('grupos.*') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Grupos
                                </Link>

                                <Link
                                    href={route('hijos.index')}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('hijos.*') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Hijos
                                </Link>
                                <Link
                                    href={route('geolocalizacion.index')}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('geolocalizacion.*') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    GPS
                                </Link>
                                
                                {/* Dropdown para las últimas 3 secciones */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50">
                                            Más
                                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content align="right" width="48" contentClasses="py-2 bg-white shadow-xl border border-gray-100 rounded-xl">
        
                                        <Link href={route('trazabilidad.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Trazabilidad
                                        </Link>
                                        <Link href={route('notificaciones.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a1 1 0 011-1h2a1 1 0 011 1v5z" />
                                            </svg>
                                            Notificaciones
                                        </Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Desktop L - 4 principales + dropdown */}
                            <div className="hidden xl:flex 2xl:hidden ms-6 space-x-1">
                                <Link
                                    href={route('dashboard')}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('dashboard') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                                    </svg>
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('paquetes.index')}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('paquetes.*') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Paquetes
                                </Link>
                                <Link
                                    href={route('grupos.index')}
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('grupos.*')
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Grupos
                                </Link>
                                
                                {/* Dropdown para el resto */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50">
                                            Más
                                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content align="right" width="48" contentClasses="py-2 bg-white shadow-xl border border-gray-100 rounded-xl">
                                        <Link href={route('hijos.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            Hijos
                                        </Link>
                                        <Link href={route('geolocalizacion.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            GPS
                                        </Link>

                                        <Link href={route('trazabilidad.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Trazabilidad
                                        </Link>
                                        <Link href={route('notificaciones.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a1 1 0 011-1h2a1 1 0 011 1v5z" />
                                            </svg>
                                            Notificaciones
                                        </Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                            
                            {/* Desktop M - Solo íconos principales + dropdown */}
                            <div className="hidden lg:flex xl:hidden ms-6 space-x-1">
                                <Link
                                    href={route('dashboard')}
                                    className={`inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('dashboard') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                    title="Dashboard"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                                    </svg>
                                </Link>
                                <Link
                                    href={route('paquetes.index')}
                                    className={`inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('paquetes.*') 
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                    title="Paquetes"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </Link>
                                <Link
                                    href={route('grupos.index')}
                                    className={`inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        route().current('grupos.*')
                                            ? 'text-white bg-red-500' 
                                            : 'text-white/90 hover:text-white hover:bg-red-500/50'
                                    }`}
                                    title="Grupos"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </Link>
                                
                                {/* Dropdown compacto */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50" title="Más opciones">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content align="right" width="48" contentClasses="py-2 bg-white shadow-xl border border-gray-100 rounded-xl">
                                        <Link href={route('hijos.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            👶 Hijos
                                        </Link>
                                        <Link href={route('geolocalizacion.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            📍 GPS
                                        </Link>

                                        <Link href={route('trazabilidad.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            📊 Trazabilidad
                                        </Link>
                                        <Link href={route('notificaciones.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            🔔 Notificaciones
                                        </Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                            
                            {/* Tablet - Menú dropdown único */}
                            <div className="hidden md:flex lg:hidden ms-4">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-white/90 hover:text-white hover:bg-red-500/50">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                            Menú
                                        </button>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content align="left" width="56" contentClasses="py-2 bg-white shadow-xl border border-gray-100 rounded-xl">
                                        <Link href={route('dashboard')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            📊 Dashboard
                                        </Link>
                                        <Link href={route('paquetes.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            📦 Paquetes
                                        </Link>
                                        <Link href={route('grupos.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            👥 Grupos
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <Link href={route('hijos.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            👶 Hijos
                                        </Link>
                                        <Link href={route('geolocalizacion.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            📍 GPS
                                        </Link>

                                        <Link href={route('trazabilidad.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            📊 Trazabilidad
                                        </Link>
                                        <Link href={route('notificaciones.index')} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
                                            🔔 Notificaciones
                                        </Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                            </>
                            )}
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
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
                                                {user.name}

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
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
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
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl p-2 text-red-600 transition duration-150 ease-in-out hover:bg-red-50 focus:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
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

                {user.is_admin && (
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    {/* Navegación móvil - Solo para administradores */}
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 border-b border-gray-200">
                        <Link
                            href={route('dashboard')}
                            className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                                route().current('dashboard') 
                                    ? 'text-red-700 bg-red-50' 
                                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                            }`}
                        >
                            📊 Dashboard
                        </Link>

                        <Link
                            href={route('paquetes.index')}
                            className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                                route().current('paquetes.*') 
                                    ? 'text-red-700 bg-red-50' 
                                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                            }`}
                        >
                            📦 Paquetes
                        </Link>

                        <Link
                            href={route('grupos.index')}
                            className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                                route().current('grupos.*')
                                    ? 'text-red-700 bg-red-50' 
                                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                            }`}
                        >
                            👥 Grupos
                        </Link>

                        <Link
                            href={route('hijos.index')}
                            className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                                route().current('hijos.*') 
                                    ? 'text-red-700 bg-red-50' 
                                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                            }`}
                        >
                            👶 Hijos
                        </Link>

                        <Link
                            href={route('geolocalizacion.index')}
                            className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                                route().current('geolocalizacion.*') 
                                    ? 'text-red-700 bg-red-50' 
                                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                            }`}
                        >
                            📍 GPS
                        </Link>



                        <Link
                            href={route('trazabilidad.index')}
                            className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                                route().current('trazabilidad.*') 
                                    ? 'text-red-700 bg-red-50' 
                                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                            }`}
                        >
                            📊 Trazabilidad
                        </Link>

                        <Link
                            href={route('notificaciones.index')}
                            className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                                route().current('notificaciones.*') 
                                    ? 'text-red-700 bg-red-50' 
                                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                            }`}
                        >
                            🔔 Notificaciones
                        </Link>
                    </div>
                </div>
                )}

                {/* Información del usuario - siempre visible */}
                {showingNavigationDropdown && (
                <div className="sm:hidden">
                    <div className="border-t border-gray-200 pb-1 pt-4 bg-white/95">
                        <div className="px-4">
                            <div className="text-base font-medium text-red-600">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-600">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
                )}
            </nav>

            {header && (
                <header className="bg-white/80 backdrop-blur border-b border-gray-100">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
