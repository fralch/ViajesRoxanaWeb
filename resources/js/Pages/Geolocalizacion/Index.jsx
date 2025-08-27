import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import Card from '@/Components/Card';
import InteractiveMap from '@/Components/InteractiveMap';
import { formatDateSafe } from '@/utils/dateUtils';

export default function Index({ auth, grupos, filters }) {
  const [search, setSearch] = useState(filters?.search || '');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [groupedLocations, setGroupedLocations] = useState({}); // objeto, no array
  const [expandedChild, setExpandedChild] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('geolocalizacion.index'), { search }, {
      preserveState: true,
      replace: true,
    });
  };

  const clearSearch = () => {
    setSearch('');
    router.get(route('geolocalizacion.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleGroupClick = async (grupo) => {
    setSelectedGroup(grupo);
    setIsLoading(true);
    setError(null);
    setLocationHistory([]);
    setGroupedLocations({});

    try {
      const response = await fetch(route('geolocalizacion.group.history', { grupo: grupo.id }));
      if (!response.ok) throw new Error('Error al cargar el historial de geolocalización.');
      const data = await response.json();
      setLocationHistory(data);

      // Agrupar ubicaciones por hijo (objeto)
      const grouped = data.reduce((acc, location) => {
        const hijoId = location.hijo.id;
        if (!acc[hijoId]) {
          acc[hijoId] = {
            hijo: location.hijo,
            locations: [],
            lastLocation: null,
            totalLocations: 0,
          };
        }
        acc[hijoId].locations.push(location);
        acc[hijoId].totalLocations++;
        if (
          !acc[hijoId].lastLocation ||
          new Date(location.created_at) > new Date(acc[hijoId].lastLocation.created_at)
        ) {
          acc[hijoId].lastLocation = location;
        }
        return acc;
      }, {});
      setGroupedLocations(grouped);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChildExpansion = (hijoId) => {
    setExpandedChild(expandedChild === hijoId ? null : hijoId);
  };

  const openLocationMap = (location) => {
    setSelectedLocation(location);
    setIsMapModalOpen(true);
  };

  const closeMapModal = () => {
    setIsMapModalOpen(false);
    setSelectedLocation(null);
  };

  const mapMarkers = selectedLocation ? [
    {
      lat: parseFloat(selectedLocation.latitud),
      lng: parseFloat(selectedLocation.longitud),
      title: selectedLocation.hijo?.nombres || 'Ubicación',
      description: `Fecha: ${formatDateSafe(selectedLocation.created_at)}`
    }
  ] : [];

  const getStatusBadge = (totalLocations) => {
    if (totalLocations === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <span className="inline-flex h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
          Sin ubicaciones
        </span>
      );
    } else if (totalLocations < 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <span className="inline-flex h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
          Pocas ubicaciones
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          Activo
        </span>
      );
    }
  };

  const filteredGrupos = (grupos ?? []).filter((grupo) => {
    if (!search) return true;
    return (
      grupo.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (grupo.paquete?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (grupo.paquete?.destino || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AuthenticatedLayout>
      <Head title="Geolocalización" />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">Geolocalización por Grupos</h2>
          </div>

          <Card className="overflow-hidden">
            <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
              {/* Search bar */}
              <div className="mb-5 sm:mb-8">
                <form
                  onSubmit={handleSearch}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-end"
                >
                  <div>
                    <TextInput
                      type="text"
                      placeholder="Buscar por nombre de grupo, paquete o destino..."
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Limpiar
                      </SecondaryButton>
                    )}
                  </div>
                </form>
              </div>

              {/* Grupos Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de Grupos */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-base font-medium text-gray-900 mb-3">Seleccionar Grupo</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredGrupos.length > 0 ? (
                        filteredGrupos.map((grupo) => (
                          <div
                            key={grupo.id}
                            onClick={() => handleGroupClick(grupo)}
                            className={`cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                              selectedGroup && selectedGroup.id === grupo.id
                                ? 'bg-red-50 border-red-300 shadow-sm'
                                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900 text-sm">{grupo.nombre}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDateSafe(grupo.fecha_inicio)} - {formatDateSafe(grupo.fecha_fin)}
                            </div>
                            {grupo.paquete && (
                              <div className="text-xs text-gray-600 mt-1">
                                {grupo.paquete.nombre} • {grupo.paquete.destino}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">
                            {search ? 'No se encontraron grupos' : 'No hay grupos disponibles'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Historial de Ubicaciones */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-4">
                      <h3 className="text-base font-medium text-gray-900">
                        {selectedGroup ? `Historial de ${selectedGroup.nombre}` : 'Selecciona un grupo'}
                      </h3>
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-3 text-gray-600">Cargando ubicaciones...</span>
                      </div>
                    ) : error ? (
                      <div className="text-center py-12">
                        <div className="text-red-600 mb-2">
                          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm">{error}</p>
                        </div>
                      </div>
                    ) : selectedGroup ? (
                      Object.keys(groupedLocations).length > 0 ? (
                        <div className="space-y-4">
                          {/* Mobile - Cards */}
                          <div className="block md:hidden space-y-3">
                            {Object.entries(groupedLocations).map(([hijoId, data]) => (
                              <div key={hijoId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div 
                                  onClick={() => toggleChildExpansion(hijoId)}
                                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center">
                                      <svg 
                                        className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                                          expandedChild === hijoId ? 'rotate-90' : ''
                                        }`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                      <div>
                                        <h4 className="font-medium text-gray-900 text-sm">
                                          {data.hijo?.nombres ?? 'Participante'}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {data.totalLocations} ubicación
                                          {data.totalLocations !== 1 ? 'es' : ''}
                                        </p>
                                      </div>
                                    </div>
                                    {getStatusBadge(data.totalLocations)}
                                  </div>
                                  {data.lastLocation && (
                                    <div className="border-t border-gray-100 pt-3 mt-3">
                                      <div className="text-xs text-gray-600 space-y-1">
                                        <div>
                                          <span className="font-medium">Última ubicación:</span>{' '}
                                          {formatDateSafe(data.lastLocation.created_at)}
                                        </div>
                                        <div>
                                          <span className="font-medium">Coordenadas:</span>{' '}
                                          {data.lastLocation.latitud}, {data.lastLocation.longitud}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {expandedChild === hijoId && data.locations && (
                                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Ubicaciones de {data.hijo?.nombres ?? 'Participante'}</h4>
                                    <div className="space-y-3">
                                      {data.locations.map((location, index) => (
                                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                          <div className="space-y-2 mb-3">
                                             <div className="flex justify-between text-sm">
                                               <span className="text-gray-500 font-medium">Fecha:</span>
                                               <span className="text-gray-900">{new Date(location.created_at).toLocaleDateString('es-ES')}</span>
                                             </div>
                                             <div className="flex justify-between text-sm">
                                               <span className="text-gray-500 font-medium">Hora:</span>
                                               <span className="text-gray-900">{new Date(location.created_at).toLocaleTimeString('es-ES')}</span>
                                             </div>
                                             <div className="flex justify-between text-sm">
                                               <span className="text-gray-500 font-medium">Coordenadas:</span>
                                               <span className="text-gray-900">{location.latitud}, {location.longitud}</span>
                                             </div>
                                           </div>
                                          <SecondaryButton
                                            onClick={() => openLocationMap(location)}
                                            className="w-full text-xs py-2"
                                          >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Ver Mapa
                                          </SecondaryButton>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Desktop - Table */}
                          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Participante
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Ubicaciones
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Última Ubicación
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coordenadas
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(groupedLocations).map(([hijoId, data]) => (
                                  <React.Fragment key={hijoId}>
                                    <tr 
                                      onClick={() => toggleChildExpansion(hijoId)}
                                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                    >
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <svg 
                                            className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                                              expandedChild === hijoId ? 'rotate-90' : ''
                                            }`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                          <div className="text-sm font-medium text-gray-900">
                                            {data.hijo?.nombres ?? 'Participante'}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(data.totalLocations)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {data.totalLocations}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {data.lastLocation ? formatDateSafe(data.lastLocation.created_at) : 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {data.lastLocation
                                          ? `${data.lastLocation.latitud}, ${data.lastLocation.longitud}`
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    {expandedChild === hijoId && data.locations && (
                                      <tr>
                                        <td colSpan="5" className="px-6 py-0">
                                          <div className="bg-gray-50 rounded-lg p-4 my-2">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Ubicaciones de {data.hijo?.nombres ?? 'Participante'}</h4>
                                            <div className="space-y-2">
                                              {data.locations.map((location, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                                  <div className="flex-1">
                                                    <div className="text-sm text-gray-900">
                                                      <span className="font-medium">Fecha:</span> {new Date(location.created_at).toLocaleDateString('es-ES')}
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                      <span className="font-medium">Hora:</span> {new Date(location.created_at).toLocaleTimeString('es-ES')}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                      <span className="font-medium">Coordenadas:</span> {location.latitud}, {location.longitud}
                                                    </div>
                                                  </div>
                                                  <SecondaryButton
                                                    onClick={() => openLocationMap(location)}
                                                    className="ml-3 text-xs px-3 py-1"
                                                  >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Ver Mapa
                                                  </SecondaryButton>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <p className="text-gray-500 text-sm">No hay ubicaciones registradas para este grupo.</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                          />
                        </svg>
                        <p className="text-gray-500 text-sm">Selecciona un grupo para ver su historial de ubicaciones.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal del Mapa */}
      <Modal show={isMapModalOpen} onClose={closeMapModal} maxWidth="7xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Mapa de Ubicaciones - {selectedGroup?.nombre}
            </h3>
            <SecondaryButton onClick={closeMapModal} className="text-gray-400 hover:text-gray-600 p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </SecondaryButton>
          </div>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <InteractiveMap
              markers={mapMarkers}
              center={mapMarkers.length > 0 ? [mapMarkers[0].lat, mapMarkers[0].lng] : [-12.0464, -77.0428]}
              zoom={13}
            />
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
