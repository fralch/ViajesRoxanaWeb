import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import { showDelete, showSuccess, showError } from '@/utils/swal';

export default function Show({ subgrupo, inscripciones, filters }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('subgrupos.show', subgrupo.id), { search }, {
      preserveState: true,
      replace: true
    });
  };

  const clearSearch = () => {
    setSearch('');
    router.get(route('subgrupos.show', subgrupo.id), {}, {
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

  const getTipoEncargadoLabel = (tipo) => {
    const tipos = {
      padre: 'Padre',
      madre: 'Madre',
      tutor_legal: 'Tutor Legal',
      familiar: 'Familiar',
      otro: 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Subgrupo: ${subgrupo.nombre} - Inscripciones`} />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href={route('subgrupos.index')}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a Subgrupos
                </Link>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-600">{subgrupo.nombre}</h2>
              <p className="text-sm text-gray-600">Grupo: {subgrupo.grupo?.nombre}</p>
            </div>
            <div className="flex gap-2">
              <Link href={route('subgrupos.edit', subgrupo.id)}>
                <SecondaryButton className="gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </SecondaryButton>
              </Link>
              <Link href={route('inscripciones.create')} className="w-full sm:w-auto">
                <PrimaryButton size="lg" className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Inscripción
                </PrimaryButton>
              </Link>
            </div>
          </div>

          {/* Información del Subgrupo */}
          <Card className="mb-6">
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Subgrupo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Grupo</span>
                  <span className="text-sm font-medium text-gray-900">{subgrupo.grupo?.nombre || '—'}</span>
                  {subgrupo.grupo?.paquete?.nombre && (
                    <span className="block text-xs text-gray-500">{subgrupo.grupo.paquete.nombre}</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Capacidad</span>
                  <span className="text-sm font-medium text-gray-900">
                    {inscripciones.total || 0}/{subgrupo.capacidad_maxima} personas
                  </span>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((inscripciones.total || 0) / subgrupo.capacidad_maxima * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado</span>
                  {getStatusBadge(subgrupo.activo)}
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Disponible</span>
                  <span className="text-sm font-medium text-gray-900">
                    {subgrupo.capacidad_maxima - (inscripciones.total || 0)} cupos
                  </span>
                </div>
              </div>

              {subgrupo.descripcion && (
                <div className="mb-6">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Descripción</span>
                  <p className="text-sm text-gray-900">{subgrupo.descripcion}</p>
                </div>
              )}

              {/* Encargados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Encargado Principal */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Encargado Principal</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Tipo:</span>
                        <span className="ml-2 text-sm text-gray-900">
                          {getTipoEncargadoLabel(subgrupo.tipo_encargado_principal)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Nombre:</span>
                        <span className="ml-2 text-sm text-gray-900">{subgrupo.nombre_encargado_principal}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Celular:</span>
                        <span className="ml-2 text-sm text-gray-900">{subgrupo.celular_encargado_principal}</span>
                      </div>
                      {subgrupo.email_encargado_principal && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Email:</span>
                          <span className="ml-2 text-sm text-gray-900">{subgrupo.email_encargado_principal}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Encargado Secundario */}
                {subgrupo.nombre_encargado_secundario && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Encargado Secundario</h4>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Tipo:</span>
                          <span className="ml-2 text-sm text-gray-900">
                            {getTipoEncargadoLabel(subgrupo.tipo_encargado_secundario)}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Nombre:</span>
                          <span className="ml-2 text-sm text-gray-900">{subgrupo.nombre_encargado_secundario}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Celular:</span>
                          <span className="ml-2 text-sm text-gray-900">{subgrupo.celular_encargado_secundario}</span>
                        </div>
                        {subgrupo.email_encargado_secundario && (
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Email:</span>
                            <span className="ml-2 text-sm text-gray-900">{subgrupo.email_encargado_secundario}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {subgrupo.observaciones && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observaciones</span>
                  <p className="text-sm text-gray-900">{subgrupo.observaciones}</p>
                </div>
              )}
            </div>
          </Card>

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
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                    />
                  </div>
                  <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
                    <PrimaryButton
                      type="submit"
                      className="flex-1 sm:flex-none gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 px-4 sm:px-6 py-3"
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

              {/* Mobile list (cards) */}
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
                      {search ? 'No se encontraron inscripciones' : 'No hay inscripciones en este subgrupo'}
                    </p>
                    <p className="text-sm">
                      {search ? 'Intenta con otros términos de búsqueda.' : 'Agrega la primera inscripción a este subgrupo.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop table (md+) */}
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
                              {search ? 'No se encontraron inscripciones' : 'No hay inscripciones en este subgrupo'}
                            </p>
                            <p className="text-sm">
                              {search ? 'Intenta con otros términos de búsqueda.' : 'Agrega la primera inscripción a este subgrupo.'}
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
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
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