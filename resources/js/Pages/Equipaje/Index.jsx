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
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEquipaje, setSelectedEquipaje] = useState(null);
    const [imagePreviews, setImagePreviews] = useState({
        images: null,
        images1: null,
        images2: null
    });

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        tip_maleta: 'Maleta de 8 kg',
        color: '',
        caracteristicas: '',
        peso: '',
        images: null,
        images1: null,
        images2: null,
        lugar_regis: ''
    });

    const resetForm = () => {
        reset();
        setImagePreviews({
            images: null,
            images1: null,
            images2: null
        });
    };

    const tiposMaleta = [
        { value: 'Maleta de 8 kg', label: 'Maleta de 8 kg' },
        { value: 'Maleta de 23 kg', label: 'Maleta de 23 kg' }
    ];

    const lugaresRegistro = [
        { value: 'aeropuerto', label: 'Aeropuerto' },
        { value: 'casa', label: 'Casa' },
        { value: 'colegio', label: 'Colegio' }
    ];

    const openEditModal = (equipaje) => {
        setSelectedEquipaje(equipaje);
        setData({
            tip_maleta: equipaje.tip_maleta || 'Maleta de 8 kg',
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
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedEquipaje(null);
        setImagePreviews({
            images: null,
            images1: null,
            images2: null
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('tip_maleta', data.tip_maleta);
        formData.append('color', data.color || '');
        formData.append('caracteristicas', data.caracteristicas || '');
        formData.append('peso', data.peso || '');
        formData.append('lugar_regis', data.lugar_regis || '');

        // Agregar archivos si existen
        if (data.images instanceof File) formData.append('images', data.images);
        if (data.images1 instanceof File) formData.append('images1', data.images1);
        if (data.images2 instanceof File) formData.append('images2', data.images2);

        post(route('equipaje.store'), formData, {
            onSuccess: () => {
                resetForm();
            }
        });
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

    const handleImageChange = (field, file) => {
        setData(field, file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => ({
                    ...prev,
                    [field]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreviews(prev => ({
                ...prev,
                [field]: null
            }));
        }
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

            <div className="py-12 space-y-8">
                {/* Formulario de Creación - Mostrado al inicio */}
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Registrar Nuevo Equipaje</h3>
                                    <p className="text-sm text-gray-500">Complete los datos del equipaje para registrarlo en el sistema</p>
                                </div>
                            </div>

                             <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                         <InputLabel htmlFor="color" value="Color" />
                                         <TextInput
                                             id="color"
                                             value={data.color}
                                             onChange={(e) => setData('color', e.target.value)}
                                             className="mt-1 block w-full"
                                             maxLength="50"
                                             placeholder="Ej: Rojo"
                                         />
                                         <InputError message={errors.color} className="mt-2" />
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                             placeholder="0.00"
                                         />
                                         <InputError message={errors.peso} className="mt-2" />
                                     </div>

                                     <div>
                                         <InputLabel htmlFor="lugar_regis" value="Lugar de Registro" />
                                         <SelectInput
                                             id="lugar_regis"
                                             value={data.lugar_regis}
                                             onChange={(e) => setData('lugar_regis', e.target.value)}
                                             className="mt-1 block w-full"
                                         >
                                             <option value="">Seleccionar lugar</option>
                                             {lugaresRegistro.map((lugar) => (
                                                 <option key={lugar.value} value={lugar.value}>
                                                     {lugar.label}
                                                 </option>
                                             ))}
                                         </SelectInput>
                                         <InputError message={errors.lugar_regis} className="mt-2" />
                                     </div>
                                 </div>

                                <div>
                                    <InputLabel htmlFor="caracteristicas" value="Características" />
                                    <textarea
                                        id="caracteristicas"
                                        value={data.caracteristicas}
                                        onChange={(e) => setData('caracteristicas', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="3"
                                        placeholder="Describa las características especiales del equipaje..."
                                    />
                                    <InputError message={errors.caracteristicas} className="mt-2" />
                                </div>

                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <div>
                                         <InputLabel htmlFor="images" value="Imagen 1" />
                                         <input
                                             id="images"
                                             type="file"
                                             accept="image/*"
                                             capture="environment"
                                             onChange={(e) => handleImageChange('images', e.target.files[0])}
                                             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                         />
                                         <p className="mt-1 text-xs text-gray-500">Formatos: JPG, PNG, GIF. Máx: 2MB</p>
                                         {imagePreviews.images && (
                                             <div className="mt-2">
                                                 <img
                                                     src={imagePreviews.images}
                                                     alt="Vista previa 1"
                                                     className="w-20 h-20 object-cover rounded-md border border-gray-300"
                                                 />
                                             </div>
                                         )}
                                         <InputError message={errors.images} className="mt-2" />
                                     </div>

                                     <div>
                                         <InputLabel htmlFor="images1" value="Imagen 2" />
                                         <input
                                             id="images1"
                                             type="file"
                                             accept="image/*"
                                             capture="environment"
                                             onChange={(e) => handleImageChange('images1', e.target.files[0])}
                                             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                         />
                                         <p className="mt-1 text-xs text-gray-500">Formatos: JPG, PNG, GIF. Máx: 2MB</p>
                                         {imagePreviews.images1 && (
                                             <div className="mt-2">
                                                 <img
                                                     src={imagePreviews.images1}
                                                     alt="Vista previa 2"
                                                     className="w-20 h-20 object-cover rounded-md border border-gray-300"
                                                 />
                                             </div>
                                         )}
                                         <InputError message={errors.images1} className="mt-2" />
                                     </div>

                                     <div>
                                         <InputLabel htmlFor="images2" value="Imagen 3" />
                                         <input
                                             id="images2"
                                             type="file"
                                             accept="image/*"
                                             capture="environment"
                                             onChange={(e) => handleImageChange('images2', e.target.files[0])}
                                             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                         />
                                         <p className="mt-1 text-xs text-gray-500">Formatos: JPG, PNG, GIF. Máx: 2MB</p>
                                         {imagePreviews.images2 && (
                                             <div className="mt-2">
                                                 <img
                                                     src={imagePreviews.images2}
                                                     alt="Vista previa 3"
                                                     className="w-20 h-20 object-cover rounded-md border border-gray-300"
                                                 />
                                             </div>
                                         )}
                                         <InputError message={errors.images2} className="mt-2" />
                                     </div>
                                 </div>

                                <div className="flex justify-end">
                                    <PrimaryButton disabled={processing} type="submit">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Registrar Equipaje
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Lista de Equipajes - Mostrada al final */}
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-lg font-medium text-gray-900">Equipaje Registrado</h3>
                                        <p className="text-sm text-gray-500">
                                            {equipajes.length} {equipajes.length === 1 ? 'item registrado' : 'items registrados'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {(equipajes || []).length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay equipaje registrado</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Comience registrando su primer equipaje usando el formulario de arriba.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {equipajes.map((equipaje) => (
                                        <div key={equipaje.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-lg text-gray-900">Equipaje #{equipaje.id}</h4>
                                                    <p className="text-sm text-gray-500">Registrado para {equipaje.hijo?.nombre} {equipaje.hijo?.apellido}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    equipaje.tip_maleta === 'Maleta de 23 kg'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {getTipoMaletaLabel(equipaje.tip_maleta)}
                                                </span>
                                            </div>

                                             <div className="space-y-2 text-sm mb-4">
                                                 {equipaje.color && (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                                        </svg>
                                                        <span className="text-gray-600"><strong>Color:</strong> {equipaje.color}</span>
                                                    </div>
                                                )}
                                                {equipaje.peso && (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                        </svg>
                                                        <span className="text-gray-600"><strong>Peso:</strong> {equipaje.peso} kg</span>
                                                    </div>
                                                )}
                                                {equipaje.lugar_regis && (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-gray-600"><strong>Lugar:</strong> {equipaje.lugar_regis}</span>
                                                    </div>
                                                )}
                                                {equipaje.caracteristicas && (
                                                    <div className="flex items-start">
                                                        <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                        </svg>
                                                        <div className="text-gray-600">
                                                            <strong>Características:</strong>
                                                            <p className="text-xs mt-1">{equipaje.caracteristicas}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mostrar imágenes si existen */}
                                            {(equipaje.images || equipaje.images1 || equipaje.images2) && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Imágenes
                                                    </p>
                                                    <div className="flex space-x-2 overflow-x-auto">
                                                        {equipaje.images && (
                                                            <img src={`/storage/${equipaje.images}`} alt="Imagen 1" className="w-16 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(`/storage/${equipaje.images}`, '_blank')} />
                                                        )}
                                                        {equipaje.images1 && (
                                                            <img src={`/storage/${equipaje.images1}`} alt="Imagen 2" className="w-16 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(`/storage/${equipaje.images1}`, '_blank')} />
                                                        )}
                                                        {equipaje.images2 && (
                                                            <img src={`/storage/${equipaje.images2}`} alt="Imagen 3" className="w-16 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(`/storage/${equipaje.images2}`, '_blank')} />
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                                <SecondaryButton
                                                    onClick={() => openEditModal(equipaje)}
                                                    className="flex-1 text-sm py-2"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Editar
                                                </SecondaryButton>
                                                <DangerButton
                                                    onClick={() => openDeleteModal(equipaje)}
                                                    className="flex-1 text-sm py-2"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
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

            {/* Modal para Editar */}
            <Modal show={showEditModal} onClose={closeModals}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                     const formData = new FormData();
                     formData.append('_method', 'PUT');
                     formData.append('tip_maleta', data.tip_maleta);
                     formData.append('color', data.color || '');
                     formData.append('caracteristicas', data.caracteristicas || '');
                     formData.append('peso', data.peso || '');
                     formData.append('lugar_regis', data.lugar_regis || '');

                    // Agregar archivos si existen
                    if (data.images instanceof File) formData.append('images', data.images);
                    if (data.images1 instanceof File) formData.append('images1', data.images1);
                    if (data.images2 instanceof File) formData.append('images2', data.images2);

                    router.put(route('equipaje.update', selectedEquipaje.id), formData, {
                        onSuccess: () => closeModals()
                    });
                }} encType="multipart/form-data" className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Editar Equipaje #{selectedEquipaje?.id}
                    </h2>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                             <SelectInput
                                 id="lugar_regis"
                                 value={data.lugar_regis}
                                 onChange={(e) => setData('lugar_regis', e.target.value)}
                                 className="mt-1 block w-full"
                             >
                                 <option value="">Seleccionar lugar</option>
                                 {lugaresRegistro.map((lugar) => (
                                     <option key={lugar.value} value={lugar.value}>
                                         {lugar.label}
                                     </option>
                                 ))}
                             </SelectInput>
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
                            <InputLabel htmlFor="images" value="Imagen 1" />
                            {selectedEquipaje?.images && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
                                    <img src={`/storage/${selectedEquipaje.images}`} alt="Imagen actual 1" className="w-16 h-16 object-cover rounded border" />
                                </div>
                            )}
                             <input
                                 id="images"
                                 type="file"
                                 accept="image/*"
                                 capture="environment"
                                 onChange={(e) => handleImageChange('images', e.target.files[0] || null)}
                                 className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                             />
                             <p className="mt-1 text-xs text-gray-500">Deja vacío para mantener la imagen actual</p>
                             {imagePreviews.images && (
                                 <div className="mt-2">
                                     <p className="text-sm text-gray-600 mb-1">Nueva imagen:</p>
                                     <img
                                         src={imagePreviews.images}
                                         alt="Vista previa nueva 1"
                                         className="w-16 h-16 object-cover rounded border"
                                     />
                                 </div>
                             )}
                             <InputError message={errors.images} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="images1" value="Imagen 2" />
                            {selectedEquipaje?.images1 && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
                                    <img src={`/storage/${selectedEquipaje.images1}`} alt="Imagen actual 2" className="w-16 h-16 object-cover rounded border" />
                                </div>
                            )}
                             <input
                                 id="images1"
                                 type="file"
                                 accept="image/*"
                                 capture="environment"
                                 onChange={(e) => handleImageChange('images1', e.target.files[0] || null)}
                                 className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                             />
                             <p className="mt-1 text-xs text-gray-500">Deja vacío para mantener la imagen actual</p>
                             {imagePreviews.images1 && (
                                 <div className="mt-2">
                                     <p className="text-sm text-gray-600 mb-1">Nueva imagen:</p>
                                     <img
                                         src={imagePreviews.images1}
                                         alt="Vista previa nueva 2"
                                         className="w-16 h-16 object-cover rounded border"
                                     />
                                 </div>
                             )}
                             <InputError message={errors.images1} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="images2" value="Imagen 3" />
                            {selectedEquipaje?.images2 && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
                                    <img src={`/storage/${selectedEquipaje.images2}`} alt="Imagen actual 3" className="w-16 h-16 object-cover rounded border" />
                                </div>
                            )}
                             <input
                                 id="images2"
                                 type="file"
                                 accept="image/*"
                                 capture="environment"
                                 onChange={(e) => handleImageChange('images2', e.target.files[0] || null)}
                                 className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                             />
                             <p className="mt-1 text-xs text-gray-500">Deja vacío para mantener la imagen actual</p>
                             {imagePreviews.images2 && (
                                 <div className="mt-2">
                                     <p className="text-sm text-gray-600 mb-1">Nueva imagen:</p>
                                     <img
                                         src={imagePreviews.images2}
                                         alt="Vista previa nueva 3"
                                         className="w-16 h-16 object-cover rounded border"
                                     />
                                 </div>
                             )}
                             <InputError message={errors.images2} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={closeModals}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Actualizar Equipaje
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