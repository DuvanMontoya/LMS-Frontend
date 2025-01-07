// src/lib/api/study/studyService.js
import { fetchFromAPI } from '../utils/utils';

const studyService = {
  // Obtener lista de artículos para estudio
  async getStudyArticles(token) {
    try {
      const response = await fetchFromAPI('study/', token);
      return response;
    } catch (error) {
      console.error('Error fetching study articles:', error);
      throw error;
    }
  },

  // Obtener detalle de un artículo con sus preguntas
  async getStudyArticle(id, token) {
    try {
      // Ajusta la URL a la tuya
      const response = await fetchFromAPI(`study/${id}/iniciar/`, token);
      return response;
    } catch (error) {
      console.error('Error fetching study article:', error);
      throw error;
    }
  },

  // Calificar una pregunta
  async rateQuestion(articleId, questionId, rating, token) {
    try {
      const response = await fetchFromAPI(`study/${articleId}/calificar-pregunta/`, token, {
        method: 'POST',
        body: {
          pregunta_id: questionId,
          calificacion: rating
        }
      });
      return response;
    } catch (error) {
      console.error('Error rating question:', error);
      throw error;
    }
  },

  // Añadir comentario a una pregunta
  async addComment(articleId, questionId, content, parentId = null, token) {
    try {
      const response = await fetchFromAPI(`study/${articleId}/comentar-pregunta/`, token, {
        method: 'POST',
        body: {
          pregunta_id: questionId,
          contenido: content,
          padre_id: parentId
        }
      });
      return response;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Dar/quitar like a un comentario
  async toggleCommentLike(articleId, commentId, token) {
    try {
      const response = await fetchFromAPI(`study/${articleId}/like-comentario/`, token, {
        method: 'POST',
        body: {
          comentario_id: commentId
        }
      });
      return response;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  },

  // Obtener mis artículos en estudio
  async getMyStudies(token) {
    try {
      const response = await fetchFromAPI('study/mis-estudios/', token);
      return response;
    } catch (error) {
      console.error('Error fetching my studies:', error);
      throw error;
    }
  },

  // Obtener preguntas pendientes de un artículo
  async getPendingQuestions(articleId, token) {
    try {
      const response = await fetchFromAPI(`study/${articleId}/preguntas-pendientes/`, token);
      return response;
    } catch (error) {
      console.error('Error fetching pending questions:', error);
      throw error;
    }
  },

  // Obtener preguntas favoritas de un artículo
  async getFavoriteQuestions(articleId, token) {
    try {
      const response = await fetchFromAPI(`study/${articleId}/preguntas-favoritas/`, token);
      return response;
    } catch (error) {
      console.error('Error fetching favorite questions:', error);
      throw error;
    }
  }
};

// Store para manejar el estado del estudio
import { writable } from 'svelte/store';

function createStudyStore() {
  const { subscribe, set, update } = writable({
    article: null,
    questions: [],
    progress: 0,
    isLoading: true,
    error: null
  });

  return {
    subscribe,
    setArticle: (article) => update(state => ({ ...state, article })),
    setQuestions: (questions) => update(state => ({ ...state, questions })),
    updateProgress: (progress) => update(state => ({ ...state, progress })),
    updateQuestionStatus: (questionId, status, value) => update(state => {
      const questions = state.questions.map(q =>
        q.id === questionId ? { ...q, [status]: value } : q
      );
      return { ...state, questions };
    }),
    updateQuestionRating: (questionId, rating) => update(state => {
      const questions = state.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              calificacion_usuario: {
                ...q.calificacion_usuario,
                calificacion: rating,
                superada: rating >= 8,
                favorita: rating >= 9,
                enemiga: rating <= 3,
                repasar: rating >= 4 && rating <= 7
              }
            }
          : q
      );
      return { ...state, questions };
    }),
    addComment: (questionId, comment) => update(state => {
      const questions = state.questions.map(q =>
        q.id === questionId
          ? { ...q, comentarios: [comment, ...q.comentarios] }
          : q
      );
      return { ...state, questions };
    }),
    updateCommentLike: (questionId, commentId, liked, likesCount) => update(state => {
      const questions = state.questions.map(q => {
        if (q.id !== questionId) return q;
        const comentarios = q.comentarios.map(c =>
          c.id === commentId
            ? { ...c, user_has_liked: liked, likes_count: likesCount }
            : c
        );
        return { ...q, comentarios };
      });
      return { ...state, questions };
    }),
    setLoading: (isLoading) => update(state => ({ ...state, isLoading })),
    setError: (error) => update(state => ({ ...state, error })),
    reset: () => set({
      article: null,
      questions: [],
      progress: 0,
      isLoading: true,
      error: null
    })
  };
}

export const studyStore = createStudyStore();
export default studyService;