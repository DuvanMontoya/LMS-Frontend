// src/lib/utils/toast.js
import { writable } from "svelte/store";

export const toasts = writable([]);

export function createToast(message, type = "info", duration = 3000) {
  const id = Date.now();

  toasts.update((all) => [...all, { id, message, type }]);

  // Eliminar el toast después de la duración especificada
  setTimeout(() => {
    toasts.update((all) => all.filter((toast) => toast.id !== id));
  }, duration);
}
