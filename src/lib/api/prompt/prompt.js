// const API_URL = 'https://backend.laila.icu/api/';
const API_URL = "http://localhost:8000/api/";

async function fetchFromAPI(endpoint, authToken, options = {}) {
  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.ok) {
    if (response.status === 204) {
      return null;
    }
    return response.json();
  } else {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Ha ocurrido un error");
  }
}

export const fetchPrompts = async (authToken) => {
  try {
    return await fetchFromAPI("prompts/", authToken);
  } catch (error) {
    console.error("Error al obtener prompts:", error);
    throw error;
  }
};

export const fetchPromptById = async (id, authToken) => {
  try {
    return await fetchFromAPI(`prompts/${id}/`, authToken);
  } catch (error) {
    console.error("Error al obtener el prompt:", error);
    throw error;
  }
};

export const createPrompt = async (data, authToken) => {
  try {
    return await fetchFromAPI("prompts/", authToken, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error al crear el prompt:", error);
    throw error;
  }
};

export const updatePrompt = async (id, data, authToken) => {
  try {
    return await fetchFromAPI(`prompts/${id}/`, authToken, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error al actualizar el prompt:", error);
    throw error;
  }
};

export const deletePrompt = async (id, authToken) => {
  try {
    await fetchFromAPI(`prompts/${id}/`, authToken, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error al eliminar el prompt:", error);
    throw error;
  }
};

export const fetchCategorias = async (authToken) => {
  try {
    return await fetchFromAPI("categorias/", authToken);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};

export const fetchEtiquetas = async (authToken) => {
  try {
    return await fetchFromAPI("etiquetas/", authToken);
  } catch (error) {
    console.error("Error al obtener etiquetas:", error);
    throw error;
  }
};

export const agregarComentario = async (promptId, comentario, authToken) => {
  try {
    return await fetchFromAPI(
      `prompts/${promptId}/agregar_comentario/`,
      authToken,
      {
        method: "POST",
        body: JSON.stringify({ contenido: comentario }),
      },
    );
  } catch (error) {
    console.error("Error al agregar comentario:", error);
    throw error;
  }
};
