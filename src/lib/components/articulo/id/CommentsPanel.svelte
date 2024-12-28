<!-- src/lib/components/articulo/id/CommentsPanel.svelte -->
<script>
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Avatar from '$lib/components/articulo/id/Avatar.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { sessionStore } from '$lib/stores/sessionStore';
  import apiService from '$lib/api/articulos/articulos.js';

  import { Howl } from 'howler';

  export let articleId = '';
  export let onClose;

  // Estado
  let comments = [];
  let newComment = '';
  let isSubmitting = false;
  let replyingTo = null;
  let replyContent = '';
  let isLoading = true;
  let error = null;

  // Fetch comments
  async function fetchComments() {
    isLoading = true;
    error = null;
    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error('No se encontró token de autenticación');

      const commentsData = await apiService.fetchComments(articleId, token);
      comments = commentsData.results;
    } catch (err) {
      console.error('Error fetching comments:', err);
      error = err.message || 'Hubo un problema al cargar los comentarios.';
    } finally {
      isLoading = false;
    }
  }

  // Función para enviar comentarios o respuestas
  async function enviarComentario(content, parentId = null) {
    if (!content.trim()) return;

    isSubmitting = true;

    try {
      const token = get(sessionStore).access;
      if (!token) {
        throw new Error('Debes iniciar sesión para comentar');
      }
      await apiService.postComment(articleId, content, token, parentId);
      // Reload comments
      await fetchComments();

      if (parentId) {
        replyContent = '';
        replyingTo = null;
      } else {
        newComment = '';
      }
    } catch (error) {
      console.error('Error al enviar el comentario:', error);
      alert('Hubo un error al enviar el comentario.');
    } finally {
      isSubmitting = false;
    }
  }

  // Función para iniciar una respuesta
  function startReply(commentId) {
    replyingTo = commentId;
    replyContent = '';
    setTimeout(() => {
      const textarea = document.getElementById(`reply-textarea-${commentId}`);
      if (textarea) textarea.focus();
    }, 100);
  }

  // Función para cancelar la respuesta
  function cancelReply() {
    replyingTo = null;
    replyContent = '';
  }

  // Función para manejar la respuesta
  function handleReply(commentId, content) {
    enviarComentario(content, commentId);
  }

  // Función para cerrar el panel con "Esc"
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  // Función para manejar "Me gusta" en comentarios
  async function enviarLikeComment(commentId) {
    try {
      const token = get(sessionStore).access;
      if (!token) {
        throw new Error('No se proporcionó un token de autenticación');
      }
      await apiService.likeComment(commentId, token);
      await fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      alert('Hubo un error al dar "Me gusta" al comentario.');
    }
  }

  // Escuchar eventos de teclado
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    fetchComments();
  });
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<!-- Overlay -->
<button
  type="button"
  class="comments-overlay"
  on:click={onClose}
  aria-label="Cerrar panel de comentarios"
  transition:fade={{ duration: 300 }}
></button>

<!-- Panel de comentarios -->
<aside
  class="comments-panel"
  transition:fly={{ x: 400, duration: 500, easing: quintOut }}
