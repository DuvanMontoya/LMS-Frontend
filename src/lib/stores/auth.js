import { writable } from "svelte/store";

function createAuthStore() {
  const { subscribe, set, update } = writable({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  return {
    subscribe,
    setAuth: (user, token) => {
      localStorage.setItem("token", token); // Almacenar el token en localStorage para persistencia
      set({ isAuthenticated: true, user, token });
    },
    clearAuth: () => {
      localStorage.removeItem("token");
      set({ isAuthenticated: false, user: null, token: null });
    },
  };
}

export const authStore = createAuthStore();
