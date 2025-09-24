import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Card from '@/Components/Card';

export default function Create({ paquetes, grupos, subgrupos, hijos }) {
    const { data, setData, post, processing, errors } = useForm({
        hijo_id: '',
        paquete_id: '',
        grupo_id: '',
        subgrupo_id: '',
        usuario_id: '' // This will be set based on the selected hijo
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inscripciones.store'));
    };

    const handleHijoChange = (e) => {
        const hijoId = e.target.value;
        const selectedHijo = hijos.find(h => h.id == hijoId);
        setData(prevData => ({
            ...prevData,
            hijo_id: hijoId,
            usuario_id: selectedHijo ? selectedHijo.user_id : ''
        }));
    };

    const getSubgruposPorGrupo = () => {
        return subgrupos.filter(subgrupo =>
            subgrupo.grupo_id == data.grupo_id && subgrupo.activo
        );
    };

    const handleGrupoChange = (e) => {
        const grupoId = e.target.value;
        setData(prevData => ({
            ...prevData,
            grupo_id: grupoId,
            subgrupo_id: '' // Reset subgrupo when grupo changes
        }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Crear Inscripción" />
            <div className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
                <div className="w-full max-w-screen-md mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-red-600">Crear Nueva Inscripción</h2>
                    </div>
                    <Card>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <InputLabel htmlFor="hijo_id" value="Hijo" />
                                <select
                                    id="hijo_id"
                                    name="hijo_id"
                                    value={data.hijo_id}
                                    onChange={handleHijoChange}
                                    className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                >
                                    <option value="">Seleccione un hijo</option>
                                    {hijos.map(hijo => (
                                        <option key={hijo.id} value={hijo.id}>{hijo.nombres} (Usuario: {hijo.user.name})</option>
                                    ))}
                                </select>
                                <InputError message={errors.hijo_id} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="paquete_id" value="Paquete" />
                                <select
                                    id="paquete_id"
                                    name="paquete_id"
                                    value={data.paquete_id}
                                    onChange={(e) => setData('paquete_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                >
                                    <option value="">Seleccione un paquete</option>
                                    {paquetes.map(paquete => (
                                        <option key={paquete.id} value={paquete.id}>{paquete.nombre}</option>
                                    ))}
                                </select>
                                <InputError message={errors.paquete_id} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="grupo_id" value="Grupo" />
                                <select
                                    id="grupo_id"
                                    name="grupo_id"
                                    value={data.grupo_id}
                                    onChange={handleGrupoChange}
                                    className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                    disabled={!data.paquete_id}
                                >
                                    <option value="">Seleccione un grupo</option>
                                    {grupos
                                        .filter(grupo => grupo.paquete_id == data.paquete_id)
                                        .map(grupo => (
                                            <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                                        ))}
                                </select>
                                <InputError message={errors.grupo_id} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="subgrupo_id" value="Subgrupo *" />
                                <select
                                    id="subgrupo_id"
                                    name="subgrupo_id"
                                    value={data.subgrupo_id}
                                    onChange={(e) => setData('subgrupo_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                    disabled={!data.grupo_id}
                                    required
                                >
                                    <option value="">Seleccione un subgrupo</option>
                                    {getSubgruposPorGrupo().map(subgrupo => (
                                        <option key={subgrupo.id} value={subgrupo.id}>
                                            {subgrupo.nombre}
                                            {subgrupo.inscripciones_count !== undefined &&
                                                ` (${subgrupo.inscripciones_count}/${subgrupo.capacidad_maxima})`
                                            }
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.subgrupo_id} className="mt-2" />
                                {data.grupo_id && getSubgruposPorGrupo().length === 0 && (
                                    <p className="mt-1 text-sm text-amber-600">
                                        No hay subgrupos activos disponibles para este grupo.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end mt-6">
                                <PrimaryButton className="ml-4" disabled={processing}>
                                    Crear Inscripción
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}