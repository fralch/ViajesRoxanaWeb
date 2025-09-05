import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function BulkMessage() {
    const { data, setData, post, processing, errors, reset } = useForm({
        phones: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('send-message.bulk.send'));
    };

    return (
        <AuthenticatedLayout
            header="Envío Masivo de Mensajes"
        >
            <Head title="Envío Masivo" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 Envío Masivo de Mensajes</h1>
                        <p className="text-gray-600">Envía mensajes a múltiples números de teléfono</p>
                    </div>

                    {/* Main Form */}
                    <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Phone Numbers Input */}
                            <div>
                                <InputLabel htmlFor="phones" value="Números de Teléfono" />
                                <div className="mt-2">
                                    <textarea
                                        id="phones"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 resize-none"
                                        rows={4}
                                        placeholder="Ejemplo: 987654321, 912345678, 976543210"
                                        value={data.phones}
                                        onChange={(e) => setData('phones', e.target.value)}
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        💡 Ingresa los números separados por comas. No incluyas el código de país (+51).
                                    </p>
                                </div>
                                <InputError message={errors.phones} className="mt-2" />
                            </div>

                            {/* Message Input */}
                            <div>
                                <InputLabel htmlFor="message" value="Mensaje" />
                                <div className="mt-2">
                                    <textarea
                                        id="message"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 resize-none"
                                        rows={6}
                                        placeholder="Escribe tu mensaje aquí..."
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        maxLength={1000}
                                        required
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm text-gray-500">
                                            ✉️ Escribe el mensaje que se enviará a todos los números
                                        </p>
                                        <span className="text-sm text-gray-400">
                                            {data.message.length}/1000
                                        </span>
                                    </div>
                                </div>
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <PrimaryButton 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-8 py-3"
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Enviando...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Enviar Mensajes
                                        </div>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>


                    {/* Instructions */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Instrucciones</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Ingresa los números de teléfono peruanos sin el código de país (+51)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Separa múltiples números con comas: 987654321, 912345678, 976543210</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>El mensaje puede tener hasta 1000 caracteres</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Hay una pausa de 1 segundo entre cada envío para evitar saturar la API</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}