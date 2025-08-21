import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Edit({ grupo, paquetes }) {
    const [tipoEncargado, setTipoEncargado] = useState(grupo.tipo_encargado || 'interno');
    
    const { data, setData, put, processing, errors } = useForm({
        paquete_id: grupo.paquete_id || '',
        nombre: grupo.nombre || '',
        capacidad: grupo.capacidad || '',
        tipo_encargado: grupo.tipo_encargado || 'interno',
        nombre_encargado: grupo.nombre_encargado || '',
        celular_encargado: grupo.celular_encargado || '',
        nombre_encargado_agencia: grupo.nombre_encargado_agencia || '',
        celular_encargado_agencia: grupo.celular_encargado_agencia || '',
        activo: grupo.activo !== undefined ? grupo.activo : true
    });

    useEffect(() => {
        setTipoEncargado(grupo.tipo_encargado || 'interno');
    }, [grupo.tipo_encargado]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('grupos.update', grupo.id));
    };

    const handleTipoEncargadoChange = (tipo) => {
        setTipoEncargado(tipo);
        setData('tipo_encargado', tipo);
        // Limpiar campos del tipo no seleccionado
        if (tipo === 'interno') {
            setData({
                ...data,
                tipo_encargado: tipo,
                nombre_encargado_agencia: '',
                celular_encargado_agencia: ''
            });
        } else {
            setData({
                ...data,
                tipo_encargado: tipo,
                nombre_encargado: '',
                celular_encargado: ''
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Editar Grupo: {grupo.nombre}
                    </h2>
                    <Link href={route('grupos.index')}>
                        <SecondaryButton>
                            Volver a Grupos
                        </SecondaryButton>
                    </Link>
                </div>
            }
        >
            <Head title={`Editar Grupo - ${grupo.nombre}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Información básica del grupo */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Información del Grupo
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Selección de paquete */}
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

                                        {/* Estado activo */}
                                        <div>
                                            <InputLabel value="Estado" />
                                            <div className="mt-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.activo}
                                                        onChange={(e) => setData('activo', e.target.checked)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        Grupo activo
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del encargado */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Información del Encargado
                                    </h3>

                                    {/* Tipo de encargado */}
                                    <div className="mb-6">
                                        <InputLabel value="Tipo de Encargado" />
                                        <div className="mt-2 flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="tipo_encargado"
                                                    value="interno"
                                                    checked={tipoEncargado === 'interno'}
                                                    onChange={(e) => handleTipoEncargadoChange(e.target.value)}
                                                    className="text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    Encargado Interno
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="tipo_encargado"
                                                    value="agencia"
                                                    checked={tipoEncargado === 'agencia'}
                                                    onChange={(e) => handleTipoEncargadoChange(e.target.value)}
                                                    className="text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    Encargado de Agencia
                                                </span>
                                            </label>
                                        </div>
                                        <InputError message={errors.tipo_encargado} className="mt-2" />
                                    </div>

                                    {/* Campos del encargado según el tipo */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {tipoEncargado === 'interno' ? (
                                            <>
                                                <div>
                                                    <InputLabel htmlFor="nombre_encargado" value="Nombre del Encargado" />
                                                    <TextInput
                                                        id="nombre_encargado"
                                                        type="text"
                                                        value={data.nombre_encargado}
                                                        onChange={(e) => setData('nombre_encargado', e.target.value)}
                                                        className="mt-1 block w-full"
                                                        placeholder="Nombre completo del encargado"
                                                        required
                                                    />
                                                    <InputError message={errors.nombre_encargado} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel htmlFor="celular_encargado" value="Celular del Encargado" />
                                                    <TextInput
                                                        id="celular_encargado"
                                                        type="tel"
                                                        value={data.celular_encargado}
                                                        onChange={(e) => setData('celular_encargado', e.target.value)}
                                                        className="mt-1 block w-full"
                                                        placeholder="Ej: +51 999 888 777"
                                                        required
                                                    />
                                                    <InputError message={errors.celular_encargado} className="mt-2" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <InputLabel htmlFor="nombre_encargado_agencia" value="Nombre del Encargado de Agencia" />
                                                    <TextInput
                                                        id="nombre_encargado_agencia"
                                                        type="text"
                                                        value={data.nombre_encargado_agencia}
                                                        onChange={(e) => setData('nombre_encargado_agencia', e.target.value)}
                                                        className="mt-1 block w-full"
                                                        placeholder="Nombre completo del encargado de agencia"
                                                        required
                                                    />
                                                    <InputError message={errors.nombre_encargado_agencia} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel htmlFor="celular_encargado_agencia" value="Celular del Encargado de Agencia" />
                                                    <TextInput
                                                        id="celular_encargado_agencia"
                                                        type="tel"
                                                        value={data.celular_encargado_agencia}
                                                        onChange={(e) => setData('celular_encargado_agencia', e.target.value)}
                                                        className="mt-1 block w-full"
                                                        placeholder="Ej: +51 999 888 777"
                                                        required
                                                    />
                                                    <InputError message={errors.celular_encargado_agencia} className="mt-2" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                                        Información del Grupo
                                    </h4>
                                    <div className="text-sm text-blue-700">
                                        <p><strong>ID:</strong> {grupo.id}</p>
                                        <p><strong>Creado:</strong> {new Date(grupo.created_at).toLocaleDateString('es-ES')}</p>
                                        <p><strong>Última actualización:</strong> {new Date(grupo.updated_at).toLocaleDateString('es-ES')}</p>
                                        {grupo.inscripciones_count !== undefined && (
                                            <p><strong>Inscripciones:</strong> {grupo.inscripciones_count}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex justify-end gap-4 pt-6 border-t">
                                    <Link href={route('grupos.index')}>
                                        <SecondaryButton type="button">
                                            Cancelar
                                        </SecondaryButton>
                                    </Link>
                                    <PrimaryButton type="submit" disabled={processing}>
                                        {processing ? 'Actualizando...' : 'Actualizar Grupo'}
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
