// sessionStore


export const articles = writable([]);
export const categories = writable([]);
export const areas = writable([]);
export const subjects = writable([]);
export const article = writable(null);
export const relatedArticles = writable([]);
export const error = writable(null);
export const user = writable(null);
export const isAuthenticated = writable(false);
export const loading = writable(false);
export const selectedArticle = writable(null);
export const types = writable([]);
export const selectedCategory = writable(null);
export const selectedArea = writable(null);
export const selectedSubject = writable(null);
export const selectedType = writable(null);
export const searchQuery = writable("");
export const currentPage = writable(1);
export const token = writable(null);
export const likeStore = writable({});
export const universidad = writable(null);

export const currentQuestion = writable(0);




export function updateLike(articleId, userId, isLiked) {
  likeStore.update(likes => {
    likes[articleId] = likes[articleId] || {};
    likes[articleId][userId] = isLiked;
    return likes;
  });
}



export function isArticleLiked(articleId, userId) {
  return likeStore.getValue()[articleId]?.[userId] || false;
}


function createAuthStore() {
  const { subscribe, set } = writable({
    isAuthenticated: false,
    user: null,
    token: null
  });

  return {
    subscribe,
    setAuth: (user, token) => {
      localStorage.setItem('token', token);
      set({ isAuthenticated: true, user, token });
    },
    clearAuth: () => {
      localStorage.removeItem('token');
      set({ isAuthenticated: false, user: null, token: null });
    }
  };
}


export function setSession(session) {
  sessionStore.set(session);
}

export const authStore = createAuthStore();

function sessionStore$login(data) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  localStorage.setItem('user_id', data.user.id); // Almacenar el userId
  sessionStore.update(state => ({
    ...state,
    access: data.access,
    refresh: data.refresh,
    userId: data.user.id, // Agregar el userId al estado
    isAuthenticated: true
  }));
}








// src/lib/stores/sessionStore.js

import { writable } from 'svelte/store';

/// Función para manejar la lectura segura de datos JSON del localStorage
function safelyParseJSON(json) {
  if (!json || json === 'undefined') {
    return {};
  }
  try {
    return JSON.parse(json) || {};
  } catch (e) {
    console.error("Error parsing JSON from localStorage:", e);
    return {};  // Retorna un objeto vacío o el valor por defecto que desees
  }
}

function createSessionStore() {
  const isBrowser = typeof window !== 'undefined';

  // Lee los valores del localStorage y maneja posibles datos no válidos
  const initialState = {
    access: isBrowser ? localStorage.getItem('access_token') : null,
    user: isBrowser ? safelyParseJSON(localStorage.getItem('user')) : null,
    isAuthenticated: isBrowser && localStorage.getItem('access_token') ? true : false,
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    login: (data) => {
      if (isBrowser) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({
          access: data.access,
          user: data.user,
          isAuthenticated: true
        });
      }
    },
    logout: () => {
      if (isBrowser) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        set({
          access: null,
          user: null,
          isAuthenticated: false
        });
      }
    },
    setUser: (user) => {
      if (isBrowser && user) {
        localStorage.setItem('user', JSON.stringify(user));
        update(state => ({ ...state, user }));
      }
    }
  };
}

export const sessionStore = createSessionStore();



async function refreshAccessToken() {
  const refreshToken = sessionStore.getRefreshToken();
  try {
    const response = await fetch(`${API_URL}token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });
    const data = await response.json();
    if (response.ok) {
      sessionStore.setAccessToken(data.access);
      return data.access;
    } else {
      throw new Error('Error al renovar el token de acceso');
    }
  } catch (error) {
    console.error('Error al renovar el token de acceso:', error);
    throw error;
  }
}

async function refreshToken(refreshToken) {
  const response = await fetch('https://backend.laila.icu/api/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return data.access;
}

export async function ensureValidToken() {
  let { access, refresh } = sessionStore.getState();

  if (!access) {
    throw new Error('No access token available');
  }

  try {
    // Intenta usar el token actual
    // Si falla, intentará refrescar el token
    const newAccess = await refreshToken(refresh);
    sessionStore.setState({ access: newAccess });
    return newAccess;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Aquí podrías redirigir al usuario a la página de inicio de sesión
    // window.location.href = '/login';
    throw error;
  }
}
