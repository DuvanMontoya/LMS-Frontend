<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { fetchComments, postComment } from '../../api/articulos/articulos';
  
    export let articleId;
    let comments = writable([]);
    let commentText = "";
  
    onMount(async () => {
      await loadComments();
      const unsubscribe = sessionStore.subscribe(async (session) => {
        if (session.isAuthenticated) {
          await loadComments();
        }
      });
      return () => unsubscribe();
    });
  
    async function loadComments() {
      try {
        if (!$sessionStore.isAuthenticated || !articleId) {
          console.warn("No se puede cargar comentarios: sesión no autenticada o ID de artículo no definido.");
          return;
        }
        const fetchedComments = await fetchComments(articleId, $sessionStore.access);
        comments.set(fetchedComments.results || []);
      } catch (err) {
        console.error("Error obteniendo comentarios:", err);
        comments.set([]);
      }
    }
  
    async function handleCommentSubmit() {
      if (!$sessionStore.isAuthenticated) {
        alert("Por favor, inicia sesión para comentar.");
        return;
      }
  
      const user = $sessionStore.user;
      if (!user || !user.id) {
        console.error("Información del usuario no disponible:", user);
        alert("Ha ocurrido un error al obtener la información del usuario. Por favor, inténtalo de nuevo más tarde.");
        return;
      }
  
      try {
        const newComment = await postComment(articleId, user.id, commentText, $sessionStore.access);
        commentText = "";
        comments.update(current => [...current, newComment]);
      } catch (err) {
        console.error("Error publicando comentario:", err);
        alert("Ha ocurrido un error al publicar el comentario. Por favor, inténtalo de nuevo más tarde.");
      }
    }
  </script>
  
  <section class="article-comments">
    <h2 class="comments-title">Comentarios</h2>
  
    {#if $comments.length === 0}
      <p>Cargando comentarios...</p>
    {:else}
      {#each $comments as comment (comment.id)}
        <div class="comment">
          <div class="comment-meta">
            <span class="comment-author">{comment.usuario.nombre}</span>
          </div>
          <p class="comment-content">{@html comment.contenido}</p>
        </div>
      {/each}
    {/if}
  
    {#if $sessionStore.isAuthenticated}
      <form class="comment-form" on:submit|preventDefault={handleCommentSubmit}>
        <textarea class="comment-input" bind:value={commentText} placeholder="Escribe tu comentario..."></textarea>
        <button class="btn-submit" type="submit">
          <i class="fas fa-paper-plane"></i> Enviar
        </button>
      </form>
    {:else}
      <p class="login-message">
        Por favor, <a href="/login">inicia sesión</a> para comentar.
      </p>
    {/if}
  </section>
  
  <style>
    .article-comments {
      margin-top: 0.3rem;
      padding: 1.5rem;
      background-color: #f9f9f9;
      border-radius: 10px;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
  
    .comments-title {
      font-size: 1.3rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 1.5rem;
      text-align: center;
      text-transform: uppercase;
    }
  
    .comment {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease-in-out;
    }
  
    .comment:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      border-color: #1a73e8;
    }
  
    .comment-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 1rem;
    }
  
    .comment-author {
      font-weight: bold;
      color: #333;
    }
  
    .comment-content {
      font-size: 1rem;
      color: #333;
      line-height: 1.5;
    }
  
    .comment-form {
      display: flex;
      flex-direction: column;
      margin-top: 1.5rem;
    }
  
    .comment-input {
      resize: vertical;
      min-height: 100px;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      margin-bottom: 1rem;
      transition: border-color 0.3s ease-in-out;
    }
  
    .comment-input:focus {
      border-color: #1a73e8;
      outline: none;
    }
  
    .btn-submit {
      align-self: flex-end;
      padding: 0.8rem 1.5rem;
      background-color: #1a73e8;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s ease-in-out;
    }
  
    .btn-submit:hover {
      background-color: #155bb5;
    }
  
    .btn-submit i {
      margin-right: 0.5rem;
    }
  
    .login-message {
      margin-top: 1.5rem;
      font-size: 1rem;
      color: #666;
      text-align: center;
    }
  
    .login-message a {
      color: #1a73e8;
      text-decoration: none;
      border-bottom: 1px solid #1a73e8;
      transition: border-bottom-color 0.3s;
    }
  
    .login-message a:hover {
      border-bottom-color: transparent;
    }
  </style>
  