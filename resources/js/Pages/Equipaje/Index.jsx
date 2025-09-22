import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SelectInput from '@/Components/SelectInput';

export default function Index({ auth, hijos }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEquipaje, setSelectedEquipaje] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        hijo_id: '',
        tip_maleta: 'Maleta de 8 kg',
        num_etiqueta: '',
        color: '',
        caracteristicas: '',
        peso: '',
        images: '',
        images1: '',
        images2: '',
        lugar_regis: ''
    });

    const tiposMaleta = [
        { value: 'Maleta de 8 kg', label: 'Maleta de 8 kg' },
        { value: 'Maleta de 23 kg', label: 'Maleta de 23 kg' }
    ];

    const openCreateModal = () => {
        reset();
        setShowCreateModal(true);
    };

    const openEditModal = (equipaje) => {
        setSelectedEquipaje(equipaje);
        setData({
            hijo_id: equipaje.hijo_id,
            tip_maleta: equipaje.tip_maleta || 'Maleta de 8 kg',
            num_etiqueta: equipaje.num_etiqueta || '',
            color: equipaje.color || '',
            caracteristicas: equipaje.caracteristicas || '',
            peso: equipaje.peso || '',
            images: equipaje.images || '',
            images1: equipaje.images1 || '',
            images2: equipaje.images2 || '',
            lugar_regis: equipaje.lugar_regis || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (equipaje) => {
        setSelectedEquipaje(equipaje);
        setShowDeleteModal(true);
    };

    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedEquipaje(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedEquipaje) {
            put(route('equipaje.update', selectedEquipaje.id), {
                onSuccess: () => closeModals()
            });
        } else {
            post(route('equipaje.store'), {
                onSuccess: () => closeModals()
            });
        }
    };

    const handleDelete = () => {
        destroy(route('equipaje.destroy', selectedEquipaje.id), {
            onSuccess: () => closeModals()
        });
    };

    const getTipoMaletaLabel = (tipo) => {
        const t = tiposMaleta.find(tm => tm.value === tipo);
        return t ? t.label : tipo;
    };

    // Obtener todos los equipajes de los hijos
    const equipajes = hijos.flatMap(hijo =>
        (hijo.equipajes || []).map(equipaje => ({
            ...equipaje,
            hijo: hijo
        }))
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Equipaje</h2>}
        >
            <Head title="Equipaje" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">Lista de Equipaje</h3>
                                <PrimaryButton onClick={openCreateModal}>
                                    Agregar Item
                                </PrimaryButton>
                            </div>

                            {(equipajes || []).length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No hay items de equipaje registrados.</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Comienza agregando el primer item de equipaje.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {equipajes.map((equipaje) => (
                                        <div key={equipaje.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-lg">Equipaje #{equipaje.id}</h4>
                                                <span className={`px-2 py-1 rounded text-xs bg-blue-100 text-blue-800`}>
                                                    {getTipoMaletaLabel(equipaje.tip_maleta)}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                <p><strong>Hijo:</strong> {equipaje.hijo?.nombre} {equipaje.hijo?.apellido}</p>
                                                {equipaje.num_etiqueta && (
                                                    <p><strong>Etiqueta:</strong> {equipaje.num_etiqueta}</p>
                                                )}
                                                {equipaje.color && (
                                                    <p><strong>Color:</strong> {equipaje.color}</p>
                                                )}
                                                {equipaje.peso && (
                                                    <p><strong>Peso:</strong> {equipaje.peso} kg</p>
                                                )}
                                                {equipaje.lugar_regis && (
                                                    <p><strong>Lugar de registro:</strong> {equipaje.lugar_regis}</p>
                                                )}
                                                {equipaje.caracteristicas && (
                                                    <p><strong>Características:</strong> {equipaje.caracteristicas}</p>
                                                )}
                                            </div>

                                            {/* Mostrar imágenes si existen */}
                                            {(equipaje.images || equipaje.images1 || equipaje.images2) && (
                                                <div className="mb-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Imágenes:</p>
                                                    <div className="flex space-x-2">
                                                        {equipaje.images && (
                                                            <img src={equipaje.images} alt="Imagen 1" className="w-16 h-16 object-cover rounded" />
                                                        )}
                                                        {equipaje.images1 && (
                                                            <img src={equipaje.images1} alt="Imagen 2" className="w-16 h-16 object-cover rounded" />
                                                        )}
                                                        {equipaje.images2 && (
                                                            <img src={equipaje.images2} alt="Imagen 3" className="w-16 h-16 object-cover rounded" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex space-x-2">
                                                <SecondaryButton
                                                    onClick={() => openEditModal(equipaje)}
                                                    className="text-xs"
                                                >
                                                    Editar
                                                </SecondaryButton>
                                                <DangerButton
                                                    onClick={() => openDeleteModal(equipaje)}
                                                    className="text-xs"
                                                >
                                                    Eliminar
                                                </DangerButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para Crear/Editar */}
            <Modal show={showCreateModal || showEditModal} onClose={closeModals}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {selectedEquipaje ? 'Editar Equipaje' : 'Agregar Equipaje'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="hijo_id" value="Hijo" />
                            <SelectInput
                                id="hijo_id"
                                value={data.hijo_id}
                                onChange={(e) => setData('hijo_id', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            >
                                <option value="">Seleccionar hijo</option>
                                {hijos.map((hijo) => (
                                    <option key={hijo.id} value={hijo.id}>
                                        {hijo.nombre} {hijo.apellido}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.hijo_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="tip_maleta" value="Tipo de Maleta" />
                            <SelectInput
                                id="tip_maleta"
                                value={data.tip_maleta}
                                onChange={(e) => setData('tip_maleta', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            >
                                {tiposMaleta.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.tip_maleta} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="num_etiqueta" value="Número de Etiqueta" />
                            <TextInput
                                id="num_etiqueta"
                                value={data.num_etiqueta}
                                onChange={(e) => setData('num_etiqueta', e.target.value)}
                                className="mt-1 block w-full"
                                maxLength="100"
                            />
                            <InputError message={errors.num_etiqueta} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="color" value="Color" />
                            <TextInput
                                id="color"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                                className="mt-1 block w-full"
                                maxLength="50"
                            />
                            <InputError message={errors.color} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="peso" value="Peso (kg)" />
                            <TextInput
                                id="peso"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.peso}
                                onChange={(e) => setData('peso', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.peso} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="lugar_regis" value="Lugar de Registro" />
                            <TextInput
                                id="lugar_regis"
                                value={data.lugar_regis}
                                onChange={(e) => setData('lugar_regis', e.target.value)}
                                className="mt-1 block w-full"
                                maxLength="255"
                            />
                            <InputError message={errors.lugar_regis} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="caracteristicas" value="Características" />
                        <textarea
                            id="caracteristicas"
                            value={data.caracteristicas}
                            onChange={(e) => setData('caracteristicas', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            rows="3"
                        />
                        <InputError message={errors.caracteristicas} className="mt-2" />
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <InputLabel htmlFor="images" value="Imagen 1 (URL)" />
                            <TextInput
                                id="images"
                                type="url"
                                value={data.images}
                                onChange={(e) => setData('images', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="https://..."
                            />
                            <InputError message={errors.images} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="images1" value="Imagen 2 (URL)" />
                            <TextInput
                                id="images1"
                                type="url"
                                value={data.images1}
                                onChange={(e) => setData('images1', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="https://..."
                            />
                            <InputError message={errors.images1} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="images2" value="Imagen 3 (URL)" />
                            <TextInput
                                id="images2"
                                type="url"
                                value={data.images2}
                                onChange={(e) => setData('images2', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="https://..."
                            />
                            <InputError message={errors.images2} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={closeModals}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {selectedEquipaje ? 'Actualizar' : 'Crear'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal para Eliminar */}
            <Modal show={showDeleteModal} onClose={closeModals}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Eliminar Equipaje
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        ¿Estás seguro de que deseas eliminar el equipaje #{selectedEquipaje?.id}?
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={closeModals}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete} disabled={processing}>
                            Eliminar
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}