import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';

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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activo
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inactivo
            </span>
        );
    };

    const getTipoEncargadoBadge = (tipo) => {
        return tipo === 'interno' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Interno
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Agencia
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Gestión de Grupos
                    </h2>
                    <Link href={route('grupos.create')}>
                        <PrimaryButton>
                            Crear Nuevo Grupo
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Grupos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Barra de búsqueda */}
                            <div className="mb-6">
                                <form onSubmit={handleSearch} className="flex gap-4">
                                    <div className="flex-1">
                                        <TextInput
                                            type="text"
                                            placeholder="Buscar por nombre de grupo, encargado o paquete..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <PrimaryButton type="submit">
                                        Buscar
                                    </PrimaryButton>
                                    {search && (
                                        <SecondaryButton type="button" onClick={clearSearch}>
                                            Limpiar
                                        </SecondaryButton>
                                    )}
                                </form>
                            </div>

                            {/* Tabla de grupos */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
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
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Editar
                                                            </Link>
                                                            <button
                                                                onClick={() => confirmDelete(grupo)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
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
                                                    className={`px-3 py-2 text-sm border rounded ${
                                                        link.active
                                                            ? 'bg-indigo-500 text-white border-indigo-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Confirmar eliminación
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        ¿Estás seguro de que deseas eliminar el grupo "{grupoToDelete?.nombre}"? 
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={deleteGrupo}>
                            Eliminar
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
