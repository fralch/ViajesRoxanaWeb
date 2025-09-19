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

export default function Index({ auth, equipajes, hijos }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEquipaje, setSelectedEquipaje] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        hijo_id: '',
        nombre_item: '',
        descripcion: '',
        cantidad: 1,
        categoria: 'otros',
        peso_estimado: '',
        es_fragil: false,
        notas: ''
    });

    const categorias = [
        { value: 'ropa', label: 'Ropa' },
        { value: 'calzado', label: 'Calzado' },
        { value: 'higiene', label: 'Higiene Personal' },
        { value: 'medicamentos', label: 'Medicamentos' },
        { value: 'electronica', label: 'Electrónicos' },
        { value: 'documentos', label: 'Documentos' },
        { value: 'otros', label: 'Otros' }
    ];

    const openCreateModal = () => {
        reset();
        setShowCreateModal(true);
    };

    const openEditModal = (equipaje) => {
        setSelectedEquipaje(equipaje);
        setData({
            hijo_id: equipaje.hijo_id,
            nombre_item: equipaje.nombre_item,
            descripcion: equipaje.descripcion || '',
            cantidad: equipaje.cantidad,
            categoria: equipaje.categoria,
            peso_estimado: equipaje.peso_estimado || '',
            es_fragil: equipaje.es_fragil,
            notas: equipaje.notas || ''
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

    const getCategoriaLabel = (categoria) => {
        const cat = categorias.find(c => c.value === categoria);
        return cat ? cat.label : categoria;
    };

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
                                                <h4 className="font-semibold text-lg">{equipaje.nombre_item}</h4>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    equipaje.es_fragil ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {equipaje.es_fragil ? 'Frágil' : 'Normal'}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                <p><strong>Hijo:</strong> {equipaje.hijo?.nombre} {equipaje.hijo?.apellido}</p>
                                                <p><strong>Categoría:</strong> {getCategoriaLabel(equipaje.categoria)}</p>
                                                <p><strong>Cantidad:</strong> {equipaje.cantidad}</p>
                                                {equipaje.peso_estimado && (
                                                    <p><strong>Peso:</strong> {equipaje.peso_estimado} kg</p>
                                                )}
                                                {equipaje.descripcion && (
                                                    <p><strong>Descripción:</strong> {equipaje.descripcion}</p>
                                                )}
                                                {equipaje.notas && (
                                                    <p><strong>Notas:</strong> {equipaje.notas}</p>
                                                )}
                                            </div>

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
                        {selectedEquipaje ? 'Editar Item de Equipaje' : 'Agregar Item de Equipaje'}
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
                            <InputLabel htmlFor="nombre_item" value="Nombre del Item" />
                            <TextInput
                                id="nombre_item"
                                value={data.nombre_item}
                                onChange={(e) => setData('nombre_item', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.nombre_item} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="categoria" value="Categoría" />
                            <SelectInput
                                id="categoria"
                                value={data.categoria}
                                onChange={(e) => setData('categoria', e.target.value)}
                                className="mt-1 block w-full"
                            >
                                {categorias.map((categoria) => (
                                    <option key={categoria.value} value={categoria.value}>
                                        {categoria.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.categoria} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="cantidad" value="Cantidad" />
                            <TextInput
                                id="cantidad"
                                type="number"
                                min="1"
                                value={data.cantidad}
                                onChange={(e) => setData('cantidad', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.cantidad} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="peso_estimado" value="Peso Estimado (kg)" />
                            <TextInput
                                id="peso_estimado"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.peso_estimado}
                                onChange={(e) => setData('peso_estimado', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.peso_estimado} className="mt-2" />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="es_fragil"
                                type="checkbox"
                                checked={data.es_fragil}
                                onChange={(e) => setData('es_fragil', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            />
                            <InputLabel htmlFor="es_fragil" value="Es frágil" className="ml-2" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="descripcion" value="Descripción" />
                        <textarea
                            id="descripcion"
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            rows="3"
                        />
                        <InputError message={errors.descripcion} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="notas" value="Notas adicionales" />
                        <textarea
                            id="notas"
                            value={data.notas}
                            onChange={(e) => setData('notas', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            rows="2"
                        />
                        <InputError message={errors.notas} className="mt-2" />
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
                        Eliminar Item de Equipaje
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        ¿Estás seguro de que deseas eliminar "{selectedEquipaje?.nombre_item}"? 
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