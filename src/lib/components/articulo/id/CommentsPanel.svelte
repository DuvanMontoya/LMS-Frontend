<script>
  /************************************************************
   * IMPORTS
   ************************************************************/
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { quintOut, elasticOut, backOut } from 'svelte/easing';
  import { flip } from 'svelte/animate';
  import { onMount, onDestroy, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { sessionStore } from '$lib/stores/sessionStore'; // Ajusta si tu store está en otro lugar
  import apiService from '$lib/api/articulos/articulos.js'; // Ajusta si tu service está en otro lugar
  import { Howl } from 'howler';

  /************************************************************
   * PROPS
   ************************************************************/
  export let articleId = '';
  export let onClose; // Función callback para cerrar

  /************************************************************
   * STATE - Estructuras de datos
   ************************************************************/
  let commentsMap = new Map(); // Para acceso O(1) por id
  let rootComments = [];       // Lista de comentarios raíz
  let replyTo = null;          // A quién estoy respondiendo
  let replyContent = '';       // Texto de la respuesta
  let isLoading = true;        // Estado de carga
  let error = null;            // Errores
  let optimisticUpdates = new Map();
  let notifications = [];
  let notificationId = 0;

  // Control de animaciones
  let animations = true;

  // Sonidos
  const sounds = {
    submit: new Howl({ src: ['/sounds/comment-submit.mp3'], volume: 0.5 }),
    like: new Howl({ src: ['/sounds/like-action.mp3'], volume: 0.3 }),
    reply: new Howl({ src: ['/sounds/reply-start.mp3'], volume: 0.4 }),
    error: new Howl({ src: ['/sounds/error-notif.mp3'], volume: 0.4 })
  };

  /************************************************************
   * FUNCIONES para Estructurar Comentarios
   ************************************************************/
  function structureComments(rawComments) {
    // Limpiar el mapa
    commentsMap.clear();
    const roots = [];

    // Inicialmente, mapear todos los comentarios
    rawComments.forEach((comment) => {
      comment.replies = [];
      commentsMap.set(comment.id, comment);
    });

    // Construir jerarquía
    rawComments.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentsMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    // Ordenar replies dentro de cada padre
    commentsMap.forEach((c) => {
      c.replies.sort(
        (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );
    });

    // Ordenar comentarios raíz
    roots.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    return roots;
  }

  /************************************************************
   * SISTEMA de NOTIFICACIONES
   ************************************************************/
  function showNotification(message, type = 'info', duration = 3000) {
    const id = notificationId++;
    const notification = { id, message, type };
    notifications = [...notifications, notification];

    // Sonido si es error
    if (type === 'error') sounds.error.play();

    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id);
    }, duration);
  }

  /************************************************************
   * FETCH (comentarios) 
   ************************************************************/
  async function fetchComments(silent = false) {
    if (!silent) isLoading = true;
    error = null;

    try {
      const token = get(sessionStore).access;
      const response = await apiService.fetchComments(articleId, token);
      rootComments = structureComments(response.results);

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

  /************************************************************
   * Crear o responder un comentario (Optimista)
   ************************************************************/
  async function submitComment(content, parentId = null) {
    // Validar
    if (!content.trim()) return;

    const timestamp = Date.now();
    const optimisticId = `temp-${timestamp}`;
    const username = get(sessionStore).username || 'Desconocido';

    // Crear objeto de comentario "optimista"
    const optimisticComment = {
      id: optimisticId,
      contenido: content,
      fecha_creacion: new Date().toISOString(),
      usuario: { username },
      likes_count: 0,
      isLikedByMe: false,
      parent_id: parentId,
      replies: [],
      isOptimistic: true
    };

    // Insertar en UI
    try {
      if (parentId) {
        // Respuesta a un comentario
        const parentComment = commentsMap.get(parentId);
        if (parentComment) {
          parentComment.replies.unshift(optimisticComment);
          // Limpiar formulario de respuesta
          replyTo = null;
          replyContent = '';
        }
      } else {
        // Comentario raíz
        rootComments.unshift(optimisticComment);
        // Limpiar el textarea de nuevo comentario
        replyContent = '';
      }

      // Animación y sonido
      sounds.submit.play();
      await animateSuccess(optimisticId);

      // Llamar API real
      const token = get(sessionStore).access;
      await apiService.postComment(articleId, content, token, parentId);

      // Actualizar silenciosamente
      await fetchComments(true);

      showNotification('¡Comentario publicado con éxito!', 'success');
    } catch (error) {
      console.error('Error al publicar comentario:', error);

      // Revertir
      if (parentId) {
        const parentComment = commentsMap.get(parentId);
        if (parentComment) {
          parentComment.replies = parentComment.replies.filter(
            (r) => r.id !== optimisticId
          );
        }
      } else {
        rootComments = rootComments.filter((c) => c.id !== optimisticId);
      }

      showNotification('No se pudo publicar el comentario', 'error');
    }
  }

  /************************************************************
   * Manejo de LIKES
   ************************************************************/
  async function handleLike(commentId) {
    // Evitar doble click
    if (optimisticUpdates.get(commentId)) return;
    optimisticUpdates.set(commentId, true);

    const comment = commentsMap.get(commentId);
    if (!comment) return;

    // Sumar like localmente
    comment.likes_count++;
    comment.isLikedByMe = true;

    // Sonido + animación
    sounds.like.play();
    await animateLike(commentId);

    // Llamar API
    try {
      const token = get(sessionStore).access;
      await apiService.likeComment(commentId, token);
      // Actualizar (silent)
      await fetchComments(true);
    } catch (error) {
      console.error('Error en like:', error);
      // Revertir
      comment.likes_count--;
      comment.isLikedByMe = false;
      showNotification('No se pudo registrar el "Me gusta"', 'error');
    } finally {
      optimisticUpdates.delete(commentId);
    }
  }

  /************************************************************
   * Animaciones personalizadas
   ************************************************************/
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
      await new Promise(resolve => setTimeout(resolve, 700));
      element.classList.remove('liked');
    }
  }

  /************************************************************
   * Respuestas a comentarios
   ************************************************************/
  function startReply(commentId) {
    sounds.reply.play();
    replyTo = commentId;
    replyContent = '';
    // Hacer focus en el textarea
    setTimeout(() => {
      const textarea = document.querySelector(`[data-reply-area="${commentId}"]`);
      if (textarea) textarea.focus();
    }, 100);
  }

  function cancelReply() {
    replyTo = null;
    replyContent = '';
  }

  /************************************************************
   * Lifecycle
   ************************************************************/
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
  ===============================================================
  VISTA 
  ===============================================================
  1. Overlay negro con blur
  2. Panel lateral
  3. Header del panel
  4. Main con notificaciones, lista de comentarios, etc.
  5. Footer con el textarea para nuevo comentario
