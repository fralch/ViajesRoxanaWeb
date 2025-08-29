import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import Card from '@/Components/Card';

export default function Show({ hijo }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Detalles de ${hijo.nombres}`} />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">
              Detalles de {hijo.nombres}
            </h2>
            <div className="flex gap-2">
              <Link href={route('hijos.edit', hijo.id)} className="w-full sm:w-auto">
                <SecondaryButton className="w-full sm:w-auto gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </SecondaryButton>
              </Link>
              <Link href={route('hijos.index')} className="w-full sm:w-auto">
                <SecondaryButton className="w-full sm:w-auto gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </SecondaryButton>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <Card>
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Información Personal
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                    <p className="mt-1 text-sm text-gray-900">{hijo.nombres}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de documento</label>
                      <p className="mt-1 text-sm text-gray-900">{hijo.doc_tipo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número de documento</label>
                      <p className="mt-1 text-sm text-gray-900">{hijo.doc_numero}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(hijo.fecha_nacimiento)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Edad</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {hijo.fecha_nacimiento ? `${calculateAge(hijo.fecha_nacimiento)} años` : 'No calculable'}
                      </p>
                    </div>
                  </div>

                  {hijo.user && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Padre/Tutor</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{hijo.user.name}</p>
                        <p className="text-sm text-gray-600">{hijo.user.email}</p>
                        {hijo.user.phone && (
                          <p className="text-sm text-gray-600">Tel: {hijo.user.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {hijo.nums_emergencia && Array.isArray(hijo.nums_emergencia) && hijo.nums_emergencia.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Números de emergencia</label>
                      <div className="mt-1 space-y-1">
                        {hijo.nums_emergencia.map((numero, index) => (
                          <p key={index} className="text-sm text-gray-900 bg-red-50 px-2 py-1 rounded">{numero}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Información Adicional */}
            <Card>
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Preferencias e Intereses
                </h3>
                
                <div className="space-y-4">
                  {hijo.plato_favorito && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plato favorito</label>
                      <p className="mt-1 text-sm text-gray-900">{hijo.plato_favorito}</p>
                    </div>
                  )}

                  {hijo.color_favorito && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color favorito</label>
                      <div className="mt-1 flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: hijo.color_favorito }}
                        ></div>
                        <p className="text-sm text-gray-900">{hijo.color_favorito}</p>
                      </div>
                    </div>
                  )}

                  {hijo.pasatiempos && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pasatiempos</label>
                      <p className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">{hijo.pasatiempos}</p>
                    </div>
                  )}

                  {hijo.deportes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deportes</label>
                      <p className="mt-1 text-sm text-gray-900 bg-green-50 p-3 rounded-lg">{hijo.deportes}</p>
                    </div>
                  )}

                  {hijo.informacion_adicional && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Información adicional</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{hijo.informacion_adicional}</p>
                    </div>
                  )}

                  {!hijo.plato_favorito && !hijo.color_favorito && !hijo.pasatiempos && !hijo.deportes && !hijo.informacion_adicional && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">No hay información adicional registrada</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Inscripciones */}
          {hijo.inscripciones && hijo.inscripciones.length > 0 && (
            <Card className="mt-6">
              <div className="px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Inscripciones Activas
                </h3>
                
                <div className="space-y-3">
                  {hijo.inscripciones.map((inscripcion) => (
                    <div key={inscripcion.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-purple-900">
                            {inscripcion.grupo?.paquete?.nombre || 'Paquete no disponible'}
                          </h4>
                          <p className="text-sm text-purple-700">
                            Grupo: {inscripcion.grupo?.nombre || 'No especificado'}
                          </p>
                          <p className="text-sm text-purple-600">
                            Destino: {inscripcion.grupo?.paquete?.destino || 'No especificado'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            inscripcion.estado === 'activa' 
                              ? 'bg-green-100 text-green-800' 
                              : inscripcion.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {inscripcion.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}