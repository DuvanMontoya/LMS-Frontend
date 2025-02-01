// lib/api/articulos/articulos.js
import { fetchFromAPI } from "../utils/utils";

export const fetchArticulos = async (authToken) => {
  try {
    const response = await fetchFromAPI("articulos/", authToken);
    return response;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
};

export const fetchArticleById = async (id, authToken) => {
  try {
    const response = await fetchFromAPI(`articulos/${id}/`, authToken);
    return response;
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
};

export const fetchRelatedArticles = async (id, authToken) => {
  try {
    const response = await fetchFromAPI(`articulos/${id}/related/`, authToken);
    return response;
  } catch (error) {
    console.error("Error fetching related articles:", error);
    throw error;
  }
};

export const fetchComments = async (articleId, authToken) => {
  try {
    // Usa la ruta /articulos/{id}/comentarios/
    // que definimos en el ArticuloViewSet
    const response = await fetchFromAPI(
      `articulos/${articleId}/comentarios/`,
      authToken,
    );
    return response; // { data } o { results } depende de cómo lo manejes en tu fetchFromAPI
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const checkArticleEnrollment = async (id, authToken) => {
  try {
    const response = await fetchFromAPI(
      `articulos/${id}/matriculado/`,
      authToken,
    );
    return response;
  } catch (error) {
    console.error("Error checking article enrollment:", error);
    throw error;
  }
};

export const fetchCategorias = (authToken) =>
  fetchFromAPI("categorias-articulos/", authToken);
export const fetchAreas = (authToken) => fetchFromAPI("areas/", authToken);
export const fetchTemas = (authToken) =>
  fetchFromAPI("temas-articulos/", authToken);
export const fetchTipos = (authToken) =>
  fetchFromAPI("tipos-articulos/", authToken);
export const fetchUniversidad = (authToken) =>
  fetchFromAPI("universidades/", authToken);

export const fetchArticlesByArea = (areaId, authToken) =>
  fetchFromAPI(`areas/${areaId}/articulos/`, authToken);
export const fetchArticlesByCategory = (categoryId, authToken) =>
  fetchFromAPI(`categorias-articulos/${categoryId}/articulos/`, authToken);
export const fetchArticlesBySubject = (subjectId, authToken) =>
  fetchFromAPI(`temas-articulos/${subjectId}/articulos/`, authToken);
export const fetchArticlesByType = (typeId, authToken) =>
  fetchFromAPI(`tipos-articulos/${typeId}/articulos/`, authToken);
export const fetchArticlesByUniversity = (universityId, authToken) =>
  fetchFromAPI(`universidades/${universityId}/articulos/`, authToken);

export const fetchLikeStatus = async (articleId, authToken) => {
  try {
    const response = await fetchFromAPI(
      `articulos/${articleId}/like-status/`,
      authToken,
    );
    return response;
  } catch (error) {
    console.error("Error fetching like status:", error);
    throw error;
  }
};

export const updateLikeStatus = async (articleId, isLiked, authToken) => {
  try {
    const response = await fetchFromAPI(
      `articulos/${articleId}/update-like/`,
      authToken,
      {
        method: "POST",
        body: { is_liked: isLiked },
      },
    );
    return response;
  } catch (error) {
    console.error("Error updating like status:", error);
    throw error;
  }
};

export async function matricularArticulo(articuloId, motivo, authToken) {
  try {
    const response = await fetchFromAPI(
      `articulos/${articuloId}/matricular/`,
      authToken,
      {
        method: "POST",
        body: { motivo },
      },
    );

    if (!response || typeof response !== "object") {
      throw new Error("Respuesta no válida del servidor");
    }

    return response; // Devuelve el JSON ya procesado
  } catch (error) {
    console.error("Error matricular artículo:", error);
    throw error;
  }
}

export async function getArticulosFavoritos(userId, authToken) {
  try {
    const response = await fetchFromAPI(
      `usuarios/${userId}/articulos-favoritos/`,
      authToken,
    );
    if (!Array.isArray(response)) {
      throw new Error("Response is not an array");
    }
    return response;
  } catch (error) {
    console.error("Error fetching favorite articles:", error);
    throw error;
  }
}

export async function getArticulosMatriculados(userId, authToken) {
  try {
    const response = await fetchFromAPI(
      `usuarios/${userId}/articulos-matriculados/`,
      authToken,
    );
    return response;
  } catch (error) {
    console.error("Error fetching articulos matriculados:", error);
    throw error;
  }
}

export async function getComentariosUsuario(userId, authToken) {
  try {
    const response = await fetchFromAPI(
      `usuarios/${userId}/comentarios/`,
      authToken,
    );
    if (!Array.isArray(response)) {
      throw new Error("Response is not an array");
    }
    return response;
  } catch (error) {
    console.error("Error fetching user comments:", error);
    throw error;
  }
}

export const postComment = (articleId, content, authToken, parentId = null) => {
  const body = { contenido: content, padre: parentId, articulo: articleId }; // Añade el campo articulo
  return fetchFromAPI(`articulos/${articleId}/comentarios/`, authToken, {
    method: "POST",
    body: body,
  });
};

export const requestArticleEnrollment = async (
  articleId,
  authToken,
  reason,
) => {
  try {
    const response = await fetchFromAPI(
      `articulos/${articleId}/solicitar-matricula/`,
      authToken,
      {
        method: "POST",
        body: { reason: reason },
      },
    );
    return response;
  } catch (error) {
    console.error("Error requesting article enrollment:", error);
    throw error;
  }
};

export const fetchEnrollmentStatus = async (articleId, authToken) => {
  try {
    const response = await fetchFromAPI(
      `articulos/${articleId}/estado-matricula/`,
      authToken,
    );
    return response;
  } catch (error) {
    console.error("Error fetching enrollment status:", error);
    throw error;
  }
};

export const requestCustomArticle = async (authToken, details) => {
  try {
    const response = await fetchFromAPI(
      "solicitar-articulo-personalizado/",
      authToken,
      {
        method: "POST",
        body: { details: details },
      },
    );
    return response;
  } catch (error) {
    console.error("Error requesting custom article:", error);
    throw error;
  }
};

export const incrementArticleViews = async (articleId, authToken) => {
  try {
    const response = await fetchFromAPI(
      `articulos/${articleId}/incrementar-vistas/`,
      authToken,
      {
        method: "POST",
      },
    );
    return response;
  } catch (error) {
    console.error("Error incrementing article views:", error);
    throw error;
  }
};

export const rateArticle = async (articleId, rating, authToken) => {
  try {
    const response = await fetchFromAPI(
      `articulos/${articleId}/calificar/`,
      authToken,
      {
        method: "POST",
        body: { rating: rating },
      },
    );
    return response;
  } catch (error) {
    console.error("Error rating article:", error);
    throw error;
  }
};

export const likeComment = async (comentarioId, authToken) => {
  // Hace POST a /api/comentarios/<comentario_id>/toggle_like/
  try {
    const response = await fetchFromAPI(
      `comentarios/${comentarioId}/toggle_like/`,
      authToken,
      {
        method: "POST",
      },
    );
    return response; // Retorna { liked, likes_count }
  } catch (error) {
    console.error("Error toggling like on comment:", error);
    throw error;
  }
};

const apiService = {
  fetchArticulos,
  fetchArticleById,
  fetchRelatedArticles,
  fetchComments,
  checkArticleEnrollment,
  fetchCategorias,
  fetchAreas,
  fetchTemas,
  fetchTipos,
  fetchUniversidad,
  fetchArticlesByArea,
  fetchArticlesByCategory,
  fetchArticlesBySubject,
  fetchArticlesByType,
  fetchArticlesByUniversity,
  fetchLikeStatus,
  updateLikeStatus,
  matricularArticulo,
  getArticulosFavoritos,
  getArticulosMatriculados,
  getComentariosUsuario,
  postComment,
  requestArticleEnrollment,
  fetchEnrollmentStatus,
  requestCustomArticle,
  incrementArticleViews,
  rateArticle,
  likeComment,
};

export default apiService;
