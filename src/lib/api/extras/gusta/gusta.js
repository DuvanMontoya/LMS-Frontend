// const API_URL = 'https://backend.laila.icu/api/';
const API_URL = "http://localhost:8000/api/";


export async function fetchLikeStatus(articleId, authToken) {
    try {
      const response = await fetch(`${API_URL}articulos/${articleId}/like-status/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch like status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching like status:', error);
      throw error;
    }
  }
  
  export async function updateLikeStatus(articleId, isLiked, authToken) {
    try {
      const response = await fetch(`${API_URL}articulos/${articleId}/update-like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_liked: isLiked })
      });
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating like status:', error);
      throw error;
    }
  }
  
  
  