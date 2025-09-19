import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function FichaSalud({ saludFicha, hijo, onSubmitSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        alergias: saludFicha?.alergias || '',
        medicamentos: saludFicha?.medicamentos || '',
        seguros: saludFicha?.seguros || '',
        emergencia_contacto: saludFicha?.emergencia_contacto || '',
        emergencia_telefono: saludFicha?.emergencia_telefono || '',
        observaciones: saludFicha?.observaciones || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('salud.ficha.store', hijo.doc_numero), {
            onSuccess: () => {
                if (onSubmitSuccess) {
                    onSubmitSuccess('Ficha de salud guardada correctamente');
                }
            },
            onError: () => {
                console.log('Error al guardar la ficha de salud');
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Información de Salud</h3>
                    <p className="text-gray-600 text-sm">Registra información médica importante</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 bg-green-50 p-6 rounded-2xl mb-6">
                    <div>
                        <InputLabel htmlFor="alergias" value="Alergias" className="text-gray-700 font-semibold" />
                        <textarea
                            id="alergias"
                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                            rows="3"
                            value={data.alergias}
                            onChange={(e) => setData('alergias', e.target.value)}
                            placeholder="Describe cualquier alergia a medicamentos conocida..."
                        />
                        <InputError message={errors.alergias} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="medicamentos" value="Medicamentos" className="text-gray-700 font-semibold" />
                        <textarea
                            id="medicamentos"
                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                            rows="3"
                            value={data.medicamentos}
                            onChange={(e) => setData('medicamentos', e.target.value)}
                            placeholder="Medicamentos que toma regularmente..."
                        />
                        <InputError message={errors.medicamentos} className="mt-2" />
                    </div>


                    
                    

                    <div className="md:col-span-2">
                        <InputLabel htmlFor="observaciones" value="Observaciones Médicas" className="text-gray-700 font-semibold" />
                        <textarea
                            id="observaciones"
                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                            rows="3"
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            placeholder="Cualquier observación médica importante..."
                        />
                        <InputError message={errors.observaciones} className="mt-2" />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <PrimaryButton
                        disabled={processing}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {processing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Guardando...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Guardar Ficha de Salud
                            </div>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}