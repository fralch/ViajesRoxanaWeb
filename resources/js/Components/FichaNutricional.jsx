 import { useForm } from '@inertiajs/react';
 import { useState, useEffect } from 'react';
 import { AppleIcon, CheckIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react';
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

    // Componente para campos condicionales con mejor diseño
    const ConditionalField = ({ show, children, priority = 'alta' }) => {
        if (!show) return null;
        
        // Definir estilos basados en la prioridad sin usar círculos
        const priorityStyles = {
            alta: {
                container: 'border-l-4 border-amber-600 bg-amber-100 shadow-sm',
                header: 'bg-amber-200 text-amber-900',
                icon: <InfoIcon className="w-4 h-4 text-amber-700" />,
                label: ''
            },
            critica: {
                container: 'border-l-4 border-amber-600 bg-amber-100 shadow-sm',
                header: 'bg-amber-200 text-amber-900',
                icon: <InfoIcon className="w-4 h-4 text-amber-700" />,
                label: ''
            },
            normal: {
                container: 'border-l-4 border-blue-500 bg-blue-50 shadow-sm',
                header: 'bg-blue-100 text-blue-800',
                icon: <InfoIcon className="w-4 h-4 text-blue-600" />,
                label: 'Información adicional'
            }
        };

        const style = priorityStyles[priority] || priorityStyles.normal;

        return (
            <div className={`ml-6 mt-4 p-4 rounded-lg transition-all duration-300 ease-in-out ${style.container}`}>
                <div className="pl-2">
                    {children}
                </div>
            </div>
        );
    };

    // Calculate completion percentage
    const calculateCompletion = () => {
        const fields = [
            data.alimento_alergia,
            data.reaccion_alergia,
            data.alimento_evitar,
            data.especificar_dieta,
            data.detalle_preferencia_alimentaria
        ];
        const filledFields = fields.filter(field => field && field.trim() !== '').length;
        return Math.round((filledFields / fields.length) * 100);
    };

    const completionPercentage = calculateCompletion();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AppleIcon className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Información Alimentaria</h3>
                    <p className="text-gray-600 text-sm">Responde las preguntas para personalizar la información nutricional</p>
                </div>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Progreso del formulario</span>
                    <span className="text-sm font-bold text-orange-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
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
                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                rows="4"
                                value={data.detalle_preferencia_alimentaria}
                                onChange={(e) => setData('detalle_preferencia_alimentaria', e.target.value)}
                                placeholder="Ej. Omnívoro, prefiere pescado y pollo"
                                required={tienePreferenciaAlimentaria === 'Sí'}
                            />
                            <InputError message={errors.detalle_preferencia_alimentaria} className="mt-2" />
                           
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
                                 <CheckIcon className="w-4 h-4" />
                                 Guardar Información Alimentaria
                             </div>
                         )}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}