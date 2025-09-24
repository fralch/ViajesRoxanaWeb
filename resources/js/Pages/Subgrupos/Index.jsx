import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import { showDelete, showSuccess, showError } from '@/utils/swal';

export default function Index({ subgrupos, filters }) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('subgrupos.index'), { search }, {
      preserveState: true,
      replace: true
    });
  };

  const clearSearch = () => {
    setSearch('');
    router.get(route('subgrupos.index'), {}, {
      preserveState: true,
      replace: true
    });
  };

  const confirmDelete = async (subgrupo) => {
    const result = await showDelete(
      `¿Eliminar subgrupo "${subgrupo.nombre}"?`,
      'Esta acción no se puede deshacer.'
    );

    if (result.isConfirmed) {
      router.delete(route('subgrupos.destroy', subgrupo.id), {
        onSuccess: () => {
          showSuccess('¡Eliminado!', 'El subgrupo ha sido eliminado exitosamente.');
        },
        onError: () => {
          showError('Error', 'No se pudo eliminar el subgrupo. Intenta nuevamente.');
        }
      });
    }
  };

  const toggleStatus = (subgrupo) => {
    router.patch(route('subgrupos.toggle-status', subgrupo.id), {}, {
      onSuccess: () => {
        showSuccess(
          subgrupo.activo ? 'Subgrupo desactivado' : 'Subgrupo activado',
          `El subgrupo ${subgrupo.nombre} ha sido ${subgrupo.activo ? 'desactivado' : 'activado'}.`
        );
      },
      onError: () => {
        showError('Error', 'No se pudo cambiar el estado del subgrupo.');
      }
    });
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
    <AuthenticatedLayout
      header={
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Subgrupos</h2>
          </div>

          <div>
            <Link href={route('subgrupos.create')}>
              <PrimaryButton className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Subgrupo
              </PrimaryButton>
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Subgrupos" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Card className="overflow-hidden">
            <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
              {/* Search bar */}
              <div className="mb-5 sm:mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-end">
                  <div>
                    <TextInput
                      type="text"
                      placeholder="Buscar subgrupos por nombre o encargado..."
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

              {/* Subgroups Grid */}
              {subgrupos.data && subgrupos.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subgrupos.data.map((subgrupo) => (
                    <div key={subgrupo.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{subgrupo.nombre}</h3>
                            <p className="text-sm text-gray-600">{subgrupo.grupo?.nombre}</p>
                          </div>
                          {getStatusBadge(subgrupo.activo)}
                        </div>

                        {subgrupo.descripcion && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{subgrupo.descripcion}</p>
                        )}

                        <div className="space-y-3 mb-4">
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Capacidad:</span>
                            <span className="ml-2 text-sm text-gray-900">
                              {subgrupo.inscripciones_count || 0}/{subgrupo.capacidad_maxima}
                            </span>
                          </div>

                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Encargado Principal:</span>
                            <div className="mt-1">
                              <span className="text-sm text-gray-900">{subgrupo.nombre_encargado_principal}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({getTipoEncargadoLabel(subgrupo.tipo_encargado_principal)})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <Link
                            href={route('subgrupos.show', subgrupo.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Ver detalles
                          </Link>

                          <div className="flex items-center space-x-2">
                            <Link href={route('subgrupos.edit', subgrupo.id)}>
                              <SecondaryButton size="sm" className="p-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </SecondaryButton>
                            </Link>

                            <SecondaryButton
                              size="sm"
                              onClick={() => toggleStatus(subgrupo)}
                              className={`p-2 ${subgrupo.activo ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                            >
                              {subgrupo.activo ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1" />
                                </svg>
                              )}
                            </SecondaryButton>

                            <SecondaryButton
                              size="sm"
                              onClick={() => confirmDelete(subgrupo)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </SecondaryButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 mb-4 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {search ? 'No se encontraron subgrupos' : 'No hay subgrupos configurados'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {search ? 'Intenta con otros términos de búsqueda.' : 'Crea el primer subgrupo para organizar mejor las inscripciones.'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {subgrupos.links && subgrupos.links.length > 3 && (
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Mostrando <span className="font-medium">{subgrupos.from}</span> a <span className="font-medium">{subgrupos.to}</span> de <span className="font-medium">{subgrupos.total}</span> resultados
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {subgrupos.links.map((link, index) => {
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