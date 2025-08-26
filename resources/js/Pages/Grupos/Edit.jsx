import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { formatDateSafe } from '@/utils/dateUtils';

export default function Edit({ grupo, paquetes }) {

  const [encargados, setEncargados] = useState(
    Array.isArray(grupo.nombre_encargado) && grupo.nombre_encargado.length > 0
      ? grupo.nombre_encargado.map((nombre, index) => ({
          tipo: 'interno',
          tipoEspecifico: grupo.tipo_encargado?.[index] || '',
          nombre: nombre || '',
          celular: grupo.celular_encargado?.[index] || '',
        }))
      : [{ tipo: 'interno', tipoEspecifico: '', nombre: '', celular: '' }]
  );

  const [encargadosAgencia, setEncargadosAgencia] = useState(
    Array.isArray(grupo.nombre_encargado_agencia) && grupo.nombre_encargado_agencia.length > 0
      ? grupo.nombre_encargado_agencia.map((nombre, index) => ({
          tipo: 'agencia',
          tipoEspecifico: grupo.tipo_encargado_agencia?.[index] || '',
          nombre: nombre || '',
          celular: grupo.celular_encargado_agencia?.[index] || '',
        }))
      : [{ tipo: 'agencia', tipoEspecifico: '', nombre: '', celular: '' }]
  );

  const { data, setData, put, processing, errors } = useForm({
    paquete_id: grupo.paquete_id || '',
    nombre: grupo.nombre || '',
    capacidad: grupo.capacidad || '',
    fecha_inicio: grupo.fecha_inicio || '',
    fecha_fin: grupo.fecha_fin || '',
    tipo_encargado: Array.isArray(grupo.tipo_encargado) ? grupo.tipo_encargado : [grupo.tipo_encargado || ''],
    nombre_encargado: Array.isArray(grupo.nombre_encargado) ? grupo.nombre_encargado : [grupo.nombre_encargado || ''],
    celular_encargado: Array.isArray(grupo.celular_encargado) ? grupo.celular_encargado : [grupo.celular_encargado || ''],
    tipo_encargado_agencia: Array.isArray(grupo.tipo_encargado_agencia) ? grupo.tipo_encargado_agencia : [grupo.tipo_encargado_agencia || ''],
    nombre_encargado_agencia: Array.isArray(grupo.nombre_encargado_agencia) ? grupo.nombre_encargado_agencia : [grupo.nombre_encargado_agencia || ''],
    celular_encargado_agencia: Array.isArray(grupo.celular_encargado_agencia) ? grupo.celular_encargado_agencia : [grupo.celular_encargado_agencia || ''],
    activo: grupo.activo || false,
  });

  useEffect(() => {
    const tiposEspecificos = encargados.map(e => e.tipoEspecifico);
    const nombres = encargados.map(e => e.nombre);
    const celulares = encargados.map(e => e.celular);
    
    const tiposEspecificosAgencia = encargadosAgencia.map(e => e.tipoEspecifico);
    const nombresAgencia = encargadosAgencia.map(e => e.nombre);
    const celularesAgencia = encargadosAgencia.map(e => e.celular);

    setData({
      ...data,
      tipo_encargado: tiposEspecificos,
      nombre_encargado: nombres,
      celular_encargado: celulares,
      tipo_encargado_agencia: tiposEspecificosAgencia,
      nombre_encargado_agencia: nombresAgencia,
      celular_encargado_agencia: celularesAgencia,
    });
  }, [encargados, encargadosAgencia]);

  const addEncargado = () => {
    setEncargados([...encargados, { tipo: 'interno', tipoEspecifico: '', nombre: '', celular: '' }]);
  };

  const removeEncargado = (index) => {
    if (encargados.length > 1) {
      const newEncargados = encargados.filter((_, i) => i !== index);
      setEncargados(newEncargados);
    }
  };

  const updateEncargado = (index, field, value) => {
    const newEncargados = [...encargados];
    newEncargados[index][field] = value;
    setEncargados(newEncargados);
  };

  const addEncargadoAgencia = () => {
    setEncargadosAgencia([...encargadosAgencia, { tipo: 'agencia', tipoEspecifico: '', nombre: '', celular: '' }]);
  };

  const removeEncargadoAgencia = (index) => {
    if (encargadosAgencia.length > 1) {
      const newEncargados = encargadosAgencia.filter((_, i) => i !== index);
      setEncargadosAgencia(newEncargados);
    }
  };

  const updateEncargadoAgencia = (index, field, value) => {
    const newEncargados = [...encargadosAgencia];
    newEncargados[index][field] = value;
    setEncargadosAgencia(newEncargados);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('grupos.update', grupo.id));
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Editar Grupo</h2>
                <p className="text-sm text-gray-500">{grupo.nombre}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={route('grupos.index')}>
              <SecondaryButton>
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
      <Head title={`Editar Grupo - ${grupo.nombre}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Información del Grupo</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputLabel htmlFor="paquete_id" value="Paquete" />
                    <select
                      id="paquete_id"
                      value={data.paquete_id}
                      onChange={(e) => setData('paquete_id', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Seleccionar paquete...</option>
                      {paquetes.map((paquete) => (
                        <option key={paquete.id} value={paquete.id}>
                          {paquete.nombre}
                        </option>
                      ))}
                    </select>
                    <InputError message={errors.paquete_id} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="nombre" value="Nombre del Grupo" />
                    <TextInput
                      id="nombre"
                      type="text"
                      value={data.nombre}
                      onChange={(e) => setData('nombre', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="Nombre del grupo"
                      required
                    />
                    <InputError message={errors.nombre} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="capacidad" value="Capacidad (personas)" />
                    <TextInput
                      id="capacidad"
                      type="number"
                      min="1"
                      value={data.capacidad}
                      onChange={(e) => setData('capacidad', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="Número de personas"
                      required
                    />
                    <InputError message={errors.capacidad} className="mt-2" />
                  </div>

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

                  <div>
                    <InputLabel value="Estado" />
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={data.activo}
                          onChange={(e) => setData('activo', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-600">Grupo activo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Información del Encargado</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">Encargados Internos</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Personal de la empresa</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">Encargados de Agencia</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Personal externo</p>
                    </div>
                  </div>
                </div>
                <InputError message={errors.tipo_encargado} className="mt-2" />
              </div>

              <div className="p-6 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">Encargados Internos</h4>
                    <PrimaryButton type="button" onClick={addEncargado} className="px-3 py-2 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agregar Encargado
                    </PrimaryButton>
                  </div>

                  <div className="space-y-4">
                    {encargados.map((encargado, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200 relative"
                      >
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Interno
                          </span>
                        </div>

                        <div>
                          <InputLabel htmlFor={`tipo_especifico_${index}`} value="Tipo Específico" />
                          <TextInput
                            id={`tipo_especifico_${index}`}
                            type="text"
                            value={encargado.tipoEspecifico}
                            onChange={(e) => updateEncargado(index, 'tipoEspecifico', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Ej: Profesor, Auxiliar, Coordinador"
                            required
                          />
                        </div>

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
                          <TextInput
                            id={`celular_encargado_${index}`}
                            type="tel"
                            value={encargado.celular}
                            onChange={(e) => updateEncargado(index, 'celular', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Número de celular"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          {encargados.length > 1 && (
                            <SecondaryButton
                              type="button"
                              onClick={() => removeEncargado(index)}
                              className="mt-1 px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </SecondaryButton>
                          )}
                        </div>
                      </div>
                    ))}
                    <InputError message={errors.nombre_encargado} className="mt-2" />
                    <InputError message={errors.celular_encargado} className="mt-2" />
                  </div>
              </div>

              <div className="p-6 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">Encargados de Agencia</h4>
                    <PrimaryButton type="button" onClick={addEncargadoAgencia} className="px-3 py-2 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agregar Encargado
                    </PrimaryButton>
                  </div>

                  <div className="space-y-4">
                    {encargadosAgencia.map((encargado, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200 relative"
                      >
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                            Agencia
                          </span>
                        </div>

                        <div>
                          <InputLabel htmlFor={`tipo_especifico_agencia_${index}`} value="Tipo Específico" />
                          <TextInput
                            id={`tipo_especifico_agencia_${index}`}
                            type="text"
                            value={encargado.tipoEspecifico}
                            onChange={(e) => updateEncargadoAgencia(index, 'tipoEspecifico', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Ej: Guía, Coordinador, Asistente"
                            required
                          />
                        </div>

                        <div>
                          <InputLabel htmlFor={`nombre_agencia_${index}`} value="Nombre" />
                          <TextInput
                            id={`nombre_agencia_${index}`}
                            type="text"
                            value={encargado.nombre}
                            onChange={(e) => updateEncargadoAgencia(index, 'nombre', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Nombre del encargado"
                            required
                          />
                        </div>

                        <div>
                          <InputLabel htmlFor={`celular_agencia_${index}`} value="Celular" />
                          <TextInput
                            id={`celular_agencia_${index}`}
                            type="tel"
                            value={encargado.celular}
                            onChange={(e) => updateEncargadoAgencia(index, 'celular', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Número de celular"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          {encargadosAgencia.length > 1 && (
                            <SecondaryButton
                              type="button"
                              onClick={() => removeEncargadoAgencia(index)}
                              className="mt-1 px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </SecondaryButton>
                          )}
                        </div>
                      </div>
                    ))}
                    <InputError message={errors.nombre_encargado_agencia} className="mt-2" />
                    <InputError message={errors.celular_encargado_agencia} className="mt-2" />
                  </div>
                </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Información del Grupo</h4>
                <div className="text-sm text-blue-700">
                  <p>
                    <strong>ID:</strong> {grupo.id}
                  </p>
                  <p>
                    <strong>Creado:</strong> {formatDateSafe(grupo.created_at)}
                  </p>
                  <p>
                    <strong>Última actualización:</strong> {formatDateSafe(grupo.updated_at)}
                  </p>
                  {grupo.inscripciones_count !== undefined && (
                    <p>
                      <strong>Inscripciones:</strong> {grupo.inscripciones_count}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <Link href={route('grupos.index')}>
                  <SecondaryButton>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </SecondaryButton>
                </Link>
                <PrimaryButton type="submit" disabled={processing}>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
    </AuthenticatedLayout>
  );
}
