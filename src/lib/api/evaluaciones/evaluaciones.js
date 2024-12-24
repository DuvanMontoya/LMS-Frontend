// evaluaciones.js
const API_URL = "http://localhost:8000/api/";
const API_BASE_URL = "http://localhost:8000/api/";

/**
 * Fetch data from the API
 * @param {string} endpoint - API endpoint
 * @param {string} access - Access token
 * @param {object} options - Fetch options (method, body)
 * @returns {Promise<object>} - Response data
 */
export async function fetchFromAPI(endpoint, access, options = {}) {
  if (!access) {
    throw new Error("No access token provided");
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${access}`,
  });

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : null,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to fetch data" }));
    throw new Error(`HTTP error! Status: ${response.status}`, {
      cause: errorData,
    });
  }

  return response.json();
}

/**
 * Refresh the access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<object>} - New access token data
 */
export async function refreshToken(refreshToken) {
  const response = await fetch(`${API_URL}token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}

export async function getEvaluacionById(id, token) {
  if (!token) {
    throw new Error("No se proporcionó token de autenticación");
  }

  try {
    const response = await fetch(`${API_URL}evaluaciones/${id}/`, {
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Sesión expirada o inválida. Por favor, inicia sesión nuevamente."
        );
      }
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Error al obtener la evaluación: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getEvaluacionById:", error);
    throw error;
  }
}

export async function getResultadosEvaluacion(evaluacionId, token) {
  try {
    const response = await fetch(
      `${API_URL}evaluaciones/${evaluacionId}/resultados/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return {
          detail: "Los resultados de esta evaluación no están disponibles.",
        };
      }
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Error al obtener resultados de la evaluación"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getResultadosEvaluacion:", error);
    throw error;
  }
}

/**
 * Get all evaluations
 * @param {string} authToken - Access token
 * @returns {Promise<Array>} - List of evaluations
 */
export async function getEvaluaciones(authToken) {
  return fetchFromAPI("evaluaciones/", authToken);
}

/**
 * Start an evaluation
 * @param {number} evaluacionId - Evaluation ID
 * @param {string} authToken - Access token
 * @returns {Promise<object>} - Data of the started evaluation
 */
export async function iniciarEvaluacion(evaluacionId, authToken) {
  try {
    const response = await fetch(`${API_URL}evaluaciones/${evaluacionId}/iniciar/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al iniciar nuevo intento");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al iniciar nuevo intento:", error);
    throw error;
  }
}


export async function enviarEvaluacion(
  evaluacionId,
  intentoId,
  respuestas,
  authToken
) {
  const url = `${API_URL}evaluaciones/${evaluacionId}/enviar/${intentoId}/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`,
      },
      body: JSON.stringify({ respuestas }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, vuelve a iniciar sesión.");
      }
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Error al enviar la evaluación: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error en enviarEvaluacion:", error);
    throw error;
  }
}

