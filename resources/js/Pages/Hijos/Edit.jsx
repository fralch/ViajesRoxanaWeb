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

export default function Edit({ hijo, users }) {
  // Formatear la fecha para el input date (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Si la fecha ya está en formato YYYY-MM-DD, devolverla tal como está
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Si está en otro formato, convertirla
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const { data, setData, put, processing, errors } = useForm({
    user_id: hijo.user_id || '',
    nombres: hijo.nombres || '',
    doc_tipo: hijo.doc_tipo || 'CC',
    doc_numero: hijo.doc_numero || '',
    nums_emergencia: hijo.nums_emergencia || [''],
    fecha_nacimiento: formatDateForInput(hijo.fecha_nacimiento),
     foto: hijo.foto || ''
   });

  const [emergencyNumbers, setEmergencyNumbers] = useState(
    hijo.nums_emergencia && hijo.nums_emergencia.length > 0 
      ? hijo.nums_emergencia 
      : ['']
  );

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
    
    put(route('hijos.update', hijo.id), {
      onSuccess: () => {
        showSuccess('¡Éxito!', 'Hijo actualizado exitosamente.');
      },
      onError: (errors) => {
        showError('Error', 'Por favor revisa los datos ingresados.');
      }
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Editar ${hijo.nombres}`} />

      <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">
              Editar {hijo.nombres}
            </h2>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <SecondaryButton className="w-full sm:w-auto gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </SecondaryButton>
            </button>
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
                      <div className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-gray-700">
                        DNI
                      </div>
                      <p className="text-sm text-gray-500 mt-1">El tipo de documento no se puede modificar</p>
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



                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t">
                  <Link href={route('hijos.show', hijo.id)} className="w-full sm:w-auto">
                    <SecondaryButton className="w-full sm:w-auto">
                      Cancelar
                    </SecondaryButton>
                  </Link>
                  <PrimaryButton 
                    type="submit" 
                    disabled={processing}
                    className="w-full sm:w-auto"
                  >
                    {processing ? 'Actualizando...' : 'Actualizar Hijo'}
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
