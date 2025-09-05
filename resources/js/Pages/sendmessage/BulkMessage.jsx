import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function BulkMessage() {
    const { grupos } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        phones: '',
        message: ''
    });

    const [selectedGroups, setSelectedGroups] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userCount, setUserCount] = useState(0);

    const handleGroupChange = (groupId, checked) => {
        let newSelectedGroups;
        if (checked) {
            newSelectedGroups = [...selectedGroups, groupId];
        } else {
            newSelectedGroups = selectedGroups.filter(id => id !== groupId);
        }
        setSelectedGroups(newSelectedGroups);
        
        if (newSelectedGroups.length > 0) {
            fetchUsersByGroups(newSelectedGroups);
        } else {
            setData('phones', '');
            setUserCount(0);
        }
    };

    const fetchUsersByGroups = async (groupIds) => {
        setLoadingUsers(true);
        try {
            const response = await axios.post(route('send-message.bulk.users-by-groups'), {
                grupo_ids: groupIds
            });
            
            const phoneNumbers = response.data.phone_numbers.join(', ');
            setData('phones', phoneNumbers);
            setUserCount(response.data.count);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoadingUsers(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('send-message.bulk.send'));
    };

    return (
        <AuthenticatedLayout
            header="Envío Masivo de Mensajes"
        >
            <Head title="Envío Masivo" />

            <div className="p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-4">
                        <h1 className="text-xl font-bold mb-2">Envío Masivo de Mensajes</h1>
                        <p>Envía mensajes a múltiples números de teléfono</p>
                    </div>

                    {/* Main Form */}
                    <div className="mb-4">
                        <form onSubmit={handleSubmit}>
                            {/* Group Selection */}
                            <div className="mb-4">
                                <InputLabel value="Seleccionar Grupos" />
                                <div className="mt-1 max-h-60 overflow-y-auto border p-2">
                                    {grupos && grupos.length > 0 ? (
                                        grupos.map((grupo) => (
                                            <div key={grupo.id} className="flex items-center mb-1">
                                                <input
                                                    id={`grupo-${grupo.id}`}
                                                    type="checkbox"
                                                    checked={selectedGroups.includes(grupo.id)}
                                                    onChange={(e) => handleGroupChange(grupo.id, e.target.checked)}
                                                />
                                                <label htmlFor={`grupo-${grupo.id}`} className="ml-2">
                                                    {grupo.nombre} {grupo.paquete && `- ${grupo.paquete.nombre}`}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No hay grupos disponibles</p>
                                    )}
                                </div>
                                {selectedGroups.length > 0 && (
                                    <p className="mt-1">
                                        {selectedGroups.length} grupo(s) seleccionado(s)
                                        {userCount > 0 && ` - ${userCount} usuarios encontrados`}
                                    </p>
                                )}
                                {loadingUsers && (
                                    <p className="mt-1">
                                        Cargando usuarios...
                                    </p>
                                )}
                            </div>

                            {/* Phone Numbers Input */}
                            <div className="mb-4">
                                <InputLabel htmlFor="phones" value="Números de Teléfono" />
                                <div className="mt-1">
                                    <textarea
                                        id="phones"
                                        className="w-full border p-2"
                                        rows={4}
                                        placeholder={selectedGroups.length > 0 ? "Los números se cargarán automáticamente al seleccionar grupos" : "Ejemplo: 987654321, 912345678, 976543210"}
                                        value={data.phones}
                                        onChange={(e) => setData('phones', e.target.value)}
                                        required
                                        readOnly={loadingUsers}
                                    />
                                    <p className="text-sm mt-1">
                                        Selecciona grupos arriba o ingresa números manualmente separados por comas. No incluyas el código de país (+51).
                                    </p>
                                </div>
                                <InputError message={errors.phones} className="mt-2" />
                            </div>

                            {/* Message Input */}
                            <div className="mb-4">
                                <InputLabel htmlFor="message" value="Mensaje" />
                                <div className="mt-1">
                                    <textarea
                                        id="message"
                                        className="w-full border p-2"
                                        rows={6}
                                        placeholder="Escribe tu mensaje aquí..."
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        maxLength={1000}
                                        required
                                    />
                                    <div className="flex justify-between mt-1">
                                        <p className="text-sm">
                                            Escribe el mensaje que se enviará a todos los números
                                        </p>
                                        <span className="text-sm">
                                            {data.message.length}/1000
                                        </span>
                                    </div>
                                </div>
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="border px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    {processing ? "Enviando..." : "Enviar Mensajes"}
                                </button>
                            </div>
                        </form>
                    </div>


                 
                </div>
            </div>
        </AuthenticatedLayout>
    );
}