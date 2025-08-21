import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import Card from '@/Components/Card';

export default function Index({ grupos, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [grupoToDelete, setGrupoToDelete] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('grupos.index'), { search }, {
            preserveState: true,
            replace: true
        });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('grupos.index'), {}, {
            preserveState: true,
            replace: true
        });
    };

    const confirmDelete = (grupo) => {
        setGrupoToDelete(grupo);
        setShowDeleteModal(true);
    };

    const deleteGrupo = () => {
        if (grupoToDelete) {
            router.delete(route('grupos.destroy', grupoToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setGrupoToDelete(null);
                }
            });
        }
    };

    const getStatusBadge = (activo) => {
        return activo ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Activo
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                Inactivo
            </span>
        );
    };

    const getTipoEncargadoBadge = (tipo) => {
        return tipo === 'interno' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Interno
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Agencia
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-red-600">
                        Gestión de Grupos
                    </h2>
                    <Link href={route('grupos.create')}>
                        <PrimaryButton size="lg" className="gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Crear Nuevo Grupo
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Grupos" />

            <div className="px-4 py-8">
                <div className="w-full max-w-7xl mx-auto">
                    <Card className="overflow-hidden">
                        <div className="px-6 sm:px-8 py-6 sm:py-8">
                            {/* Barra de búsqueda */}
                            <div className="mb-8">
                                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-1">
                                        <TextInput
                                            type="text"
                                            placeholder="Buscar por nombre de grupo, encargado o paquete..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <PrimaryButton type="submit" className="gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Buscar
                                        </PrimaryButton>
                                        {search && (
                                            <PrimaryButton type="button" onClick={clearSearch} variant="outline" className="gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Limpiar
                                            </PrimaryButton>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Tabla de grupos */}
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-red-50 to-orange-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Grupo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Paquete
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Capacidad
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Encargado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {grupos.data.length > 0 ? (
                                            grupos.data.map((grupo) => (
                                                <tr key={grupo.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {grupo.nombre}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                ID: {grupo.id}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {grupo.paquete?.nombre}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {grupo.paquete?.destino}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {grupo.capacidad} personas
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {getTipoEncargadoBadge(grupo.tipo_encargado)}
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {grupo.tipo_encargado === 'interno' 
                                                                    ? grupo.nombre_encargado 
                                                                    : grupo.nombre_encargado_agencia}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {grupo.tipo_encargado === 'interno' 
                                                                    ? grupo.celular_encargado 
                                                                    : grupo.celular_encargado_agencia}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(grupo.activo)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex gap-2">
                                                            <Link
                                                                href={route('grupos.edit', grupo.id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Editar
                                                            </Link>
                                                            <button
                                                                onClick={() => confirmDelete(grupo)}
                                                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                    {search ? 'No se encontraron grupos que coincidan con la búsqueda.' : 'No hay grupos registrados.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {grupos.links && grupos.links.length > 3 && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Mostrando {grupos.from} a {grupos.to} de {grupos.total} resultados
                                    </div>
                                    <div className="flex gap-1">
                                        {grupos.links.map((link, index) => {
                                            if (link.url === null) {
                                                return (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }
                                            
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 ${
                                                        link.active
                                                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-8 bg-white rounded-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                Confirmar eliminación
                            </h2>
                            <p className="text-sm text-gray-600">
                                Esta acción no se puede deshacer
                            </p>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            ¿Estás seguro de que deseas eliminar el grupo <span className="font-medium text-gray-900">"{grupoToDelete?.nombre}"</span>? 
                            Todos los datos asociados se perderán permanentemente.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton 
                            onClick={() => setShowDeleteModal(false)}
                            className="px-6 py-2.5 text-sm font-medium"
                        >
                            Cancelar
                        </SecondaryButton>
                        <DangerButton 
                            onClick={deleteGrupo}
                            className="px-6 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        >
                            Eliminar grupo
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
