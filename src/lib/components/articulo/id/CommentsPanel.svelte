<script>
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { flip } from 'svelte/animate';
  import { onMount, onDestroy, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { sessionStore } from '$lib/stores/sessionStore';
  import apiService from '$lib/api/articulos/articulos.js';
  import { Howl } from 'howler';

  export let articleId = '';
  export let onClose;

  // Estado principal
  let rootComments = [];
  let isLoading = true;
  let error = null;

  // Estado de respuestas y formularios
  let replyTo = null;
  let newCommentContent = ''; // Para comentarios nuevos
  let replyContent = '';      // Para respuestas
  let optimisticUpdates = new Set();

  // Sistema de notificaciones
  let notifications = [];
  let notificationId = 0;

  // Efectos de sonido
  const sounds = {
    submit: new Howl({ src: ['/sounds/comment-submit.mp3'], volume: 0.5 }),
    like: new Howl({ src: ['/sounds/like-action.mp3'], volume: 0.3 }),
    reply: new Howl({ src: ['/sounds/reply-start.mp3'], volume: 0.4 }),
    error: new Howl({ src: ['/sounds/error-notif.mp3'], volume: 0.4 })
  };

  // ------------------------------------------------------------------
  // Estructurar la jerarquía de comentarios a partir del campo "padre"
  // ------------------------------------------------------------------
  function structureComments(rawComments) {
    const commentsById = {};
    const roots = [];

    // Crear objetos base
    rawComments.forEach(comment => {
      commentsById[comment.id] = {
        ...comment,
        isLikedByMe: comment.liked,
        likes_count: comment.likes_count,
        replies: [],
        isOptimistic: false
      };
    });

    // Construir la jerarquía
    rawComments.forEach(comment => {
      if (comment.padre) {
        const parent = commentsById[comment.padre];
        if (parent) {
          parent.replies.push(commentsById[comment.id]);
        } else {
          // Si no se encuentra el padre, agrégalo a la raíz
          roots.push(commentsById[comment.id]);
        }
      } else {
        // Sin padre => raíz
        roots.push(commentsById[comment.id]);
      }
    });

    // Ordenar por fecha creación desc
    const sortByDateDesc = (a, b) =>
      new Date(b.fecha_creacion) - new Date(a.fecha_creacion);

    roots.sort(sortByDateDesc);
    roots.forEach(comment => {
      if (comment.replies) {
        comment.replies.sort(sortByDateDesc);
      }
    });

    return { roots };
  }

  // ------------------------------------------------------------------
  // Cargar comentarios desde el backend
  // ------------------------------------------------------------------
  async function fetchComments(silent = false) {
    if (!silent) isLoading = true;
    error = null;

    try {
      const token = get(sessionStore).access;
      const response = await apiService.fetchComments(articleId, token);

      const rawComments = Array.isArray(response) ? response : response.results;

      const { roots } = structureComments(rawComments);
      rootComments = roots;

      if (!silent) {
        showNotification('Comentarios actualizados', 'success');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      error = err.message;
      showNotification('No se pudieron cargar los comentarios', 'error');
    } finally {
      if (!silent) isLoading = false;
    }
  }

  // ------------------------------------------------------------------
  // Función auxiliar para encontrar un comentario por ID
  // ------------------------------------------------------------------
  function findCommentById(id, comments = rootComments) {
    for (let comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(id, comment.replies);
        if (found) return found;
      }
    }
    return null;
  }

  // ------------------------------------------------------------------
  // Publicar un comentario nuevo (raíz o respuesta)
  // ------------------------------------------------------------------
  async function submitComment(content, parentId = null) {
    if (!content.trim()) return;

    const timestamp = Date.now();
    const optimisticId = `temp-${timestamp}`;
    const username = get(sessionStore).username || 'Desconocido';

    // Comentario optimista
    const optimisticComment = {
      id: optimisticId,
      contenido: content,
      fecha_creacion: new Date().toISOString(),
      usuario: { username },
      likes_count: 0,
      isLikedByMe: false,
      padre: parentId,
      replies: [],
      isOptimistic: true
    };

    try {
      // Insertarlo localmente
      if (parentId) {
        const parentComment = findCommentById(parentId);
        if (parentComment) {
          parentComment.replies.unshift(optimisticComment);
        } else {
          rootComments.unshift(optimisticComment);
        }
      } else {
        // Comentario raíz
        rootComments.unshift(optimisticComment);
      }

      // Forzar actualización
      rootComments = [...rootComments];

      // Sonido + animación
      sounds.submit.play();
      await animateSuccess(optimisticId);

      // Petición real al servidor
      const token = get(sessionStore).access;
      await apiService.postComment(articleId, content, token, parentId);

      // Refrescar para obtener ID real y subcomentarios actualizados
      await fetchComments(true);

      showNotification('¡Comentario publicado con éxito!', 'success');
    } catch (e) {
      console.error('Error al publicar comentario:', e);

      // Revertir
      if (parentId) {
        const parentComment = findCommentById(parentId);
        if (parentComment) {
          parentComment.replies = parentComment.replies.filter(c => c.id !== optimisticId);
        }
      } else {
        rootComments = rootComments.filter(c => c.id !== optimisticId);
      }

      rootComments = [...rootComments];

      showNotification('No se pudo publicar el comentario', 'error');
    }
  }

  // ------------------------------------------------------------------
  // Manejar "Me gusta" / "No me gusta" en comentarios
  // ------------------------------------------------------------------
  async function handleLike(commentId) {
    if (optimisticUpdates.has(commentId)) return;
    const comment = findCommentById(commentId);
    if (!comment) return;

    optimisticUpdates.add(commentId);

    try {
      const wasLiked = comment.isLikedByMe;
      comment.isLikedByMe = !wasLiked;
      comment.likes_count += wasLiked ? -1 : 1;

      rootComments = [...rootComments];
      sounds.like.play();
      await animateLike(commentId);

      // Llamada al backend
      const token = get(sessionStore).access;
      await apiService.likeComment(commentId, token);

      // Refrescar
      await fetchComments(true);
    } catch (error) {
      console.error('Error toggling like:', error);

      // Revertir
      comment.isLikedByMe = !comment.isLikedByMe;
      comment.likes_count += comment.isLikedByMe ? 1 : -1;

      rootComments = [...rootComments];

      showNotification('No se pudo procesar el "Me gusta"', 'error');
    } finally {
      optimisticUpdates.delete(commentId);
    }
  }

  // ------------------------------------------------------------------
  // Sistema de notificaciones local
  // ------------------------------------------------------------------
  function showNotification(message, type = 'info', duration = 3000) {
    const id = notificationId++;
    const notification = { id, message, type };
    notifications = [...notifications, notification];

    if (type === 'error') {
      sounds.error.play();
    }

    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id);
    }, duration);
  }

  // ------------------------------------------------------------------
  // Animaciones
  // ------------------------------------------------------------------
  async function animateSuccess(commentId) {
    const element = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (element) {
      element.style.transform = 'translateX(-40px)';
      element.style.opacity = '0';
      await tick();
      element.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
    }
  }

  async function animateLike(commentId) {
    const element = document.querySelector(`[data-like-button="${commentId}"]`);
    if (element) {
      element.classList.add('liked');
      await new Promise(r => setTimeout(r, 700));
      element.classList.remove('liked');
    }
  }

  // ------------------------------------------------------------------
  // Manejo de respuesta
  // ------------------------------------------------------------------
  function startReply(commentId) {
    sounds.reply.play();
    replyTo = commentId;
    replyContent = '';

    setTimeout(() => {
      const textarea = document.querySelector(`[data-reply-area="${commentId}"]`);
      if (textarea) textarea.focus();
    }, 100);
  }

  function cancelReply() {
    replyTo = null;
    replyContent = '';
  }

  // ------------------------------------------------------------------
  // Ciclo de vida
  // ------------------------------------------------------------------
  onMount(() => {
    fetchComments();
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (replyTo) {
        cancelReply();
      } else {
        onClose();
      }
    }
  }
