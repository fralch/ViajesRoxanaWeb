import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

export default function FichaNutricional({ nutricionFicha, hijo, onSubmitSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        restricciones: nutricionFicha?.restricciones || '',
        preferencias: nutricionFicha?.preferencias || '',
        alergias_alimentarias: nutricionFicha?.alergias_alimentarias || '',
        intolerancias: nutricionFicha?.intolerancias || '',
        otras_notas: nutricionFicha?.otras_notas || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('nutricion.ficha.store', hijo.doc_numero), {
            onSuccess: () => {
                if (onSubmitSuccess) {
                    onSubmitSuccess('Ficha nutricional guardada correctamente');
                }
            },
            onError: () => {
                console.log('Error al guardar la ficha nutricional');
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Información Nutricional</h3>
                    <p className="text-gray-600 text-sm">Registra preferencias y restricciones alimentarias</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 bg-orange-50 p-6 rounded-2xl">
                    <div>
                        <InputLabel htmlFor="restricciones" value="Restricciones Alimentarias" className="text-gray-700 font-semibold" />
                        <textarea
                            id="restricciones"
                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            rows="3"
                            value={data.restricciones}
                            onChange={(e) => setData('restricciones', e.target.value)}
                            placeholder="Describe cualquier restricción alimentaria..."
                        />
                        <InputError message={errors.restricciones} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="preferencias" value="Preferencias Alimentarias" className="text-gray-700 font-semibold" />
                        <textarea
                            id="preferencias"
                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            rows="3"
                            value={data.preferencias}
                            onChange={(e) => setData('preferencias', e.target.value)}
                            placeholder="Comidas favoritas, gustos especiales..."
                        />
                        <InputError message={errors.preferencias} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="alergias_alimentarias" value="Alergias Alimentarias" className="text-gray-700 font-semibold" />
                        <textarea
                            id="alergias_alimentarias"
                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            rows="3"
                            value={data.alergias_alimentarias}
                            onChange={(e) => setData('alergias_alimentarias', e.target.value)}
                            placeholder="Alergias específicas a alimentos..."
                        />
                        <InputError message={errors.alergias_alimentarias} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="intolerancias" value="Intolerancias Alimentarias" className="text-gray-700 font-semibold" />
                        <textarea
                            id="intolerancias"
                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            rows="3"
                            value={data.intolerancias}
                            onChange={(e) => setData('intolerancias', e.target.value)}
                            placeholder="Intolerancias conocidas (lactosa, gluten, etc.)..."
                        />
                        <InputError message={errors.intolerancias} className="mt-2" />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel htmlFor="otras_notas" value="Otras Notas Nutricionales" className="text-gray-700 font-semibold" />
                        <textarea
                            id="otras_notas"
                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            rows="3"
                            value={data.otras_notas}
                            onChange={(e) => setData('otras_notas', e.target.value)}
                            placeholder="Cualquier otra información nutricional relevante..."
                        />
                        <InputError message={errors.otras_notas} className="mt-2" />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <PrimaryButton
                        disabled={processing}
                        className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
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
                                Guardar Ficha Nutricional
                            </div>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}