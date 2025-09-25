import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import ModalCreateHijo from '@/Components/ModalCreateHijo';
import { showSuccess, showError } from '@/utils/swal';

export default function ModalCreateInscripcion({
    show = false,
    onClose = () => {},
    subgrupo,
    paquetes = [],
    grupos = [],
    subgrupos = [],
    hijos = []
}) {
    const [showCreateHijoModal, setShowCreateHijoModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        hijo_id: '',
        paquete_id: '',
        grupo_id: '',
        subgrupo_id: subgrupo?.id || '',
        usuario_id: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inscripciones.store'), {
            onSuccess: () => {
                onClose();
                reset();
                showSuccess('¡Inscripción creada!', 'La inscripción ha sido creada exitosamente.');
                // Reload the page to show the new inscription
                window.location.reload();
            },
            onError: () => {
                showError('Error', 'No se pudo crear la inscripción. Verifica los datos e intenta nuevamente.');
            }
        });
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
        return subgrupos.filter(subgrupoItem =>
            subgrupoItem.grupo_id == data.grupo_id && subgrupoItem.activo
        );
    };

    const handleGrupoChange = (e) => {
        const grupoId = e.target.value;
        setData(prevData => ({
            ...prevData,
            grupo_id: grupoId,
            subgrupo_id: subgrupo?.id || '' // Keep the current subgrupo selected
        }));
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleHijoCreated = (newHijo) => {
        // Agregar el nuevo hijo a la lista y seleccionarlo
        setData(prevData => ({
            ...prevData,
            hijo_id: newHijo.id,
            usuario_id: newHijo.user_id
        }));
    };

    return (
        <>
            <Modal show={show} onClose={handleClose} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-red-600">Crear Nueva Inscripción</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
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

                        <div>
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

                        <div>
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
                                {getSubgruposPorGrupo().map(subgrupoItem => (
                                    <option key={subgrupoItem.id} value={subgrupoItem.id}>
                                        {subgrupoItem.nombre}
                                        {subgrupoItem.inscripciones_count !== undefined &&
                                            ` (${subgrupoItem.inscripciones_count}/${subgrupoItem.capacidad_maxima})`
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

                        {/* Selector de hijo al final */}
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <InputLabel htmlFor="hijo_id" value="Hijo *" />
                                <button
                                    type="button"
                                    onClick={() => setShowCreateHijoModal(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Registrar nuevo hijo
                                </button>
                            </div>
                            <select
                                id="hijo_id"
                                name="hijo_id"
                                value={data.hijo_id}
                                onChange={handleHijoChange}
                                className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="">Seleccione un hijo</option>
                                {hijos.map(hijo => (
                                    <option key={hijo.id} value={hijo.id}>{hijo.nombres} (Usuario: {hijo.user.name})</option>
                                ))}
                            </select>
                            <InputError message={errors.hijo_id} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <SecondaryButton type="button" onClick={handleClose}>
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'Creando...' : 'Crear Inscripción'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal para crear nuevo hijo */}
            <ModalCreateHijo
                show={showCreateHijoModal}
                onClose={() => setShowCreateHijoModal(false)}
                onHijoCreated={handleHijoCreated}
                currentUserId={data.usuario_id}
            />
        </>
    );
}