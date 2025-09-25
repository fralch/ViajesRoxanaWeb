import React, { useMemo, useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import axios from "axios";
import { showSuccess, showError, showWarning, showToast } from "../../utils/swal";
import { formatDateSafe } from "@/utils/dateUtils";

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
  disabled = false,
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
      disabled={disabled}
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

// Helper que define si un hijo está completo con lo mínimo
const isChildComplete = (c) => {
  const nameOk =
    !!c.name?.trim() &&
    c.name.trim().length >= 3 &&
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(c.name.trim());

  const typeOk = !!c.docType && ["DNI", "Pasaporte", "C. E."].includes(c.docType);

  const docOk =
    !!c.docNumber?.trim() &&
    c.docNumber.trim().length >= 8 &&
    c.docNumber.trim().length <= 20;

  return nameOk && typeOk && docOk;
};

const ChildCard = ({ index, child, updateChild, removeChild, canRemove, complete }) => {
  // Se deja por si luego deseas validar fechas u otros campos con la fecha actual
  useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <div className="mb-4 p-4 rounded-xl border border-gray-200 bg-gray-50/60">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Hijo(a)</h3>
        <div className="flex items-center gap-2">
          <span
            className={classNames(
              "text-xs px-2 py-1 rounded-full border",
              complete
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {complete ? "Completo" : "Incompleto"}
          </span>
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
            {child.errors?.docType && (
              <p role="alert" className="text-xs text-red-600 mt-1">{child.errors.docType}</p>
            )}
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

export default function Index({ paquete, grupo, subgrupo, capacidadDisponible, hijosInscritos = [], error, flash }) {
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    parent_dni: "",
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

  const [showUserExistsWarning, setShowUserExistsWarning] = useState(false);
  const [existingUserData, setExistingUserData] = useState(null);
  const [dniValidated, setDniValidated] = useState(false);
  const [dniLoading, setDniLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // New states for child selection and user creation
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showUserCreationForm, setShowUserCreationForm] = useState(false);
  const [userCreationMode, setUserCreationMode] = useState(false);

  // New user creation form data
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: ''
  });

  // Memo: ¿hay al menos un hijo completo?
  const hasAtLeastOneCompleteChild = useMemo(
    () => (data.children || []).some(isChildComplete),
    [data.children]
  );

  // Función para validar DNI - ÚNICA verificación
  const validateDNI = async (dni) => {
    if (!dni?.trim() || dni.trim().length !== 8) {
      setDniValidated(false);
      setShowUserExistsWarning(false);
      setExistingUserData(null);
      return;
    }

    setDniLoading(true);
    try {
      const response = await axios.post('/check-user-exists', {
        dni: dni.trim()
      });

      if (response.data.exists) {
        setExistingUserData(response.data);
        setShowUserExistsWarning(true);
        setDniValidated(true);
        showToast('Usuario encontrado en el sistema', 'info');
      } else {
        setShowUserExistsWarning(false);
        setExistingUserData(null);
        setDniValidated(true);
        showToast('DNI disponible para registro', 'success');
      }
    } catch (error) {
      console.log('Error verificando DNI:', error);
      setShowUserExistsWarning(false);
      setExistingUserData(null);
      setDniValidated(false);
      showError('Error de verificación', 'No se pudo verificar el DNI. Intenta nuevamente.');
    } finally {
      setDniLoading(false);
    }
  };

  // Función para manejar la selección de hijo inscrito
  const handleChildSelection = (childId) => {
    const child = hijosInscritos.find(h => h.id === parseInt(childId));
    setSelectedChildId(childId);
    setSelectedChild(child);

    if (child) {
      // Verificar si el user relacionado es admin (user_id === 1)
      if (child.user_id === 1) {
        // Mostrar formulario para crear nuevo usuario
        setUserCreationMode(true);
        setShowUserCreationForm(true);
        showToast('Este niño necesita un apoderado responsable', 'info');
      } else if (child.user) {
        // Usuario existe y no es admin, cargar sus datos
        setUserCreationMode(false);
        setShowUserCreationForm(false);
        setData({
          ...data,
          parent_name: child.user.name,
          parent_email: child.user.email,
          parent_phone: child.user.phone || "",
          parent_dni: "",
        });
        setDniValidated(true);
        showToast('Datos del apoderado cargados', 'success');
      }
    }
  };

  // Función para usar los datos del usuario existente
  const useExistingUserData = () => {
    if (existingUserData) {
      setData({
        ...data,
        parent_name: existingUserData.user.name,
        parent_email: existingUserData.user.email,
        parent_phone: existingUserData.user.phone,
        parent_dni: existingUserData.user.dni || "",
        children: existingUserData.children.length > 0
          ? existingUserData.children.map(child => ({
              ...child,
              errors: {}
            }))
          : [{
              name: "",
              docType: "DNI",
              docNumber: "",
              errors: {}
            }]
      });
      setShowUserExistsWarning(false);
      setExistingUserData(null);
      setDniValidated(true);
      showToast('Datos cargados correctamente', 'success');
    }
  };

  // Efecto para mostrar mensajes flash y errores al cargar
  useEffect(() => {
    if (flash?.success) {
      showSuccess('¡Éxito!', flash.success);
    }
    if (error) {
      showError('Error', error);
    }
  }, [flash, error]);

  // Efecto para validar DNI cuando cambia - ÚNICA verificación
  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.parent_dni && data.parent_dni.length === 8) {
        validateDNI(data.parent_dni);
      } else if (data.parent_dni && data.parent_dni.length < 8) {
        setDniValidated(false);
        setShowUserExistsWarning(false);
        setExistingUserData(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [data.parent_dni]);

  const addChild = () => {
    setData("children", [
      ...data.children,
      {
        name: "",
        docType: "DNI",
        docNumber: "",
        errors: {},
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
    const localErrors = {};

    // Validación del nombre del tutor
    if (!data.parent_name?.trim()) {
      localErrors.parent_name = "El nombre del tutor es obligatorio.";
      ok = false;
    } else if (data.parent_name.trim().length < 3) {
      localErrors.parent_name = "El nombre del tutor debe tener al menos 3 caracteres.";
      ok = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.parent_name.trim())) {
      localErrors.parent_name = "El nombre del tutor solo puede contener letras y espacios.";
      ok = false;
    }

    // Validación del teléfono peruano (9 dígitos iniciando en 9)
    const cleanPhone = (data.parent_phone || "").replace(/\D/g, "");
    if (!cleanPhone) {
      localErrors.parent_phone = "El celular es obligatorio.";
      ok = false;
    } else if (!/^9\d{8}$/.test(cleanPhone)) {
      localErrors.parent_phone = "El celular debe ser un número peruano válido (9 dígitos empezando en 9).";
      ok = false;
    }

    // Validación del email
    if (!data.parent_email?.trim()) {
      localErrors.parent_email = "El correo electrónico es obligatorio.";
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parent_email.trim())) {
      localErrors.parent_email = "El correo electrónico debe tener un formato válido.";
      ok = false;
    }

    // Validación del DNI
    const cleanDni = (data.parent_dni || "").replace(/\D/g, "");
    if (!cleanDni) {
      localErrors.parent_dni = "El DNI es obligatorio.";
      ok = false;
    } else if (!/^\d{8}$/.test(cleanDni)) {
      localErrors.parent_dni = "El DNI debe tener exactamente 8 dígitos.";
      ok = false;
    }

    // Validación de hijos
    const children = data.children.map((c) => ({ ...c, errors: {} }));
    
    if (data.children.length === 0) {
      localErrors.children = "Debe registrar al menos un hijo.";
      ok = false;
    } else if (data.children.length > 5) {
      localErrors.children = "No puede registrar más de 5 hijos a la vez.";
      ok = false;
    }

    // Verificar que al menos un hijo esté completamente lleno
    let hasCompleteChild = false;
    
    children.forEach((c, index) => {
      const e = {};
      
      // Validar nombre del hijo
      if (!c.name?.trim()) {
        e.name = "El nombre del hijo es obligatorio.";
        ok = false;
      } else if (c.name.trim().length < 3) {
        e.name = "El nombre del hijo debe tener al menos 3 caracteres.";
        ok = false;
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(c.name.trim())) {
        e.name = "El nombre del hijo solo puede contener letras y espacios.";
        ok = false;
      }

      // Validar tipo de documento
      if (!c.docType) {
        e.docType = "El tipo de documento es obligatorio.";
        ok = false;
      } else if (!["DNI", "Pasaporte", "C. E."].includes(c.docType)) {
        e.docType = "El tipo de documento debe ser DNI, Pasaporte o C. E.";
        ok = false;
      }

      // Validar número de documento
      if (!c.docNumber?.trim()) {
        e.docNumber = "El número de documento es obligatorio.";
        ok = false;
      } else if (c.docNumber.trim().length < 8) {
        e.docNumber = "El número de documento debe tener al menos 8 caracteres.";
        ok = false;
      } else if (c.docNumber.trim().length > 20) {
        e.docNumber = "El número de documento no puede tener más de 20 caracteres.";
        ok = false;
      }

      // Verificar si este hijo está completamente lleno
      if (isChildComplete(c) && Object.keys(e).length === 0) {
        hasCompleteChild = true;
      }

      c.errors = e;
    });

    // Validar que al menos un hijo esté completamente lleno
    if (data.children.length > 0 && !hasCompleteChild) {
      localErrors.children = "Debe completar al menos los datos básicos de un hijo (nombre y documento).";
      ok = false;
    }

    // Verificar documentos duplicados
    const documentos = children.map(c => `${c.docType}-${c.docNumber?.trim()}`);
    const documentosUnicos = new Set(documentos);
    if (documentos.length !== documentosUnicos.size) {
      localErrors.children = "No puede registrar hijos con el mismo tipo y número de documento.";
      ok = false;
    }

    setData("children", children);

    if (Object.keys(localErrors).length > 0) {
      console.log("Errores de validación:", localErrors);
    }

    return ok;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

     if (!selectedChildId) {
       showWarning('Niño no seleccionado', 'Selecciona un niño del listado para continuar.');
       return;
     }

    if (!selectedChild) {
      showWarning('Error', 'Error al obtener los datos del niño seleccionado.');
      return;
    }

    // Determinar la URL según si es inscripción específica o formulario general
    const submitUrl = paquete && grupo && subgrupo
      ? `/paquete/${paquete.id}/grupo/${grupo.id}/subgrupo/${subgrupo.id}/form`
      : paquete && grupo
      ? `/paquete/${paquete.id}/grupo/${grupo.id}/form`
      : "/inscripciones";

    // Si el hijo ya tiene apoderado (no es admin), solo necesita confirmación
    if (selectedChild.user_id !== 1) {
      // Solo confirmar el apoderado existente
      const submitData = {
        selected_child_id: selectedChildId,
        confirm_existing_guardian: true,
        assign_guardian: true
      };

      // Enviar confirmación
      post(submitUrl, {
        data: submitData,
        preserveScroll: true,
        onSuccess: () => {
          showSuccess('¡Confirmado!', 'Apoderado confirmado correctamente.');
        },
        onError: () => {
          showError('Error', 'No se pudo confirmar el apoderado.');
        }
      });
      return;
    }

    // Si necesita crear apoderado, validar que esté completo
    if (userCreationMode && !dniValidated) {
      showWarning('DNI no validado', 'Debes completar y validar el DNI del apoderado.');
      return;
    }

    if (selectedChild.user_id === 1 && !userCreationMode) {
      showWarning('Apoderado requerido', 'Este niño necesita que completes los datos del apoderado.');
      return;
    }

    // Preparar datos específicos para asignación de apoderado
    const submitData = {
      ...data,
      selected_child_id: selectedChildId,
      user_creation_mode: userCreationMode,
      assign_guardian: true
    };

    post(submitUrl, {
      data: submitData,
      preserveScroll: true,
      onSuccess: () => {
        // Mostrar alerta de éxito y redirigir al login
        showSuccess(
          '¡Inscripción exitosa!', 
          'Los datos se han guardado correctamente. Recibirás un correo con los detalles.'
        ).then(() => {
          router.visit('/login');
        });
        
        // Resetear formulario
        setData({
          parent_name: "",
          parent_phone: "",
          parent_email: "",
          parent_dni: "",
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
        // Resetear estados de validación
        setDniValidated(false);
        setShowUserExistsWarning(false);
        setExistingUserData(null);
        setConsentChecked(false);
      },
      onError: (errors) => {
        if (errors.capacity) {
          showError('Sin cupos disponibles', errors.capacity);
        } else if (errors.parent_email) {
          showError('Correo electrónico duplicado', errors.parent_email);
        } else if (errors.parent_phone) {
          showError('Teléfono duplicado', errors.parent_phone);
        } else if (errors.children) {
          showError('Error en datos de hijos', errors.children);
        } else if (Object.keys(errors).length > 0) {
          showError('Error en el formulario', 'Por favor revisa los datos ingresados.');
        } else {
          showError('Error inesperado', 'No se pudo procesar la inscripción. Intenta nuevamente.');
        }
      }
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

            {/* Información del paquete, grupo y subgrupo */}
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
                    <div className="space-y-1">
                      <p className="text-sm text-blue-600 font-medium">
                        Grupo: {grupo.nombre}
                      </p>
                      {subgrupo && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                          <p className="text-sm text-green-700 font-semibold">
                            Subgrupo: {subgrupo.nombre}
                          </p>
                        </div>
                      )}
                    </div>
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
                              {(() => {
                                let date;
                                if (paquete.fecha_inicio.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                  const [year, month, day] = paquete.fecha_inicio.split('-');
                                  date = new Date(year, month - 1, day);
                                } else {
                                  date = new Date(paquete.fecha_inicio);
                                }
                                return date.toLocaleDateString('es-PE', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                });
                              })()
                              }
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-blue-600 font-medium">Duración del viaje</p>
                            <p className="text-sm text-blue-800 font-semibold">
                              {(() => {
                                let startDate, endDate;
                                if (paquete.fecha_inicio.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                  const [year, month, day] = paquete.fecha_inicio.split('-');
                                  startDate = new Date(year, month - 1, day);
                                } else {
                                  startDate = new Date(paquete.fecha_inicio);
                                }
                                if (paquete.fecha_fin.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                  const [year, month, day] = paquete.fecha_fin.split('-');
                                  endDate = new Date(year, month - 1, day);
                                } else {
                                  endDate = new Date(paquete.fecha_fin);
                                }
                                return startDate.toLocaleDateString('es-PE', {
                                  day: 'numeric',
                                  month: 'short'
                                }) + ' - ' + endDate.toLocaleDateString('es-PE', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                });
                              })()
                              }
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lista de hijos inscritos para seleccionar */}
            {hijosInscritos && hijosInscritos.length > 0 && (
              <section className="mb-8">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-900 mb-1">
                        Niños Inscritos en este Subgrupo
                      </h3>
                      <p className="text-sm text-green-700 mb-4">
                        Selecciona el niño para asignarle un apoderado responsable
                      </p>
                    </div>
                  </div>

                   <div className="space-y-4">
                     <div>
                       <label htmlFor="child_select" className="block text-sm font-medium text-gray-700 mb-2">
                         Seleccionar niño
                       </label>
                       <select
                         id="child_select"
                         value={selectedChildId || ""}
                         onChange={(e) => handleChildSelection(e.target.value)}
                         className={classNames(
                           inputBase,
                           "bg-white/80 backdrop-blur border-gray-300 focus:ring-green-500 focus:border-green-500"
                         )}
                       >
                         <option value="">-- Seleccionar un niño --</option>
                         {hijosInscritos.map((hijo) => (
                           <option key={hijo.id} value={hijo.id.toString()}>
                             {hijo.nombres} - {hijo.doc_tipo}: {hijo.doc_numero}
                             {hijo.user_id === 1 ? " (Sin apoderado)" : " (✓ Con apoderado)"}
                           </option>
                         ))}
                       </select>
                     </div>
                  </div>

                   {!selectedChildId && (
                     <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                       <p className="text-sm text-yellow-800">
                         ⚠️ Selecciona un niño del listado para continuar con la asignación de apoderado
                       </p>
                     </div>
                   )}
                </div>
              </section>
            )}

            {/* Información del apoderado actual - Solo mostrar cuando el hijo tiene apoderado y NO esté en modo de creación */}
            {selectedChild && selectedChild.user_id !== 1 && !userCreationMode && (
              <section className="mb-8">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Apoderado Confirmado</h3>
                      <p className="text-sm text-green-700">
                        {selectedChild.nombres} ya tiene un apoderado asignado
                      </p>
                    </div>
                  </div>

                  {selectedChild.user && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Apoderado</span>
                          <p className="text-base font-semibold text-gray-900">{selectedChild.user.name}</p>
                        </div>
                        {selectedChild.user.email && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo</span>
                            <p className="text-sm text-gray-700">{selectedChild.user.email}</p>
                          </div>
                        )}
                        {selectedChild.user.phone && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</span>
                            <p className="text-sm text-gray-700">{selectedChild.user.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Este niño ya está correctamente asignado a un apoderado responsable.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Advertencia de usuario existente */}
            {showUserExistsWarning && existingUserData && (
              <section className="mb-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-amber-800 mb-2">
                        ¡Usuario encontrado en el sistema!
                      </h3>
                      <p className="text-xs text-amber-700 mb-3">
                        Ya existe una cuenta con este DNI. Puedes usar los datos guardados.
                      </p>
                      
                      <div className="bg-white/60 rounded-lg p-3 mb-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium text-gray-600">Nombre:</span>
                            <p className="text-gray-800">{existingUserData.user.name}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">DNI:</span>
                            <p className="text-gray-800">{existingUserData.user.dni || "No registrado"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Email:</span>
                            <p className="text-gray-800">{existingUserData.user.email}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Teléfono:</span>
                            <p className="text-gray-800">{existingUserData.user.phone}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-medium text-gray-600">Hijos registrados:</span>
                            <p className="text-gray-800">{existingUserData.children.length}</p>
                          </div>
                        </div>
                        
                        {existingUserData.children.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="font-medium text-gray-600">Hijos:</span>
                            <ul className="mt-1 space-y-1">
                              {existingUserData.children.map((child, index) => (
                                <li key={index} className="text-gray-700">
                                  • {child.name} ({child.docType}: {child.docNumber})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={useExistingUserData}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 focus:ring-2 focus:ring-amber-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Usar datos guardados
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserExistsWarning(false);
                            setExistingUserData(null);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
                        >
                          Continuar sin cambios
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Formulario para crear nuevo usuario cuando es necesario */}
            {userCreationMode && selectedChild && (
              <section className="mb-8">
                <SectionTitle subtitle="Complete los datos del nuevo apoderado responsable">
                  Crear Apoderado para {selectedChild.nombres}
                </SectionTitle>

                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Nuevo Apoderado</h4>
                      <p className="text-sm text-blue-700">
                        {selectedChild.nombres} necesita un apoderado responsable
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <TextField
                      id="new_parent_name"
                      label="Nombre completo del apoderado"
                      value={newUserData.name}
                      onChange={(e) => {
                        setNewUserData({...newUserData, name: e.target.value});
                        setData('parent_name', e.target.value);
                      }}
                      placeholder="Nombre y apellidos del apoderado responsable"
                      required
                    />

                    <TextField
                      id="new_parent_dni"
                      label="DNI del apoderado"
                      value={newUserData.dni}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 8) {
                          setNewUserData({...newUserData, dni: value});
                          setData('parent_dni', value);
                          if (value.length === 8) {
                            setDniValidated(true);
                          } else {
                            setDniValidated(false);
                          }
                        }
                      }}
                      placeholder="12345678"
                      required
                      inputMode="numeric"
                      pattern="^\d{8}$"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        id="new_parent_phone"
                        label="Teléfono del apoderado"
                        value={newUserData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setNewUserData({...newUserData, phone: value});
                          setData('parent_phone', value);
                        }}
                        placeholder="987654321"
                        required
                        inputMode="numeric"
                        pattern="^9\\d{8}$"
                      />

                      <TextField
                        id="new_parent_email"
                        label="Correo electrónico"
                        type="email"
                        value={newUserData.email}
                        onChange={(e) => {
                          setNewUserData({...newUserData, email: e.target.value});
                          setData('parent_email', e.target.value);
                        }}
                        placeholder="correo@ejemplo.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (newUserData.name && newUserData.dni && newUserData.phone && newUserData.email) {
                          if (newUserData.dni.length === 8) {
                            setDniValidated(true);
                            showToast('Datos del apoderado completados correctamente', 'success');
                          } else {
                            showError('DNI incompleto', 'El DNI debe tener 8 dígitos');
                          }
                        } else {
                          showError('Campos incompletos', 'Complete todos los datos del apoderado');
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmar Datos del Apoderado
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserCreationMode(false);
                        setShowUserCreationForm(false);
                        setSelectedChildId(null);
                        setSelectedChild(null);
                        setNewUserData({name: '', email: '', phone: '', dni: ''});
                        setData({
                          ...data,
                          parent_name: '',
                          parent_email: '',
                          parent_phone: '',
                          parent_dni: ''
                        });
                        setDniValidated(false);
                      }}
                      className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </section>
            )}


            {/* Consentimiento y políticas */}
            <section className="mb-6">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  Declaro que los datos proporcionados son verídicos y autorizo su uso exclusivo para la gestión del viaje escolar contratado. <span className="text-gray-500">(Obligatorio)</span>
                </label>
              </div>
            </section>

            {/* CTA */}
            <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-white/80 to-transparent">
              <button
                type="submit"
                disabled={
                  processing ||
                  !selectedChildId ||
                  !consentChecked ||
                  (userCreationMode && !dniValidated) ||
                  (selectedChild && selectedChild.user_id === 1 && !userCreationMode)
                }
                className={classNames(
                  "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold text-white",
                  "bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300",
                  (processing || !selectedChildId || !consentChecked ||
                    (userCreationMode && !dniValidated) ||
                    (selectedChild && selectedChild.user_id === 1 && !userCreationMode)) &&
                    "opacity-70 cursor-not-allowed"
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
                 ) : !selectedChildId ? (
                   <>Selecciona un niño</>
                 ) : !consentChecked ? (
                  <>Acepte los términos para continuar</>
                ) : selectedChild && selectedChild.user_id === 1 && !userCreationMode ? (
                  <>Complete los datos del apoderado</>
                ) : userCreationMode && !dniValidated ? (
                  <>Complete el DNI del apoderado</>
                ) : userCreationMode ? (
                  <>Crear y Asignar Apoderado</>
                ) : (
                  <>Confirmar Apoderado Actual</>
                )}
              </button>

             {/* Términos y Condiciones */}
              <div className="mt-2 text-center px-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al enviar este formulario, aceptas nuestras{' '}
                  <a
                    target="_blank"
                    href="https://viajesroxana.com/pdfs/politica-de-seguridad-datos.pdf"
                    className="text-gray-700 underline hover:text-red-600 transition-colors duration-200"
                    rel="noreferrer"
                  >
                    Políticas de Privacidad
                  </a>{' '}
                  y{' '}
                  <a
                    target="_blank"
                    href="https://viajesroxana.com/pdfs/terminos-condiciones-intranet.pdf"
                    className="text-gray-700 underline hover:text-red-600 transition-colors duration-200"
                    rel="noreferrer"
                  >
                    Términos y Condiciones
                  </a>
                  .
                </p>
              </div>
            </div>
          </form>
        </Card>

        
      </div>
    </div>
  );
}
