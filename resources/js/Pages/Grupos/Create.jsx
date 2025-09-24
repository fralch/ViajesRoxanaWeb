import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SubgrupoManager from '@/Components/SubgrupoManager';

export default function Create({ paquetes }) {
  const [subgrupos, setSubgrupos] = useState([]);

  const { data, setData, post, processing, errors, reset } = useForm({
    paquete_id: '',
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    capacidad: '',
    activo: true,
    subgrupos: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update subgroups data before submitting
    setData('subgrupos', subgrupos);
    post(route('grupos.store'), {
      onSuccess: () => {
        reset();
        setSubgrupos([]);
      },
    });
  };

  const handleSubgruposChange = (updatedSubgrupos) => {
    setSubgrupos(updatedSubgrupos);
    setData('subgrupos', updatedSubgrupos);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3" id="crear-grupo">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Grupo</h2>
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
      <Head title="Crear Grupo" />

      <div className="py-8">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
            <div className="p-8">
              {/* ÚNICO FORM QUE ENVUELVE TODO */}
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
              {/* FIN ÚNICO FORM */}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
