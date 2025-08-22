import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Create({ paquetes }) {
  const [tipoEncargado, setTipoEncargado] = useState('interno');
  const [encargados, setEncargados] = useState([{ nombre: '', celular: '' }]);
  const [encargadosAgencia, setEncargadosAgencia] = useState([{ nombre: '', celular: '' }]);

  const { data, setData, post, processing, errors, reset } = useForm({
    paquete_id: '',
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    capacidad: '',
    tipo_encargado: ['interno'],
    nombre_encargado: [''],
    celular_encargado: [''],
    nombre_encargado_agencia: [''],
    celular_encargado_agencia: [''],
    activo: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('grupos.store'), {
      onSuccess: () => {
        reset();
        setTipoEncargado('interno');
      },
    });
  };

  const handleTipoEncargadoChange = (tipo) => {
    setTipoEncargado(tipo);
    setData('tipo_encargado', [tipo]);
    if (tipo === 'interno') {
      setData({
        ...data,
        tipo_encargado: [tipo],
        nombre_encargado_agencia: [''],
        celular_encargado_agencia: [''],
      });
      setEncargadosAgencia([{ nombre: '', celular: '' }]);
    } else {
      setData({
        ...data,
        tipo_encargado: [tipo],
        nombre_encargado: [''],
        celular_encargado: [''],
      });
       setEncargados([{ nombre: '', celular: '' }]);
     }
   };

   const addEncargado = () => {
     const newEncargados = [...encargados, { nombre: '', celular: '' }];
     setEncargados(newEncargados);
     setData('nombre_encargado', newEncargados.map(e => e.nombre));
     setData('celular_encargado', newEncargados.map(e => e.celular));
   };

   const removeEncargado = (index) => {
     const newEncargados = encargados.filter((_, i) => i !== index);
     setEncargados(newEncargados);
     setData('nombre_encargado', newEncargados.map(e => e.nombre));
     setData('celular_encargado', newEncargados.map(e => e.celular));
   };

   const updateEncargado = (index, field, value) => {
     const newEncargados = [...encargados];
     newEncargados[index][field] = value;
     setEncargados(newEncargados);
     setData('nombre_encargado', newEncargados.map(e => e.nombre));
     setData('celular_encargado', newEncargados.map(e => e.celular));
   };

   const addEncargadoAgencia = () => {
     const newEncargados = [...encargadosAgencia, { nombre: '', celular: '' }];
     setEncargadosAgencia(newEncargados);
     setData('nombre_encargado_agencia', newEncargados.map(e => e.nombre));
     setData('celular_encargado_agencia', newEncargados.map(e => e.celular));
   };

   const removeEncargadoAgencia = (index) => {
     const newEncargados = encargadosAgencia.filter((_, i) => i !== index);
     setEncargadosAgencia(newEncargados);
     setData('nombre_encargado_agencia', newEncargados.map(e => e.nombre));
     setData('celular_encargado_agencia', newEncargados.map(e => e.celular));
   };

   const updateEncargadoAgencia = (index, field, value) => {
     const newEncargados = [...encargadosAgencia];
     newEncargados[index][field] = value;
     setEncargadosAgencia(newEncargados);
     setData('nombre_encargado_agencia', newEncargados.map(e => e.nombre));
     setData('celular_encargado_agencia', newEncargados.map(e => e.celular));
   };

  return (
    <AuthenticatedLayout
      header={
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3" id = "crear-grupo">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Grupo</h2>
          </div>
          
          <div id = "volver-grupos">
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
      <Head title="Crear Grupo" />

      <div className="py-8">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica del grupo */}
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
                    {/* Selección de paquete */}
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

                    {/* Nombre del grupo */}
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

                    {/* Fecha de Inicio */}
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

                    {/* Fecha de Fin */}
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

                    {/* Estado activo */}
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

                {/* Información del encargado - FONDO DINÁMICO */}
                <div
                  className={`p-6 rounded-xl transition-colors duration-300 border
                    ${tipoEncargado === 'interno'
                      ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center 
                        ${tipoEncargado === 'interno' ? 'bg-red-100' : 'bg-amber-100'}
                      `}
                    >
                      <svg
                        className={`w-5 h-5 ${tipoEncargado === 'interno' ? 'text-red-600' : 'text-amber-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Información del Encargado</h3>
                  </div>

                  {/* Tipo de encargado */}
                  <div className="mb-6">
                    <InputLabel value="Tipo de Encargado" />
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Interno */}
                      <label
                        className={`relative flex items-center p-4 bg-white rounded-lg border-2 cursor-pointer transition-colors duration-200
                          ${tipoEncargado === 'interno' ? 'border-red-300' : 'border-gray-200 hover:border-red-300'}
                        `}
                      >
                        <input
                          type="radio"
                          name="tipo_encargado"
                          value="interno"
                          checked={tipoEncargado === 'interno'}
                          onChange={(e) => handleTipoEncargadoChange(e.target.value)}
                          className="text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">Encargado Interno</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Personal de la empresa</p>
                        </div>
                      </label>

                      {/* Agencia */}
                      <label
                        className={`relative flex items-center p-4 bg-white rounded-lg border-2 cursor-pointer transition-colors duration-200
                          ${tipoEncargado === 'agencia' ? 'border-amber-300' : 'border-gray-200 hover:border-amber-300'}
                        `}
                      >
                        <input
                          type="radio"
                          name="tipo_encargado"
                          value="agencia"
                          checked={tipoEncargado === 'agencia'}
                          onChange={(e) => handleTipoEncargadoChange(e.target.value)}
                          className="text-amber-600 border-gray-300 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">Encargado de Agencia</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Personal externo</p>
                        </div>
                      </label>
                    </div>
                    <InputError message={errors.tipo_encargado} className="mt-2" />
                  </div>

                  {/* Campos del encargado */}
                  <div className="space-y-6">
                    {tipoEncargado === 'interno' ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium text-gray-900">Encargados Internos</h4>
                          <PrimaryButton
                            type="button"
                            onClick={addEncargado}
                            className="px-3 py-2 text-xs"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Agregar Encargado
                          </PrimaryButton>
                        </div>
                        {encargados.map((encargado, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                            <div>
                              <InputLabel htmlFor={`nombre_encargado_${index}`} value="Nombre del Encargado" />
                              <TextInput
                                id={`nombre_encargado_${index}`}
                                type="text"
                                value={encargado.nombre}
                                onChange={(e) => updateEncargado(index, 'nombre', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Nombre completo del encargado"
                                required
                              />
                            </div>
                            <div>
                              <InputLabel htmlFor={`celular_encargado_${index}`} value="Celular del Encargado" />
                              <div className="flex gap-2">
                                <TextInput
                                  id={`celular_encargado_${index}`}
                                  type="tel"
                                  value={encargado.celular}
                                  onChange={(e) => updateEncargado(index, 'celular', e.target.value)}
                                  className="mt-1 block w-full"
                                  placeholder="Ej: +51 999 888 777"
                                  required
                                />
                                {encargados.length > 1 && (
                                  <SecondaryButton
                                    type="button"
                                    onClick={() => removeEncargado(index)}
                                    className="mt-1 px-3 py-2 text-red-600 hover:text-red-700"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </SecondaryButton>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <InputError message={errors.nombre_encargado} className="mt-2" />
                        <InputError message={errors.celular_encargado} className="mt-2" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium text-gray-900">Encargados de Agencia</h4>
                          <PrimaryButton
                            type="button"
                            onClick={addEncargadoAgencia}
                            className="px-3 py-2 text-xs"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Agregar Encargado
                          </PrimaryButton>
                        </div>
                        {encargadosAgencia.map((encargado, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                            <div>
                              <InputLabel htmlFor={`nombre_encargado_agencia_${index}`} value="Nombre del Encargado de Agencia" />
                              <TextInput
                                id={`nombre_encargado_agencia_${index}`}
                                type="text"
                                value={encargado.nombre}
                                onChange={(e) => updateEncargadoAgencia(index, 'nombre', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Nombre completo del encargado de agencia"
                                required
                              />
                            </div>
                            <div>
                              <InputLabel htmlFor={`celular_encargado_agencia_${index}`} value="Celular del Encargado de Agencia" />
                              <div className="flex gap-2">
                                <TextInput
                                  id={`celular_encargado_agencia_${index}`}
                                  type="tel"
                                  value={encargado.celular}
                                  onChange={(e) => updateEncargadoAgencia(index, 'celular', e.target.value)}
                                  className="mt-1 block w-full"
                                  placeholder="Ej: +51 999 888 777"
                                  required
                                />
                                {encargadosAgencia.length > 1 && (
                                  <SecondaryButton
                                    type="button"
                                    onClick={() => removeEncargadoAgencia(index)}
                                    className="mt-1 px-3 py-2 text-red-600 hover:text-red-700"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </SecondaryButton>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <InputError message={errors.nombre_encargado_agencia} className="mt-2" />
                        <InputError message={errors.celular_encargado_agencia} className="mt-2" />
                      </div>
                    )}
                  </div>
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
                        Creando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Crear Grupo
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
