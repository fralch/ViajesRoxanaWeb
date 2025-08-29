import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import Card from '@/Components/Card';
import { showDelete, showSuccess, showError } from '../../utils/swal';

export default function Index({ users, filters, isAdmin }) {
  const [search, setSearch] = useState(filters.search || '');
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hijoToDelete, setHijoToDelete] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('hijos.index'), { search }, {
      preserveState: true,
      replace: true
    });
  };

  const clearSearch = () => {
    setSearch('');
    router.get(route('hijos.index'), {}, {
      preserveState: true,
      replace: true
    });
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const confirmDelete = async (hijo) => {
    const result = await showDelete(
      `¿Eliminar "${hijo.nombres}"?`,
      'Esta acción eliminará el hijo permanentemente'
    );
    
    if (result.isConfirmed) {
      router.delete(route('hijos.destroy', hijo.id), {
        onSuccess: () => {
          showSuccess('¡Eliminado!', 'El hijo ha sido eliminado exitosamente.');
        },
        onError: () => {
          showError('Error', 'No se pudo eliminar el hijo. Intenta nuevamente.');
        }
      });
    }
  };

  const confirmDeleteParent = async (user) => {
    const result = await showDelete(
      `¿Eliminar al padre "${user.name}"?`,
      'Esta acción eliminará al padre y TODOS sus hijos, inscripciones y notificaciones PERMANENTEMENTE. Esta acción NO se puede deshacer.'
    );
    
    if (result.isConfirmed) {
      router.delete(route('hijos.destroy-parent', user.id), {
        onSuccess: () => {
          showSuccess('¡Eliminado!', 'El padre y todas sus dependencias han sido eliminados exitosamente.');
        },
        onError: (errors) => {
          const errorMessage = errors?.message || 'No se pudo eliminar el padre. Intenta nuevamente.';
          showError('Error', errorMessage);
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

  const calculateAge = (fechaNacimiento) => {
    const birth = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <AuthenticatedLayout>
      <Head title="Gestión de Hijos" />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">
              {isAdmin ? 'Gestión de Hijos por Padre' : 'Mis Hijos'}
            </h2>
            <Link href={route('hijos.create')} className="w-full sm:w-auto">
              <PrimaryButton size="lg" className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700 focus:ring-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Registrar Nuevo Hijo
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
                      placeholder="Buscar por padre, hijo, email o documento..."
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

              {/* Users/Parents list */}
              {users.data && users.data.length > 0 ? (
                <div className="space-y-4">
                  {users.data.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      {/* Parent header */}
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                              <div className="text-sm text-gray-600 space-x-4">
                                <span>{user.email}</span>
                                {user.dni && <span>DNI: {user.dni}</span>}
                                {user.phone && <span>Tel: {user.phone}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              {user.hijos?.length || 0} hijo{(user.hijos?.length || 0) !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-1">
                              {isAdmin && (
                                <button
                                  onClick={() => confirmDeleteParent(user)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar padre y todas sus dependencias"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => toggleUserExpansion(user.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title={expandedUsers.has(user.id) ? "Ocultar hijos" : "Ver hijos"}
                              >
                                <svg className={`w-5 h-5 transition-transform ${expandedUsers.has(user.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Children section */}
                      {expandedUsers.has(user.id) && (
                        <div className="px-6 py-4">
                          {user.hijos && user.hijos.length > 0 ? (
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Hijos registrados:</h4>
                              {user.hijos.map((hijo) => (
                                <div key={hijo.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-gray-900">{hijo.nombres}</h5>
                                        <div className="text-sm text-gray-600">
                                          {hijo.doc_tipo}: {hijo.doc_numero}
                                          {hijo.fecha_nacimiento && (
                                            <span className="ml-2">• {calculateAge(hijo.fecha_nacimiento)} años</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Link
                                        href={route('hijos.show', hijo.id)}
                                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="Ver detalles"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      </Link>
                                      <Link
                                        href={route('hijos.edit', hijo.id)}
                                        className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                        title="Editar"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </Link>
                                      <button
                                        onClick={() => confirmDelete(hijo)}
                                        className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Eliminar"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Additional child info */}
                                  {(hijo.plato_favorito || hijo.color_favorito || hijo.pasatiempos || hijo.deportes) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                      {hijo.plato_favorito && (
                                        <div>
                                          <span className="text-gray-600">Plato favorito:</span>
                                          <span className="ml-1 text-gray-900">{hijo.plato_favorito}</span>
                                        </div>
                                      )}
                                      {hijo.color_favorito && (
                                        <div>
                                          <span className="text-gray-600">Color favorito:</span>
                                          <span className="ml-1 text-gray-900">{hijo.color_favorito}</span>
                                        </div>
                                      )}
                                      {hijo.pasatiempos && (
                                        <div>
                                          <span className="text-gray-600">Pasatiempos:</span>
                                          <span className="ml-1 text-gray-900">{hijo.pasatiempos}</span>
                                        </div>
                                      )}
                                      {hijo.deportes && (
                                        <div>
                                          <span className="text-gray-600">Deportes:</span>
                                          <span className="ml-1 text-gray-900">{hijo.deportes}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <p className="text-sm">Este padre no tiene hijos registrados</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {search ? 'No se encontraron resultados' : 'No hay padres con hijos registrados'}
                  </h3>
                  <p className="text-gray-600">
                    {search ? 'Intenta con otros términos de búsqueda.' : 'Los padres aparecerán aquí cuando tengan hijos registrados.'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {users.links && users.links.length > 3 && (
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Mostrando <span className="font-medium">{users.from}</span> a <span className="font-medium">{users.to}</span> de <span className="font-medium">{users.total}</span> resultados
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {users.links.map((link, index) => {
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