-->

<div 
  class="comments-overlay"
  on:click|self={onClose}
  on:keydown={(e) => e.key === 'Escape' && onClose()}
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
    <!-- Header Premium -->
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
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      {#if !isLoading && rootComments.length > 0}
        <div class="header-stats" transition:slide>
          <div class="stat">
            <i class="fas fa-user-group"></i>
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

    <!-- MAIN -->
    <main class="comments-content custom-scrollbar">
      <!-- Sistema de notificaciones -->
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
        <!-- LISTADO DE COMENTARIOS RAÍZ -->
        <div class="comments-tree">
          {#each rootComments as comment (comment.id)}
            <article
              class="comment-card"
              class:optimistic={comment.isOptimistic}
              data-comment-id={comment.id}
              transition:slide|local={{ duration: 300 }}
              animate:flip={{ duration: 300 }}
            >
              <div class="comment-main">
                <!-- HEADER DEL COMENTARIO -->
                <header class="comment-header">
                  <div class="user-info">
                    <!-- Podrías sustituir por tu componente Avatar -->
                    <div class="avatar">{comment.usuario.username.charAt(0).toUpperCase()}</div>
                    <div class="meta">
                      <h3 class="username">{comment.usuario.username}</h3>
                      <time datetime={comment.fecha_creacion}>
                        {new Date(comment.fecha_creacion).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </header>

                <!-- CUERPO DEL COMENTARIO -->
                <div class="comment-body">
                  <p>{comment.contenido}</p>
                </div>

                <!-- FOOTER: BOTONES -->
                <footer class="comment-actions">
                  <button
                    class="action-button reply-button"
                    on:click={() => startReply(comment.id)}
                  >
                    <i class="far fa-comment"></i>
                    <span>Responder</span>
                  </button>
                  <button
                    class="action-button like-button"
                    class:liked={comment.isLikedByMe}
                    on:click={() => handleLike(comment.id)}
                    data-like-button={comment.id}
                    disabled={optimisticUpdates.get(comment.id)}
                  >
                    <i class="far fa-heart"></i>
                    <span>{comment.likes_count || ''}</span>
                  </button>
                </footer>
              </div>

              <!-- FORMULARIO DE RESPUESTA (si user hace click en "Responder") -->
              {#if replyTo === comment.id}
                <div
                  class="reply-form"
                  transition:slide|local
                  data-reply-to={comment.id}
                >
                  <div class="reply-header">
                    <div class="avatar">{get(sessionStore).username?.charAt(0).toUpperCase() || 'T'}</div>
                    <span>Respondiendo a {comment.usuario.username}</span>
                  </div>
                  
                  <textarea
                    bind:value={replyContent}
                    placeholder="Escribe tu respuesta..."
                    rows="3"
                    data-reply-area={comment.id}
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

              <!-- REPLIES ANIDADAS -->
              {#if comment.replies && comment.replies.length > 0}
                <div class="replies-container" transition:slide|local>
                  {#each comment.replies as reply (reply.id)}
                    <article
                      class="reply-card"
                      class:optimistic={reply.isOptimistic}
                      data-comment-id={reply.id}
                      transition:slide|local
                      animate:flip
                    >
                      <div class="reply-content">
                        <header class="reply-header">
                          <div class="user-info">
                            <div class="avatar">{reply.usuario.username.charAt(0).toUpperCase()}</div>
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
                            class="action-button like-button"
                            class:liked={reply.isLikedByMe}
                            on:click={() => handleLike(reply.id)}
                            data-like-button={reply.id}
                            disabled={optimisticUpdates.get(reply.id)}
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

    <!-- FOOTER - Nuevo Comentario -->
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
          bind:value={replyContent}
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
            disabled={!replyContent.trim()}
            on:click={() => submitComment(replyContent)}
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
  /* =========================================================
     VARIABLES Y CONFIGURACIÓN
  ========================================================= */
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
    
    --primary-light: rgb(59 130 246 / 0.1);
    --primary-main: rgb(59 130 246);
    --primary-dark: rgb(37 99 235);
    
    --success-light: rgb(34 197 94 / 0.1);
    --success-main: rgb(34 197 94);
    --error-light: rgb(239 68 68 / 0.1);
    --error-main: rgb(239 68 68);
    
    --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-glow: 0 0 15px rgb(59 130 246 / 0.5);
    
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 1rem;
    --radius-full: 9999px;
    
    --transition-all: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* =========================================================
     MODO OSCURO 
  ========================================================= */
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

  /* =========================================================
     OVERLAY - fondo semi-transparente
  ========================================================= */
  .comments-overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.5);
    backdrop-filter: blur(8px);
    z-index: 50000;
    display: flex;
    justify-content: flex-end;
  }

  /* =========================================================
     PANEL - contenedor principal
  ========================================================= */
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
    position: relative;
  }

  /* =========================================================
     HEADER DEL PANEL
  ========================================================= */
  .panel-header {
    padding: 1.5rem;
    background: linear-gradient(
      to bottom,
      var(--panel-bg),
      rgb(var(--primary-rgb) / 0.05)
    );
    border-bottom: 1px solid var(--card-border);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
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

  .comment-count {
    background: var(--primary-main);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: 0.875rem;
    font-weight: 500;
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
  }
  .close-button:hover {
    background: rgb(0 0 0 / 0.1);
    color: var(--text-primary);
    transform: rotate(90deg);
  }

  .header-stats {
    display: flex;
    gap: 1rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  /* =========================================================
     MAIN - contenido de comentarios
  ========================================================= */
  .comments-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    position: relative;
  }

  /* =========================================================
     SISTEMA DE NOTIFICACIONES
  ========================================================= */
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
  }

  .notification.success {
    border-left: 4px solid var(--success-main);
  }

  .notification.error {
    border-left: 4px solid var(--error-main);
  }

  .notification i {
    font-size: 1.25rem;
  }

  .notification.success i {
    color: var(--success-main);
  }

  .notification.error i {
    color: var(--error-main);
  }

  /* =========================================================
     ESTADOS: cargando, error, vacío
  ========================================================= */
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

  .error-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-full);
    display: grid;
    place-items: center;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    background: var(--error-light);
    color: var(--error-main);
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-full);
    display: grid;
    place-items: center;
    font-size: 2rem;
    margin-bottom: 1.5rem;
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
  }
  .premium-button:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }

  /* =========================================================
     CARDS DE COMENTARIOS
  ========================================================= */
  .comments-tree {
    margin-top: 1rem;
  }

  .comment-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    margin-bottom: 1.5rem;
    transition: var(--transition-all);
    position: relative;
  }
  .comment-card:hover {
    background: var(--card-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
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

  /* FOOTER DE COMENTARIO */
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

  /* BOTÓN like con latido */
  .like-button.liked {
    color: #ff6060;
    background: rgb(255 150 150 / 0.15);
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

  /* =========================================================
     REPLIES ANIDADAS
  ========================================================= */
  .replies-container {
    margin-left: 2rem;
    padding-left: 1rem;
    border-left: 2px solid var(--card-border);
    margin-bottom: 1rem;
  }

  .reply-card {
    background: rgb(var(--primary-rgb) / 0.03);
    border-radius: var(--radius-lg);
    margin-bottom: 1rem;
    transition: var(--transition-all);
  }
  .reply-card:hover {
    background: rgb(var(--primary-rgb) / 0.06);
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

  /* =========================================================
     FORMULARIO DE RESPUESTA
  ========================================================= */
  .reply-form {
    padding: 1rem 1.5rem;
    background: var(--form-bg);
    border-top: 1px solid var(--card-border);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    margin-top: -1rem;
  }
  .reply-form .reply-header {
    color: var(--text-secondary);
    font-size: 0.875rem;
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
    box-shadow: 0 0 0 3px rgb(var(--primary-rgb) / 0.1);
  }

  /* =========================================================
     FOOTER - NUEVO COMENTARIO
  ========================================================= */
  .panel-footer {
    background: var(--form-bg);
    border-top: 1px solid var(--card-border);
    padding: 1.5rem;
  }
  .new-comment-form {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
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
    box-shadow: 0 0 0 3px rgb(var(--primary-rgb) / 0.1);
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
    background: rgb(0 0 0 / 0.1);
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
    box-shadow: var(--shadow-md);
  }
  .submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* =========================================================
     CUSTOM SCROLLBAR
  ========================================================= */
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

  /* =========================================================
     EFECTOS HOVER
  ========================================================= */
  .comment-card:hover .username {
    color: var(--primary-main);
  }
  .action-button:hover i {
    transform: scale(1.1);
  }

  /* =========================================================
     EFECTOS DE INTERACCIÓN
  ========================================================= */
  .action-button:active {
    transform: scale(0.95);
  }
  .submit-button:active {
    transform: scale(0.98);
  }

  /* =========================================================
     RESPONSIVE
  ========================================================= */
  @media (max-width: 768px) {
    .comments-panel {
      max-width: none;
    }
    .panel-header {
      padding: 1rem;
    }
    .header-stats {
      flex-direction: column;
      gap: 0.5rem;
    }
    .comments-content {
      padding: 1rem;
    }
    .replies-container {
      margin-left: 1rem;
      padding-left: 1rem;
    }
    .comment-main {
      padding: 1rem;
    }
    .reply-form {
      padding: 1rem;
    }
    .panel-footer {
      padding: 1rem;
    }
    .new-comment-form {
      padding: 1rem;
    }
  }

  @media (max-width: 480px) {
    .header-left h2 {
      font-size: 1.25rem;
    }
    .user-info {
      gap: 0.5rem;
    }
    .action-button {
      padding: 0.375rem 0.75rem;
    }
    .submit-button,
    .cancel-button {
      padding: 0.375rem 1rem;
    }
  }
</style>