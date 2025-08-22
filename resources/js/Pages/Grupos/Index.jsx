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
  const [copiedGrupoId, setCopiedGrupoId] = useState(null);

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

  const copyPublicFormUrl = async (grupo) => {
    const url = `${window.location.origin}/paquete/${grupo.paquete_id}/grupo/${grupo.id}/form`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedGrupoId(grupo.id);
      setTimeout(() => setCopiedGrupoId(null), 2000);
    } catch {
      alert('No se pudo copiar el enlace');
    }
  };

  const getStatusBadge = (activo) => {
    return activo ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
        Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
        <span className="inline-flex h-2 w-2 rounded-full bg-red-500 mr-2"></span>
        Inactivo
      </span>
    );
  };

  const EncargadosPills = ({ grupo }) => {
    const hasInternos = Array.isArray(grupo.nombre_encargado) && grupo.nombre_encargado.length > 0;
    const hasAgencias = Array.isArray(grupo.nombre_encargado_agencia) && grupo.nombre_encargado_agencia.length > 0;

    if (!hasInternos && !hasAgencias) {
      return <span className="text-gray-400 text-sm">Sin encargados</span>;
    }

    return (
      <div className="space-y-1">
        {hasInternos && (
          <div>
            <div className="text-[11px] font-medium text-gray-600 mb-1">Internos:</div>
            <div className="flex flex-wrap gap-1">
              {grupo.nombre_encargado.map((nombre, index) => (
                <span key={`int-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                  {grupo.tipo_encargado?.[index] ? `${grupo.tipo_encargado[index]} - ` : ''}{nombre}
                </span>
              ))}
            </div>
          </div>
        )}
        {hasAgencias && (
          <div className={hasInternos ? 'pt-1' : ''}>
            <div className="text-[11px] font-medium text-gray-600 mb-1">Agencia:</div>
            <div className="flex flex-wrap gap-1">
              {grupo.nombre_encargado_agencia.map((nombre, index) => (
                <span key={`ag-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                  {grupo.tipo_encargado_agencia?.[index] ? `${grupo.tipo_encargado_agencia[index]} - ` : ''}{nombre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Grupos" />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">Gestión de Grupos</h2>
            <Link href={route('grupos.create')} className="w-full sm:w-auto">
              <PrimaryButton size="lg" className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700 focus:ring-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Nuevo Grupo
              </PrimaryButton>
            </Link>
          </div>

          <Card className="overflow-hidden">
            <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
              {/* Search bar */}
              <div className="mb-5 sm:mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-end">
                  <div>
                    <TextInput
                      type="text"
                      placeholder="Buscar por nombre de grupo, encargado o paquete..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
                    />
                  </div>
                  <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
                    <PrimaryButton
                      type="submit"
                      className="flex-1 sm:flex-none gap-2 bg-red-600 hover:bg-red-700 focus:ring-red-500 px-4 sm:px-6 py-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Buscar
                    </PrimaryButton>
                    {search && (
                      <SecondaryButton
                        type="button"
                        onClick={clearSearch}
                        className="flex-1 sm:flex-none gap-2 px-4 sm:px-6 py-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Limpiar
                      </SecondaryButton>
                    )}
                  </div>
                </form>
              </div>

              {/* ======= Mobile list (cards) ======= */}
              <div className="md:hidden">
                {grupos.data.length > 0 ? (
                  <ul className="space-y-3">
                    {grupos.data.map((grupo) => (
                      <li key={grupo.id}>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-semibold text-gray-900">{grupo.nombre}</div>
                              <div className="text-xs text-gray-500">ID: {grupo.id}</div>
                            </div>
                            {getStatusBadge(grupo.activo)}
                          </div>

                          {/* Paquete / Fechas */}
                          <div className="mt-3 grid grid-cols-1 gap-2">
                            <div className="text-sm">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500">Paquete</span>
                              <span className="font-medium text-gray-900">{grupo.paquete?.nombre || '—'}</span>
                              {grupo.paquete?.destino && (
                                <span className="ml-2 text-gray-500">· {grupo.paquete.destino}</span>
                              )}
                            </div>
                            <div className="text-sm">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500">Fechas</span>
                              <span className="font-medium text-gray-900">
                                {grupo.fecha_inicio ? new Date(grupo.fecha_inicio).toLocaleDateString('es-ES') : 'No definida'}
                              </span>
                              <span className="mx-1 text-gray-400">→</span>
                              <span className="font-medium text-gray-900">
                                {grupo.fecha_fin ? new Date(grupo.fecha_fin).toLocaleDateString('es-ES') : 'No definida'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500">Capacidad</span>
                              <span className="font-medium text-gray-900">{grupo.capacidad} personas</span>
                            </div>
                            <div className="text-sm">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500">Encargados</span>
                              <EncargadosPills grupo={grupo} />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex items-center justify-end gap-2">
                            <a
                              href={`/paquete/${grupo.paquete_id}/grupo/${grupo.id}/form`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-green-700 hover:text-green-800 hover:bg-green-50 transition-colors"
                              title="Abrir formulario público"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M13 5h8m0 0v8m0-8l-8 8" />
                              </svg>
                            </a>

                            <button
                              onClick={() => copyPublicFormUrl(grupo)}
                              className={`inline-flex items-center justify-center h-10 px-3 rounded-lg transition-colors ${
                                copiedGrupoId === grupo.id
                                  ? 'text-green-700 bg-green-50'
                                  : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
                              }`}
                              title="Copiar enlace del formulario"
                            >
                              {copiedGrupoId === grupo.id ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>

                            <Link
                              href={route('grupos.edit', grupo.id)}
                              className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                              title="Editar grupo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>

                            <button
                              onClick={() => confirmDelete(grupo)}
                              className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-red-700 hover:text-red-800 hover:bg-red-50 transition-colors"
                              title="Eliminar grupo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-2 py-10 text-center text-gray-500">
                    <svg className="w-4 h-4 mb-4 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-base font-medium mb-1">
                      {search ? 'No se encontraron grupos' : 'No hay grupos registrados'}
                    </p>
                    <p className="text-sm">
                      {search ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer grupo de viaje.'}
                    </p>
                  </div>
                )}
              </div>

              {/* ======= Desktop table (md+) ======= */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquete</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encargados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grupos.data.length > 0 ? (
                      grupos.data.map((grupo) => (
                        <tr key={grupo.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{grupo.nombre}</div>
                              <div className="text-sm text-gray-500">ID: {grupo.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{grupo.paquete?.nombre}</div>
                              <div className="text-sm text-gray-500">{grupo.paquete?.destino}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {grupo.fecha_inicio ? new Date(grupo.fecha_inicio).toLocaleDateString('es-ES') : 'No definida'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {grupo.fecha_fin ? new Date(grupo.fecha_fin).toLocaleDateString('es-ES') : 'No definida'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {grupo.capacidad} personas
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <EncargadosPills grupo={grupo} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(grupo.activo)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <a
                                href={`/paquete/${grupo.paquete_id}/grupo/${grupo.id}/form`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-9 h-9 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                title="Abrir formulario público"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M13 5h8m0 0v8m0-8l-8 8" />
                                </svg>
                              </a>

                              <button
                                onClick={() => copyPublicFormUrl(grupo)}
                                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 ${
                                  copiedGrupoId === grupo.id
                                    ? 'text-green-600 bg-green-50'
                                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                }`}
                                title="Copiar enlace del formulario"
                              >
                                {copiedGrupoId === grupo.id ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>

                              <Link
                                href={route('grupos.edit', grupo.id)}
                                className="inline-flex items-center justify-center w-9 h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="Editar grupo"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>

                              <button
                                onClick={() => confirmDelete(grupo)}
                                className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Eliminar grupo"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-4 h-4 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-lg font-medium mb-1">
                              {search ? 'No se encontraron grupos' : 'No hay grupos registrados'}
                            </p>
                            <p className="text-sm">
                              {search ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer grupo de viaje.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {grupos.links && grupos.links.length > 3 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Mostrando <span className="font-medium">{grupos.from}</span> a <span className="font-medium">{grupos.to}</span> de <span className="font-medium">{grupos.total}</span> resultados
                  </div>
                  <div className="flex flex-wrap gap-1">
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

      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6 sm:p-8 bg-white rounded-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
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
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
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
