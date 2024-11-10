import { toasts } from 'svelte-toasts';

export function showToast(message, type = 'success') {
  toasts.add({
    text: message,
    type: type,
    duration: 4000,  // Duración en milisegundos
    dismissible: true, // Si el toast se puede cerrar manualmente
    pauseOnHover: true // Pausar el temporizador al pasar el cursor
  });
}