export async function obtenerIntento(evaluacionId, token) {
  if (!token) {
    throw new Error("No se proporcionó token de autenticación");
  }

  try {
    const response = await fetch(
      `${API_URL}evaluaciones/${evaluacionId}/intento/`,
      {
        method: "GET",
        headers: {
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Sesión expirada o inválida. Por favor, inicia sesión nuevamente."
        );
      }
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener intento:", error);
    throw error;
  }
}

export async function guardarProgreso(
  intentoId,
  respuestas,
  tiempoRestante,
  authToken
) {
  try {
    const response = await fetch(
      `${API_URL}intentos/${intentoId}/guardar-temporal/`,
      {
        method: "POST",
        headers: {
          Authorization: authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          respuestas: respuestas,
          tiempo_restante: tiempoRestante,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, vuelve a iniciar sesión.");
      }
      const errorData = await response.json();
      throw new Error("Error al guardar respuestas temporales: " + (errorData.detail || response.status));
    }

    return await response.json();
  } catch (error) {
    console.error("Error al guardar respuestas temporales:", error);
    throw error;
  }
}

/**
 * Get question by ID
 * @param {number} id - Question ID
 * @param {string} token - Access token
 * @returns {Promise<object>} - Question data
 */
export async function getPreguntaById(id, token) {
  return fetchFromAPI(`preguntas/${id}/`, token);
}

/**
 * Get all questions
 * @param {string} authToken - Access token
 * @returns {Promise<Array>} - List of questions
 */
export async function getPreguntas(authToken) {
  return fetchFromAPI("preguntas/", authToken);
}

/**
 * Get tag by ID
 * @param {number} id - Tag ID
 * @param {string} token - Access token
 * @returns {Promise<object>} - Tag data
 */
export async function getTagById(id, token) {
  return fetchFromAPI(`tags/${id}/`, token);
}

/**
 * Get all tags
 * @param {string} authToken - Access token
 * @returns {Promise<Array>} - List of tags
 */
export async function getTags(authToken) {
  return fetchFromAPI("tags/", authToken);
}

/**
 * Upload an image
 * @param {File} imageFile - Image file to upload
 * @param {string} authToken - Access token
 * @returns {Promise<object>} - Uploaded image URL
 */
export async function uploadImage(imageFile, authToken) {
  const formData = new FormData();
  formData.append("upload", imageFile);

  const response = await fetch(`${API_URL}upload_image/`, {
    method: "POST",
    headers: {
      Authorization: authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Failed to upload image" }));
    throw new Error(`HTTP error! Status: ${response.status}`, {
      cause: errorData,
    });
  }

  return response.json();
}

export async function getEvaluacionesPendientes(userId, token) {
  try {
    const response = await fetch(
      `${API_BASE_URL}usuarios/${userId}/evaluaciones-pendientes/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Error al obtener evaluaciones pendientes"
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getEvaluacionesPendientes:", error);
    throw error;
  }
}

export async function iniciarNuevoIntento(evaluacionId, token) {
  try {
    const response = await fetch(
      `${API_URL}evaluaciones/${evaluacionId}/iniciar/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al iniciar nuevo intento");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al iniciar nuevo intento:", error);
    throw error;
  }
}

export async function finalizarIntento(
  evaluacionId,
  intentoId,
  respuestas,
  token
) {
  try {
    const response = await fetch(
      `${API_URL}evaluaciones/${evaluacionId}/enviar/${intentoId}/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.startsWith("Bearer ") ? token : `Bearer ${token}`}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          respuestas: respuestas,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Error al enviar la evaluación: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error al finalizar intento:", error);
    throw error;
  }
}

export async function sincronizarTiempo(intentoId, tiempoRestante, authToken) {
  if (!intentoId) {
    console.error("Error: intentoId is undefined");
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}intentos/${intentoId}/guardar-temporal/`, // Asumiendo que 'sincronizar-tiempo' es similar a 'guardar-temporal'
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`,
        },
        body: JSON.stringify({ tiempo_restante: tiempoRestante }),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Intento with id ${intentoId} not found`);
        return null;
      }
      const errorData = await response.json();
      throw new Error(
        errorData.detail ||
          `Error al sincronizar el tiempo: ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      const textResponse = await response.text();
      console.warn("Response is not JSON:", textResponse);
      return null;
    }
  } catch (error) {
    console.error("Error en sincronizarTiempo:", error);
    throw error;
  }
}




export async function reportarPregunta(
  preguntaId,
  intentoId,
  descripcion,
  motivo,
  authToken
) {
  try {
    const response = await fetch(
      `${API_URL}preguntas/${preguntaId}/reportar/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ intento_id: intentoId, descripcion, motivo }),
      }
    );
    createToast("Problema reportado. Gracias por tu feedback.", "success");
  } catch (error) {
    console.error("Error al reportar la pregunta:", error);
    createToast("Error al reportar el problema", "error");
  }
}








const API_BASE = "http://localhost:8000/api/";


// Utilidad para manejar errores de red
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error en la petición');
    }
    return response.json();
}



export async function iniciarIntento(evaluacionId, token) {
    const response = await fetch(`${API_BASE}evaluaciones/${evaluacionId}/intento-actual/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return handleResponse(response);
}



export async function guardarRespuestas(intentoId, respuestas, token) {
    const response = await fetch(`${API_BASE}/intentos/${intentoId}/guardar/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ respuestas })
    });
    return handleResponse(response);
}


// Control de retención de datos
const CACHE_KEY_PREFIX = 'evaluacion_';

export function guardarProgresoLocal(evaluacionId, datos) {
    try {
        localStorage.setItem(
            `${CACHE_KEY_PREFIX}${evaluacionId}`,
            JSON.stringify(datos)
        );
    } catch (error) {
        console.error('Error guardando progreso local:', error);
    }
}

export function obtenerProgresoLocal(evaluacionId) {
    try {
        const datos = localStorage.getItem(`${CACHE_KEY_PREFIX}${evaluacionId}`);
        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        console.error('Error leyendo progreso local:', error);
        return null;
    }
}

export function limpiarProgresoLocal(evaluacionId) {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${evaluacionId}`);
}