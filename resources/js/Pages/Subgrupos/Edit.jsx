import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Edit({ subgrupo, grupos }) {
  const { data, setData, put, processing, errors } = useForm({
    grupo_id: subgrupo.grupo_id || '',
    nombre: subgrupo.nombre || '',
    capacidad_maxima: subgrupo.capacidad_maxima || '',
    edad_minima: subgrupo.edad_minima || '',
    edad_maxima: subgrupo.edad_maxima || '',
    tipo_encargado_principal: subgrupo.tipo_encargado_principal || '',
    nombre_encargado_principal: subgrupo.nombre_encargado_principal || '',
    celular_encargado_principal: subgrupo.celular_encargado_principal || '',
    email_encargado_principal: subgrupo.email_encargado_principal || '',
    direccion_encargado_principal: subgrupo.direccion_encargado_principal || '',
    tiene_encargado_secundario: subgrupo.tiene_encargado_secundario || false,
    tipo_encargado_secundario: subgrupo.tipo_encargado_secundario || '',
    nombre_encargado_secundario: subgrupo.nombre_encargado_secundario || '',
    celular_encargado_secundario: subgrupo.celular_encargado_secundario || '',
    email_encargado_secundario: subgrupo.email_encargado_secundario || '',
    direccion_encargado_secundario: subgrupo.direccion_encargado_secundario || '',
    observaciones: subgrupo.observaciones || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('subgrupos.update', subgrupo.id));
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Subgrupo: {subgrupo.nombre}</h2>
          </div>

          <div className="flex gap-3">
            <Link href={route('subgrupos.show', subgrupo.id)}>
              <SecondaryButton className="border-gray-300 hover:bg-gray-50 text-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Subgrupo
              </SecondaryButton>
            </Link>
            <Link href={route('subgrupos.index')}>
              <SecondaryButton className="border-gray-300 hover:bg-gray-50 text-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </SecondaryButton>
            </Link>
          </div>
        </div>
      }
    >
      <Head title={`Editar Subgrupo: ${subgrupo.nombre}`} />

      <div className="py-8">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información Básica */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InputLabel htmlFor="grupo_id" value="Grupo" />
                      <select
                        id="grupo_id"
                        value={data.grupo_id}
                        onChange={(e) => setData('grupo_id', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                        required
                      >
                        <option value="">Seleccionar grupo...</option>
                        {grupos.map((grupo) => (
                          <option key={grupo.id} value={grupo.id}>
                            {grupo.nombre} ({grupo.paquete?.nombre})
                          </option>
                        ))}
                      </select>
                      <InputError message={errors.grupo_id} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="nombre" value="Nombre del Subgrupo" />
                      <TextInput
                        id="nombre"
                        type="text"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ej: Niños 8-12 años"
                        required
                      />
                      <InputError message={errors.nombre} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="capacidad_maxima" value="Capacidad Máxima" />
                      <TextInput
                        id="capacidad_maxima"
                        type="number"
                        min="1"
                        max="50"
                        value={data.capacidad_maxima}
                        onChange={(e) => setData('capacidad_maxima', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ej: 10"
                        required
                      />
                      <InputError message={errors.capacidad_maxima} className="mt-2" />
                    </div>

                    <div className="md:col-span-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <InputLabel htmlFor="edad_minima" value="Edad Mínima" />
                          <TextInput
                            id="edad_minima"
                            type="number"
                            min="0"
                            max="18"
                            value={data.edad_minima}
                            onChange={(e) => setData('edad_minima', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Ej: 8"
                          />
                          <InputError message={errors.edad_minima} className="mt-2" />
                        </div>

                        <div>
                          <InputLabel htmlFor="edad_maxima" value="Edad Máxima" />
                          <TextInput
                            id="edad_maxima"
                            type="number"
                            min="0"
                            max="18"
                            value={data.edad_maxima}
                            onChange={(e) => setData('edad_maxima', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Ej: 12"
                          />
                          <InputError message={errors.edad_maxima} className="mt-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Encargado Principal */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Encargado Principal</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InputLabel htmlFor="tipo_encargado_principal" value="Tipo de Encargado" />
                      <select
                        id="tipo_encargado_principal"
                        value={data.tipo_encargado_principal}
                        onChange={(e) => setData('tipo_encargado_principal', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 bg-white"
                        required
                      >
                        <option value="">Seleccionar tipo...</option>
                        <option value="padre">Padre</option>
                        <option value="madre">Madre</option>
                        <option value="tutor_legal">Tutor Legal</option>
                        <option value="familiar">Familiar</option>
                        <option value="otro">Otro</option>
                      </select>
                      <InputError message={errors.tipo_encargado_principal} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="nombre_encargado_principal" value="Nombre Completo" />
                      <TextInput
                        id="nombre_encargado_principal"
                        type="text"
                        value={data.nombre_encargado_principal}
                        onChange={(e) => setData('nombre_encargado_principal', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Nombre y apellidos"
                        required
                      />
                      <InputError message={errors.nombre_encargado_principal} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="celular_encargado_principal" value="Celular" />
                      <TextInput
                        id="celular_encargado_principal"
                        type="tel"
                        value={data.celular_encargado_principal}
                        onChange={(e) => setData('celular_encargado_principal', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ej: +51 999 999 999"
                        required
                      />
                      <InputError message={errors.celular_encargado_principal} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="email_encargado_principal" value="Email" />
                      <TextInput
                        id="email_encargado_principal"
                        type="email"
                        value={data.email_encargado_principal}
                        onChange={(e) => setData('email_encargado_principal', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="email@ejemplo.com"
                      />
                      <InputError message={errors.email_encargado_principal} className="mt-2" />
                    </div>

                    <div className="md:col-span-2">
                      <InputLabel htmlFor="direccion_encargado_principal" value="Dirección" />
                      <TextInput
                        id="direccion_encargado_principal"
                        type="text"
                        value={data.direccion_encargado_principal}
                        onChange={(e) => setData('direccion_encargado_principal', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Dirección completa"
                      />
                      <InputError message={errors.direccion_encargado_principal} className="mt-2" />
                    </div>
                  </div>
                </div>

                {/* Encargado Secundario */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Encargado  de Agencia de Viajes</h3>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={data.tiene_encargado_secundario}
                        onChange={(e) => setData('tiene_encargado_secundario', e.target.checked)}
                        className="rounded border-gray-300 text-amber-600 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Agregar encargado de Agencia de Viajes</span>
                    </label>
                  </div>

                  {data.tiene_encargado_secundario && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InputLabel htmlFor="tipo_encargado_secundario" value="Tipo de Encargado" />
                        <select
                          id="tipo_encargado_secundario"
                          value={data.tipo_encargado_secundario}
                          onChange={(e) => setData('tipo_encargado_secundario', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white"
                        >
                          <option value="">Seleccionar tipo...</option>
                          <option value="viajes_roxana">Viajes Roxana</option>
                          <option value="otro">Otro</option>
                        </select>
                        <InputError message={errors.tipo_encargado_secundario} className="mt-2" />
                      </div>

                      <div>
                        <InputLabel htmlFor="nombre_encargado_secundario" value="Nombre Completo" />
                        <TextInput
                          id="nombre_encargado_secundario"
                          type="text"
                          value={data.nombre_encargado_secundario}
                          onChange={(e) => setData('nombre_encargado_secundario', e.target.value)}
                          className="mt-1 block w-full"
                          placeholder="Nombre y apellidos"
                        />
                        <InputError message={errors.nombre_encargado_secundario} className="mt-2" />
                      </div>

                      <div>
                        <InputLabel htmlFor="celular_encargado_secundario" value="Celular" />
                        <TextInput
                          id="celular_encargado_secundario"
                          type="tel"
                          value={data.celular_encargado_secundario}
                          onChange={(e) => setData('celular_encargado_secundario', e.target.value)}
                          className="mt-1 block w-full"
                          placeholder="Ej: +51 999 999 999"
                        />
                        <InputError message={errors.celular_encargado_secundario} className="mt-2" />
                      </div>

                      <div>
                        <InputLabel htmlFor="email_encargado_secundario" value="Email" />
                        <TextInput
                          id="email_encargado_secundario"
                          type="email"
                          value={data.email_encargado_secundario}
                          onChange={(e) => setData('email_encargado_secundario', e.target.value)}
                          className="mt-1 block w-full"
                          placeholder="email@ejemplo.com"
                        />
                        <InputError message={errors.email_encargado_secundario} className="mt-2" />
                      </div>

                      <div className="md:col-span-2">
                        <InputLabel htmlFor="direccion_encargado_secundario" value="Dirección" />
                        <TextInput
                          id="direccion_encargado_secundario"
                          type="text"
                          value={data.direccion_encargado_secundario}
                          onChange={(e) => setData('direccion_encargado_secundario', e.target.value)}
                          className="mt-1 block w-full"
                          placeholder="Dirección completa"
                        />
                        <InputError message={errors.direccion_encargado_secundario} className="mt-2" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Observaciones */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Observaciones</h3>
                  </div>

                  <div>
                    <InputLabel htmlFor="observaciones" value="Observaciones adicionales" />
                    <textarea
                      id="observaciones"
                      value={data.observaciones}
                      onChange={(e) => setData('observaciones', e.target.value)}
                      rows="4"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Información adicional relevante para el subgrupo..."
                    />
                    <InputError message={errors.observaciones} className="mt-2" />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                  <Link href={route('subgrupos.show', subgrupo.id)}>
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
                    className="px-8 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Actualizar Subgrupo
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