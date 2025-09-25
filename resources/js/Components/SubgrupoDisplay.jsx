import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Card from '@/Components/Card';
import { showDelete, showSuccess, showError } from '@/utils/swal';

export default function SubgrupoDisplay({ subgrupos = [], grupoId, canManage = true }) {
  const [showDetails, setShowDetails] = useState({});

  const toggleDetails = (subgrupoId) => {
    setShowDetails(prev => ({
      ...prev,
      [subgrupoId]: !prev[subgrupoId]
    }));
  };

  const confirmDeleteSubgrupo = async (subgrupo) => {
    const result = await showDelete(
      `¿Eliminar subgrupo "${subgrupo.nombre}"?`,
      'Esta acción no se puede deshacer. Se eliminarán todas las inscripciones asociadas.'
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

  if (subgrupos.length === 0) {
    return (
      <Card className="mb-6">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subgrupos</h3>
            {canManage && (
              <Link href={route('subgrupos.create', { grupo_id: grupoId })}>
                <PrimaryButton size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Subgrupo
                </PrimaryButton>
              </Link>
            )}
          </div>
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-base font-medium mb-1">No hay subgrupos configurados</p>
            <p className="text-sm">Los subgrupos ayudan a organizar mejor las inscripciones.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Subgrupos ({subgrupos.length})</h3>
          {canManage && (
            <Link href={route('subgrupos.create', { grupo_id: grupoId })}>
              <PrimaryButton size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Subgrupo
              </PrimaryButton>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {subgrupos.map((subgrupo) => (
            <div key={subgrupo.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-md font-medium text-gray-900">{subgrupo.nombre}</h4>
                    {getStatusBadge(subgrupo.activo)}
                  </div>
                   <div className="flex items-center space-x-2">
                     <span className="text-sm text-gray-500">
                       {subgrupo.inscripciones_count || 0}/{subgrupo.capacidad_maxima} inscritos
                     </span>
                     <button
                       onClick={() => toggleDetails(subgrupo.id)}
                       className="p-1 text-gray-400 hover:text-gray-600"
                     >
                       <svg
                         className={`w-5 h-5 transform transition-transform ${showDetails[subgrupo.id] ? 'rotate-180' : ''}`}
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </button>
                   </div>
                </div>
                {subgrupo.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{subgrupo.descripcion}</p>
                )}
              </div>

              {showDetails[subgrupo.id] && (
                <div className="px-4 py-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Encargado Principal */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Encargado Principal</h5>
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

                    {/* Encargado Secundario */}
                    {subgrupo.nombre_encargado_secundario && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-3">Encargado Secundario</h5>
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
                    )}
                  </div>

                  {subgrupo.observaciones && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Observaciones</h5>
                      <p className="text-sm text-gray-600">{subgrupo.observaciones}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end space-x-2">
                    <Link href={route('subgrupos.show', subgrupo.id)}>
                      <SecondaryButton size="sm" className="gap-2 text-blue-600 hover:text-blue-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalles
                      </SecondaryButton>
                    </Link>
                    {canManage && (
                      <>
                        <Link href={route('subgrupos.edit', subgrupo.id)}>
                          <SecondaryButton size="sm" className="gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </SecondaryButton>
                        </Link>
                        <SecondaryButton
                          size="sm"
                          onClick={() => toggleStatus(subgrupo)}
                          className={`gap-2 ${subgrupo.activo ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {subgrupo.activo ? 'Desactivar' : 'Activar'}
                        </SecondaryButton>
                        <SecondaryButton
                          size="sm"
                          onClick={() => confirmDeleteSubgrupo(subgrupo)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </SecondaryButton>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}