import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Login() {
  const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

  const [showPassword, setShowPassword] = useState(false);

  const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">¡Bienvenido/a a tu próxima aventura!</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-10">
            <form onSubmit={submit}>
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <img src="/imgs/logo-viajesroxana.png" alt="Viajes Roxana" className="h-12 w-auto" />
              </div>

              <div className="text-center text-2xl font-semibold text-gray-800 mb-8">Inicia Sesión</div>

              {/* Usuario */}
              <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="Usuario"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
                {errors.username && <div className="text-sm text-red-600 mt-1">{errors.username}</div>}
              </div>

              {/* Contraseña */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                      <path
                        fillRule="evenodd"
                        d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Contraseña"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <div className="text-sm text-red-600 mt-1">{errors.password}</div>}
              </div>

              {/* Recordar */}
              <div className="flex items-center mb-6">
                <input
                  id="remember_me"
                  type="checkbox"
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                />
                <label htmlFor="remember_me" className="ml-2 text-sm text-red-600 cursor-pointer">
                  Recordar
                </label>
              </div>

              {/* Submit */}
              <div className="mb-6">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 text-white font-medium rounded-lg text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ingresando...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </div>

             

              <div className="border-t border-gray-200 pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿Olvidaste tu contraseña?{' '}
                    <a className="text-red-600 hover:text-red-700 font-medium hover:underline transition-colors duration-200" href="/forgot-password">
                      Recupera el acceso
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer / Políticas */}
        <div className="mt-8 text-center px-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Protegido por reCAPTCHA, se aplica a las{' '}
            <a
              target="_blank"
              href="https://viajesroxana.com/avisos-legales/politica-de-privacidad-y-seguridad/"
              className="text-gray-700 underline hover:text-red-600 transition-colors duration-200"
              rel="noreferrer"
            >
              Políticas de Privacidad
            </a>{' '}
            y a los{' '}
            <a
              target="_blank"
              href="https://viajesroxana.com/avisos-legales/terminos-y-condiciones-intranet/"
              className="text-gray-700 underline hover:text-red-600 transition-colors duration-200"
              rel="noreferrer"
            >
              Términos y Condiciones
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
