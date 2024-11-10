// const API_URL = 'https://backend.laila.icu/api/';

const API_URL = "http://localhost:8000/api/";



import { fetchFromAPI } from '../utils/utils';






export async function getPerfil(authToken) {
  try {
    const response = await fetchFromAPI('perfil/', authToken);
    return response;
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    throw error;
  }
}



export async function getUsers(accessToken) {
  const response = await fetch('https://backend.laila.icu/api/users/', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error('Error fetching users');
  }
  return await response.json();
}



export async function getUser(userId, accessToken) {

  const response = await fetch(`https://backend.laila.icu/api/users/${userId}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error('Error fetching user');
  }
  return await response.json();
}


export async function fetchUserInfo(accessToken) {
  try {
    const response = await fetch(`${API_URL}user/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener la información del usuario');
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error al obtener la información del usuario:', error);
    throw error;
  }
}


export async function updateProfile(endpoint, profileData, authToken) {
  const response = await fetch(`https://backend.laila.icu/api/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  if (!response.ok) throw new Error('Error updating profile');
  return response.json();
}
