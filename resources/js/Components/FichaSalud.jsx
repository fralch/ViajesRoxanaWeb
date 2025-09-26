import { useForm } from '@inertiajs/react';
 import { useState } from 'react';
 import { HeartIcon, CheckIcon, DropletIcon, PillIcon, HospitalIcon, AlertTriangleIcon, SyringeIcon, ShieldIcon, ClipboardIcon } from 'lucide-react';
 import InputError from '@/Components/InputError';
 import InputLabel from '@/Components/InputLabel';
 import TextInput from '@/Components/TextInput';
 import PrimaryButton from '@/Components/PrimaryButton';

export default function FichaSalud({ saludFicha, hijo, onSubmitSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        grupo_sanguineo: saludFicha?.grupo_sanguineo || '',
        factor_rh: saludFicha?.factor_rh || '',
        recibe_tratamientos: saludFicha?.recibe_tratamientos || '',
        condicion_medica: saludFicha?.condicion_medica || '',
        nombre_medicamento: saludFicha?.nombre_medicamento || '',
        frecuencia: saludFicha?.frecuencia || '',
        quien_administra: saludFicha?.quien_administra || '',
        observaciones: saludFicha?.observaciones || '',
        detalle_enfermedad: saludFicha?.detalle_enfermedad || '',
        medicamento_enfermedad: saludFicha?.medicamento_enfermedad || '',
        frecuencia_enfermedad: saludFicha?.frecuencia_enfermedad || '',
        quien_administra_enfermedad: saludFicha?.quien_administra_enfermedad || '',
        observaciones_enfermedad: saludFicha?.observaciones_enfermedad || '',
        detalle_alergia: saludFicha?.detalle_alergia || '',
        medicamento_control: saludFicha?.medicamento_control || '',
        frecuencia_alergia: saludFicha?.frecuencia_alergia || '',
        quien_administra_alergia: saludFicha?.quien_administra_alergia || '',
        observaciones_alergia: saludFicha?.observaciones_alergia || '',
        vacunas_checklist: saludFicha?.vacunas_checklist || [],
        dosis_covid: saludFicha?.dosis_covid || '',
        efectos_covid: saludFicha?.efectos_covid || '',
        tiene_seguro_particular: saludFicha?.tiene_seguro_particular || '',
        nombre_seguro: saludFicha?.nombre_seguro || '',
        administradora: saludFicha?.administradora || '',
        numero_poliza: saludFicha?.numero_poliza || '',
        telefono_contacto: saludFicha?.telefono_contacto || '',
        informacion_adicional: saludFicha?.informacion_adicional || '',
        archivo_adjunto: null
    });

    const [currentSection, setCurrentSection] = useState(0);

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

    const handleVacunaChange = (vacuna, checked) => {
        const updatedVacunas = checked
            ? [...data.vacunas_checklist, vacuna]
            : data.vacunas_checklist.filter(v => v !== vacuna);
        setData('vacunas_checklist', updatedVacunas);
    };

    const sections = [
        {
            title: "Datos básicos de salud",
            icon: <DropletIcon className="w-5 h-5" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Tratamientos actuales",
            icon: <PillIcon className="w-5 h-5" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Enfermedades preexistentes",
            icon: <HospitalIcon className="w-5 h-5" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Alergias",
            icon: <AlertTriangleIcon className="w-5 h-5" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Vacunas recibidas",
            icon: <SyringeIcon className="w-5 h-5" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Seguro médico",
            icon: <ShieldIcon className="w-5 h-5" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Información adicional",
            icon: <ClipboardIcon className="w-5 h-5" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <HeartIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Información de Salud</h3>
                    <p className="text-gray-600 text-sm">Responde las preguntas paso a paso</p>
                </div>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Progreso del formulario</span>
                    <span className="text-sm font-bold text-emerald-600">{Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Section navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                {sections.map((section, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentSection(index)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                            currentSection === index
                                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex justify-center items-center text-lg mb-1">{section.icon}</div>
                        <div className="text-xs font-medium text-gray-700 leading-tight">{section.title}</div>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 0: Datos básicos de salud */}
                {currentSection === 0 && (
                    <div className={`${sections[0].bgColor} p-6 rounded-2xl border-2 ${sections[0].borderColor}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{sections[0].icon}</span>
                            <h4 className="text-lg font-semibold text-gray-900">{sections[0].title}</h4>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="grupo_sanguineo" value="Grupo sanguíneo" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Grupo sanguíneo <span className="text-green-500">*</span>
                                    <span className="text-green-600 text-xs">🟢</span>
                                </InputLabel>
                                <select
                                    id="grupo_sanguineo"
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    value={data.grupo_sanguineo}
                                    onChange={(e) => setData('grupo_sanguineo', e.target.value)}
                                    requigreen
                                >
                                    <option value="">Ej. O, A, B, AB</option>
                                    <option value="O">O</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                </select>
                                <InputError message={errors.grupo_sanguineo} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="factor_rh" value="Factor Rh" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Factor Rh <span className="text-green-500">*</span>
                                    <span className="text-green-600 text-xs">🟢</span>
                                </InputLabel>
                                <select
                                    id="factor_rh"
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    value={data.factor_rh}
                                    onChange={(e) => setData('factor_rh', e.target.value)}
                                    requigreen
                                >
                                    <option value="">Ej. + / -</option>
                                    <option value="+">Positivo (+)</option>
                                    <option value="-">Negativo (-)</option>
                                </select>
                                <InputError message={errors.factor_rh} className="mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Section 1: Tratamientos actuales */}
                {currentSection === 1 && (
                    <div className={`${sections[1].bgColor} p-6 rounded-2xl border-2 ${sections[1].borderColor}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{sections[1].icon}</span>
                            <h4 className="text-lg font-semibold text-gray-900">{sections[1].title}</h4>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel value="¿Recibe tratamientos de salud actualmente?" className="text-gray-700 font-semibold flex items-center gap-1">
                                    ¿Recibe tratamientos de salud actualmente? <span className="text-green-500">*</span>
                                </InputLabel>
                                <div className="mt-3 space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="recibe_tratamientos"
                                            value="Sí"
                                            checked={data.recibe_tratamientos === 'Sí'}
                                            onChange={(e) => setData('recibe_tratamientos', e.target.value)}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="ml-3 text-gray-700">Sí</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="recibe_tratamientos"
                                            value="No"
                                            checked={data.recibe_tratamientos === 'No'}
                                            onChange={(e) => setData('recibe_tratamientos', e.target.value)}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="ml-3 text-gray-700">No</span>
                                    </label>
                                </div>
                                <InputError message={errors.recibe_tratamientos} className="mt-2" />
                            </div>

                            {/* Conditional fields for treatments */}
                            {data.recibe_tratamientos === 'Sí' && (
                                <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-4 animate-fadeIn">
                                    <div>
                                        <InputLabel htmlFor="condicion_medica" value="Condición médica" className="text-gray-700 font-semibold flex items-center gap-1">
                                            Condición médica <span className="text-green-500">*</span>
                                            <span className="text-green-600 text-xs">🟢</span>
                                        </InputLabel>
                                        <TextInput
                                            id="condicion_medica"
                                            type="text"
                                            className="mt-2 block w-full rounded-xl"
                                            value={data.condicion_medica}
                                            onChange={(e) => setData('condicion_medica', e.target.value)}
                                            placeholder="Ej. Asma, diabetes"
                                            requigreen={data.recibe_tratamientos === 'Sí'}
                                        />
                                        <InputError message={errors.condicion_medica} className="mt-2" />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="nombre_medicamento" value="Nombre del medicamento" className="text-gray-700 font-semibold flex items-center gap-1">
                                                Nombre del medicamento <span className="text-green-500">*</span>
                                                <span className="text-green-600 text-xs">🟢</span>
                                            </InputLabel>
                                            <TextInput
                                                id="nombre_medicamento"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl"
                                                value={data.nombre_medicamento}
                                                onChange={(e) => setData('nombre_medicamento', e.target.value)}
                                                placeholder="Ej. Salbutamol"
                                                requigreen={data.recibe_tratamientos === 'Sí'}
                                            />
                                            <InputError message={errors.nombre_medicamento} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="frecuencia" value="Frecuencia" className="text-gray-700 font-semibold flex items-center gap-1">
                                                Frecuencia <span className="text-green-500">*</span>
                                                <span className="text-green-600 text-xs">🟢</span>
                                            </InputLabel>
                                            <TextInput
                                                id="frecuencia"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl"
                                                value={data.frecuencia}
                                                onChange={(e) => setData('frecuencia', e.target.value)}
                                                placeholder="Ej. Cada 8 horas"
                                                requigreen={data.recibe_tratamientos === 'Sí'}
                                            />
                                            <InputError message={errors.frecuencia} className="mt-2" />
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="quien_administra" value="¿Quién lo administra?" className="text-gray-700 font-semibold flex items-center gap-1">
                                            ¿Quién lo administra? <span className="text-green-500">*</span>
                                            <span className="text-green-600 text-xs">🔴</span>
                                        </InputLabel>
                                        <TextInput
                                            id="quien_administra"
                                            type="text"
                                            className="mt-2 block w-full rounded-xl"
                                            value={data.quien_administra}
                                            onChange={(e) => setData('quien_administra', e.target.value)}
                                            placeholder="Ej. Enfermera, padre"
                                            requigreen={data.recibe_tratamientos === 'Sí'}
                                        />
                                        <InputError message={errors.quien_administra} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="observaciones" value="Observaciones" className="text-gray-700 font-semibold flex items-center gap-1">
                                            Observaciones
                                            <span className="text-green-600 text-xs">🔴</span>
                                            <span className="text-xs text-gray-500">(Este campo solo lo verá la agencia para apoyar mejor al alumno)</span>
                                        </InputLabel>
                                        <textarea
                                            id="observaciones"
                                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                            rows="3"
                                            value={data.observaciones}
                                            onChange={(e) => setData('observaciones', e.target.value)}
                                            placeholder="Ej. Se agita al correr"
                                        />
                                        <InputError message={errors.observaciones} className="mt-2" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section 2: Enfermedades preexistentes */}
                {currentSection === 2 && (
                    <div className={`${sections[2].bgColor} p-6 rounded-2xl border-2 ${sections[2].borderColor}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{sections[2].icon}</span>
                            <h4 className="text-lg font-semibold text-gray-900">{sections[2].title}</h4>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="detalle_enfermedad" value="Detalle de la enfermedad" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Detalle de la enfermedad <span className="text-green-500">*</span>
                                    <span className="text-green-600 text-xs">🟢</span>
                                </InputLabel>
                                <TextInput
                                    id="detalle_enfermedad"
                                    type="text"
                                    className="mt-2 block w-full rounded-xl"
                                    value={data.detalle_enfermedad}
                                    onChange={(e) => setData('detalle_enfermedad', e.target.value)}
                                    placeholder="Ej. Epilepsia"
                                />
                                <InputError message={errors.detalle_enfermedad} className="mt-2" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="medicamento_enfermedad" value="Medicamento" className="text-gray-700 font-semibold flex items-center gap-1">
                                        Medicamento <span className="text-green-500">*</span>
                                        <span className="text-green-600 text-xs">🟢</span>
                                    </InputLabel>
                                    <TextInput
                                        id="medicamento_enfermedad"
                                        type="text"
                                        className="mt-2 block w-full rounded-xl"
                                        value={data.medicamento_enfermedad}
                                        onChange={(e) => setData('medicamento_enfermedad', e.target.value)}
                                        placeholder="Ej. Ácido valproico"
                                    />
                                    <InputError message={errors.medicamento_enfermedad} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="frecuencia_enfermedad" value="Frecuencia" className="text-gray-700 font-semibold flex items-center gap-1">
                                        Frecuencia <span className="text-green-500">*</span>
                                        <span className="text-green-600 text-xs">🟢</span>
                                    </InputLabel>
                                    <TextInput
                                        id="frecuencia_enfermedad"
                                        type="text"
                                        className="mt-2 block w-full rounded-xl"
                                        value={data.frecuencia_enfermedad}
                                        onChange={(e) => setData('frecuencia_enfermedad', e.target.value)}
                                        placeholder="Ej. 1 vez al día"
                                    />
                                    <InputError message={errors.frecuencia_enfermedad} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="quien_administra_enfermedad" value="¿Quién lo administra?" className="text-gray-700 font-semibold flex items-center gap-1">
                                    ¿Quién lo administra? <span className="text-green-500">*</span>
                                    <span className="text-green-600 text-xs">🔴</span>
                                </InputLabel>
                                <TextInput
                                    id="quien_administra_enfermedad"
                                    type="text"
                                    className="mt-2 block w-full rounded-xl"
                                    value={data.quien_administra_enfermedad}
                                    onChange={(e) => setData('quien_administra_enfermedad', e.target.value)}
                                    placeholder="Ej. Mamá, doctor"
                                />
                                <InputError message={errors.quien_administra_enfermedad} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="observaciones_enfermedad" value="Observaciones" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Observaciones
                                    <span className="text-green-600 text-xs">🔴</span>
                                </InputLabel>
                                <textarea
                                    id="observaciones_enfermedad"
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    rows="3"
                                    value={data.observaciones_enfermedad}
                                    onChange={(e) => setData('observaciones_enfermedad', e.target.value)}
                                    placeholder="Ej. Crisis controladas con medicación"
                                />
                                <InputError message={errors.observaciones_enfermedad} className="mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Section 3: Alergias */}
                {currentSection === 3 && (
                    <div className={`${sections[3].bgColor} p-6 rounded-2xl border-2 ${sections[3].borderColor}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{sections[3].icon}</span>
                            <h4 className="text-lg font-semibold text-gray-900">{sections[3].title}</h4>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="detalle_alergia" value="Detalle de la alergia" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Detalle de la alergia <span className="text-green-500">*</span>
                                    <span className="text-green-600 text-xs">🟢</span>
                                </InputLabel>
                                <TextInput
                                    id="detalle_alergia"
                                    type="text"
                                    className="mt-2 block w-full rounded-xl"
                                    value={data.detalle_alergia}
                                    onChange={(e) => setData('detalle_alergia', e.target.value)}
                                    placeholder="Ej. Penicilina"
                                />
                                <InputError message={errors.detalle_alergia} className="mt-2" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="medicamento_control" value="Medicamento de control" className="text-gray-700 font-semibold flex items-center gap-1">
                                        Medicamento de control <span className="text-green-500">*</span>
                                        <span className="text-green-600 text-xs">🟢</span>
                                    </InputLabel>
                                    <TextInput
                                        id="medicamento_control"
                                        type="text"
                                        className="mt-2 block w-full rounded-xl"
                                        value={data.medicamento_control}
                                        onChange={(e) => setData('medicamento_control', e.target.value)}
                                        placeholder="Ej. Loratadina"
                                    />
                                    <InputError message={errors.medicamento_control} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="frecuencia_alergia" value="Frecuencia" className="text-gray-700 font-semibold flex items-center gap-1">
                                        Frecuencia <span className="text-green-500">*</span>
                                        <span className="text-green-600 text-xs">🟢</span>
                                    </InputLabel>
                                    <TextInput
                                        id="frecuencia_alergia"
                                        type="text"
                                        className="mt-2 block w-full rounded-xl"
                                        value={data.frecuencia_alergia}
                                        onChange={(e) => setData('frecuencia_alergia', e.target.value)}
                                        placeholder="Ej. Cada 12 horas"
                                    />
                                    <InputError message={errors.frecuencia_alergia} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="quien_administra_alergia" value="¿Quién lo administra?" className="text-gray-700 font-semibold flex items-center gap-1">
                                    ¿Quién lo administra? <span className="text-green-500">*</span>
                                    <span className="text-green-600 text-xs">🔴</span>
                                </InputLabel>
                                <TextInput
                                    id="quien_administra_alergia"
                                    type="text"
                                    className="mt-2 block w-full rounded-xl"
                                    value={data.quien_administra_alergia}
                                    onChange={(e) => setData('quien_administra_alergia', e.target.value)}
                                    placeholder=""
                                />
                                <InputError message={errors.quien_administra_alergia} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="observaciones_alergia" value="Observaciones" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Observaciones
                                    <span className="text-green-600 text-xs">🔴</span>
                                    <span className="text-xs text-gray-500">(Solo visible en el portal para padres y agencia)</span>
                                </InputLabel>
                                <textarea
                                    id="observaciones_alergia"
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    rows="3"
                                    value={data.observaciones_alergia}
                                    onChange={(e) => setData('observaciones_alergia', e.target.value)}
                                    placeholder="Ej. Reacción con ronchas leves"
                                />
                                <InputError message={errors.observaciones_alergia} className="mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Section 4: Vacunas */}
                {currentSection === 4 && (
                    <div className={`${sections[4].bgColor} p-6 rounded-2xl border-2 ${sections[4].borderColor}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{sections[4].icon}</span>
                            <h4 className="text-lg font-semibold text-gray-900">{sections[4].title}</h4>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Vacunas recibidas" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Vacunas recibidas <span className="text-green-500">*</span>
                                </InputLabel>
                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['Tétano', 'Rubeola', 'Hepatitis B', 'Fiebre amarilla', 'Gripe', 'Tuberculosis', 'Sarampión', 'COVID-19'].map((vacuna) => (
                                        <label key={vacuna} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={data.vacunas_checklist.includes(vacuna)}
                                                onChange={(e) => handleVacunaChange(vacuna, e.target.checked)}
                                                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-700">{vacuna}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.vacunas_checklist} className="mt-2" />
                            </div>

                            {/* COVID-19 conditional fields */}
                            {data.vacunas_checklist.includes('COVID-19') && (
                                <div className="bg-white p-4 rounded-xl border border-green-200 space-y-4 animate-fadeIn">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="dosis_covid" value="Dosis recibidas" className="text-gray-700 font-semibold flex items-center gap-1">
                                                Dosis recibidas <span className="text-green-500">*</span>
                                                <span className="text-green-600 text-xs">🟢</span>
                                            </InputLabel>
                                            <TextInput
                                                id="dosis_covid"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl"
                                                value={data.dosis_covid}
                                                onChange={(e) => setData('dosis_covid', e.target.value)}
                                                placeholder="Ej. 2 dosis"
                                                requigreen={data.vacunas_checklist.includes('COVID-19')}
                                            />
                                            <InputError message={errors.dosis_covid} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="efectos_covid" value="Efectos secundarios" className="text-gray-700 font-semibold flex items-center gap-1">
                                                Efectos secundarios
                                                <span className="text-green-600 text-xs">🔴</span>
                                            </InputLabel>
                                            <TextInput
                                                id="efectos_covid"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl"
                                                value={data.efectos_covid}
                                                onChange={(e) => setData('efectos_covid', e.target.value)}
                                                placeholder="Ej. Dolor en brazo"
                                            />
                                            <InputError message={errors.efectos_covid} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section 5: Seguro médico */}
                {currentSection === 5 && (
                    <div className={`${sections[5].bgColor} p-6 rounded-2xl border-2 ${sections[5].borderColor}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{sections[5].icon}</span>
                            <h4 className="text-lg font-semibold text-gray-900">{sections[5].title}</h4>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Seguro de la agencia" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Seguro de la agencia
                                    <span className="text-xs text-gray-500">(Seguro ya incluido en el viaje, no editable por los padres)</span>
                                </InputLabel>
                                <TextInput
                                    type="text"
                                    className="mt-2 block w-full rounded-xl bg-gray-100"
                                    value="Medix Travel"
                                    disabled
                                />
                            </div>

                            <div>
                                <InputLabel value="¿Tiene seguro particular?" className="text-gray-700 font-semibold flex items-center gap-1">
                                    ¿Tiene seguro particular? <span className="text-green-500">*</span>
                                </InputLabel>
                                <div className="mt-3 space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tiene_seguro_particular"
                                            value="Sí"
                                            checked={data.tiene_seguro_particular === 'Sí'}
                                            onChange={(e) => setData('tiene_seguro_particular', e.target.value)}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="ml-3 text-gray-700">Sí</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tiene_seguro_particular"
                                            value="No"
                                            checked={data.tiene_seguro_particular === 'No'}
                                            onChange={(e) => setData('tiene_seguro_particular', e.target.value)}
                                            className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="ml-3 text-gray-700">No</span>
                                    </label>
                                </div>
                                <InputError message={errors.tiene_seguro_particular} className="mt-2" />
                            </div>

                            {/* Conditional fields for private insurance */}
                            {data.tiene_seguro_particular === 'Sí' && (
                                <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-4 animate-fadeIn">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="nombre_seguro" value="Nombre del seguro" className="text-gray-700 font-semibold flex items-center gap-1">
                                                Nombre del seguro <span className="text-green-500">*</span>
                                                <span className="text-green-600 text-xs">🔴</span>
                                            </InputLabel>
                                            <TextInput
                                                id="nombre_seguro"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl"
                                                value={data.nombre_seguro}
                                                onChange={(e) => setData('nombre_seguro', e.target.value)}
                                                placeholder="Ej. Rimac Plan Familiar"
                                                requigreen={data.tiene_seguro_particular === 'Sí'}
                                            />
                                            <InputError message={errors.nombre_seguro} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="administradora" value="Administradora" className="text-gray-700 font-semibold flex items-center gap-1">
                                                Administradora <span className="text-green-500">*</span>
                                                <span className="text-green-600 text-xs">🔴</span>
                                            </InputLabel>
                                            <TextInput
                                                id="administradora"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl"
                                                value={data.administradora}
                                                onChange={(e) => setData('administradora', e.target.value)}
                                                placeholder="Ej. Rimac, Pacífico"
                                                requigreen={data.tiene_seguro_particular === 'Sí'}
                                            />
                                            <InputError message={errors.administradora} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="numero_poliza" value="Nº de póliza" className="text-gray-700 font-semibold flex items-center gap-1">
                                                Nº de póliza <span className="text-green-500">*</span>
                                                <span className="text-green-600 text-xs">🔴</span>
                                            </InputLabel>
                                            <TextInput
                                                id="numero_poliza"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl"
                                                value={data.numero_poliza}
                                                onChange={(e) => setData('numero_poliza', e.target.value)}
                                                placeholder="Ej. 123456789"
                                                requigreen={data.tiene_seguro_particular === 'Sí'}
                                            />
                                            <InputError message={errors.numero_poliza} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="telefono_contacto" value="Teléfono de contacto" className="text-gray-700 font-semibold flex items-center gap-1">
                                                Teléfono de contacto <span className="text-green-500">*</span>
                                                <span className="text-green-600 text-xs">🔴</span>
                                            </InputLabel>
                                            <TextInput
                                                id="telefono_contacto"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl"
                                                value={data.telefono_contacto}
                                                onChange={(e) => setData('telefono_contacto', e.target.value)}
                                                placeholder="Ej. 01 411 1111"
                                                requigreen={data.tiene_seguro_particular === 'Sí'}
                                            />
                                            <InputError message={errors.telefono_contacto} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section 6: Información adicional */}
                {currentSection === 6 && (
                    <div className={`${sections[6].bgColor} p-6 rounded-2xl border-2 ${sections[6].borderColor}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{sections[6].icon}</span>
                            <h4 className="text-lg font-semibold text-gray-900">{sections[6].title}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Opcional</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="informacion_adicional" value="Campo libre" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Campo libre
                                    <span className="text-green-600 text-xs">🔴</span>
                                </InputLabel>
                                <textarea
                                    id="informacion_adicional"
                                    className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    rows="4"
                                    value={data.informacion_adicional}
                                    onChange={(e) => setData('informacion_adicional', e.target.value)}
                                    placeholder="Ej. Usa inhalador en las mañanas, antecedentes familiares de asma"
                                />
                                <InputError message={errors.informacion_adicional} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="archivo_adjunto" value="Subir archivo" className="text-gray-700 font-semibold flex items-center gap-1">
                                    Subir archivo
                                    <span className="text-green-600 text-xs">🔴</span>
                                    <span className="text-xs text-gray-500">(Puedes adjuntar historial médico o receta en PDF, JPG o PNG)</span>
                                </InputLabel>
                                <input
                                    id="archivo_adjunto"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="mt-2 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-xl file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-emerald-50 file:text-emerald-700
                                        hover:file:bg-emerald-100"
                                    onChange={(e) => setData('archivo_adjunto', e.target.files[0])}
                                />
                                <p className="mt-1 text-xs text-gray-500">Tipos de archivo permitidos: PDF, JPG, PNG</p>
                                <InputError message={errors.archivo_adjunto} className="mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                        disabled={currentSection === 0}
                        className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                            currentSection === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        ← Anterior
                    </button>

                    <div className="flex gap-3">
                        {currentSection < sections.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all duration-200"
                            >
                                Siguiente →
                            </button>
                        ) : (
                            <PrimaryButton
                                disabled={processing}
                                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Guardando...
                                    </div>
                                 ) : (
                                     <div className="flex items-center gap-2">
                                         <CheckIcon className="w-4 h-4" />
                                         Guardar Ficha de Salud
                                     </div>
                                 )}
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}