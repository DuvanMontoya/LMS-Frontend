import { get } from 'svelte/store';
import { sessionStore } from '$lib/stores/sessionStore';

// const API_URL = 'https://backend.laila.icu/api/';
const API_URL = "http://localhost:8000/api/";


async function fetchWithAuth(endpoint, options = {}) {
    const token = get(sessionStore).access;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Ocurrió un error en la solicitud');
    }
    return response.json();
}

export const fetchCalendarios = () => fetchWithAuth('calendarios/');
export const createCalendario = (data) => fetchWithAuth('calendarios/', { method: 'POST', body: JSON.stringify(data) });
export const updateCalendario = (id, data) => fetchWithAuth(`calendarios/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCalendario = (id) => fetchWithAuth(`calendarios/${id}/`, { method: 'DELETE' });
export const asignarPermisoCalendario = (id, data) => fetchWithAuth(`calendarios/${id}/asignar_permiso/`, { method: 'POST', body: JSON.stringify(data) });
export const transferirPropiedadCalendario = (id, data) => fetchWithAuth(`calendarios/${id}/transferir_propiedad/`, { method: 'POST', body: JSON.stringify(data) });

export const fetchEventos = () => fetchWithAuth('eventos/');
// export const createEvento = (data) => fetchWithAuth('eventos/', { method: 'POST', body: JSON.stringify(data) });
// export const updateEvento = (id, data) => fetchWithAuth(`eventos/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
// export const deleteEvento = (id) => fetchWithAuth(`eventos/${id}/`, { method: 'DELETE' });
export const asignarPermisoEvento = (id, data) => fetchWithAuth(`eventos/${id}/asignar_permiso/`, { method: 'POST', body: JSON.stringify(data) });
export const transferirPropiedadEvento = (id, data) => fetchWithAuth(`eventos/${id}/transferir_propiedad/`, { method: 'POST', body: JSON.stringify(data) });

export const fetchPermisos = () => fetchWithAuth('permisos/');
export const fetchPermisosEvento = () => fetchWithAuth('permisos-evento/');
export const fetchHistorialEvento = () => fetchWithAuth('historial-evento/');
export const fetchNotificaciones = () => fetchWithAuth('notificaciones/');
export const marcarNotificacionComoLeida = (id) => fetchWithAuth(`notificaciones/${id}/marcar_como_leida/`, { method: 'POST' });

export const fetchRoles = () => fetchWithAuth('roles/');



export async function createEvento(eventoData) {
    try {
        const response = await fetch(`${API_URL}eventos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get(sessionStore).access}`
            },
            body: JSON.stringify(eventoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        return await response.json();
    } catch (error) {
        console.error('Error en createEvento:', error);
        throw error;
    }
}

export async function updateEvento(id, eventoData) {
    try {
        const response = await fetch(`${API_URL}eventos/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get(sessionStore).access}`
            },
            body: JSON.stringify(eventoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        return await response.json();
    } catch (error) {
        console.error('Error en updateEvento:', error);
        throw error;
    }
}

export async function deleteEvento(id) {
    try {
        const response = await fetch(`${API_URL}eventos/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${get(sessionStore).access}`
            }
        });

        if (!response.ok && response.status !== 204) {
            const errorData = await response.text();
            throw new Error(errorData || 'Error al eliminar el evento');
        }

        return response;
    } catch (error) {
        console.error('Error en deleteEvento:', error);
        throw error;
    }
}