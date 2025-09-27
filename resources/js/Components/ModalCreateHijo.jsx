import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { showSuccess, showError } from '@/utils/swal';

export default function ModalCreateHijo({
    show = false,
    onClose = () => {},
    onHijoCreated = () => {},
    currentUserId = null
}) {
    const [data, setData] = useState({
        user_id: currentUserId || null,
        nombres: '',
        doc_tipo: 'DNI',
        doc_numero: '',
        nums_emergencia: [''],
        fecha_nacimiento: '',
        foto: '',
        pasatiempos: '',
        deportes: '',
        plato_favorito: '',
        color_favorito: '',
        informacion_adicional: ''
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            const response = await fetch(route('hijos.store'), {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    setErrors(result.errors);
                }
                showError('Error', 'No se pudo registrar el hijo. Verifica los datos e intenta nuevamente.');
                return;
            }

            showSuccess('¡Hijo registrado!', 'El hijo ha sido registrado exitosamente.');

            const newHijo = result.hijo || result;

            const hijoCompleto = {
                ...newHijo,
                user_id: currentUserId || newHijo.user_id,
                user: newHijo.user || {
                    id: currentUserId || newHijo.user_id,
                    name: 'Usuario actual'
                }
            };

            onHijoCreated(hijoCompleto);
            handleClose();
        } catch (error) {
            showError('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setData({
            user_id: currentUserId || null,
            nombres: '',
            doc_tipo: 'DNI',
            doc_numero: '',
            nums_emergencia: [''],
            fecha_nacimiento: '',
            foto: '',
            pasatiempos: '',
            deportes: '',
            plato_favorito: '',
            color_favorito: '',
            informacion_adicional: ''
        });
        setErrors({});
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-blue-600">Registrar Nuevo Hijo</h2>
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
                    {/* Nombres completos */}
                    <div>
                        <InputLabel htmlFor="nombres" value="Nombres completos *" />
                        <TextInput
                            id="nombres"
                            name="nombres"
                            value={data.nombres}
                            onChange={(e) => setData({...data, nombres: e.target.value})}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.nombres} className="mt-2" />
                    </div>

                    {/* Documento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <InputLabel htmlFor="doc_tipo" value="Tipo de documento *" />
                            <select
                                id="doc_tipo"
                                name="doc_tipo"
                                value={data.doc_tipo}
                                onChange={(e) => setData({...data, doc_tipo: e.target.value})}
                                className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                required
                            >
                                <option value="dni">DNI</option>
                                <option value="carnet_extranjeria">Carnet de Extranjería</option>
                                <option value="pasaporte">Pasaporte</option>
                            </select>
                            <InputError message={errors.doc_tipo} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="doc_numero" value="Número de documento *" />
                            <TextInput
                                id="doc_numero"
                                name="doc_numero"
                                value={data.doc_numero}
                                onChange={(e) => setData({...data, doc_numero: e.target.value})}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.doc_numero} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <SecondaryButton type="button" onClick={handleClose}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Registrando...' : 'Registrar Hijo'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}