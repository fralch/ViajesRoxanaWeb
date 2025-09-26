import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import Card from '@/Components/Card';
import SubgrupoDisplay from '@/Components/SubgrupoDisplay';
import { formatDateSafe, formatDateRange } from '@/utils/dateUtils';
import { showDelete, showSuccess, showError } from '../../utils/swal';

export default function Show({ grupo, inscripciones, filters, auth }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('grupos.show', grupo.id), { search }, {
      preserveState: true,
      replace: true
    });
  };

  const clearSearch = () => {
    setSearch('');
    router.get(route('grupos.show', grupo.id), {}, {
      preserveState: true,
      replace: true
    });
  };

  const confirmDelete = async (inscripcion) => {
    const result = await showDelete(
      `¿Eliminar inscripción de "${inscripcion.hijo.nombres}"?`,
      'Esta acción no se puede deshacer.'
    );
    
    if (result.isConfirmed) {
      router.delete(route('inscripciones.destroy', inscripcion.id), {
        onSuccess: () => {
          showSuccess('¡Eliminada!', 'La inscripción ha sido eliminada exitosamente.');
        },
        onError: () => {
          showError('Error', 'No se pudo eliminar la inscripción. Intenta nuevamente.');
        }
      });
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

  const SubgruposPills = ({ subgrupos }) => {
    if (!subgrupos || subgrupos.length === 0) {
      return <span className="text-gray-400 text-sm">Sin subgrupos configurados</span>;
    }

    return (
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-gray-600 mb-1">Subgrupos:</div>
        <div className="flex flex-wrap gap-1">
          {subgrupos.map((subgrupo) => (
            <span key={subgrupo.id} className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
              {subgrupo.nombre} ({subgrupo.inscripciones_count || 0}/{subgrupo.capacidad_maxima})
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Grupo: ${grupo.nombre} - Inscripciones`} />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link 
                  href={route('grupos.index')}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a Grupos
                </Link>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-600">{grupo.nombre}</h2>
              <p className="text-sm text-gray-600">Inscripciones del grupo</p>
            </div>
           
          </div>

          {/* Información del Grupo */}
          <Card className="mb-6">
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Grupo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Paquete</span>
                  <span className="text-sm font-medium text-gray-900">{grupo.paquete?.nombre || '—'}</span>
                  {grupo.paquete?.destino && (
                    <span className="block text-xs text-gray-500">{grupo.paquete.destino}</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fechas</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDateRange(grupo.fecha_inicio, grupo.fecha_fin)}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Capacidad</span>
                  <span className="text-sm font-medium text-gray-900">{grupo.capacidad} personas</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado</span>
                  {getStatusBadge(grupo.activo)}
                </div>
              </div>
              <div className="mt-4">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Resumen de Subgrupos</span>
                <SubgruposPills subgrupos={grupo.subgrupos} />
              </div>
            </div>
          </Card>

          {/* Subgrupos */}
          <SubgrupoDisplay
            subgrupos={grupo.subgrupos || []}
            grupoId={grupo.id}
            canManage={auth?.user?.is_admin}
          />

          {/* Inscripciones */}
          <Card className="overflow-hidden">
            <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  Inscripciones ({inscripciones.total || 0})
                </h3>
              </div>

              {/* Search bar */}
              <div className="mb-5 sm:mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-end">
                  <div>
                    <TextInput
                      type="text"
                      placeholder="Buscar por nombre del hijo o usuario..."
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
                {inscripciones.data && inscripciones.data.length > 0 ? (
                  <ul className="space-y-3">
                    {inscripciones.data.map((inscripcion) => (
                      <li key={inscripcion.id}>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-semibold text-gray-900">{inscripcion.hijo.nombres}</div>
                              <div className="text-xs text-gray-500">ID: {inscripcion.id}</div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-2">
                            <div className="text-sm">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500">Usuario</span>
                              <span className="font-medium text-gray-900">{inscripcion.user.name}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-2">
                            <Link
                              href={route('inscripciones.edit', inscripcion.id)}
                              className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                              title="Editar inscripción"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>

                            <button
                              onClick={() => confirmDelete(inscripcion)}
                              className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-red-700 hover:text-red-800 hover:bg-red-50 transition-colors"
                              title="Eliminar inscripción"
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
                    <svg className="w-12 h-12 mb-4 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-base font-medium mb-1">
                      {search ? 'No se encontraron inscripciones' : 'No hay inscripciones en este grupo'}
                    </p>
                    <p className="text-sm">
                      {search ? 'Intenta con otros términos de búsqueda.' : 'Agrega la primera inscripción a este grupo.'}
                    </p>
                  </div>
                )}
              </div>

              {/* ======= Desktop table (md+) ======= */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hijo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inscripciones.data && inscripciones.data.length > 0 ? (
                      inscripciones.data.map((inscripcion) => (
                        <tr key={inscripcion.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{inscripcion.hijo.nombres}</div>
                            <div className="text-sm text-gray-500">ID: {inscripcion.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{inscripcion.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={route('inscripciones.edit', inscripcion.id)}
                                className="inline-flex items-center justify-center w-9 h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="Editar inscripción"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>

                              <button
                                onClick={() => confirmDelete(inscripcion)}
                                className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Eliminar inscripción"
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
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium mb-1">
                              {search ? 'No se encontraron inscripciones' : 'No hay inscripciones en este grupo'}
                            </p>
                            <p className="text-sm">
                              {search ? 'Intenta con otros términos de búsqueda.' : 'Agrega la primera inscripción a este grupo.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {inscripciones.links && inscripciones.links.length > 3 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Mostrando <span className="font-medium">{inscripciones.from}</span> a <span className="font-medium">{inscripciones.to}</span> de <span className="font-medium">{inscripciones.total}</span> resultados
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {inscripciones.links.map((link, index) => {
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
    </AuthenticatedLayout>
  );
}