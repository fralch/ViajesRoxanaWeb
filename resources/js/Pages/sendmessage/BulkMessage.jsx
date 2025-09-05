import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function BulkMessage() {
    const { grupos } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        phones: '',
        message: ''
    });

    const [selectedGroups, setSelectedGroups] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('send-message.bulk.send'));
    };

    return (
        <AuthenticatedLayout header="Envío Masivo">
            <Head title="Envío Masivo" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Envío Masivo de Mensajes</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selección de Grupos */}
                    <div className="bg-white p-4 rounded-lg border">
                        <label className="block text-sm font-medium mb-3">Seleccionar Grupos</label>
                        <div className="space-y-2">
                            {grupos && grupos.length > 0 ? (
                                grupos.map((grupo) => (
                                    <div key={grupo.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`grupo-${grupo.id}`}
                                            className="mr-2"
                                        />
                                        <label htmlFor={`grupo-${grupo.id}`} className="text-sm">
                                            {grupo.nombre}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No hay grupos disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Números de Teléfono */}
                    <div className="bg-white p-4 rounded-lg border">
                        <label htmlFor="phones" className="block text-sm font-medium mb-2">Números de Teléfono</label>
                        <textarea
                            id="phones"
                            className="w-full p-2 border rounded-md"
                            rows="3"
                            placeholder="Ingresa números separados por comas"
                            value={data.phones}
                            onChange={(e) => setData('phones', e.target.value)}
                            required
                        />
                        {errors.phones && <div className="text-red-500 text-sm mt-1">{errors.phones}</div>}
                    </div>

                    {/* Mensaje */}
                    <div className="bg-white p-4 rounded-lg border">
                        <label htmlFor="message" className="block text-sm font-medium mb-2">Mensaje</label>
                        <textarea
                            id="message"
                            className="w-full p-2 border rounded-md"
                            rows="4"
                            placeholder="Escribe tu mensaje aquí..."
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            required
                        />
                        {errors.message && <div className="text-red-500 text-sm mt-1">{errors.message}</div>}
                    </div>

                    {/* Botón de Envío */}
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
                        >
                            {processing ? 'Enviando...' : 'Enviar Mensajes'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}