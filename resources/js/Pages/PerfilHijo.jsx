import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import FichaSalud from '@/Components/FichaSalud';
import FichaNutricional from '@/Components/FichaNutricional';
import Swal from 'sweetalert2';

export default function PerfilHijo({ hijo, saludFicha, nutricionFicha }) {
    const { flash } = usePage().props;
    const [photoPreview, setPhotoPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('perfil');

    // Persistir y sincronizar pestaña activa con hash y localStorage (deep-linking)
    useEffect(() => {
        try {
            const fromHash = window.location.hash?.replace('#', '');
            const fromStorage = localStorage.getItem('perfilHijoActiveTab');
            const allowed = ['perfil', 'salud', 'nutricion'];
            const initial = allowed.includes(fromHash)
                ? fromHash
                : (allowed.includes(fromStorage) ? fromStorage : 'perfil');
            if (initial !== 'perfil') setActiveTab(initial);
        } catch {}
    }, []);

    useEffect(() => {
        try {
            if (activeTab) {
                window.history.replaceState(null, '', `#${activeTab}`);
                localStorage.setItem('perfilHijoActiveTab', activeTab);
            }
        } catch {}
    }, [activeTab]);

    const { data: perfilData, setData: setPerfilData, post: postPerfil, processing: processingPerfil, errors: erroresPerfil } = useForm({
        nombres: hijo?.nombres || '',
        doc_tipo: hijo?.doc_tipo || '',
        doc_numero: hijo?.doc_numero || '',
        fecha_nacimiento: hijo?.fecha_nacimiento || '',
        foto: hijo?.foto || '',
        informacion_adicional: hijo?.informacion_adicional || '',
        nums_emergencia: Array.isArray(hijo?.nums_emergencia) ? hijo.nums_emergencia : [],
    });

    const profileCompletion = useMemo(() => {
        // Campos del perfil personal
        const perfilFieldsData = {
            'Nombres Completos': perfilData.nombres,
            'Número de Documento': perfilData.doc_numero,
            'Fecha de Nacimiento': perfilData.fecha_nacimiento,
            'Información Adicional': perfilData.informacion_adicional,
        };

        // Números de emergencia (hasta 2)
        const emergencyNumbers = Array.isArray(perfilData.nums_emergencia) ? perfilData.nums_emergencia : [];
        if (emergencyNumbers.length > 0) {
            emergencyNumbers.forEach((num, index) => {
                perfilFieldsData[`Contacto de Emergencia ${index + 1}`] = num;
            });
        }

        // Campos de salud (nuevos campos según la migración)
        const saludFieldsData = saludFicha ? {
            'Grupo Sanguíneo': saludFicha.grupo_sanguineo,
            'Factor RH': saludFicha.factor_rh,
            'Información Médica Adicional': saludFicha.informacion_adicional,
        } : {};

        // Campos nutricionales (nuevos campos según la migración)
        const nutricionFieldsData = nutricionFicha ? {
            'Alimentos que causan alergia': nutricionFicha.alimento_alergia,
            'Reacciones alérgicas': nutricionFicha.reaccion_alergia,
            'Alimentos que debe evitar': nutricionFicha.alimento_evitar,
            'Tipo de dieta especial': nutricionFicha.especificar_dieta,
            'Preferencias alimentarias detalladas': nutricionFicha.detalle_preferencia_alimentaria,
        } : {};

        // Combinar todos los campos
        const allFieldsData = { ...perfilFieldsData, ...saludFieldsData, ...nutricionFieldsData };
        
        // Calcular campos completados
        const totalFields = Object.keys(allFieldsData).length;
        const filledFields = Object.values(allFieldsData).filter(field => field && String(field).trim() !== '').length;
        
        return {
            percentage: totalFields > 0 ? (filledFields / totalFields) * 100 : 0,
            totalFields,
            filledFields,
            missingFields: Object.entries(allFieldsData)
                .filter(([key, value]) => !value || String(value).trim() === '')
                .map(([key]) => key)
        };
    }, [perfilData, saludFicha, nutricionFicha]);

    // NUEVO: Porcentaje de avance por sección (perfil, salud, nutrición)
    const sectionCompletion = useMemo(() => {
        const isFilled = (v) => v !== null && v !== undefined && String(v).trim() !== '';
        const getPct = (fields) => {
            const total = fields.length;
            const filled = fields.filter(isFilled).length;
            return total > 0 ? Math.round((filled / total) * 100) : 0;
        };

        // Perfil: nombres, doc_numero, fecha_nacimiento, informacion_adicional y hasta 2 contactos
        const perfilPct = getPct([
            perfilData?.nombres ?? '',
            perfilData?.doc_numero ?? '',
            perfilData?.fecha_nacimiento ?? '',
            perfilData?.informacion_adicional ?? '',
            Array.isArray(perfilData?.nums_emergencia) ? (perfilData.nums_emergencia[0] ?? '') : '',
            Array.isArray(perfilData?.nums_emergencia) ? (perfilData.nums_emergencia[1] ?? '') : ''
        ]);

        // Salud: grupo_sanguineo, factor_rh, informacion_adicional (nuevos campos)
        const saludPct = getPct([
            saludFicha?.grupo_sanguineo ?? '',
            saludFicha?.factor_rh ?? '',
            saludFicha?.informacion_adicional ?? ''
        ]);

        // Nutrición: nuevos campos según la migración
        const nutricionPct = getPct([
            nutricionFicha?.alimento_alergia ?? '',
            nutricionFicha?.reaccion_alergia ?? '',
            nutricionFicha?.alimento_evitar ?? '',
            nutricionFicha?.especificar_dieta ?? '',
            nutricionFicha?.detalle_preferencia_alimentaria ?? ''
        ]);

        return { perfil: perfilPct, salud: saludPct, nutricion: nutricionPct };
    }, [perfilData, saludFicha, nutricionFicha]);

    const [showMissingFields, setShowMissingFields] = useState(false);

    const handlePerfilSubmit = (e) => {
        e.preventDefault();
        postPerfil(route('perfil.hijo.update', hijo.doc_numero), {
            transform: (data) => {
                const { doc_tipo, ...updateData } = data;
                return updateData;
            },
            onSuccess: (response) => {
                console.log('OnSuccess called:', response);
                
                // Mostrar SweetAlert de confirmación siempre
                Swal.fire({
                    title: '¡Perfil Guardado!',
                    text: 'La información del perfil ha sido guardada correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    confirmButtonColor: '#dc2626',
                    timer: 3000,
                    timerProgressBar: true,
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                });

                // Actualizar los datos del formulario con los datos actualizados
                if (response?.props?.flash?.hijo) {
                    const hijoActualizado = response.props.flash.hijo;
                    console.log('Hijo actualizado desde flash:', hijoActualizado);
                    setPerfilData(prevData => ({
                        ...prevData,
                        nombres: hijoActualizado.nombres || prevData.nombres,
                        doc_tipo: hijoActualizado.doc_tipo || prevData.doc_tipo,
                        doc_numero: hijoActualizado.doc_numero || prevData.doc_numero,
                        fecha_nacimiento: hijoActualizado.fecha_nacimiento || prevData.fecha_nacimiento,
                        foto: hijoActualizado.foto || prevData.foto,
                        informacion_adicional: hijoActualizado.informacion_adicional || prevData.informacion_adicional,
                        nums_emergencia: Array.isArray(hijoActualizado.nums_emergencia) ? 
                            hijoActualizado.nums_emergencia : 
                            prevData.nums_emergencia
                    }));
                }
            },
            onError: (errors) => {
                console.log('OnError called:', errors);
                
                // Mapear nombres de campos a etiquetas legibles
                const fieldLabels = {
                    nombres: 'Nombres Completos',
                    doc_numero: 'Número de Documento',
                    fecha_nacimiento: 'Fecha de Nacimiento',
                    informacion_adicional: 'Información Adicional',
                    nums_emergencia: 'Números de Emergencia',
                    foto: 'Foto de Perfil'
                };
                
                // Construir mensaje de error detallado
                let errorMessage = 'Se encontraron los siguientes errores:\n\n';
                let hasErrors = false;
                
                Object.keys(errors).forEach(field => {
                    if (errors[field]) {
                        hasErrors = true;
                        // Manejar errores de arrays (ej: nums_emergencia.0, nums_emergencia.1)
                        const baseField = field.split('.')[0];
                        const fieldLabel = fieldLabels[baseField] || fieldLabels[field] || field;
                        const errorText = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                        errorMessage += `• ${fieldLabel}: ${errorText}\n`;
                    }
                });
                
                if (!hasErrors) {
                    errorMessage = 'Hubo un problema al guardar la información. Por favor, verifica los datos e inténtalo nuevamente.';
                }
                
                Swal.fire({
                    title: 'Error al Guardar',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#dc2626',
                    customClass: {
                        popup: 'text-left'
                    }
                });
            },
            onFinish: () => {
                console.log('Request finished');
            }
        });
    };

    const addEmergencyNumber = () => {
        if (perfilData.nums_emergencia.length < 2) {
            setPerfilData('nums_emergencia', [...perfilData.nums_emergencia, '']);
        }
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

    const formatAge = (birthDate) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1;
        }
        return age;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Perfil de {hijo?.nombres || 'Mi Hijo'}
                            </h2>
                            <p className="text-gray-600">Gestiona la información personal de forma segura</p>
                        </div>
                    </div>
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </Link>
                </div>
            }
        >
            <Head title={`Perfil - ${hijo?.nombres || 'Mi Hijo'}`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Success Message */}
                    {flash?.message && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-green-800 font-semibold">{flash.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Profile Header Card */}
                    <div className="bg-white rounded-3xl shadow-xl mb-8 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-12 text-white relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="w-full h-full bg-repeat" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                                }}></div>
                            </div>
                            
                            <div className="relative z-10 flex items-center gap-6">
                                {/* Profile Photo */}
                                <div className="relative">
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
                                        {hijo?.foto ? (
                                            <img src={hijo.foto} alt={hijo.nombres} className="w-24 h-24 rounded-full object-cover" />
                                        ) : (
                                            <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                
                                {/* Profile Info */}
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold text-white mb-2">{hijo?.nombres || 'Mi Hijo'}</h3>
                                    <div className="flex flex-wrap gap-4 text-white/90">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                            </svg>
                                            <span>{hijo?.doc_tipo} {hijo?.doc_numero}</span>
                                        </div>
                                        {hijo?.fecha_nacimiento && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{formatAge(hijo.fecha_nacimiento)} años</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V9" />
                                            </svg>
                                            <span>Perfil Activo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                  

                    {/* Main Content Card */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                        {/* Tabs Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Información del Perfil</h3>
                                        <p className="text-gray-600 text-sm">Gestiona toda la información de tu hijo</p>
                                    </div>
                                </div>
                            </div>

                            {/* Accesos rápidos - Desktop */}
                            <div className="hidden md:grid grid-cols-3 gap-3 mb-4">
                                <button onClick={() => setActiveTab('perfil')} className={`group rounded-2xl p-4 text-left border transition-all ${activeTab==='perfil' ? 'border-gray-200 bg-red-500 shadow text-white' : 'border-gray-200 bg-white hover:shadow-sm'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab==='perfil' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                            </div>
                                            <span className={`font-semibold ${activeTab==='perfil' ? 'text-white' : 'text-gray-800'}`}>Perfil Personal</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${sectionCompletion.perfil===100 ? 'bg-green-100 text-green-700' : activeTab==='perfil' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{sectionCompletion.perfil}%</span>
                                    </div>
                                    <p className={`text-xs mt-2 ${activeTab==='perfil' ? 'text-red-100' : 'text-gray-500'}`}>Datos básicos y contactos de emergencia.</p>
                                </button>
                                <button onClick={() => setActiveTab('salud')} className={`group rounded-2xl p-4 text-left border transition-all ${activeTab==='salud' ? 'border-gray-200 bg-green-500 shadow text-white' : 'border-gray-200 bg-white hover:shadow-sm'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab==='salud' ? 'bg-green-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                            </div>
                                            <span className={`font-semibold ${activeTab==='salud' ? 'text-white' : 'text-gray-800'}`}>Ficha de Salud</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${sectionCompletion.salud===100 ? 'bg-green-100 text-green-700' : activeTab==='salud' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{sectionCompletion.salud}%</span>
                                    </div>
                                    <p className={`text-xs mt-2 ${activeTab==='salud' ? 'text-green-100' : 'text-gray-500'}`}>Alergias, medicamentos y observaciones.</p>
                                </button>
                                <button onClick={() => setActiveTab('nutricion')} className={`group rounded-2xl p-4 text-left border transition-all ${activeTab==='nutricion' ? 'border-gray-200 bg-yellow-500 shadow text-white' : 'border-gray-200 bg-white hover:shadow-sm'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab==='nutricion' ? 'bg-yellow-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/></svg>
                                            </div>
                                            <span className={`font-semibold ${activeTab==='nutricion' ? 'text-white' : 'text-gray-800'}`}>Ficha Nutricional</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${sectionCompletion.nutricion===100 ? 'bg-green-100 text-green-700' : activeTab==='nutricion' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{sectionCompletion.nutricion}%</span>
                                    </div>
                                    <p className={`text-xs mt-2 ${activeTab==='nutricion' ? 'text-yellow-100' : 'text-gray-500'}`}>Preferencias, intolerancias y alergias.</p>
                                </button>
                            </div>

                            {/* Accesos rápidos - Mobile */}
                            <div className="md:hidden mb-4">
                                {/* Mobile Tab Navigation */}
                                <div className="flex overflow-x-auto scrollbar-hide gap-2 px-1 pb-2">
                                    <button 
                                        onClick={() => setActiveTab('perfil')} 
                                        className={`flex-shrink-0 min-w-[280px] rounded-2xl p-4 text-left border transition-all touch-manipulation ${
                                            activeTab==='perfil' 
                                                ? 'border-red-300 bg-red-500 shadow-lg text-white' 
                                                : 'border-gray-200 bg-white hover:shadow-md active:scale-95'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    activeTab==='perfil' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                    </svg>
                                                </div>
                                                <span className={`font-bold text-base ${activeTab==='perfil' ? 'text-white' : 'text-gray-800'}`}>
                                                    Perfil Personal
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                                                sectionCompletion.perfil===100 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : activeTab==='perfil' 
                                                        ? 'bg-red-600 text-white' 
                                                        : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {sectionCompletion.perfil}%
                                            </span>
                                        </div>
                                        <p className={`text-sm ${activeTab==='perfil' ? 'text-red-100' : 'text-gray-500'}`}>
                                            Datos básicos y contactos de emergencia
                                        </p>
                                    </button>

                                    <button 
                                        onClick={() => setActiveTab('salud')} 
                                        className={`flex-shrink-0 min-w-[280px] rounded-2xl p-4 text-left border transition-all touch-manipulation ${
                                            activeTab==='salud' 
                                                ? 'border-green-300 bg-green-500 shadow-lg text-white' 
                                                : 'border-gray-200 bg-white hover:shadow-md active:scale-95'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    activeTab==='salud' ? 'bg-green-600 text-white' : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                                    </svg>
                                                </div>
                                                <span className={`font-bold text-base ${activeTab==='salud' ? 'text-white' : 'text-gray-800'}`}>
                                                    Ficha de Salud
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                                                sectionCompletion.salud===100 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : activeTab==='salud' 
                                                        ? 'bg-green-600 text-white' 
                                                        : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {sectionCompletion.salud}%
                                            </span>
                                        </div>
                                        <p className={`text-sm ${activeTab==='salud' ? 'text-green-100' : 'text-gray-500'}`}>
                                            Alergias, medicamentos y observaciones
                                        </p>
                                    </button>

                                    <button 
                                        onClick={() => setActiveTab('nutricion')} 
                                        className={`flex-shrink-0 min-w-[280px] rounded-2xl p-4 text-left border transition-all touch-manipulation ${
                                            activeTab==='nutricion' 
                                                ? 'border-yellow-300 bg-yellow-500 shadow-lg text-white' 
                                                : 'border-gray-200 bg-white hover:shadow-md active:scale-95'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    activeTab==='nutricion' ? 'bg-yellow-600 text-white' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                                                    </svg>
                                                </div>
                                                <span className={`font-bold text-base ${activeTab==='nutricion' ? 'text-white' : 'text-gray-800'}`}>
                                                    Ficha Nutricional
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                                                sectionCompletion.nutricion===100 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : activeTab==='nutricion' 
                                                        ? 'bg-yellow-600 text-white' 
                                                        : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {sectionCompletion.nutricion}%
                                            </span>
                                        </div>
                                        <p className={`text-sm ${activeTab==='nutricion' ? 'text-yellow-100' : 'text-gray-500'}`}>
                                            Preferencias, intolerancias y alergias
                                        </p>
                                    </button>
                                </div>
                            </div>

                          
                        </div>
                        
                        {/* Tab Content */}
                        <div className="p-8">
                             {activeTab === 'perfil' && (
                                 <div className="space-y-6">
                                     {/* Progress indicator */}
                                     <div className="mb-8">
                                         <div className="flex items-center justify-between mb-2">
                                             <span className="text-sm font-medium text-gray-600">Progreso del perfil personal</span>
                                             <span className="text-sm font-bold text-red-600">{Math.round(profileCompletion.percentage)}%</span>
                                         </div>
                                         <div className="w-full bg-gray-200 rounded-full h-2">
                                             <div
                                                 className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                                                 style={{ width: `${profileCompletion.percentage}%` }}
                                             ></div>
                                         </div>
                                     </div>

                                     <form onSubmit={handlePerfilSubmit} className="space-y-8">

                                 {/* Información Básica */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        Datos Básicos
                                    </h4>
                                    
                                    <div className="grid gap-6 md:grid-cols-2 bg-red-50 p-6 rounded-2xl">
                                        <div>
                                            <InputLabel htmlFor="nombres" value="Nombres Completos" className="text-gray-700 font-semibold" />
                                            <TextInput
                                                id="nombres"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                                                value={perfilData.nombres}
                                                onChange={(e) => setPerfilData('nombres', e.target.value)}
                                                required
                                            />
                                            <InputError message={erroresPerfil.nombres} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="fecha_nacimiento" value="Fecha de Nacimiento" className="text-gray-700 font-semibold" />
                                            <TextInput
                                                id="fecha_nacimiento"
                                                type="date"
                                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                                                value={perfilData.fecha_nacimiento}
                                                onChange={(e) => setPerfilData('fecha_nacimiento', e.target.value)}
                                            />
                                            <InputError message={erroresPerfil.fecha_nacimiento} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="doc_tipo" value="Tipo de Documento" className="text-gray-700 font-semibold" />
                                            <TextInput
                                                id="doc_tipo"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm bg-gray-100"
                                                value="DNI"
                                                disabled
                                            />
                                            <InputError message={erroresPerfil.doc_tipo} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="doc_numero" value="Número de Documento" className="text-gray-700 font-semibold" />
                                            <TextInput
                                                id="doc_numero"
                                                type="text"
                                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                                                value={perfilData.doc_numero}
                                                onChange={(e) => setPerfilData('doc_numero', e.target.value)}
                                                required
                                            />
                                            <InputError message={erroresPerfil.doc_numero} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contactos de Emergencia */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        Contactos de Emergencia
                                        <SecondaryButton 
                                            type="button" 
                                            onClick={addEmergencyNumber}
                                            disabled={perfilData.nums_emergencia.length >= 2}
                                            className={`ml-auto text-sm ${
                                                perfilData.nums_emergencia.length >= 2 
                                                    ? 'opacity-50 cursor-not-allowed' 
                                                    : ''
                                            }`}
                                        >
                                            {perfilData.nums_emergencia.length >= 2 
                                                ? 'Máximo 2 números' 
                                                : '+ Agregar Número'
                                            }
                                        </SecondaryButton>
                                    </h4>
                                    
                                    <p className="text-sm text-gray-600 mb-4">
                                        Puedes agregar hasta 2 números de contacto para emergencias.
                                    </p>
                                    
                                    <div className="bg-red-50 p-6 rounded-2xl">
                                        <div className="space-y-4">
                                            {perfilData.nums_emergencia.length === 0 && (
                                                <p className="text-gray-500 text-center py-4 italic">
                                                    No hay números de emergencia registrados. Haz clic en "Agregar Número" para añadir uno.
                                                </p>
                                            )}
                                            
                                            {perfilData.nums_emergencia.map((numero, index) => (
                                                <div key={index} className="flex gap-3 items-start">
                                                    <div className="flex-1">
                                                        <InputLabel value={`Contacto ${index + 1}`} className="text-gray-700 font-medium text-sm" />
                                                        <TextInput
                                                            type="text"
                                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                                                            value={numero}
                                                            onChange={(e) => updateEmergencyNumber(index, e.target.value)}
                                                            placeholder="Número de teléfono"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEmergencyNumber(index)}
                                                        className="mt-7 px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors duration-200"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={erroresPerfil.nums_emergencia} className="mt-3" />
                                    </div>
                                </div>

                                {/* Información Adicional */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        Información Adicional
                                    </h4>
                                    
                                    <div className="bg-red-50 p-6 rounded-2xl border-gray-200">
                                        <InputLabel htmlFor="informacion_adicional" value="Notas Especiales" className="text-gray-700 font-semibold" />
                                        <textarea
                                            id="informacion_adicional"
                                            className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                            rows="4"
                                            value={perfilData.informacion_adicional}
                                            onChange={(e) => setPerfilData('informacion_adicional', e.target.value)}
                                            placeholder="Cualquier información adicional relevante sobre tu hijo..."
                                        />
                                        <InputError message={erroresPerfil.informacion_adicional} className="mt-2" />
                                    </div>
                                </div>


                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-6 border-t border-gray-200">
                                        <PrimaryButton
                                            disabled={processingPerfil}
                                            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                        >
                                            {processingPerfil ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Guardando...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Guardar Perfil
                                                </div>
                                            )}
                                        </PrimaryButton>
                                     </div>
                                     </form>
                                 </div>
                             )}

                            {activeTab === 'salud' && (
                                <FichaSalud
                                    saludFicha={saludFicha}
                                    hijo={hijo}
                                    onSubmitSuccess={(message) => {
                                        Swal.fire({
                                            title: '¡Éxito!',
                                            text: message,
                                            icon: 'success',
                                            confirmButtonText: 'Continuar',
                                            confirmButtonColor: '#dc2626',
                                            timer: 3000,
                                            timerProgressBar: true
                                        });
                                    }}
                                />
                            )}

                            {activeTab === 'nutricion' && (
                                <FichaNutricional
                                    nutricionFicha={nutricionFicha}
                                    hijo={hijo}
                                    onSubmitSuccess={(message) => {
                                        Swal.fire({
                                            title: '¡Éxito!',
                                            text: message,
                                            icon: 'success',
                                            confirmButtonText: 'Continuar',
                                            confirmButtonColor: '#dc2626',
                                            timer: 3000,
                                            timerProgressBar: true
                                        });
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de navegación rápida en móviles */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-2 flex items-center justify-between">
                    <button
                        onClick={() => setActiveTab('perfil')}
                        className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl ${activeTab==='perfil' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        <span className="text-[11px] font-medium">Perfil</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('salud')}
                        className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl ${activeTab==='salud' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        <span className="text-[11px] font-medium">Salud</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('nutricion')}
                        className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl ${activeTab==='nutricion' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/></svg>
                        <span className="text-[11px] font-medium">Nutrición</span>
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}