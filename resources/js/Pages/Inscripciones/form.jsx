import React, { useMemo } from "react";
import { useForm } from "@inertiajs/react";

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

const helperStyles = "text-xs text-gray-500 mt-1";
const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
const inputBase =
  "w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition disabled:opacity-60 disabled:cursor-not-allowed";

const TextField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  describedby,
  autoComplete,
  inputMode,
  pattern,
  max,
  min,
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className={labelStyles}>
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      aria-invalid={!!error}
      aria-describedby={describedby}
      autoComplete={autoComplete}
      inputMode={inputMode}
      pattern={pattern}
      max={max}
      min={min}
      className={classNames(
        inputBase,
        "bg-white/80 backdrop-blur border-gray-300 focus:ring-red-500 focus:border-red-500 placeholder-gray-400",
        error && "border-red-400 focus:ring-red-400 focus:border-red-400"
      )}
    />
    {error ? (
      <p role="alert" className="text-xs text-red-600">
        {error}
      </p>
    ) : (
      describedby && <p id={describedby} className={helperStyles} />
    )}
  </div>
);

const Card = ({ children }) => (
  <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    <div className="px-6 sm:px-8 py-6 sm:py-8">{children}</div>
  </div>
);

const SectionTitle = ({ children, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
      <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
      {children}
    </h2>
    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
  </div>
);

const ChildCard = ({ index, child, updateChild, removeChild, canRemove }) => {
  // Se deja por si luego deseas validar fechas u otros campos con la fecha actual
  useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <div className="mb-4 p-4 rounded-xl border border-gray-200 bg-gray-50/60">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Hijo(a) {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={removeChild}
            className="text-xs font-medium text-red-600 hover:text-red-700 focus:ring-2 focus:ring-red-500 rounded-lg px-2 py-1"
            aria-label={`Eliminar hijo ${index + 1}`}
          >
            Eliminar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          id={`child_name_${index}`}
          label="Nombre completo"
          value={child.name}
          onChange={(e) => updateChild(index, "name", e.target.value)}
          placeholder="Nombre y apellidos"
          required
          error={child.errors?.name}
        />



        {/* Documento: select + número (lado a lado) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelStyles}>Tipo de documento</label>
            <select
              value={child.docType || "DNI"}
              onChange={(e) => updateChild(index, "docType", e.target.value)}
              className={classNames(
                inputBase,
                "bg-white/80 backdrop-blur border-gray-300 focus:ring-red-500 focus:border-red-500"
              )}
            >
              <option>DNI</option>
              <option>Pasaporte</option>
              <option>C. E.</option>
            </select>
          </div>
          <div>
            <TextField
              id={`child_doc_${index}`}
              label="N° de documento"
              value={child.docNumber || ""}
              onChange={(e) => updateChild(index, "docNumber", e.target.value)}
              placeholder="Número"
              required
              error={child.errors?.docNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Index({ paquete, grupo, capacidadDisponible, error, flash }) {
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    children: [
      {
        name: "",
        docType: "DNI",
        docNumber: "",


        hobbies: "",
        sports: "",
        favoriteDish: "",
        favoriteColor: "",
        additionalInfo: "",
        errors: {},
      },
    ],
  });

  const addChild = () => {
    setData("children", [
      ...data.children,
      {
        name: "",
        docType: "DNI",
        docNumber: "",


      },
    ]);
  };

  const removeChild = (index) => {
    const next = data.children.filter((_, i) => i !== index);
    setData("children", next);
  };

  const updateChild = (index, field, value) => {
    const next = [...data.children];
    next[index] = { ...next[index], [field]: value };
    setData("children", next);
  };

  const validateClient = () => {
    let ok = true;

    // Validación simple de teléfono peruano (9 dígitos iniciando en 9)
    const phoneOk = /^9\d{8}$/.test((data.parent_phone || "").replace(/\D/g, ""));
    if (!phoneOk) ok = false;

    // Valida hijos
    const children = data.children.map((c) => ({ ...c, errors: {} }));
    children.forEach((c) => {
      const e = {};
      if (!c.name?.trim()) {
        e.name = "Ingresa el nombre";
        ok = false;
      }
      if (!c.docNumber?.trim()) {
        e.docNumber = "Ingresa el número";
        ok = false;
      }
      c.errors = e;
    });

    setData("children", children);

    return ok;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();
    if (!validateClient()) return;

    // Determinar la URL según si es inscripción específica o formulario general
    const submitUrl = paquete && grupo 
      ? `/paquete/${paquete.id}/grupo/${grupo.id}/form`
      : "/users";

    post(submitUrl, {
      preserveScroll: true,
      onSuccess: () => {
        setData({
          parent_name: "",
          parent_phone: "",
          parent_email: "",
          children: [{ 
            name: "", 
            docType: "DNI", 
            docNumber: "",

            hobbies: "",
            sports: "",
            favoriteDish: "",
            favoriteColor: "",
            additionalInfo: "",
            errors: {} 
          }],
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">

        <Card>
          <form onSubmit={handleSubmit} noValidate>
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/imgs/logo-viajesroxana.png"
                alt="Viajes Roxana"
                className="h-12 w-auto"
                loading="lazy"
              />
            </div>

            {/* Información del paquete y grupo */}
            {paquete && grupo && (
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 mb-1">
                      {paquete.nombre}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                      Grupo: {grupo.nombre}
                    </p>
                  </div>
                </div>
                
                {paquete.fecha_inicio && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        {paquete.fecha_inicio === paquete.fecha_fin ? (
                          <>
                            <p className="text-xs text-blue-600 font-medium">Fecha del viaje (Full Day)</p>
                            <p className="text-sm text-blue-800 font-semibold">
                              {new Date(paquete.fecha_inicio).toLocaleDateString('es-PE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-blue-600 font-medium">Duración del viaje</p>
                            <p className="text-sm text-blue-800 font-semibold">
                              {new Date(paquete.fecha_inicio).toLocaleDateString('es-PE', {
                                day: 'numeric',
                                month: 'short'
                              })} - {new Date(paquete.fecha_fin).toLocaleDateString('es-PE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Lugares disponibles</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{capacidadDisponible}</span>
                </div> */}
              </div>
            )}

            {/* Mostrar mensajes */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {flash?.success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-700">{flash.success}</p>
                </div>
              </div>
            )}
            
            {errors.capacity && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{errors.capacity}</p>
              </div>
            )}

           {/* Datos del padre/madre/tutor */}
            <section className="mb-8">
            <SectionTitle subtitle="Usaremos estos datos para crear tu cuenta.">
                Datos del tutor
            </SectionTitle>

            <div className="grid grid-cols-1 gap-4">
                {/* Nombre ocupa todo el ancho */}
                <TextField
                id="parent_name"
                label="Nombre completo"
                value={data.parent_name}
                onChange={(e) => setData("parent_name", e.target.value)}
                placeholder="Nombre y apellidos"
                required
                autoComplete="name"
                error={errors.parent_name}
                />

                {/* Celular + Correo en la misma fila en PC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                    id="parent_phone"
                    label="Celular"
                    value={data.parent_phone}
                    onChange={(e) =>
                    setData("parent_phone", e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="9XXXXXXXX"
                    required
                    inputMode="numeric"
                    pattern="^9\\d{8}$"
                    autoComplete="tel"
                    describedby="phone_help"
                    error={errors.parent_phone}
                />

                <TextField
                    id="parent_email"
                    label="Correo"
                    type="email"
                    value={data.parent_email}
                    onChange={(e) => setData("parent_email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                    autoComplete="email"
                    error={errors.parent_email}
                />
                </div>
            </div>
            </section>


            {/* Hijos */}
            <section className="mb-8">
              <SectionTitle subtitle="Añade tantos menores como necesites. El número del tutor será usado como contacto de emergencia.">
                Datos de hijo(s)
              </SectionTitle>

              {data.children.map((child, index) => (
                <ChildCard
                  key={index}
                  index={index}
                  child={child}
                  updateChild={updateChild}
                  removeChild={() => removeChild(index)}
                  canRemove={data.children.length > 1}
                />
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addChild}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500"
                >
                  <span aria-hidden>＋</span> Agregar otro hijo(a)
                </button>
              </div>
            </section>

            {/* Consentimiento y políticas */}
            <section className="mb-6">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  Confirmo que los datos ingresados son correctos y autorizo el uso para gestionar los
                  servicios de viaje. <span className="text-gray-500">(Obligatorio)</span>
                </label>
              </div>
            </section>

            {/* CTA */}
            <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-white/80 to-transparent">
              <button
                type="submit"
                disabled={processing}
                className={classNames(
                  "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold text-white",
                  "bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300",
                  processing && "opacity-70 cursor-not-allowed"
                )}
              >
                {processing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando…
                  </>
                ) : (
                  <>Enviar datos</>
                )}
              </button>

              {/* Mensaje legal */}
              <p className="mt-3 text-[11px] leading-tight text-gray-500 text-center">
                Protegemos tu información. Solo la utilizaremos para gestionar tus reservas y comunicarte
                novedades del servicio.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
