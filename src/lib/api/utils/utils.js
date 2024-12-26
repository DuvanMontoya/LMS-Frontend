// lib/api/utils/utils.js
const API_URL = "http://localhost:8000/api/";


export async function fetchFromAPI(endpoint, authToken, options = {}) {
  const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
  });

  try {
      const response = await fetch(`${API_URL}${endpoint}`, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : null,
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error HTTP: ${response.status}. Mensaje: ${errorText}`);
      }

      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : {};
  } catch (error) {
      console.error('Error en fetchFromAPI:', error);
      throw error;
  }
}


export const fetchAPI = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_URL}/${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Error en la solicitud');
    }

    return responseData;
  } catch (error) {
    console.error(`Error en la solicitud a ${url}:`, error);
    throw error;
  }
};

export async function fetchToken(username, password) {
  try {
    const response = await fetch(`${API_URL}token/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Credenciales inválidas', { cause: errorData });
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener el token:', error);
    throw error;
  }
}
