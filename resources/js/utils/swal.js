import Swal from 'sweetalert2';

// Configuración base personalizada para el tema de la app
const swalConfig = {
  customClass: {
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors',
    cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-xl font-semibold transition-colors mr-3',
    popup: 'rounded-2xl shadow-2xl',
    title: 'text-gray-800 font-bold',
    content: 'text-gray-600',
    icon: 'border-0'
  },
  buttonsStyling: false,
  focusConfirm: false,
  allowOutsideClick: true,
  allowEscapeKey: true,
};

// Funciones específicas para diferentes tipos de alertas
export const showSuccess = (title, text = '') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: 'Entendido',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: true,
  });
};

export const showError = (title, text = '') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'Cerrar',
    customClass: {
      ...swalConfig.customClass,
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors'
    }
  });
};

export const showWarning = (title, text = '') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonText: 'Entendido',
    customClass: {
      ...swalConfig.customClass,
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors'
    }
  });
};

export const showConfirm = (title, text = '', confirmText = 'Sí, confirmar', cancelText = 'Cancelar') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'question',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
};

export const showDelete = (title = '¿Estás seguro?', text = 'Esta acción no se puede deshacer') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'warning',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      ...swalConfig.customClass,
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors'
    }
  });
};

export const showLoading = (title = 'Procesando...', text = 'Por favor espera un momento') => {
  return Swal.fire({
    ...swalConfig,
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const showToast = (title, type = 'success', position = 'top-end') => {
  const Toast = Swal.mixin({
    toast: true,
    position: position,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'rounded-xl shadow-lg',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon: type,
    title: title
  });
};

// Exportar Swal por defecto también para casos especiales
export default Swal;