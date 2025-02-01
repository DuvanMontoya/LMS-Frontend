import { parse } from "cookie";
import { fetchUserInfo } from "$lib/api/api";
import {
  getEvaluacionById,
  obtenerIntento,
} from "$lib/api/evaluaciones/evaluaciones";
import { sessionStore } from "$lib/stores/sessionStore";
import { get } from "svelte/store";

export async function handle({ event, resolve }) {
  const cookies = parse(event.request.headers.get("cookie") || "");
  const accessToken = cookies["access_token"];

  if (accessToken) {
    try {
      const user = await fetchUserInfo(accessToken);
      event.locals.user = user;
    } catch (error) {
      console.error("Failed to fetch user info with token:", error);
      event.locals.user = null;
    }
  }

  // Verificar si el usuario está autenticado
  const session = get(sessionStore);
  const isAuthenticated = !!session?.access;

  if (event.url.pathname.startsWith("/evaluaciones/")) {
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado y la ruta es de evaluación
      return new Response(null, {
        status: 302,
        headers: {
          location: "/evaluaciones",
        },
      });
    }

    // Verificar permisos y condiciones específicas para la ruta de evaluación
    const evaluacionId = event.url.pathname.split("/").pop();
    try {
      const authToken = session.access;
      const evaluacion = await getEvaluacionById(evaluacionId, authToken);
      const intento = await obtenerIntento(evaluacionId, authToken);

      const currentDate = new Date();
      const evaluacionDate = new Date(evaluacion.fecha_limite);

      if (
        currentDate > evaluacionDate ||
        intento.intentos >= evaluacion.max_intentos
      ) {
        // Redirigir si no cumple con las condiciones
        return new Response(null, {
          status: 302,
          headers: {
            location: "/evaluaciones/no-autorizado",
          },
        });
      }
    } catch (err) {
      console.error("Error al verificar evaluación", err);
      return new Response(null, {
        status: 302,
        headers: {
          location: "/evaluaciones/no-autorizado",
        },
      });
    }
  }

  return resolve(event);
}

export function getSession({ locals }) {
  return {
    user: locals.user || null,
    isAuthenticated: !!locals.user,
  };
}
