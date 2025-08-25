import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';

export default function PerfilHijo({ hijo, saludFicha, nutricionFicha, paquetes }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('perfil');

    const { data: perfilData, setData: setPerfilData, post: postPerfil, processing: processingPerfil, errors: erroresPerfil } = useForm({
        nombres: hijo?.nombres || '',
        doc_tipo: hijo?.doc_tipo || '',
        doc_numero: hijo?.doc_numero || '',
        fecha_nacimiento: hijo?.fecha_nacimiento || '',
        foto: hijo?.foto || '',
        pasatiempos: hijo?.pasatiempos || '',
        deportes: hijo?.deportes || '',
        plato_favorito: hijo?.plato_favorito || '',
        color_favorito: hijo?.color_favorito || '',
        informacion_adicional: hijo?.informacion_adicional || '',
        nums_emergencia: Array.isArray(hijo?.nums_emergencia) ? hijo.nums_emergencia : (hijo?.nums_emergencia ? JSON.parse(hijo.nums_emergencia) : [])
    });

    const { data: saludData, setData: setSaludData, post: postSalud, processing: processingSalud, errors: erroresSalud } = useForm({
        hijo_id: hijo?.id || '',
        package_id: '',
        alergias: saludFicha?.alergias || '',
        medicamentos: saludFicha?.medicamentos || '',
        seguros: saludFicha?.seguros || '',
        emergencia_contacto: saludFicha?.emergencia_contacto || '',
        emergencia_telefono: saludFicha?.emergencia_telefono || '',
        observaciones: saludFicha?.observaciones || ''
    });

    const { data: nutricionData, setData: setNutricionData, post: postNutricion, processing: processingNutricion, errors: erroresNutricion } = useForm({
        hijo_id: hijo?.id || '',
        package_id: '',
        restricciones: nutricionFicha?.restricciones || '',
        preferencias: nutricionFicha?.preferencias || '',
        alergias_alimentarias: nutricionFicha?.alergias_alimentarias || '',
        intolerancias: nutricionFicha?.intolerancias || '',
        otras_notas: nutricionFicha?.otras_notas || ''
    });

    const handlePerfilSubmit = (e) => {
        e.preventDefault();
        postPerfil(route('perfil.hijo.update', hijo.id));
    };

    const handleSaludSubmit = (e) => {
        e.preventDefault();
        postSalud(route('perfil.hijo.salud.store', hijo.id));
    };

    const handleNutricionSubmit = (e) => {
        e.preventDefault();
        postNutricion(route('perfil.hijo.nutricion.store', hijo.id));
    };

    const addEmergencyNumber = () => {
        setPerfilData('nums_emergencia', [...perfilData.nums_emergencia, '']);
    };

    const updateEmergencyNumber = (index, value) => {
        const newNumbers = [...perfilData.nums_emergencia];
        newNumbers[index] = value;
        setPerfilData('nums_emergencia', newNumbers);
    };

    const removeEmergencyNumber = (index) => {
        const newNumbers = perfilData.nums_emergencia.filter((_, i) => i !== index);
        setPerfilData('nums_emergencia', newNumbers);
    };

    const TabButton = ({ tab, label, icon, isActive, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isActive
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 shadow-md'
            }`}
        >
            <div className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {icon}
            </div>
            {label}
        </button>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Perfil de {hijo?.nombres || 'Mi Hijo'}
                        </h2>
                        <p className="text-sm text-gray-600">Gestiona información personal y fichas médicas</p>
                    </div>
                </div>
            }
        >
            <Head title={`Perfil - ${hijo?.nombres || 'Mi Hijo'}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Messages */}
                    {flash?.message && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-green-800 font-medium">{flash.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="mb-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                        <TabButton
                            tab="perfil"
                            label="Información Personal"
                            isActive={activeTab === 'perfil'}
                            onClick={() => setActiveTab('perfil')}
                            icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                        />
                        <TabButton
                            tab="salud"
                            label="Ficha de Salud"
                            isActive={activeTab === 'salud'}
                            onClick={() => setActiveTab('salud')}
                            icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            }
                        />
                        <TabButton
                            tab="nutricion"
                            label="Ficha Nutricional"
                            isActive={activeTab === 'nutricion'}
                            onClick={() => setActiveTab('nutricion')}
                            icon={
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Content */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-3xl">
                        
                        {/* Perfil Tab */}
                        {activeTab === 'perfil' && (
                            <div className="p-8">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Información Personal</h3>
                                    <p className="text-gray-600">Actualiza los datos básicos y contactos de emergencia</p>
                                </div>

                                <form onSubmit={handlePerfilSubmit} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="nombres" value="Nombres Completos" />
                                            <TextInput
                                                id="nombres"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={perfilData.nombres}
                                                onChange={(e) => setPerfilData('nombres', e.target.value)}
                                                required
                                            />
                                            <InputError message={erroresPerfil.nombres} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="fecha_nacimiento" value="Fecha de Nacimiento" />
                                            <TextInput
                                                id="fecha_nacimiento"
                                                type="date"
                                                className="mt-1 block w-full"
                                                value={perfilData.fecha_nacimiento}
                                                onChange={(e) => setPerfilData('fecha_nacimiento', e.target.value)}
                                            />
                                            <InputError message={erroresPerfil.fecha_nacimiento} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="doc_tipo" value="Tipo de Documento" />
                                            <select
                                                id="doc_tipo"
                                                className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                                value={perfilData.doc_tipo}
                                                onChange={(e) => setPerfilData('doc_tipo', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="CC">Cédula de Ciudadanía</option>
                                                <option value="TI">Tarjeta de Identidad</option>
                                                <option value="RC">Registro Civil</option>
                                                <option value="CE">Cédula de Extranjería</option>
                                            </select>
                                            <InputError message={erroresPerfil.doc_tipo} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="doc_numero" value="Número de Documento" />
                                            <TextInput
                                                id="doc_numero"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={perfilData.doc_numero}
                                                onChange={(e) => setPerfilData('doc_numero', e.target.value)}
                                                required
                                            />
                                            <InputError message={erroresPerfil.doc_numero} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="pasatiempos" value="Pasatiempos" />
                                            <TextInput
                                                id="pasatiempos"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={perfilData.pasatiempos}
                                                onChange={(e) => setPerfilData('pasatiempos', e.target.value)}
                                                placeholder="Ej: Leer, jugar videojuegos, dibujar"
                                            />
                                            <InputError message={erroresPerfil.pasatiempos} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="deportes" value="Deportes" />
                                            <TextInput
                                                id="deportes"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={perfilData.deportes}
                                                onChange={(e) => setPerfilData('deportes', e.target.value)}
                                                placeholder="Ej: Fútbol, natación, tenis"
                                            />
                                            <InputError message={erroresPerfil.deportes} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="plato_favorito" value="Plato Favorito" />
                                            <TextInput
                                                id="plato_favorito"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={perfilData.plato_favorito}
                                                onChange={(e) => setPerfilData('plato_favorito', e.target.value)}
                                                placeholder="Ej: Pizza, hamburguesas, pasta"
                                            />
                                            <InputError message={erroresPerfil.plato_favorito} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="color_favorito" value="Color Favorito" />
                                            <TextInput
                                                id="color_favorito"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={perfilData.color_favorito}
                                                onChange={(e) => setPerfilData('color_favorito', e.target.value)}
                                                placeholder="Ej: Azul, rojo, verde"
                                            />
                                            <InputError message={erroresPerfil.color_favorito} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Números de Emergencia */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <InputLabel value="Números de Emergencia" />
                                            <SecondaryButton type="button" onClick={addEmergencyNumber}>
                                                Agregar Número
                                            </SecondaryButton>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {perfilData.nums_emergencia.map((numero, index) => (
                                                <div key={index} className="flex gap-3">
                                                    <TextInput
                                                        type="text"
                                                        className="flex-1"
                                                        value={numero}
                                                        onChange={(e) => updateEmergencyNumber(index, e.target.value)}
                                                        placeholder="Número de teléfono"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEmergencyNumber(index)}
                                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={erroresPerfil.nums_emergencia} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="informacion_adicional" value="Información Adicional" />
                                        <textarea
                                            id="informacion_adicional"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="4"
                                            value={perfilData.informacion_adicional}
                                            onChange={(e) => setPerfilData('informacion_adicional', e.target.value)}
                                            placeholder="Cualquier información adicional relevante..."
                                        />
                                        <InputError message={erroresPerfil.informacion_adicional} className="mt-2" />
                                    </div>

                                    <div className="flex justify-end">
                                        <PrimaryButton disabled={processingPerfil}>
                                            {processingPerfil ? 'Guardando...' : 'Guardar Perfil'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Salud Tab */}
                        {activeTab === 'salud' && (
                            <div className="p-8">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ficha de Salud</h3>
                                    <p className="text-gray-600">Información médica importante para el cuidado durante los viajes</p>
                                </div>

                                <form onSubmit={handleSaludSubmit} className="space-y-6">
                                    {paquetes && paquetes.length > 0 && (
                                        <div>
                                            <InputLabel htmlFor="package_id_salud" value="Paquete (Opcional)" />
                                            <select
                                                id="package_id_salud"
                                                className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                                value={saludData.package_id}
                                                onChange={(e) => setSaludData('package_id', e.target.value)}
                                            >
                                                <option value="">Información general (sin paquete específico)</option>
                                                {paquetes.map(paquete => (
                                                    <option key={paquete.id} value={paquete.id}>
                                                        {paquete.nombre} - {paquete.destino}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={erroresSalud.package_id} className="mt-2" />
                                        </div>
                                    )}

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="seguros" value="Seguros Médicos" />
                                            <TextInput
                                                id="seguros"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={saludData.seguros}
                                                onChange={(e) => setSaludData('seguros', e.target.value)}
                                                placeholder="Ej: EPS Sanitas, Seguro privado"
                                            />
                                            <InputError message={erroresSalud.seguros} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="emergencia_contacto" value="Contacto de Emergencia" />
                                            <TextInput
                                                id="emergencia_contacto"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={saludData.emergencia_contacto}
                                                onChange={(e) => setSaludData('emergencia_contacto', e.target.value)}
                                                placeholder="Nombre completo"
                                            />
                                            <InputError message={erroresSalud.emergencia_contacto} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="emergencia_telefono" value="Teléfono de Emergencia" />
                                            <TextInput
                                                id="emergencia_telefono"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={saludData.emergencia_telefono}
                                                onChange={(e) => setSaludData('emergencia_telefono', e.target.value)}
                                                placeholder="Número de contacto"
                                            />
                                            <InputError message={erroresSalud.emergencia_telefono} className="mt-2" />
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="alergias" value="Alergias" />
                                        <textarea
                                            id="alergias"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="3"
                                            value={saludData.alergias}
                                            onChange={(e) => setSaludData('alergias', e.target.value)}
                                            placeholder="Detalla las alergias conocidas..."
                                        />
                                        <InputError message={erroresSalud.alergias} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="medicamentos" value="Medicamentos" />
                                        <textarea
                                            id="medicamentos"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="3"
                                            value={saludData.medicamentos}
                                            onChange={(e) => setSaludData('medicamentos', e.target.value)}
                                            placeholder="Medicamentos que toma regularmente, dosis, frecuencia..."
                                        />
                                        <InputError message={erroresSalud.medicamentos} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="observaciones_salud" value="Observaciones Médicas" />
                                        <textarea
                                            id="observaciones_salud"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="4"
                                            value={saludData.observaciones}
                                            onChange={(e) => setSaludData('observaciones', e.target.value)}
                                            placeholder="Cualquier otra información médica relevante..."
                                        />
                                        <InputError message={erroresSalud.observaciones} className="mt-2" />
                                    </div>

                                    <div className="flex justify-end">
                                        <PrimaryButton disabled={processingSalud}>
                                            {processingSalud ? 'Guardando...' : 'Guardar Ficha de Salud'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Nutrición Tab */}
                        {activeTab === 'nutricion' && (
                            <div className="p-8">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ficha Nutricional</h3>
                                    <p className="text-gray-600">Preferencias y restricciones alimentarias para una mejor experiencia</p>
                                </div>

                                <form onSubmit={handleNutricionSubmit} className="space-y-6">
                                    {paquetes && paquetes.length > 0 && (
                                        <div>
                                            <InputLabel htmlFor="package_id_nutricion" value="Paquete (Opcional)" />
                                            <select
                                                id="package_id_nutricion"
                                                className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                                value={nutricionData.package_id}
                                                onChange={(e) => setNutricionData('package_id', e.target.value)}
                                            >
                                                <option value="">Información general (sin paquete específico)</option>
                                                {paquetes.map(paquete => (
                                                    <option key={paquete.id} value={paquete.id}>
                                                        {paquete.nombre} - {paquete.destino}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={erroresNutricion.package_id} className="mt-2" />
                                        </div>
                                    )}

                                    <div>
                                        <InputLabel htmlFor="restricciones" value="Restricciones Alimentarias" />
                                        <textarea
                                            id="restricciones"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="3"
                                            value={nutricionData.restricciones}
                                            onChange={(e) => setNutricionData('restricciones', e.target.value)}
                                            placeholder="Ej: Vegetariano, vegano, kosher, halal..."
                                        />
                                        <InputError message={erroresNutricion.restricciones} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="alergias_alimentarias" value="Alergias Alimentarias" />
                                        <textarea
                                            id="alergias_alimentarias"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="3"
                                            value={nutricionData.alergias_alimentarias}
                                            onChange={(e) => setNutricionData('alergias_alimentarias', e.target.value)}
                                            placeholder="Ej: Maní, mariscos, huevos, etc."
                                        />
                                        <InputError message={erroresNutricion.alergias_alimentarias} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="intolerancias" value="Intolerancias" />
                                        <textarea
                                            id="intolerancias"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="3"
                                            value={nutricionData.intolerancias}
                                            onChange={(e) => setNutricionData('intolerancias', e.target.value)}
                                            placeholder="Ej: Lactosa, gluten, fructosa..."
                                        />
                                        <InputError message={erroresNutricion.intolerancias} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="preferencias" value="Preferencias Alimentarias" />
                                        <textarea
                                            id="preferencias"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="3"
                                            value={nutricionData.preferencias}
                                            onChange={(e) => setNutricionData('preferencias', e.target.value)}
                                            placeholder="Ej: Evita comida picante, prefiere comida suave..."
                                        />
                                        <InputError message={erroresNutricion.preferencias} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="otras_notas" value="Otras Notas Nutricionales" />
                                        <textarea
                                            id="otras_notas"
                                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm"
                                            rows="4"
                                            value={nutricionData.otras_notas}
                                            onChange={(e) => setNutricionData('otras_notas', e.target.value)}
                                            placeholder="Cualquier otra información nutricional relevante..."
                                        />
                                        <InputError message={erroresNutricion.otras_notas} className="mt-2" />
                                    </div>

                                    <div className="flex justify-end">
                                        <PrimaryButton disabled={processingNutricion}>
                                            {processingNutricion ? 'Guardando...' : 'Guardar Ficha Nutricional'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}