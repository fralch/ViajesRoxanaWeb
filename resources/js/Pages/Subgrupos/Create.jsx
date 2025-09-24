import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Create({ grupos }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    grupo_id: '',
    nombre: '',
    descripcion: '',
    tipo_encargado_principal: 'padre',
    nombre_encargado_principal: '',
    celular_encargado_principal: '',
    email_encargado_principal: '',
    tipo_encargado_secundario: '',
    nombre_encargado_secundario: '',
    celular_encargado_secundario: '',
    email_encargado_secundario: '',
    capacidad_maxima: 10,
    activo: true,
    observaciones: ''
  });

  const tiposEncargado = [
    { value: 'padre', label: 'Padre' },
    { value: 'madre', label: 'Madre' },
    { value: 'tutor_legal', label: 'Tutor Legal' },
    { value: 'familiar', label: 'Familiar' },
    { value: 'otro', label: 'Otro' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('subgrupos.store'), {
      onSuccess: () => {
        reset();
      },
    });
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
            <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Subgrupo</h2>
          </div>

          <div>
            <Link href={route('subgrupos.index')}>
              <SecondaryButton className="border-gray-300 hover:bg-gray-50 text-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a Subgrupos
              </SecondaryButton>
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Crear Subgrupo" />

      <div className="py-8">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Básica */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Información del Subgrupo</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grupo */}
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
                            {grupo.nombre} - {grupo.paquete?.nombre}
                          </option>
                        ))}
                      </select>
                      <InputError message={errors.grupo_id} className="mt-2" />
                    </div>

                    {/* Nombre */}
                    <div>
                      <InputLabel htmlFor="nombre" value="Nombre del Subgrupo" />
                      <TextInput
                        id="nombre"
                        type="text"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ej: Grupo Pequeños"
                        required
                      />
                      <InputError message={errors.nombre} className="mt-2" />
                    </div>

                    {/* Capacidad */}
                    <div>
                      <InputLabel htmlFor="capacidad_maxima" value="Capacidad Máxima" />
                      <TextInput
                        id="capacidad_maxima"
                        type="number"
                        min="1"
                        max="50"
                        value={data.capacidad_maxima}
                        onChange={(e) => setData('capacidad_maxima', parseInt(e.target.value) || 10)}
                        className="mt-1 block w-full"
                        required
                      />
                      <InputError message={errors.capacidad_maxima} className="mt-2" />
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
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">Subgrupo activo</span>
                        </label>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                      <InputLabel htmlFor="descripcion" value="Descripción" />
                      <textarea
                        id="descripcion"
                        value={data.descripcion}
                        onChange={(e) => setData('descripcion', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows="3"
                        placeholder="Descripción opcional del subgrupo"
                      />
                      <InputError message={errors.descripcion} className="mt-2" />
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
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        {tiposEncargado.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
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
                        placeholder="Nombre del encargado"
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
                        placeholder="+51 999 888 777"
                        required
                      />
                      <InputError message={errors.celular_encargado_principal} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="email_encargado_principal" value="Email (Opcional)" />
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
                  </div>
                </div>

                {/* Encargado Secundario */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Encargado Secundario (Opcional)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InputLabel htmlFor="tipo_encargado_secundario" value="Tipo de Encargado" />
                      <select
                        id="tipo_encargado_secundario"
                        value={data.tipo_encargado_secundario}
                        onChange={(e) => setData('tipo_encargado_secundario', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar...</option>
                        {tiposEncargado.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
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
                        placeholder="Nombre del encargado secundario"
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
                        placeholder="+51 999 888 777"
                      />
                      <InputError message={errors.celular_encargado_secundario} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="email_encargado_secundario" value="Email (Opcional)" />
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
                  </div>
                </div>

                {/* Observaciones */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Observaciones</h3>
                  </div>

                  <div>
                    <InputLabel htmlFor="observaciones" value="Observaciones Adicionales" />
                    <textarea
                      id="observaciones"
                      value={data.observaciones}
                      onChange={(e) => setData('observaciones', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows="4"
                      placeholder="Observaciones adicionales sobre el subgrupo"
                    />
                    <InputError message={errors.observaciones} className="mt-2" />
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                  <Link href={route('subgrupos.index')}>
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
                        Creando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Crear Subgrupo
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