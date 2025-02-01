const API_URL = "http://localhost:8000/api/";

export async function fetchFromAPI(endpoint, authToken, options = {}) {
  if (!authToken) {
    throw new Error("No se proporcionó un token de autenticación");
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  });

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : null,
    });

    console.log(`Response status for ${endpoint}:`, response.status);
    console.log(
      `Response headers for ${endpoint}:`,
      Object.fromEntries(response.headers),
    );

    const responseText = await response.text();
    console.log(`Raw response for ${endpoint}:`, responseText);

    if (response.status === 401) {
      throw new Error("No autorizado");
    }

    if (!response.ok) {
      throw new Error(`Error HTTP. Estado: ${response.status}`);
    }

    try {
      return responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error("Error al analizar JSON:", error);
      throw new Error("Respuesta JSON inválida");
    }
  } catch (error) {
    console.error(`Error en fetchFromAPI para ${endpoint}:`, error);
    throw error;
  }
}

export async function fetchToken(username, password) {
  try {
    const response = await fetch(`${API_URL}token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Credenciales inválidas", {
        cause: errorData,
      });
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener el token:", error);
    throw error;
  }
}

export async function fetchUserInfo(accessToken) {
  try {
    const response = await fetch(`${API_URL}user/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error al obtener la información del usuario");
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error al obtener la información del usuario:", error);
    throw error;
  }
}
