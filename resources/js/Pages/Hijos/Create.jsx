import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Card from '@/Components/Card';
import { showSuccess, showError } from '../../utils/swal';

export default function Create({ users, auth }) {
  const { data, setData, post, processing, errors } = useForm({
    user_id: auth.user.is_admin ? '' : auth.user.id,
    nombres: '',
    doc_tipo: 'CC',
    doc_numero: '',
    nums_emergencia: [''],
    fecha_nacimiento: '',
    foto: '',
    pasatiempos: '',
    deportes: '',
    plato_favorito: '',
    color_favorito: '#000000',
    informacion_adicional: ''
  });

  const [emergencyNumbers, setEmergencyNumbers] = useState(['']);

  const addEmergencyNumber = () => {
    const newNumbers = [...emergencyNumbers, ''];
    setEmergencyNumbers(newNumbers);
    setData('nums_emergencia', newNumbers);
  };

  const removeEmergencyNumber = (index) => {
    if (emergencyNumbers.length > 1) {
      const newNumbers = emergencyNumbers.filter((_, i) => i !== index);
      setEmergencyNumbers(newNumbers);
      setData('nums_emergencia', newNumbers);
    }
  };

  const updateEmergencyNumber = (index, value) => {
    const newNumbers = [...emergencyNumbers];
    newNumbers[index] = value;
    setEmergencyNumbers(newNumbers);
    setData('nums_emergencia', newNumbers);
  };

  const submit = (e) => {
    e.preventDefault();
    
    post(route('hijos.store'), {
      onSuccess: () => {
        showSuccess('¡Éxito!', 'Hijo registrado exitosamente.');
      },
      onError: (errors) => {
        showError('Error', 'Por favor revisa los datos ingresados.');
      }
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Registrar Nuevo Hijo" />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">
              Registrar Nuevo Hijo
            </h2>
            <Link href={route('hijos.index')} className="w-full sm:w-auto">
              <SecondaryButton className="w-full sm:w-auto gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </SecondaryButton>
            </Link>
          </div>

          <Card>
            <div className="px-6 py-5">
              <form onSubmit={submit} className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {auth.user.is_admin && (
                      <div className="md:col-span-2">
                        <InputLabel htmlFor="user_id" value="Padre/Tutor *" />
                        <select
                          id="user_id"
                          name="user_id"
                          value={data.user_id}
                          onChange={(e) => setData('user_id', e.target.value)}
                          className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                          required
                        >
                          <option value="">Seleccionar padre/tutor</option>
                          {users && users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} - {user.email}
                            </option>
                          ))}
                        </select>
                        <InputError message={errors.user_id} className="mt-2" />
                      </div>
                    )}

                    <div>
                      <InputLabel htmlFor="nombres" value="Nombre completo *" />
                      <TextInput
                        id="nombres"
                        type="text"
                        name="nombres"
                        value={data.nombres}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('nombres', e.target.value)}
                        required
                      />
                      <InputError message={errors.nombres} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="doc_tipo" value="Tipo de documento *" />
                      <select
                        id="doc_tipo"
                        name="doc_tipo"
                        value={data.doc_tipo}
                        onChange={(e) => setData('doc_tipo', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        required
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="RC">Registro Civil</option>
                        <option value="CE">Cédula de Extranjería</option>
                      </select>
                      <InputError message={errors.doc_tipo} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="doc_numero" value="Número de documento *" />
                      <TextInput
                        id="doc_numero"
                        type="text"
                        name="doc_numero"
                        value={data.doc_numero}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('doc_numero', e.target.value)}
                        required
                      />
                      <InputError message={errors.doc_numero} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="fecha_nacimiento" value="Fecha de nacimiento *" />
                      <TextInput
                        id="fecha_nacimiento"
                        type="date"
                        name="fecha_nacimiento"
                        value={data.fecha_nacimiento}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                        required
                      />
                      <InputError message={errors.fecha_nacimiento} className="mt-2" />
                    </div>
                  </div>
                </div>

                {/* Números de Emergencia */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Números de Emergencia *
                  </h3>
                  
                  <div className="space-y-3">
                    {emergencyNumbers.map((number, index) => (
                      <div key={index} className="flex gap-2">
                        <TextInput
                          type="tel"
                          value={number}
                          onChange={(e) => updateEmergencyNumber(index, e.target.value)}
                          placeholder="Número de emergencia"
                          className="flex-1"
                          required
                        />
                        {emergencyNumbers.length > 1 && (
                          <SecondaryButton
                            type="button"
                            onClick={() => removeEmergencyNumber(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </SecondaryButton>
                        )}
                      </div>
                    ))}
                    <SecondaryButton
                      type="button"
                      onClick={addEmergencyNumber}
                      className="gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agregar número
                    </SecondaryButton>
                  </div>
                  <InputError message={errors.nums_emergencia} className="mt-2" />
                </div>

                {/* Preferencias e Intereses */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Preferencias e Intereses
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InputLabel htmlFor="plato_favorito" value="Plato favorito" />
                      <TextInput
                        id="plato_favorito"
                        type="text"
                        name="plato_favorito"
                        value={data.plato_favorito}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('plato_favorito', e.target.value)}
                      />
                      <InputError message={errors.plato_favorito} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="color_favorito" value="Color favorito" />
                      <div className="flex gap-2 mt-1">
                        <input
                          id="color_favorito"
                          type="color"
                          name="color_favorito"
                          value={data.color_favorito || '#000000'}
                          onChange={(e) => setData('color_favorito', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <TextInput
                          type="text"
                          value={data.color_favorito}
                          onChange={(e) => setData('color_favorito', e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                      <InputError message={errors.color_favorito} className="mt-2" />
                    </div>

                    <div className="md:col-span-2">
                      <InputLabel htmlFor="pasatiempos" value="Pasatiempos" />
                      <textarea
                        id="pasatiempos"
                        name="pasatiempos"
                        value={data.pasatiempos}
                        onChange={(e) => setData('pasatiempos', e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        placeholder="Describe los pasatiempos del niño..."
                      />
                      <InputError message={errors.pasatiempos} className="mt-2" />
                    </div>

                    <div className="md:col-span-2">
                      <InputLabel htmlFor="deportes" value="Deportes" />
                      <textarea
                        id="deportes"
                        name="deportes"
                        value={data.deportes}
                        onChange={(e) => setData('deportes', e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        placeholder="Describe los deportes que practica..."
                      />
                      <InputError message={errors.deportes} className="mt-2" />
                    </div>

                    <div className="md:col-span-2">
                      <InputLabel htmlFor="informacion_adicional" value="Información adicional" />
                      <textarea
                        id="informacion_adicional"
                        name="informacion_adicional"
                        value={data.informacion_adicional}
                        onChange={(e) => setData('informacion_adicional', e.target.value)}
                        rows={4}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        placeholder="Cualquier información adicional relevante..."
                      />
                      <InputError message={errors.informacion_adicional} className="mt-2" />
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t">
                  <Link href={route('hijos.index')} className="w-full sm:w-auto">
                    <SecondaryButton className="w-full sm:w-auto">
                      Cancelar
                    </SecondaryButton>
                  </Link>
                  <PrimaryButton 
                    type="submit" 
                    disabled={processing}
                    className="w-full sm:w-auto"
                  >
                    {processing ? 'Registrando...' : 'Registrar Hijo'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