>
  <!-- Encabezado -->
  <header class="panel-header">
    <h2 class="panel-title">
      <i class="fas fa-comments"></i>
      Comentarios y Discusión
    </h2>
    <button class="close-button" on:click={onClose} aria-label="Cerrar">
      <i class="fas fa-times"></i>
    </button>
  </header>

  <!-- Contenido -->
  <div class="panel-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando comentarios...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error al cargar los comentarios</h3>
        <p>{error}</p>
        <button class="retry-button" on:click={fetchComments}>
          Intentar de nuevo
        </button>
      </div>
    {:else if comments.length === 0}
      <div class="empty-state" transition:scale={{ duration: 300 }}>
        <div class="empty-icon">
          <i class="far fa-comments"></i>
        </div>
        <h3>No hay comentarios aún</h3>
        <p>¡Sé el primero en iniciar la discusión!</p>
      </div>
    {:else}
      <div class="comments-list">
        {#each comments as comment (comment.id)}
          <article class="comment-card" transition:fade={{ duration: 300 }}>
            <header class="comment-header">
              <Avatar size="48" username={comment.usuario.username} />
              <div class="comment-meta">
                <h3 class="author">{comment.usuario.username}</h3>
                <span class="date">
                  {new Date(comment.fecha_creacion).toLocaleDateString()}
                </span>
              </div>
            </header>

            <div class="comment-content">
              <p>{comment.contenido}</p>
            </div>

            <footer class="comment-actions">
              <button
                class="action-button reply"
                on:click|stopPropagation={() => startReply(comment.id)}
              >
                <i class="far fa-comment"></i>
                Responder
              </button>
              <button
                class="action-button like"
                on:click|stopPropagation={() => enviarLikeComment(comment.id)}
              >
                <i class="far fa-thumbs-up"></i>
                {comment.likes_count > 0 ? comment.likes_count : 'Me gusta'}
              </button>
            </footer>

            {#if replyingTo === comment.id}
              <div class="reply-form" transition:fly={{ y: 20, duration: 300 }}>
                <textarea
                  id={`reply-textarea-${comment.id}`}
                  bind:value={replyContent}
                  placeholder="Escribe tu respuesta..."
                  rows="3"
                  aria-label="Responder al comentario"
                ></textarea>
                <div class="form-actions">
                  <button class="action-button cancel" on:click={cancelReply}>
                    Cancelar
                  </button>
                  <button
                    class="action-button submit"
                    on:click={() => handleReply(replyingTo, replyContent)}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    {#if isSubmitting}
                      <i class="fas fa-spinner fa-spin"></i>
                      Enviando...
                    {:else}
                      <i class="fas fa-paper-plane"></i>
                      Enviar respuesta
                    {/if}
                  </button>
                </div>
              </div>
            {/if}

            {#if comment.respuestas && comment.respuestas.length > 0}
              <div class="replies">
                {#each comment.respuestas as respuesta (respuesta.id)}
                  <article class="comment-card reply" transition:fade={{ duration: 300 }}>
                    <header class="comment-header">
                      <Avatar size="48" username={respuesta.usuario.username} />
                      <div class="comment-meta">
                        <h3 class="author">{respuesta.usuario.username}</h3>
                        <span class="date">
                          {new Date(respuesta.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                    </header>

                    <div class="comment-content">
                      <p>{respuesta.contenido}</p>
                    </div>

                    <footer class="comment-actions">
                      <button
                        class="action-button like"
                        on:click|stopPropagation={() => enviarLikeComment(respuesta.id)}
                      >
                        <i class="far fa-thumbs-up"></i>
                        {respuesta.likes_count > 0 ? respuesta.likes_count : 'Me gusta'}
                      </button>
                    </footer>
                  </article>
                {/each}
              </div>
            {/if}
          </article>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Pie del panel -->
  <footer class="panel-footer">
    <div class="comment-form">
      <textarea
        bind:value={newComment}
        placeholder="Escribe tu comentario..."
        disabled={isSubmitting}
        rows="3"
        aria-label="Escribir un comentario"
      ></textarea>
      <div class="form-actions">
        <button
          class="action-button cancel"
          on:click={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          class="action-button submit"
          on:click={() => enviarComentario(newComment)}
          disabled={!newComment.trim() || isSubmitting}
        >
          {#if isSubmitting}
            <i class="fas fa-spinner fa-spin"></i>
            Enviando...
          {:else}
            <i class="fas fa-paper-plane"></i>
            Enviar comentario
          {/if}
        </button>
      </div>
    </div>
  </footer>
</aside>

<style>
  :root {
    --primary-color: #6d28d9; /* Violet-600 */
    --primary-dark: #5b21b6; /* Violet-700 */
    --secondary-color: #8b5cf6; /* Violet-400 */
    --background-color2: #f8fafc; /* Gray-50 */
    --background-elevated: #ffffff;
    --text-color: #1e293b; /* Gray-800 */
    --text-color-lighter: #64748b; /* Gray-500 */
    --text-rgb: 30, 41, 59; /* Gray-800 RGB */
    --primary-rgb: 109, 40, 217; /* Violet-600 RGB */
    --border-radius: 0.75rem; /* 12px */
    --transition-speed: 0.3s;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* Overlay */
  .comments-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
  }

  /* Panel de comentarios */
  .comments-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    max-width: 600px;
    height: 100vh;
    background-color: var(--background-elevated);
    z-index: 100100;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  /* Encabezado del panel */
  .panel-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background-color var(--transition-speed), transform var(--transition-speed);
  }

  .close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: rotate(90deg);
  }

  /* Contenido del panel */
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background-color: var(--background-color2);
  }

  /* Estado vacío */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: var(--text-color-lighter);
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    font-size: 2rem;
    color: white;
  }

  .empty-state h3 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem;
    color: var(--text-color);
  }

  .empty-state p {
    margin: 0;
    color: var(--text-color-lighter);
  }

  /* Lista de comentarios */
  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Tarjeta de comentario */
  .comment-card {
    background-color: var(--background-elevated);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    transition: transform var(--transition-speed), box-shadow var(--transition-speed);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .comment-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--box-shadow);
  }

  /* Encabezado del comentario */
  .comment-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: center;
  }

  .comment-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .author {
    margin: 0;
    font-size: 1rem;
    color: var(--text-color);
    font-weight: 600;
  }

  .date {
    font-size: 0.85rem;
    color: var(--text-color-lighter);
  }

  /* Contenido del comentario */
  .comment-content {
    color: var(--text-color);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .comment-content p {
    margin: 0;
  }

  /* Acciones del comentario */
  .comment-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(var(--text-rgb), 0.1);
  }

  .action-button {
    background: none;
    border: none;
    color: var(--text-color-lighter);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all var(--transition-speed);
  }

  .action-button:hover {
    background-color: rgba(var(--primary-rgb), 0.1);
    color: var(--primary-color);
  }

  .action-button.like:hover {
    color: #ef4444; /* Rojo-500 para "Me gusta" */
  }

  /* Formulario de respuesta */
  .reply-form {
    padding: 1rem;
    background-color: var(--background-color2);
    margin-top: 1rem;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .reply-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(var(--text-rgb), 0.1);
    border-radius: var(--border-radius);
    background-color: #ffffff;
    color: var(--text-color);
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
  }

  .reply-form textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .action-button.submit {
    background-color: var(--primary-color);
    color: white;
  }

  .action-button.submit:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }

  .action-button.cancel {
    border: 1px solid var(--text-color-lighter);
    color: var(--text-color);
  }

  .action-button.cancel:hover {
    border-color: var(--text-color);
    color: var(--text-color);
  }

  /* Pie del panel */
  .panel-footer {
    padding: 1.5rem;
    background-color: var(--background-elevated);
    border-top: 1px solid rgba(var(--text-rgb), 0.1);
  }

  /* Formulario de nuevo comentario */
  .comment-form textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid rgba(var(--text-rgb), 0.1);
    border-radius: var(--border-radius);
    background-color: #ffffff;
    color: var(--text-color);
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
  }

  .comment-form textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }

  /* Botones del formulario */
  .action-button.submit,
  .action-button.cancel {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
  }

  /* Botón de envío deshabilitado */
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsividad */
  @media (max-width: 768px) {
    .comments-panel {
      width: 100%;
      max-width: none;
    }
  }

  /* Respuestas */
  .replies {
    margin-top: 1rem;
    padding-left: 2rem;
    border-left: 2px solid rgba(var(--primary-rgb), 0.2);
  }

  .comment-card.reply {
    background-color: rgba(var(--primary-rgb), 0.05);
  }
</style>