import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SubgrupoManager from '@/Components/SubgrupoManager';

export default function Edit({ grupo, paquetes }) {
  const [subgrupos, setSubgrupos] = useState(grupo.subgrupos || []);
  const [documentos, setDocumentos] = useState(grupo.documentos_links || []);

  const { data, setData, put, processing, errors, reset } = useForm({
    paquete_id: grupo.paquete_id || '',
    nombre: grupo.nombre || '',
    fecha_inicio: grupo.fecha_inicio || '',
    fecha_fin: grupo.fecha_fin || '',
    capacidad: grupo.capacidad || '',
    activo: grupo.activo || false,
    subgrupos: grupo.subgrupos || [],
    documentos_links: grupo.documentos_links || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update subgroups and documents data before submitting
    setData('subgrupos', subgrupos);
    setData('documentos_links', documentos);
    put(route('grupos.update', grupo.id), {
      onSuccess: () => {
        // Success message handled by redirect
      },
    });
  };

  const handleSubgruposChange = (updatedSubgrupos) => {
    setSubgrupos(updatedSubgrupos);
    setData('subgrupos', updatedSubgrupos);
  };

  const handleAddDocumento = () => {
    const newDocumento = { titulo: '', url: '' };
    const updatedDocumentos = [...documentos, newDocumento];
    setDocumentos(updatedDocumentos);
    setData('documentos_links', updatedDocumentos);
  };

  const handleRemoveDocumento = (index) => {
    const updatedDocumentos = documentos.filter((_, i) => i !== index);
    setDocumentos(updatedDocumentos);
    setData('documentos_links', updatedDocumentos);
  };

  const handleDocumentoChange = (index, field, value) => {
    const updatedDocumentos = [...documentos];
    updatedDocumentos[index][field] = value;
    setDocumentos(updatedDocumentos);
    setData('documentos_links', updatedDocumentos);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3" id="editar-grupo">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Grupo: {grupo.nombre}</h2>
          </div>

          <div id="volver-grupos">
            <Link href={route('grupos.index')}>
              <SecondaryButton className="border-gray-300 hover:bg-gray-50 text-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a Grupos
              </SecondaryButton>
            </Link>
          </div>
        </div>
      }
    >
      <Head title={`Editar Grupo: ${grupo.nombre}`} />

      <div className="py-8">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información del Grupo */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Información del Grupo</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Paquete */}
                    <div>
                      <InputLabel htmlFor="paquete_id" value="Paquete" />
                      <select
                        id="paquete_id"
                        value={data.paquete_id}
                        onChange={(e) => setData('paquete_id', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500 bg-white"
                        required
                      >
                        <option value="">Seleccionar paquete...</option>
                        {paquetes.map((paquete) => (
                          <option key={paquete.id} value={paquete.id}>
                            {paquete.nombre} - {paquete.destino}
                          </option>
                        ))}
                      </select>
                      <InputError message={errors.paquete_id} className="mt-2" />
                    </div>

                    {/* Nombre */}
                    <div>
                      <InputLabel htmlFor="nombre" value="Nombre del Grupo" />
                      <TextInput
                        id="nombre"
                        type="text"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ej: Grupo Familiar Lima"
                        required
                      />
                      <InputError message={errors.nombre} className="mt-2" />
                    </div>

                    {/* Capacidad */}
                    <div>
                      <InputLabel htmlFor="capacidad" value="Capacidad (personas)" />
                      <TextInput
                        id="capacidad"
                        type="number"
                        min="1"
                        max="100"
                        value={data.capacidad}
                        onChange={(e) => setData('capacidad', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ej: 25"
                        required
                      />
                      <InputError message={errors.capacidad} className="mt-2" />
                    </div>

                    {/* Fechas */}
                    <div>
                      <InputLabel htmlFor="fecha_inicio" value="Fecha de Inicio" />
                      <TextInput
                        id="fecha_inicio"
                        type="date"
                        value={data.fecha_inicio}
                        onChange={(e) => setData('fecha_inicio', e.target.value)}
                        className="mt-1 block w-full"
                        required
                      />
                      <InputError message={errors.fecha_inicio} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="fecha_fin" value="Fecha de Fin" />
                      <TextInput
                        id="fecha_fin"
                        type="date"
                        value={data.fecha_fin}
                        onChange={(e) => setData('fecha_fin', e.target.value)}
                        className="mt-1 block w-full"
                        required
                      />
                      <InputError message={errors.fecha_fin} className="mt-2" />
                    </div>

                    {/* Estado */}
                    <div>
                      <InputLabel value="Estado" />
                      <div className="mt-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={data.activo}
                            onChange={(e) => setData('activo', e.target.checked)}
                            className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-500 focus:ring-red-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">Grupo activo</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gestión de Subgrupos */}
                <SubgrupoManager
                  subgrupos={subgrupos}
                  onChange={handleSubgruposChange}
                  errors={errors}
                />

                {/* Documentos para Descargar */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Documentos Necesarios para Descargar</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDocumento}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar Documento
                    </button>
                  </div>

                  {documentos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No hay documentos agregados. Haz clic en "Agregar Documento" para añadir links de documentos PDF.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {documentos.map((doc, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <InputLabel htmlFor={`doc_titulo_${index}`} value="Título del Documento" />
                                <TextInput
                                  id={`doc_titulo_${index}`}
                                  type="text"
                                  value={doc.titulo}
                                  onChange={(e) => handleDocumentoChange(index, 'titulo', e.target.value)}
                                  className="mt-1 block w-full"
                                  placeholder="Ej: Documento de Identidad"
                                />
                                <InputError message={errors[`documentos_links.${index}.titulo`]} className="mt-2" />
                              </div>
                              <div>
                                <InputLabel htmlFor={`doc_url_${index}`} value="URL del Documento (PDF)" />
                                <TextInput
                                  id={`doc_url_${index}`}
                                  type="url"
                                  value={doc.url}
                                  onChange={(e) => handleDocumentoChange(index, 'url', e.target.value)}
                                  className="mt-1 block w-full"
                                  placeholder="https://ejemplo.com/documento.pdf"
                                />
                                <InputError message={errors[`documentos_links.${index}.url`]} className="mt-2" />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocumento(index)}
                              className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Eliminar documento"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                  <Link href={route('grupos.index')}>
                    <SecondaryButton
                      type="button"
                      className="px-6 py-3 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </SecondaryButton>
                  </Link>

                  <PrimaryButton
                    type="submit"
                    disabled={processing}
                    className="px-8 py-3 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Actualizar Grupo
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}