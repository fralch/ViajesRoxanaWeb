import React, { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function SubgrupoManager({ subgrupos = [], onChange, errors = {} }) {
  const [localSubgrupos, setLocalSubgrupos] = useState(subgrupos);

  const tiposEncargado = [
    { value: 'padre', label: 'Padre' },
    { value: 'madre', label: 'Madre' },
    { value: 'tutor_legal', label: 'Tutor Legal' },
    { value: 'viajes_roxana', label: 'Viajes Roxana' },
    { value: 'otro', label: 'Otro' }
  ];

  const addSubgrupo = () => {
    const newSubgrupo = {
      temp_id: Date.now(), // Temporary ID for new subgroups
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
    };

    const updated = [...localSubgrupos, newSubgrupo];
    setLocalSubgrupos(updated);
    onChange(updated);
  };

  const removeSubgrupo = (index) => {
    const updated = localSubgrupos.filter((_, i) => i !== index);
    setLocalSubgrupos(updated);
    onChange(updated);
  };

  const updateSubgrupo = (index, field, value) => {
    const updated = [...localSubgrupos];
    updated[index] = { ...updated[index], [field]: value };
    setLocalSubgrupos(updated);
    onChange(updated);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Subgrupos</h3>
        </div>
        <PrimaryButton
          type="button"
          onClick={addSubgrupo}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Subgrupo
        </PrimaryButton>
      </div>

      {localSubgrupos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-medium mb-1">No hay subgrupos configurados</p>
          <p className="text-xs">Los subgrupos ayudan a organizar mejor las inscripciones con información detallada de encargados.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {localSubgrupos.map((subgrupo, index) => (
            <div key={subgrupo.id || subgrupo.temp_id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Subgrupo {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeSubgrupo(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Eliminar subgrupo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Información básica */}
                <div>
                  <InputLabel htmlFor={`subgrupo_nombre_${index}`} value="Nombre del Subgrupo" />
                  <TextInput
                    id={`subgrupo_nombre_${index}`}
                    type="text"
                    value={subgrupo.nombre}
                    onChange={(e) => updateSubgrupo(index, 'nombre', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="Ej: Grupo Pequeños"
                  />
                  <InputError message={errors[`subgrupos.${index}.nombre`]} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor={`subgrupo_capacidad_${index}`} value="Capacidad Máxima" />
                  <TextInput
                    id={`subgrupo_capacidad_${index}`}
                    type="number"
                    min="1"
                    max="50"
                    value={subgrupo.capacidad_maxima}
                    onChange={(e) => updateSubgrupo(index, 'capacidad_maxima', parseInt(e.target.value) || 10)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={errors[`subgrupos.${index}.capacidad_maxima`]} className="mt-2" />
                </div>

                <div className="md:col-span-2">
                  <InputLabel htmlFor={`subgrupo_descripcion_${index}`} value="Descripción" />
                  <textarea
                    id={`subgrupo_descripcion_${index}`}
                    value={subgrupo.descripcion}
                    onChange={(e) => updateSubgrupo(index, 'descripcion', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="2"
                    placeholder="Descripción opcional del subgrupo"
                  />
                  <InputError message={errors[`subgrupos.${index}.descripcion`]} className="mt-2" />
                </div>
              </div>

              {/* Encargado Principal */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Encargado Principal</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputLabel htmlFor={`tipo_encargado_principal_${index}`} value="Tipo de Encargado" />
                    <select
                      id={`tipo_encargado_principal_${index}`}
                      value={subgrupo.tipo_encargado_principal}
                      onChange={(e) => updateSubgrupo(index, 'tipo_encargado_principal', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {tiposEncargado.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                    <InputError message={errors[`subgrupos.${index}.tipo_encargado_principal`]} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor={`nombre_encargado_principal_${index}`} value="Nombre Completo" />
                    <TextInput
                      id={`nombre_encargado_principal_${index}`}
                      type="text"
                      value={subgrupo.nombre_encargado_principal}
                      onChange={(e) => updateSubgrupo(index, 'nombre_encargado_principal', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="Nombre del encargado"
                    />
                    <InputError message={errors[`subgrupos.${index}.nombre_encargado_principal`]} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor={`celular_encargado_principal_${index}`} value="Celular" />
                    <TextInput
                      id={`celular_encargado_principal_${index}`}
                      type="tel"
                      value={subgrupo.celular_encargado_principal}
                      onChange={(e) => updateSubgrupo(index, 'celular_encargado_principal', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="+51 999 888 777"
                    />
                    <InputError message={errors[`subgrupos.${index}.celular_encargado_principal`]} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor={`email_encargado_principal_${index}`} value="Email (Opcional)" />
                    <TextInput
                      id={`email_encargado_principal_${index}`}
                      type="email"
                      value={subgrupo.email_encargado_principal}
                      onChange={(e) => updateSubgrupo(index, 'email_encargado_principal', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="email@ejemplo.com"
                    />
                    <InputError message={errors[`subgrupos.${index}.email_encargado_principal`]} className="mt-2" />
                  </div>
                </div>
              </div>

              {/* Encargado Secundario */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Encargado Agencia de Viajes</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputLabel htmlFor={`tipo_encargado_secundario_${index}`} value="Tipo de Encargado" />
                    <select
                      id={`tipo_encargado_secundario_${index}`}
                      value={subgrupo.tipo_encargado_secundario}
                      onChange={(e) => updateSubgrupo(index, 'tipo_encargado_secundario', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {tiposEncargado.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                    <InputError message={errors[`subgrupos.${index}.tipo_encargado_secundario`]} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor={`nombre_encargado_secundario_${index}`} value="Nombre Completo" />
                    <TextInput
                      id={`nombre_encargado_secundario_${index}`}
                      type="text"
                      value={subgrupo.nombre_encargado_secundario}
                      onChange={(e) => updateSubgrupo(index, 'nombre_encargado_secundario', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="Nombre del encargado secundario"
                    />
                    <InputError message={errors[`subgrupos.${index}.nombre_encargado_secundario`]} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor={`celular_encargado_secundario_${index}`} value="Celular" />
                    <TextInput
                      id={`celular_encargado_secundario_${index}`}
                      type="tel"
                      value={subgrupo.celular_encargado_secundario}
                      onChange={(e) => updateSubgrupo(index, 'celular_encargado_secundario', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="+51 999 888 777"
                    />
                    <InputError message={errors[`subgrupos.${index}.celular_encargado_secundario`]} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor={`email_encargado_secundario_${index}`} value="Email (Opcional)" />
                    <TextInput
                      id={`email_encargado_secundario_${index}`}
                      type="email"
                      value={subgrupo.email_encargado_secundario}
                      onChange={(e) => updateSubgrupo(index, 'email_encargado_secundario', e.target.value)}
                      className="mt-1 block w-full"
                      placeholder="email@ejemplo.com"
                    />
                    <InputError message={errors[`subgrupos.${index}.email_encargado_secundario`]} className="mt-2" />
                  </div>
                </div>
              </div>

              {/* Observaciones y Estado */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <InputLabel htmlFor={`subgrupo_observaciones_${index}`} value="Observaciones" />
                    <textarea
                      id={`subgrupo_observaciones_${index}`}
                      value={subgrupo.observaciones}
                      onChange={(e) => updateSubgrupo(index, 'observaciones', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows="2"
                      placeholder="Observaciones adicionales"
                    />
                    <InputError message={errors[`subgrupos.${index}.observaciones`]} className="mt-2" />
                  </div>

                  <div className="flex items-end">
                    <div className="w-full">
                      <InputLabel value="Estado" />
                      <div className="mt-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={subgrupo.activo}
                            onChange={(e) => updateSubgrupo(index, 'activo', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">Subgrupo activo</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}