<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { fetchLikeStatus, updateLikeStatus } from '$lib/api/extras/gusta/gusta';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { get } from 'svelte/store';
  
    export let articleId;
    // export let likeStatus; 
  
  
  
    let isLiked = false;
    let likes = 0;
    let isLoading = true;
  
    const dispatch = createEventDispatcher();
  
    onMount(fetchLikes);
  
    async function fetchLikes() {
      try {
        const state = get(sessionStore); // Usa get para obtener el valor actual del store
        const authToken = state.access;
        if (!authToken || !articleId) {
          console.warn('No auth token or article ID provided.');
          return;
        }
        const response = await fetchLikeStatus(articleId, authToken);
        isLiked = response.is_liked;
        likes = response.total_likes;
      } catch (error) {
        console.error('Error fetching like status:', error);
      } finally {
        isLoading = false;
      }
    }
  
    async function toggleLike() {
      const state = get(sessionStore); // Usa get para obtener el valor actual del store
      const authToken = state.access;
      if (!authToken || !articleId) {
        console.warn('No auth token or article ID provided for toggling.');
        return;
      }
      const newLikeStatus = !isLiked;
      try {
        const response = await updateLikeStatus(articleId, newLikeStatus, authToken);
        isLiked = response.is_liked;
        likes = response.total_likes;
        dispatch('likeToggled', { articleId, likes, isLiked });
      } catch (error) {
        console.error('Error toggling like status:', error);
      }
    }
  </script>
  
  {#if !isLoading}
    <button on:click={toggleLike} class="like-button">
      <div class="heart-icon">
        {#if isLiked}
          <i class="fas fa-heart filled"></i>
        {:else}
          <i class="far fa-heart"></i>
        {/if}
      </div>
      <span class="like-count">{likes}</span>
    </button>
  {/if}
  
  <style>
    .like-button {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 16px;
      transition: color 0.3s ease;
    }
  
    .like-button:hover,
    .like-button:focus {
      color: #ff5252;
      outline: none;
    }
  
    .like-button .heart-icon {
      position: relative;
      width: 24px;
      height: 24px;
      transition: transform 0.3s ease;
    }
  
    .like-button i {
      position: absolute;
      top: 0;
      left: 0;
      font-size: 24px;
      transition: transform 0.3s ease;
    }
  
    .like-button .filled {
      transform: scale(1.2);
      color: #ff5252;
    }
  
    .like-button:hover .filled {
      transform: scale(1.35);
    }
  
    .like-button:not(.filled):hover i,
    .like-button:not(.filled):focus i {
      transform: scale(1.15);
    }
  
    .like-count {
      margin-left: 8px;
      font-size: 16px;
      transition: transform 0.3s ease;
    }
  
    .like-button:hover .like-count,
    .like-button:focus .like-count {
      transform: scale(1.2);
    }
  </style>
  