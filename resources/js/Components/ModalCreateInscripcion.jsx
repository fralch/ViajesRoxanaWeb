import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
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
    const { auth } = usePage().props;
    const [showCreateHijoModal, setShowCreateHijoModal] = useState(false);
    const [hijosDisponibles, setHijosDisponibles] = useState(hijos);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHijos, setSelectedHijos] = useState([]);

    const { data, setData, processing, errors, reset } = useForm({
        paquete_id: '',
        grupo_id: '',
        subgrupo_id: subgrupo?.id || '',
    });

    const addHijo = (hijo) => {
        if (!selectedHijos.some(s => s.id === hijo.id)) {
            setSelectedHijos([...selectedHijos, hijo]);
        }
    };

    const removeHijo = (id) => {
        setSelectedHijos(selectedHijos.filter(s => s.id !== id));
    };

    const filteredHijos = hijosDisponibles.filter(h =>
        h.nombres.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedHijos.some(s => s.id === h.id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedHijos.length === 0) {
            showError('Error', 'Debe seleccionar al menos un hijo.');
            return;
        }

        if (!data.paquete_id || !data.grupo_id || !data.subgrupo_id) {
            showError('Error', 'Debe seleccionar paquete, grupo y subgrupo.');
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const hijo of selectedHijos) {
            const inscriptionData = {
                paquete_id: data.paquete_id,
                grupo_id: data.grupo_id,
                subgrupo_id: data.subgrupo_id,
                hijo_id: hijo.id,
                usuario_id: hijo.user_id || ''
            };

            try {
                await new Promise((resolve, reject) => {
                    router.post(route('inscripciones.store'), inscriptionData, {
                        onSuccess: () => resolve(),
                        onError: () => reject()
                    });
                });
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }

        onClose();
        reset();
        setSelectedHijos([]);
        setSearchTerm('');

        if (successCount > 0) {
            showSuccess('¡Inscripciones creadas!', `${successCount} inscripciones creadas exitosamente.`);
        }
        if (errorCount > 0) {
            showError('Error', `${errorCount} inscripciones fallaron. Verifica los datos.`);
        }

        window.location.reload();
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
            subgrupo_id: subgrupo?.id || ''
        }));
    };

    const handleClose = () => {
        reset();
        setSelectedHijos([]);
        setSearchTerm('');
        onClose();
    };

    const handleHijoCreated = (newHijo) => {
        addHijo(newHijo);
        setHijosDisponibles([...hijosDisponibles, newHijo]);
        setShowCreateHijoModal(false);
    };

    return (
        <>
            <Modal show={show && !showCreateHijoModal} onClose={handleClose} maxWidth="2xl">
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

                        {/* Selector de hijos múltiple */}
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <InputLabel value="Hijos *" />
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

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar hijo por nombre..."
                                className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                            />

                            {searchTerm && (
                                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white">
                                    {filteredHijos.map(hijo => (
                                        <div
                                            key={hijo.id}
                                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                            onClick={() => addHijo(hijo)}
                                        >
                                            {hijo.nombres}
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                    ))}
                                    {filteredHijos.length === 0 && <p className="p-2 text-gray-500">No se encontraron hijos</p>}
                                </div>
                            )}

                            <div className="mt-4">
                                <p className="font-medium mb-2">Hijos seleccionados ({selectedHijos.length}):</p>
                                {selectedHijos.map(hijo => (
                                    <div key={hijo.id} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
                                        <span>{hijo.nombres}</span>
                                        <button onClick={() => removeHijo(hijo.id)} className="text-red-500 hover:text-red-700">Eliminar</button>
                                    </div>
                                ))}
                                {selectedHijos.length === 0 && <p className="text-gray-500">No hay hijos seleccionados</p>}
                            </div>

                            <InputError message={errors.general} className="mt-2" /> {/* Adjust for general errors */}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <SecondaryButton type="button" onClick={handleClose}>
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing || selectedHijos.length === 0}>
                                {processing ? 'Creando...' : `Crear ${selectedHijos.length > 1 ? 'Inscripciones' : 'Inscripción'}`}
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
                currentUserId={auth.user?.id}
            />
        </>
    );
}