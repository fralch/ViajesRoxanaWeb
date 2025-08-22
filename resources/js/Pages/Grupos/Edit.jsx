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
    const [encargados, setEncargados] = useState(
        Array.isArray(grupo.nombre_encargado) && grupo.nombre_encargado.length > 0
            ? grupo.nombre_encargado.map((nombre, index) => ({
                tipo: 'interno',
                tipoEspecifico: '',
                nombre: nombre || '',
                celular: grupo.celular_encargado?.[index] || ''
            }))
            : [{ tipo: 'interno', tipoEspecifico: '', nombre: '', celular: '' }]
    );
    const [encargadosAgencia, setEncargadosAgencia] = useState(
        Array.isArray(grupo.nombre_encargado_agencia) && grupo.nombre_encargado_agencia.length > 0
            ? grupo.nombre_encargado_agencia.map((nombre, index) => ({
                tipo: 'agencia',
                tipoEspecifico: '',
                nombre: nombre || '',
                celular: grupo.celular_encargado_agencia?.[index] || ''
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
        activo: grupo.activo !== undefined ? grupo.activo : true
    });

    useEffect(() => {
        setTipoEncargado(grupo.tipo_encargado || 'interno');
    }, [grupo.tipo_encargado]);

    // Inicializar arrays de encargados con datos existentes
    useEffect(() => {
        if (grupo.nombre_encargado && grupo.celular_encargado) {
            const nombresArray = Array.isArray(grupo.nombre_encargado) ? grupo.nombre_encargado : [grupo.nombre_encargado];
            const celularesArray = Array.isArray(grupo.celular_encargado) ? grupo.celular_encargado : [grupo.celular_encargado];
            const tiposArray = Array.isArray(grupo.tipo_encargado) ? grupo.tipo_encargado : [grupo.tipo_encargado || ''];
            
            const encargadosIniciales = nombresArray.map((nombre, index) => ({
                tipo: 'interno',
                tipoEspecifico: tiposArray[index] || '',
                nombre: nombre || '',
                celular: celularesArray[index] || ''
            }));
            
            if (encargadosIniciales.length > 0 && encargadosIniciales[0].nombre) {
                setEncargados(encargadosIniciales);
                setData({
                    ...data,
                    tipo_encargado: encargadosIniciales.map(e => e.tipoEspecifico)
                });
            }
        }
        
        if (grupo.nombre_encargado_agencia && grupo.celular_encargado_agencia) {
            const nombresAgenciaArray = Array.isArray(grupo.nombre_encargado_agencia) ? grupo.nombre_encargado_agencia : [grupo.nombre_encargado_agencia];
            const celularesAgenciaArray = Array.isArray(grupo.celular_encargado_agencia) ? grupo.celular_encargado_agencia : [grupo.celular_encargado_agencia];
            const tiposAgenciaArray = Array.isArray(grupo.tipo_encargado_agencia) ? grupo.tipo_encargado_agencia : [grupo.tipo_encargado_agencia || ''];
            
            const encargadosAgenciaIniciales = nombresAgenciaArray.map((nombre, index) => ({
                tipo: 'agencia',
                tipoEspecifico: tiposAgenciaArray[index] || '',
                nombre: nombre || '',
                celular: celularesAgenciaArray[index] || ''
            }));
            
            if (encargadosAgenciaIniciales.length > 0 && encargadosAgenciaIniciales[0].nombre) {
                setEncargadosAgencia(encargadosAgenciaIniciales);
                setData({
                    ...data,
                    tipo_encargado_agencia: encargadosAgenciaIniciales.map(e => e.tipoEspecifico)
                });
            }
        }
    }, [grupo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('grupos.update', grupo.id));
    };

    const handleTipoEncargadoChange = (tipo) => {
        setTipoEncargado(tipo);
        setData('tipo_encargado', [tipo]);
        // Actualizar arrays según el tipo seleccionado
        if (tipo === 'interno') {
            setData({
                ...data,
                tipo_encargado: [tipo],
                nombre_encargado: encargados.map(e => e.nombre),
                celular_encargado: encargados.map(e => e.celular),
                nombre_encargado_agencia: [],
                celular_encargado_agencia: []
            });
        } else {
            setData({
                ...data,
                tipo_encargado: [tipo],
                nombre_encargado: [],
                celular_encargado: [],
                nombre_encargado_agencia: encargadosAgencia.map(e => e.nombre),
                celular_encargado_agencia: encargadosAgencia.map(e => e.celular)
            });
        }
    };

    // Funciones para manejar encargados internos
    const addEncargado = () => {
        const newEncargados = [...encargados, { tipo: 'interno', tipoEspecifico: '', nombre: '', celular: '' }];
        setEncargados(newEncargados);
        setData({
            ...data,
            tipo_encargado: newEncargados.map(e => e.tipoEspecifico),
            nombre_encargado: newEncargados.map(e => e.nombre),
            celular_encargado: newEncargados.map(e => e.celular)
        });
    };

    const removeEncargado = (index) => {
        const newEncargados = encargados.filter((_, i) => i !== index);
        setEncargados(newEncargados);
        setData({
            ...data,
            tipo_encargado: newEncargados.map(e => e.tipoEspecifico),
            nombre_encargado: newEncargados.map(e => e.nombre),
            celular_encargado: newEncargados.map(e => e.celular)
        });
    };

    const updateEncargado = (index, field, value) => {
        const newEncargados = [...encargados];
        newEncargados[index][field] = value;
        setEncargados(newEncargados);
        setData({
            ...data,
            tipo_encargado: newEncargados.map(e => e.tipoEspecifico),
            nombre_encargado: newEncargados.map(e => e.nombre),
            celular_encargado: newEncargados.map(e => e.celular)
        });
    };

    // Funciones para manejar encargados de agencia
    const addEncargadoAgencia = () => {
        const newEncargados = [...encargadosAgencia, { tipo: 'agencia', tipoEspecifico: '', nombre: '', celular: '' }];
        setEncargadosAgencia(newEncargados);
        setData({
            ...data,
            tipo_encargado_agencia: newEncargados.map(e => e.tipoEspecifico),
            nombre_encargado_agencia: newEncargados.map(e => e.nombre),
            celular_encargado_agencia: newEncargados.map(e => e.celular)
        });
    };

    const removeEncargadoAgencia = (index) => {
        const newEncargados = encargadosAgencia.filter((_, i) => i !== index);
        setEncargadosAgencia(newEncargados);
        setData({
            ...data,
            tipo_encargado_agencia: newEncargados.map(e => e.tipoEspecifico),
            nombre_encargado_agencia: newEncargados.map(e => e.nombre),
            celular_encargado_agencia: newEncargados.map(e => e.celular)
        });
    };

    const updateEncargadoAgencia = (index, field, value) => {
        const newEncargados = [...encargadosAgencia];
        newEncargados[index][field] = value;
        setEncargadosAgencia(newEncargados);
        setData({
            ...data,
            tipo_encargado_agencia: newEncargados.map(e => e.tipoEspecifico),
            nombre_encargado_agencia: newEncargados.map(e => e.nombre),
            celular_encargado_agencia: newEncargados.map(e => e.celular)
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center bg-white px-6 py-4 ">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Editar Grupo
                            </h2>
                            <p className="text-sm text-gray-500">{grupo.nombre}</p>
                        </div>
                    </div>
                    <Link href={route('grupos.index')}>
                        <SecondaryButton className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver a Grupos
                        </SecondaryButton>
                    </Link>
                </div>
            }
        >
            <Head title={`Editar Grupo - ${grupo.nombre}`} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg sm:rounded-xl border border-gray-100">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Información básica del grupo */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Información del Grupo
                                        </h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Selección de paquete */}
                                        <div>
                                            <InputLabel htmlFor="paquete_id" value="Paquete" />
                                            <select
                                                id="paquete_id"
                                                value={data.paquete_id}
                                                onChange={(e) => setData('paquete_id', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
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
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Información del Encargado
                                        </h3>
                                    </div>

                                    {/* Tipo de encargado */}
                                    <div className="mb-6">
                                        <InputLabel value="Tipo de Encargado" />
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <label className="relative flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200">
                                                <input
                                                    type="radio"
                                                    name="tipo_encargado"
                                                    value="interno"
                                                    checked={tipoEncargado === 'interno'}
                                                    onChange={(e) => handleTipoEncargadoChange(e.target.value)}
                                                    className="text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="ml-3">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            Encargado Interno
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Personal de la empresa</p>
                                                </div>
                                            </label>
                                            <label className="relative flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-amber-300 transition-colors duration-200">
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
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            Encargado de Agencia
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Contacto externo</p>
                                                </div>
                                            </label>
                                        </div>
                                        <InputError message={errors.tipo_encargado} className="mt-2" />
                                    </div>

                                    {/* Campos del encargado según el tipo */}
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
                                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200 relative">
                                                        {/* Badge para indicar tipo de encargado */}
                                                        <div className="absolute top-2 right-2">
                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200 relative">
                                                        {/* Badge para indicar tipo de encargado */}
                                                        <div className="absolute top-2 right-2">
                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                    <Link href={route('grupos.index')}>
                                        <SecondaryButton type="button" className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancelar
                                        </SecondaryButton>
                                    </Link>
                                    <PrimaryButton type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200">
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
        </AuthenticatedLayout>
    );
}
