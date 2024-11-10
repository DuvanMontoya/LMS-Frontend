// src/lib/api/cursos/cursos.js


// const API_URL = 'https://backend.laila.icu/api/';

// const API_BASE_URL = 'https://backend.laila.icu/api/';

const API_URL = "http://localhost:8000/api/";

const API_BASE_URL = "http://localhost:8000/api/";





export async function getDashboardData(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard-data/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener datos del dashboard');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getDashboardData:', error);
    throw error;
  }
}



async function fetchFromAPI(endpoint, access, options = {}) {
  if (!access) {
    throw new Error('No access token provided');
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access}`
  });

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : null,
  });

  if (response.status === 401) {
    throw new Error('Unauthorized: Token inválido o expirado');
  }

  if (response.status === 403) {
    throw new Error('Forbidden: No tienes permiso para realizar esta acción');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch data' }));
    throw new Error(`HTTP error! Status: ${response.status}`, { cause: errorData });
  }

  return await response.json();
}

// export async function requestEnrollment(courseId, access) {
//   return await fetchFromAPI(`cursos/${courseId}/solicitar_inscripcion/`, access, {
//     method: 'POST',
//   });
// }

export async function getTemasDelCurso(cursoId, authToken) {
  return await fetchFromAPI(`cursos/${cursoId}/temas/`, authToken);
}

export async function getLeccionesDelTema(temaId, authToken) {
  return await fetchFromAPI(`temas/${temaId}/lecciones/`, authToken);
}

export async function getLeccionDetails(leccionId, authToken) {
  return await fetchFromAPI(`lecciones/${leccionId}/`, authToken);
}





export async function getCourses(authToken) {
  return await fetchFromAPI('cursos/', authToken);
}

export async function getCourse(courseId, access) {
  return await fetchFromAPI(`cursos/${courseId}/`, access);
}

export async function getCourseDetails(courseId, access) {
  return await fetchFromAPI(`cursos/${courseId}/detalles/`, access);
}

export async function getCursoDetalles(cursoId, access) {
  return await fetchFromAPI(`cursos/${cursoId}/`, access);
}

export async function enrollInCourse(courseId, access) {
  return await fetchFromAPI(`cursos/${courseId}/inscribir/`, access, {
    method: 'POST',
  });
}

export async function requestEnrollment(courseId, access) {
  try {
    const response = await fetchFromAPI(`cursos/${courseId}/solicitar_inscripcion/`, access, {
      method: 'POST',
    });
    return response.status;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
}

export async function checkEnrollment(courseId, access) {
  try {
    const response = await fetchFromAPI(`cursos/${courseId}/estado_inscripcion/`, access);
    return response.status === 'inscrito' || response.status === 'aprobada';
  } catch (error) {
    console.error('Error checking enrollment:', error);
    throw error;
  }
}

export async function getEnrollmentStatus(courseId, access) {
  try {
    const response = await fetchFromAPI(`cursos/${courseId}/estado_inscripcion/`, access);
    return response;
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    throw error;
  }
}

export async function getLeccionDetalles(leccionId, access) {
  return await fetchFromAPI(`lecciones/${leccionId}/`, access);
}

export async function marcarLeccionCompletada(leccionId, access) {
  return await fetchFromAPI(`lecciones/${leccionId}/marcar_completada/`, access, {
    method: 'POST',
  });
}

export async function getProgresoDelCurso(cursoId, authToken) {
  return await fetchFromAPI(`cursos/${cursoId}/progreso/`, authToken);
}



export async function registrarProgresoLeccion(leccionId, access, progreso) {
  return await fetchFromAPI(`lecciones/${leccionId}/registrar-progreso/`, access, {
    method: 'POST',
    body: { progreso }
  });
}

export async function agregarFeedbackLeccion(leccionId, comentario, calificacion, access) {
  return await fetchFromAPI(`lecciones/${leccionId}/agregar-feedback/`, access, {
    method: 'POST',
    body: { comentario, calificacion }
  });
}



export async function calcularProgresoCurso(cursoId, access) {
  return await fetchFromAPI(`cursos/${cursoId}/progreso/`, access);
}

export async function getInscripcionesCurso(userId, access) {
  return await fetchFromAPI(`inscripciones/?usuario=${userId}`, access);
}

export async function getTemasCompletados(userId, access) {
  return await fetchFromAPI(`temas-completados/?usuario=${userId}`, access);
}

export async function getComentariosUsuario(userId, access) {
  return await fetchFromAPI(`usuarios/${userId}/comentarios/`, access);
}

export async function getLeccionesCompletadas(cursoId, access) {
  try {
    const response = await fetchFromAPI(`cursos/${cursoId}/lecciones-completadas/`, access);
    return response;
  } catch (error) {
    console.error('Error al obtener lecciones completadas:', error);
    throw error;
  }
}

export async function getTareasUsuario(userId, access) {
  return await fetchFromAPI(`tareas/?usuario=${userId}`, access);
}

export async function getLeccionesPendientes(userId, access) {
  return await fetchFromAPI(`lecciones-pendientes/?usuario=${userId}`, access);
}

export async function getEstadisticasCurso(cursoId, access) {
  return await fetchFromAPI(`cursos/${cursoId}/estadisticas/`, access);
}

export async function getEstadisticasInstructor(instructorId, access) {
  return await fetchFromAPI(`instructores/${instructorId}/estadisticas/`, access);
}

export async function getCursosRecomendados(access) {
  try {
    const response = await fetchFromAPI('cursos/recomendaciones/', access);
    return response;
  } catch (error) {
    console.error('Error al obtener recomendaciones de cursos:', error);
    return []; // Devolver un array vacío si hay un error
  }
}

export async function marcarTemaCompletado(temaId, access) {
  return await fetchFromAPI(`temas/${temaId}/marcar_completado/`, access, {
    method: 'POST',
  });
}

export async function getProgresoTema(temaId, access) {
  return await fetchFromAPI(`temas/${temaId}/progreso/`, access);
}





export async function calificarCurso(cursoId, calificacion, comentario, access) {
  return await fetchFromAPI(`cursos/${cursoId}/calificar/`, access, {
    method: 'POST',
    body: JSON.stringify({ calificacion, comentario }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}





export async function getCursosMatriculados(userId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/cursos-matriculados/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener cursos matriculados');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getCursosMatriculados:', error);
    throw error;
  }
}


export async function getProgresoCompletoPorCurso(cursoId, userId, token) {
  const response = await fetch(`${API_BASE_URL}/cursos/${cursoId}/progreso-completo/${userId}/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Error al obtener progreso del curso');
  }
  return await response.json();
}


export async function buscarCursos(query, categoria, dificultad, ordenarPor, access) {
  const params = new URLSearchParams({
    q: query,
    categoria,
    dificultad,
    ordenar_por: ordenarPor
  });
  return await fetchFromAPI(`cursos/buscar/?${params}`, access);
}