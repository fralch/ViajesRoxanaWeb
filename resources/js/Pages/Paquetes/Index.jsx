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

export default function Index({ paquetes, filters }) {
  const [search, setSearch] = useState(filters.search || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paqueteToDelete, setPaqueteToDelete] = useState(null);
  const [expandedPaquetes, setExpandedPaquetes] = useState(new Set());
  const [editingRoutes, setEditingRoutes] = useState(null);
  const [routesOrder, setRoutesOrder] = useState({});

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('paquetes.index'), { search }, {
      preserveState: true,
      replace: true
    });
  };

  const clearSearch = () => {
    setSearch('');
    router.get(route('paquetes.index'), {}, {
      preserveState: true,
      replace: true
    });
  };

  const confirmDelete = async (paquete) => {
    const result = await showDelete(
      `¿Eliminar "${paquete.nombre}"?`,
      'Esta acción eliminará el paquete y todos sus grupos asociados'
    );
    
    if (result.isConfirmed) {
      router.delete(route('paquetes.destroy', paquete.id), {
        onSuccess: () => {
          showSuccess('¡Eliminado!', 'El paquete ha sido eliminado exitosamente.');
        },
        onError: () => {
          showError('Error', 'No se pudo eliminar el paquete. Intenta nuevamente.');
        }
      });
    }
  };

  // Función eliminada - ya no necesitamos modal personalizado
  const deletePaquete = () => {};  // Mantener para evitar errores

  const togglePaqueteExpansion = (paqueteId) => {
    const newExpanded = new Set(expandedPaquetes);
    if (newExpanded.has(paqueteId)) {
      newExpanded.delete(paqueteId);
    } else {
      newExpanded.add(paqueteId);
    }
    setExpandedPaquetes(newExpanded);
  };

  const startEditingRoutes = (paqueteId, recorridos) => {
    setEditingRoutes(paqueteId);
    const order = {};
    recorridos.forEach(recorrido => {
      order[recorrido.id] = recorrido;
    });
    setRoutesOrder(order);
  };

  const moveRoute = (routeId, direction) => {
    const routes = Object.values(routesOrder).sort((a, b) => a.orden - b.orden);
    const currentIndex = routes.findIndex(r => r.id === routeId);
    
    if (direction === 'up' && currentIndex > 0) {
      const temp = routes[currentIndex].orden;
      routes[currentIndex].orden = routes[currentIndex - 1].orden;
      routes[currentIndex - 1].orden = temp;
    } else if (direction === 'down' && currentIndex < routes.length - 1) {
      const temp = routes[currentIndex].orden;
      routes[currentIndex].orden = routes[currentIndex + 1].orden;
      routes[currentIndex + 1].orden = temp;
    }

    const newOrder = {};
    routes.forEach(route => {
      newOrder[route.id] = route;
    });
    setRoutesOrder(newOrder);
  };

  const saveRoutesOrder = async () => {
    const routes = Object.values(routesOrder).map(route => ({
      id: route.id,
      orden: route.orden
    }));

    try {
      await router.patch('recorrido-paquetes/update-order', 
        { routes },
        {
          preserveScroll: true,
          onSuccess: () => {
            showSuccess('¡Orden actualizado!', 'El orden de los recorridos ha sido actualizado exitosamente.');
            setEditingRoutes(null);
            setRoutesOrder({});
          },
          onError: (errors) => {
            console.error('Error updating routes order:', errors);
            showError('Error', 'No se pudo actualizar el orden de los recorridos.');
          }
        }
      );
    } catch (error) {
      console.error('Exception updating routes order:', error);
      showError('Error', 'Ocurrió un error al actualizar el orden.');
    }
  };

  const cancelEditingRoutes = () => {
    setEditingRoutes(null);
    setRoutesOrder({});
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

  return (
    <AuthenticatedLayout>
      <Head title="Paquetes" />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">Gestión de Paquetes</h2>
            <Link href={route('paquetes.create')} className="w-full sm:w-auto">
              <PrimaryButton size="lg" className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700 focus:ring-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Nuevo Paquete
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
                      placeholder="Buscar por nombre o destino..."
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
                {paquetes.data.length > 0 ? (
                  <ul className="space-y-3">
                    {paquetes.data.map((paquete) => (
                      <li key={paquete.id}>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-semibold text-gray-900">{paquete.nombre}</div>
                              <div className="text-xs text-gray-500">ID: {paquete.id}</div>
                            </div>
                            {getStatusBadge(paquete.activo)}
                          </div>

                          {/* Destino / Descripcion */}
                          <div className="mt-3 grid grid-cols-1 gap-2">
                            <div className="text-sm">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500">Destino</span>
                              <span className="font-medium text-gray-900">{paquete.destino}</span>
                            </div>
                            <div className="text-sm">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500">Descripción</span>
                              <p className="text-gray-700">{paquete.descripcion}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                              onClick={() => togglePaqueteExpansion(paquete.id)}
                              className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-purple-700 hover:text-purple-800 hover:bg-purple-50 transition-colors"
                              title="Ver recorridos"
                            >
                              <svg className={`w-4 h-4 transition-transform ${expandedPaquetes.has(paquete.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            <Link
                              href={route('paquetes.edit', paquete.id)}
                              className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                              title="Editar paquete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>

                            <button
                              onClick={() => confirmDelete(paquete)}
                              className="inline-flex items-center justify-center h-10 px-3 rounded-lg text-red-700 hover:text-red-800 hover:bg-red-50 transition-colors"
                              title="Eliminar paquete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {/* Routes section */}
                          {expandedPaquetes.has(paquete.id) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-900">Recorridos</h4>
                                {paquete.recorridos && paquete.recorridos.length > 0 && (
                                  <button
                                    onClick={() => editingRoutes === paquete.id ? cancelEditingRoutes() : startEditingRoutes(paquete.id, paquete.recorridos)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                      editingRoutes === paquete.id
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                  >
                                    {editingRoutes === paquete.id ? 'Cancelar' : 'Editar orden'}
                                  </button>
                                )}
                              </div>

                              {paquete.recorridos && paquete.recorridos.length > 0 ? (
                                <div className="space-y-2">
                                  {(editingRoutes === paquete.id ? Object.values(routesOrder).sort((a, b) => a.orden - b.orden) : paquete.recorridos).map((recorrido, index) => (
                                    <div key={recorrido.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium">
                                          {recorrido.orden}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">{recorrido.nombre}</span>
                                        {!recorrido.activo && (
                                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Inactivo</span>
                                        )}
                                      </div>
                                      {editingRoutes === paquete.id && (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => moveRoute(recorrido.id, 'up')}
                                            disabled={index === 0}
                                            className={`p-1 rounded ${
                                              index === 0
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                                            }`}
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l5-5 5 5" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => moveRoute(recorrido.id, 'down')}
                                            disabled={index === (editingRoutes === paquete.id ? Object.keys(routesOrder).length : paquete.recorridos.length) - 1}
                                            className={`p-1 rounded ${
                                              index === (editingRoutes === paquete.id ? Object.keys(routesOrder).length : paquete.recorridos.length) - 1
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                                            }`}
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 10l-5 5-5-5" />
                                            </svg>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {editingRoutes === paquete.id && (
                                    <div className="flex gap-2 pt-2">
                                      <button
                                        onClick={saveRoutesOrder}
                                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                                      >
                                        Guardar orden
                                      </button>
                                      <button
                                        onClick={cancelEditingRoutes}
                                        className="px-3 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No hay recorridos configurados para este paquete</p>
                              )}
                            </div>
                          )}
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
                      {search ? 'No se encontraron paquetes' : 'No hay paquetes registrados'}
                    </p>
                    <p className="text-sm">
                      {search ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer paquete de viaje.'}
                    </p>
                  </div>
                )}
              </div>

              {/* ======= Desktop table (md+) ======= */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paquetes.data.length > 0 ? (
                      paquetes.data.map((paquete) => (
                        <React.Fragment key={paquete.id}>
                          <tr className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{paquete.nombre}</div>
                                <div className="text-sm text-gray-500">ID: {paquete.id}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{paquete.destino}</div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700 truncate max-w-xs">{paquete.descripcion}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(paquete.activo)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => togglePaqueteExpansion(paquete.id)}
                                  className="inline-flex items-center justify-center w-9 h-9 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                  title="Ver recorridos"
                                >
                                  <svg className={`w-4 h-4 transition-transform ${expandedPaquetes.has(paquete.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>

                                <Link
                                  href={route('paquetes.edit', paquete.id)}
                                  className="inline-flex items-center justify-center w-9 h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="Editar paquete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>

                                <button
                                  onClick={() => confirmDelete(paquete)}
                                  className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Eliminar paquete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* Routes section */}
                          {expandedPaquetes.has(paquete.id) && (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 bg-gray-50 border-b">
                                <div className="bg-white rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-gray-900">Recorridos del paquete</h4>
                                    {paquete.recorridos && paquete.recorridos.length > 0 && (
                                      <button
                                        onClick={() => editingRoutes === paquete.id ? cancelEditingRoutes() : startEditingRoutes(paquete.id, paquete.recorridos)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                          editingRoutes === paquete.id
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        }`}
                                      >
                                        {editingRoutes === paquete.id ? 'Cancelar edición' : 'Editar orden'}
                                      </button>
                                    )}
                                  </div>

                                  {paquete.recorridos && paquete.recorridos.length > 0 ? (
                                    <div className="space-y-3">
                                      {(editingRoutes === paquete.id ? Object.values(routesOrder).sort((a, b) => a.orden - b.orden) : paquete.recorridos).map((recorrido, index) => (
                                        <div key={recorrido.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                                          <div className="flex items-center gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-semibold">
                                              {recorrido.orden}
                                            </span>
                                            <div>
                                              <span className="text-sm font-semibold text-gray-900">{recorrido.nombre}</span>
                                              {!recorrido.activo && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Inactivo</span>
                                              )}
                                            </div>
                                          </div>
                                          {editingRoutes === paquete.id && (
                                            <div className="flex gap-1">
                                              <button
                                                onClick={() => moveRoute(recorrido.id, 'up')}
                                                disabled={index === 0}
                                                className={`p-2 rounded-lg transition-colors ${
                                                  index === 0
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                                                }`}
                                                title="Mover hacia arriba"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l5-5 5 5" />
                                                </svg>
                                              </button>
                                              <button
                                                onClick={() => moveRoute(recorrido.id, 'down')}
                                                disabled={index === (editingRoutes === paquete.id ? Object.keys(routesOrder).length : paquete.recorridos.length) - 1}
                                                className={`p-2 rounded-lg transition-colors ${
                                                  index === (editingRoutes === paquete.id ? Object.keys(routesOrder).length : paquete.recorridos.length) - 1
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                                                }`}
                                                title="Mover hacia abajo"
                                              >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 10l-5 5-5-5" />
                                                </svg>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      {editingRoutes === paquete.id && (
                                        <div className="flex gap-3 pt-4 justify-end">
                                          <button
                                            onClick={saveRoutesOrder}
                                            className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                          >
                                            Guardar cambios
                                          </button>
                                          <button
                                            onClick={cancelEditingRoutes}
                                            className="px-6 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                      </svg>
                                      <p className="text-sm text-gray-500">No hay recorridos configurados para este paquete</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-4 h-4 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-lg font-medium mb-1">
                              {search ? 'No se encontraron paquetes' : 'No hay paquetes registrados'}
                            </p>
                            <p className="text-sm">
                              {search ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer paquete de viaje.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paquetes.links && paquetes.links.length > 3 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Mostrando <span className="font-medium">{paquetes.from}</span> a <span className="font-medium">{paquetes.to}</span> de <span className="font-medium">{paquetes.total}</span> resultados
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {paquetes.links.map((link, index) => {
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
              ¿Estás seguro de que deseas eliminar el paquete <span className="font-medium text-gray-900">"{paqueteToDelete?.nombre}"</span>? 
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
              onClick={deletePaquete}
              className="px-6 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Eliminar paquete
            </DangerButton>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}