import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { showSuccess, showError } from '../../utils/swal';

export default function Edit({ paquete }) {
  const { data, setData, put, processing, errors } = useForm({
    nombre: paquete.nombre || '',
    destino: paquete.destino || '',
    descripcion: paquete.descripcion || '',
    activo: paquete.activo || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('paquetes.update', paquete.id), {
      onSuccess: () => {
        showSuccess('¡Paquete actualizado!', 'Los cambios han sido guardados exitosamente.');
      },
      onError: () => {
        showError('Error', 'No se pudo actualizar el paquete. Revisa los datos ingresados.');
      }
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Editar Paquete</h2>
                <p className="text-sm text-gray-500">{paquete.nombre}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={route('paquetes.index')}>
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
      <Head title={`Editar Paquete - ${paquete.nombre}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Información del Paquete</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputLabel htmlFor="nombre" value="Nombre del Paquete" />
                    <TextInput
                      id="nombre"
                      type="text"
                      value={data.nombre}
                      onChange={(e) => setData('nombre', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="Ej: Paquete a Cusco"
                      required
                    />
                    <InputError message={errors.nombre} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="destino" value="Destino" />
                    <TextInput
                      id="destino"
                      type="text"
                      value={data.destino}
                      onChange={(e) => setData('destino', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="Ej: Cusco, Perú"
                      required
                    />
                    <InputError message={errors.destino} className="mt-2" />
                  </div>

                  <div className="md:col-span-2">
                    <InputLabel htmlFor="descripcion" value="Descripción" />
                    <textarea
                      id="descripcion"
                      value={data.descripcion}
                      onChange={(e) => setData('descripcion', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500 bg-white"
                      rows="4"
                      placeholder="Descripción detallada del paquete..."
                    ></textarea>
                    <InputError message={errors.descripcion} className="mt-2" />
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
                        <span className="ml-2 text-sm text-gray-600">Paquete activo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <Link href={route('paquetes.index')}>
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
                      Actualizar Paquete
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