</script>

<!-- 
  HTML de la interfaz: Panel de comentarios
  Incluye una interfaz más rica y atractiva con mejoras en la experiencia de usuario.
-->

<div 
  class="comments-overlay"
  on:click|self={onClose}
  role="button"
  tabindex="0"
  aria-label="Close comments panel overlay"
  transition:fade={{ duration: 300 }}
>
  <div
    role="dialog"
    aria-label="Comments panel"
    class="comments-panel"
    transition:fly={{
      x: 400,
      duration: 400,
      easing: backOut
    }}
    on:click|stopPropagation
  >
    <!-- Header -->
    <header class="panel-header">
      <div class="header-content">
        <div class="header-left">
          <i class="fas fa-comments"></i>
          <h2>Comentarios</h2>
          {#if rootComments.length > 0}
            <span class="comment-count" transition:scale>
              {rootComments.length}
            </span>
          {/if}
        </div>
        <button class="close-button" on:click={onClose} aria-label="Cerrar panel de comentarios">
          <i class="fas fa-times"></i>
        </button>
      </div>

      {#if !isLoading && rootComments.length > 0}
        <div class="header-stats" transition:slide>
          <div class="stat">
            <i class="fas fa-user-group"></i>
            <!-- Ejemplo: participantes únicos -->
            <span>
              {new Set(rootComments.map(c => c.usuario.username)).size} participantes
            </span>
          </div>
          <div class="stat">
            <i class="fas fa-clock"></i>
            <span>
              Última actividad: {new Date(rootComments[0].fecha_creacion).toLocaleTimeString()}
            </span>
          </div>
        </div>
      {/if}
    </header>

    <!-- Main Content -->
    <main class="comments-content custom-scrollbar">
      <!-- Notificaciones -->
      <div class="notifications-container">
        {#each notifications as notification (notification.id)}
          <div
            class="notification {notification.type}"
            transition:slide
            animate:flip
          >
            <i class="fas fa-{notification.type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>{notification.message}</span>
          </div>
        {/each}
      </div>

      <!-- Estados: cargando, error, vacío -->
      {#if isLoading}
        <div class="loading-state" transition:fade>
          <div class="premium-loader"></div>
          <p>Cargando comentarios...</p>
        </div>
      {:else if error}
        <div class="error-state" transition:fade>
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>No se pudieron cargar los comentarios</h3>
          <p>{error}</p>
          <button class="premium-button" on:click={() => fetchComments()}>
            <i class="fas fa-sync-alt"></i> Reintentar
          </button>
        </div>
      {:else if rootComments.length === 0}
        <div class="empty-state" transition:scale>
          <div class="empty-icon">
            <i class="far fa-comments"></i>
          </div>
          <h3>Sé el primero en comentar</h3>
          <p>¡Inicia la conversación compartiendo tus ideas!</p>
        </div>
      {:else}
        <!-- Lista de comentarios en árbol -->
        <div class="comments-tree">
          {#each rootComments as comment (comment.id)}
            <article
              class="comment-card {comment.isOptimistic ? 'optimistic' : ''}"
              data-comment-id={comment.id}
              transition:slide|local={{ duration: 300 }}
              animate:flip={{ duration: 300 }}
            >
              <div class="comment-main">
                <header class="comment-header">
                  <div class="user-info">
                    <div class="avatar">
                      {comment.usuario.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="meta">
                      <h3 class="username">{comment.usuario.username}</h3>
                      <time datetime={comment.fecha_creacion}>
                        {new Date(comment.fecha_creacion).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </header>

                <div class="comment-body">
                  <p>{comment.contenido}</p>
                </div>

                <footer class="comment-actions">
                  <button
                    class="action-button reply-button"
                    on:click={() => startReply(comment.id)}
                  >
                    <i class="far fa-comment"></i>
                    <span>Responder</span>
                  </button>
                  <button
                    class="action-button like-button {comment.isLikedByMe ? 'liked' : ''}"
                    on:click={() => handleLike(comment.id)}
                    data-like-button={comment.id}
                    disabled={optimisticUpdates.has(comment.id)}
                    aria-label={comment.isLikedByMe ? 'Quitar me gusta' : 'Dar me gusta'}
                  >
                    <i class="far fa-heart"></i>
                    <span>{comment.likes_count || ''}</span>
                  </button>
                </footer>
              </div>

              <!-- Formulario de respuesta -->
              {#if replyTo === comment.id}
                <div
                  class="reply-form"
                  transition:slide|local
                  data-reply-to={comment.id}
                >
                  <div class="reply-header">
                    <div class="avatar">
                      {get(sessionStore).username?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <span>Respondiendo a {comment.usuario.username}</span>
                  </div>
                  
                  <textarea
                    bind:value={replyContent}
                    placeholder="Escribe tu respuesta..."
                    rows="3"
                    data-reply-area={comment.id}
                    aria-label="Área para escribir respuesta"
                  ></textarea>
                  
                  <div class="form-actions">
                    <button 
                      class="cancel-button"
                      on:click={cancelReply}
                    >
                      Cancelar
                    </button>
                    <button
                      class="submit-button"
                      disabled={!replyContent.trim()}
                      on:click={() => submitComment(replyContent, comment.id)}
                    >
                      <i class="fas fa-reply"></i>
                      Responder
                    </button>
                  </div>
                </div>
              {/if}

              <!-- Respuestas anidadas -->
              {#if comment.replies && comment.replies.length > 0}
                <div class="replies-container" transition:slide|local>
                  {#each comment.replies as reply (reply.id)}
                    <article
                      class="reply-card {reply.isOptimistic ? 'optimistic' : ''}"
                      data-comment-id={reply.id}
                      transition:slide|local
                      animate:flip
                    >
                      <div class="reply-content">
                        <header class="reply-header">
                          <div class="user-info">
                            <div class="avatar">
                              {reply.usuario.username.charAt(0).toUpperCase()}
                            </div>
                            <div class="meta">
                              <h4 class="username">{reply.usuario.username}</h4>
                              <time datetime={reply.fecha_creacion}>
                                {new Date(reply.fecha_creacion).toLocaleString()}
                              </time>
                            </div>
                          </div>
                        </header>

                        <div class="reply-body">
                          <p>{reply.contenido}</p>
                        </div>

                        <footer class="reply-actions">
                          <button
                            class="action-button like-button {reply.isLikedByMe ? 'liked' : ''}"
                            on:click={() => handleLike(reply.id)}
                            data-like-button={reply.id}
                            disabled={optimisticUpdates.has(reply.id)}
                            aria-label={reply.isLikedByMe ? 'Quitar me gusta' : 'Dar me gusta'}
                          >
                            <i class="far fa-heart"></i>
                            <span>{reply.likes_count || ''}</span>
                          </button>
                        </footer>
                      </div>
                    </article>
                  {/each}
                </div>
              {/if}
            </article>
          {/each}
        </div>
      {/if}
    </main>

    <!-- Footer - Nuevo comentario -->
    <footer class="panel-footer">
      <div class="new-comment-form">
        <div class="form-header">
          <div class="avatar">
            {get(sessionStore).username?.charAt(0).toUpperCase() || 'T'}
          </div>
          <span class="form-prompt">¿Qué opinas sobre este artículo?</span>
        </div>
        
        <textarea
          class="premium-textarea"
          placeholder="Comparte tus pensamientos..."
          rows="3"
          bind:value={newCommentContent}
          aria-label="Área para escribir nuevo comentario"
        ></textarea>
        
        <div class="form-actions">
          <button 
            class="cancel-button"
            on:click={onClose}
          >
            Cancelar
          </button>
          <button
            class="submit-button primary"
            disabled={!newCommentContent.trim()}
            on:click={() => submitComment(newCommentContent)}
          >
            <i class="fas fa-paper-plane"></i>
            Publicar comentario
          </button>
        </div>
      </div>
    </footer>
  </div>
</div>

<style>
/* 
  =========================================================
  CSS Mejorado y Optimizado para una Interfaz Más Impresionante
  =========================================================
*/
:global(:root) {
  --panel-width: 50rem;
  --panel-bg: rgb(255 255 255 / 0.95);
  --panel-border: rgb(255 255 255 / 0.2);
  --card-bg: rgb(255 255 255 / 0.8);
  --card-hover: rgb(255 255 255 / 0.9);
  --card-border: rgb(229 231 235 / 0.5);
  --form-bg: rgb(249 250 251 / 0.9);

  --text-primary: rgb(17 24 39);
  --text-secondary: rgb(75 85 99);
  --text-tertiary: rgb(156 163 175);

  --primary-main: rgb(59 130 246);
  --primary-dark: rgb(37 99 235);
  --primary-light: rgb(59 130 246 / 0.1);

  --success-main: rgb(34 197 94);
  --success-light: rgb(34 197 94 / 0.1);
  --error-main: rgb(239 68 68);
  --error-light: rgb(239 68 68 / 0.1);

  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --radius-full: 9999px;
  --radius-lg: 1rem;
  --radius-md: 0.5rem;
  --transition-all: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(.dark) {
  --panel-bg: rgb(17 24 39 / 0.95);
  --panel-border: rgb(0 0 0 / 0.2);
  --card-bg: rgb(31 41 55 / 0.8);
  --card-hover: rgb(31 41 55 / 0.9);
  --card-border: rgb(55 65 81 / 0.5);
  --form-bg: rgb(17 24 39 / 0.9);

  --text-primary: rgb(243 244 246);
  --text-secondary: rgb(209 213 219);
  --text-tertiary: rgb(156 163 175);
}

.comments-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem;
}

.comments-panel {
  width: 100%;
  max-width: var(--panel-width);
  height: 100vh;
  background: var(--panel-bg);
  backdrop-filter: blur(16px);
  border-left: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  position: relative;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--card-border);
  background: var(--card-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-left h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  display: grid;
  place-items: center;
  background: transparent;
  color: var(--text-secondary);
  transition: var(--transition-all);
  border: none;
  cursor: pointer;
}
.close-button:hover {
  background: rgb(0 0 0 / 0.1);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.header-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  animation: fadeIn 0.5s ease-in-out;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.comments-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--form-bg);
  position: relative;
}

.notifications-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}
.notification {
  background: var(--panel-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  animation: slideIn 0.5s forwards;
}
.notification.success {
  border-left: 4px solid var(--success-main);
}
.notification.error {
  border-left: 4px solid var(--error-main);
}
.notification.success i {
  color: var(--success-main);
}
.notification.error i {
  color: var(--error-main);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}
.premium-loader {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--primary-light);
  border-top-color: var(--primary-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.error-icon,
.empty-icon {
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-full);
  display: grid;
  place-items: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}
.error-icon {
  background: var(--error-light);
  color: var(--error-main);
}
.empty-icon {
  background: var(--primary-light);
  color: var(--primary-main);
}

.premium-button {
  background: var(--primary-main);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition-all);
  border: none;
  cursor: pointer;
}
.premium-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.comments-tree {
  margin-top: 1rem;
}

.comment-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  position: relative;
  transition: var(--transition-all);
  box-shadow: var(--shadow-md);
  animation: fadeInUp 0.5s ease-in-out;
}
.comment-card:hover {
  background: var(--card-hover);
  transform: translateY(-2px);
}
.optimistic {
  animation: glow 1.5s ease-in-out infinite alternate;
}
@keyframes glow {
  from { box-shadow: 0 0 5px var(--primary-main); }
  to { box-shadow: 0 0 15px var(--primary-main); }
}

.comment-main {
  padding: 1.5rem;
}
.comment-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.avatar {
  background: var(--primary-main);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1rem;
}
.meta {
  display: flex;
  flex-direction: column;
}
.username {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
time {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}
.comment-body p {
  margin: 0;
  line-height: 1.4;
  color: var(--text-secondary);
}

.comment-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--card-border);
}
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: transparent;
  transition: var(--transition-all);
  border: none;
  cursor: pointer;
}
.action-button:hover:not(:disabled) {
  background: var(--primary-light);
  color: var(--primary-main);
}
.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.like-button.liked {
  color: #ff6060;
  background: rgba(255, 150, 150, 0.15);
}
.like-button.liked i {
  animation: heartBeat 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(0.9); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.replies-container {
  margin-left: 2rem;
  padding-left: 1rem;
  border-left: 2px solid var(--card-border);
  margin-bottom: 1rem;
  animation: fadeInUp 0.5s ease-in-out;
}
.reply-card {
  background: rgb(255 255 255 / 0.3);
  border-radius: var(--radius-lg);
  margin-bottom: 1rem;
  transition: var(--transition-all);
  box-shadow: var(--shadow-md);
  animation: fadeInUp 0.5s ease-in-out;
}
.reply-card:hover {
  background: rgb(255 255 255 / 0.5);
  transform: translateY(-2px);
}
.reply-content {
  padding: 1rem;
}
.reply-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.reply-body p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.4;
}
.reply-actions {
  margin-top: 0.5rem;
  border-top: 1px solid var(--card-border);
  padding-top: 0.5rem;
  display: flex;
  gap: 1rem;
}

.reply-form {
  padding: 1rem 1.5rem;
  background: var(--form-bg);
  border-top: 1px solid var(--card-border);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  margin-top: -1rem;
  animation: fadeInUp 0.5s ease-in-out;
}
.reply-form .reply-header {
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.reply-form .reply-header .avatar {
  width: 32px;
  height: 32px;
}
.reply-form textarea {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: none;
  transition: var(--transition-all);
}
.reply-form textarea:focus {
  outline: none;
  border-color: var(--primary-main);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.panel-footer {
  background: var(--form-bg);
  border-top: 1px solid  var(--card-border);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
  padding: 1.5rem;
  position: sticky;
  bottom: 0;
  z-index: 100;
}
.new-comment-form {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  animation: fadeInUp 0.5s ease-in-out;
}
.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.form-prompt {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
.premium-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  transition: var(--transition-all);
}
.premium-textarea:focus {
  outline: none;
  border-color: var(--primary-main);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
.cancel-button,
.submit-button {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--transition-all);
  border: none;
  cursor: pointer;
}
.cancel-button {
  color: var(--text-secondary);
  background: transparent;
}
.cancel-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}
.submit-button.primary {
  background: var(--primary-main);
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.submit-button.primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}
.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--text-tertiary) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--text-tertiary);
  border-radius: 3px;
}

@media (max-width: 768px) {
  .comments-panel {
    max-width: none;
    height: 100vh;
    border-left: none;
    border-radius: 0;
  }
  .comments-content {
    padding: 1rem;
  }
  .panel-footer {
    padding: 1rem;
  }
  .new-comment-form {
    padding: 1rem;
  }
  .header-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>