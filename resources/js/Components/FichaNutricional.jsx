import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

export default function FichaNutricional({ nutricionFicha, hijo, onSubmitSuccess }) {
    // Estado para las preguntas principales (radio buttons)
    const [tieneAlergiaAlimentaria, setTieneAlergiaAlimentaria] = useState('');
    const [evitaAlimentos, setEvitaAlimentos] = useState('');
    const [tieneDietaEspecial, setTieneDietaEspecial] = useState('');
    const [tienePreferenciaAlimentaria, setTienePreferenciaAlimentaria] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        alimento_alergia: nutricionFicha?.alimento_alergia || '',
        reaccion_alergia: nutricionFicha?.reaccion_alergia || '',
        alimento_evitar: nutricionFicha?.alimento_evitar || '',
        especificar_dieta: nutricionFicha?.especificar_dieta || '',
        detalle_preferencia_alimentaria: nutricionFicha?.detalle_preferencia_alimentaria || ''
    });

    // Inicializar estados basado en datos existentes
    useEffect(() => {
        if (nutricionFicha) {
            setTieneAlergiaAlimentaria(nutricionFicha.alimento_alergia ? 'Sí' : '');
            setEvitaAlimentos(nutricionFicha.alimento_evitar ? 'Sí' : '');
            setTieneDietaEspecial(nutricionFicha.especificar_dieta ? 'Sí' : '');
            setTienePreferenciaAlimentaria(nutricionFicha.detalle_preferencia_alimentaria ? 'Sí' : '');
        }
    }, [nutricionFicha]);

    // Limpiar campos cuando se selecciona "No"
    const handleRadioChange = (question, value) => {
        switch (question) {
            case 'alergia':
                setTieneAlergiaAlimentaria(value);
                if (value === 'No') {
                    setData('alimento_alergia', '');
                    setData('reaccion_alergia', '');
                }
                break;
            case 'evita':
                setEvitaAlimentos(value);
                if (value === 'No') {
                    setData('alimento_evitar', '');
                }
                break;
            case 'dieta':
                setTieneDietaEspecial(value);
                if (value === 'No') {
                    setData('especificar_dieta', '');
                }
                break;
            case 'preferencia':
                setTienePreferenciaAlimentaria(value);
                if (value === 'No') {
                    setData('detalle_preferencia_alimentaria', '');
                }
                break;
        }
    };

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

    // Componente para preguntas con radio buttons
    const RadioQuestion = ({ question, value, onChange, options = ['Sí', 'No'] }) => (
        <div className="space-y-3">
            <p className="text-gray-800 font-semibold">{question}</p>
            <div className="flex gap-4">
                {options.map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            value={option}
                            checked={value === option}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    // Componente para campos condicionales con animación
    const ConditionalField = ({ show, children, priority = 'alta' }) => {
        const priorityColors = {
            alta: 'border-l-orange-500 bg-orange-50',
            critica: 'border-l-red-500 bg-red-50'
        };

        const priorityIcons = {
            alta: '🟢',
            critica: '🔴'
        };

        if (!show) return null;

        return (
            <div className={`ml-6 mt-4 p-4 border-l-4 rounded-r-lg transition-all duration-300 ease-in-out ${priorityColors[priority]}`}>
                <div className="flex items-center gap-2 mb-2">
                    <span>{priorityIcons[priority]}</span>
                    <span className="text-xs font-medium text-gray-600">
                        {priority === 'alta' ? 'Información importante' : 'Información crítica'}
                    </span>
                </div>
                {children}
            </div>
        );
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
                    <h3 className="text-xl font-bold text-gray-900">Información Alimentaria</h3>
                    <p className="text-gray-600 text-sm">Responde las preguntas para personalizar la información nutricional</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Pregunta 1: Alergias Alimentarias */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <RadioQuestion
                        question="¿Tiene alguna alergia alimentaria?"
                        value={tieneAlergiaAlimentaria}
                        onChange={(value) => handleRadioChange('alergia', value)}
                    />

                    <ConditionalField show={tieneAlergiaAlimentaria === 'Sí'} priority="alta">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="alimento_alergia" value="¿A qué alimento?" className="text-gray-700 font-semibold" />
                                <textarea
                                    id="alimento_alergia"
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    rows="3"
                                    value={data.alimento_alergia}
                                    onChange={(e) => setData('alimento_alergia', e.target.value)}
                                    placeholder="Ej. Maní, leche, mariscos"
                                    required={tieneAlergiaAlimentaria === 'Sí'}
                                />
                                <InputError message={errors.alimento_alergia} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="reaccion_alergia" value="¿Qué reacción le produce?" className="text-gray-700 font-semibold" />
                                <textarea
                                    id="reaccion_alergia"
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                    rows="3"
                                    value={data.reaccion_alergia}
                                    onChange={(e) => setData('reaccion_alergia', e.target.value)}
                                    placeholder="Ej. Dificultad respiratoria, sarpullido"
                                    required={tieneAlergiaAlimentaria === 'Sí'}
                                />
                                <InputError message={errors.reaccion_alergia} className="mt-2" />
                            </div>
                        </div>
                    </ConditionalField>
                </div>

                {/* Pregunta 2: Alimentos que Evita */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <RadioQuestion
                        question="¿Evita algún alimento aunque no sea alérgico?"
                        value={evitaAlimentos}
                        onChange={(value) => handleRadioChange('evita', value)}
                    />

                    <ConditionalField show={evitaAlimentos === 'Sí'} priority="alta">
                        <div>
                            <InputLabel htmlFor="alimento_evitar" value="Especificar alimento(s)" className="text-gray-700 font-semibold" />
                            <textarea
                                id="alimento_evitar"
                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                rows="3"
                                value={data.alimento_evitar}
                                onChange={(e) => setData('alimento_evitar', e.target.value)}
                                placeholder="Ej. No come cerdo, evita embutidos"
                                required={evitaAlimentos === 'Sí'}
                            />
                            <InputError message={errors.alimento_evitar} className="mt-2" />
                        </div>
                    </ConditionalField>
                </div>

                {/* Pregunta 3: Dieta Especial */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <RadioQuestion
                        question="¿Sigue alguna dieta especial?"
                        value={tieneDietaEspecial}
                        onChange={(value) => handleRadioChange('dieta', value)}
                    />

                    <ConditionalField show={tieneDietaEspecial === 'Sí'} priority="alta">
                        <div>
                            <InputLabel htmlFor="especificar_dieta" value="Especificar dieta" className="text-gray-700 font-semibold" />
                            <textarea
                                id="especificar_dieta"
                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                rows="3"
                                value={data.especificar_dieta}
                                onChange={(e) => setData('especificar_dieta', e.target.value)}
                                placeholder="Ej. Vegetariana, baja en sodio, sin azúcar"
                                required={tieneDietaEspecial === 'Sí'}
                            />
                            <InputError message={errors.especificar_dieta} className="mt-2" />
                        </div>
                    </ConditionalField>
                </div>

                {/* Pregunta 4: Preferencias Alimentarias */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <RadioQuestion
                        question="¿Tiene alguna preferencia alimentaria importante?"
                        value={tienePreferenciaAlimentaria}
                        onChange={(value) => handleRadioChange('preferencia', value)}
                    />

                    <ConditionalField show={tienePreferenciaAlimentaria === 'Sí'} priority="critica">
                        <div>
                            <InputLabel htmlFor="detalle_preferencia_alimentaria" value="Especificar detalle" className="text-gray-700 font-semibold" />
                            <textarea
                                id="detalle_preferencia_alimentaria"
                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                                rows="4"
                                value={data.detalle_preferencia_alimentaria}
                                onChange={(e) => setData('detalle_preferencia_alimentaria', e.target.value)}
                                placeholder="Ej. Omnívoro, prefiere pescado y pollo"
                                required={tienePreferenciaAlimentaria === 'Sí'}
                            />
                            <InputError message={errors.detalle_preferencia_alimentaria} className="mt-2" />
                            <p className="text-xs text-gray-500 mt-2">🔒 Esta información es solo para uso interno del personal</p>
                        </div>
                    </ConditionalField>
                </div>

                {/* Botón de guardar */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <PrimaryButton
                        disabled={processing}
                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                                Guardar Información Alimentaria
                            </div>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}