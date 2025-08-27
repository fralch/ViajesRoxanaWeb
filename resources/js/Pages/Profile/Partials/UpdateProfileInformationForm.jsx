import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { UserIcon, EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={`${className} bg-white rounded-xl shadow-sm border border-gray-100`}>
            {/* Header moderno */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Información del Perfil
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Actualiza la información de tu cuenta y dirección de correo electrónico.
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulario mejorado */}
            <div className="px-6 py-6">
                <form onSubmit={submit} className="space-y-6">
                    {/* Campo Nombre */}
                    <div className="space-y-2">
                        <InputLabel 
                            htmlFor="name" 
                            value="Nombre completo"
                            className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                        />
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <TextInput
                                id="name"
                                className="pl-10 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                                autoComplete="name"
                                placeholder="Ingresa tu nombre completo"
                            />
                        </div>
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    {/* Campo Email */}
                    <div className="space-y-2">
                        <InputLabel 
                            htmlFor="email" 
                            value="Correo electrónico"
                            className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                        />
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                className="pl-10 mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="tu@correo.com"
                            />
                        </div>
                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {/* Verificación de email mejorada */}
                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-amber-800 mb-2">
                                        Tu dirección de correo electrónico no está verificada.
                                    </p>
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                                    >
                                        Reenviar email de verificación
                                    </Link>
                                </div>
                            </div>
                            
                            {status === 'verification-link-sent' && (
                                <Transition
                                    show={true}
                                    enter="transition-all ease-out duration-300"
                                    enterFrom="opacity-0 transform translate-y-2"
                                    enterTo="opacity-100 transform translate-y-0"
                                >
                                    <div className="mt-3 flex items-center space-x-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
                                        <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                                        <span>Se ha enviado un nuevo enlace de verificación a tu correo.</span>
                                    </div>
                                </Transition>
                            )}
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                            <PrimaryButton 
                                disabled={processing}
                                className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                            >
                                {processing && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <span className={processing ? 'opacity-0' : 'opacity-100'}>
                                    Guardar cambios
                                </span>
                            </PrimaryButton>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition-all ease-out duration-300"
                                enterFrom="opacity-0 transform scale-95"
                                enterTo="opacity-100 transform scale-100"
                                leave="transition-all ease-in duration-200"
                                leaveTo="opacity-0 transform scale-95"
                            >
                                <div className="flex items-center space-x-2 text-sm font-medium text-green-600">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    <span>¡Guardado correctamente!</span>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}
