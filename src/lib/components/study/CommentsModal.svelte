<script>
    import { onMount, afterUpdate, onDestroy, createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';
    import Modal from './Modal.svelte';
    
    export let question = null;  // { id, comentarios: [...], contexto, ... }
    export let isOpen = false;
    
    const dispatch = createEventDispatcher();
    
    // Estado interno para un nuevo comentario
    let newComment = '';
    let replyingTo = null;  // ID del comentario al que se responde
    let commentTextArea;
    let isSubmitting = false;
    
    // Lista local de comentarios que se mostrarán en el modal
    let comments = [];
    
    // Filtros
    let filtersOpen = false;
    let sortBy = 'recent';
    let filterBy = 'all';
    
    // Cada vez que cambie question o question.comentarios, asignamos a comments
    $: if (question && question.comentarios) {
      comments = Array.isArray(question.comentarios) ? question.comentarios : [];
    }
    
    // Orden y filtrado
    $: sortedComments = getSortedComments(comments, sortBy);
    $: filteredComments = getFilteredComments(sortedComments, filterBy);
    
    // Renderizar MathJax después de cada actualización
    afterUpdate(() => {
      if (isOpen && window.MathJax) {
        window.MathJax.typesetPromise();
      }
    });
    
    function getSortedComments(cList, sort) {
      const arr = [...cList];
      switch (sort) {
        case 'popular':
          return arr.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        case 'oldest':
          return arr.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
        default:
          // recent
          return arr.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
      }
    }
    
    function getFilteredComments(cList, filter) {
      switch (filter) {
        case 'unanswered':
          return cList.filter(c => !c.respuestas?.length);
        case 'resolved':
          return cList.filter(c => c.respuestas?.length);
        default:
          return cList;
      }
    }
    
    // Envía nuevo comentario (o respuesta)
    async function handleSubmit() {
      if (!newComment.trim() || isSubmitting) return;
      isSubmitting = true;
      try {
        // Disparamos evento al padre para que guarde el comentario
        dispatch('comment', {
          content: newComment,
          parentId: replyingTo,
          questionId: question.id
        });
        newComment = '';
        replyingTo = null;
        if (commentTextArea) commentTextArea.focus();
      } finally {
        isSubmitting = false;
      }
    }
    
    // Cierra el modal
    function handleClose() {
      dispatch('close');
    }
    
    // Prepara la respuesta a un comentario
    function startReply(comment) {
      replyingTo = comment.id;
      newComment = `@${comment.usuario_nombre} `;
      if (commentTextArea) {
        commentTextArea.focus();
        commentTextArea.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Cancela la respuesta
    function cancelReply() {
      replyingTo = null;
      newComment = '';
    }
    
    // Da like a un comentario
    function handleLike(commentId) {
      dispatch('like', { commentId, questionId: question.id });
    }
    
    // Generador de color de avatar
    function stringToColor(str) {
      const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
      ];
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    }
    
    // Manejar el enfoque inicial al abrir el modal
    onMount(() => {
      if (isOpen && commentTextArea) {
        commentTextArea.focus();
      }
    });
    
    onDestroy(() => {
      // Limpieza si es necesario
    });
  </script>
  
  {#if isOpen}
    <Modal title="Dudas y comentarios" size="large" showClose={true} on:close={handleClose}>
      <div class="comments-modal">
        <!-- Encabezado con filtros y stats -->
        <header class="modal-header">
          <div class="filters-section">
            <button 
              class="filter-button"
              class:active={filtersOpen}
              on:click={() => filtersOpen = !filtersOpen}
            >
              <i class="fas fa-sliders-h"></i>
              <span>Filtrar y ordenar</span>
            </button>
  
            {#if filtersOpen}
              <div class="filters-dropdown" transition:fly={{ y: -10 }}>
                <div class="filter-group">
                  <label for="sort-select">Ordenar por</label>
                  <select id="sort-select" bind:value={sortBy} class="filter-select">
                    <option value="recent">Más recientes</option>
                    <option value="popular">Más populares</option>
                    <option value="oldest">Más antiguos</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label for="filter-select">Mostrar</label>
                  <select id="filter-select" bind:value={filterBy} class="filter-select">
                    <option value="all">Todos los comentarios</option>
                    <option value="unanswered">Sin responder</option>
                    <option value="resolved">Resueltos</option>
                  </select>
                </div>
              </div>
            {/if}
          </div>
  
          <div class="stats">
            <span class="badge">
              <i class="fas fa-comments"></i>
              {comments.length} comentarios
            </span>
            <span class="badge">
              <i class="fas fa-reply-all"></i>
              {comments.reduce((acc, c) => acc + (c.respuestas?.length || 0), 0)} respuestas
            </span>
          </div>
        </header>
  
        <!-- Contexto de la pregunta -->
        <div class="question-context">
          <h4>Contexto de la pregunta:</h4>
          <div class="question-text">
            {@html question?.contexto}
          </div>
        </div>
  
        <!-- Form para nuevo comentario o respuesta -->
        <div class="comment-form {replyingTo ? 'replying' : ''}">
          {#if replyingTo}
            <div class="reply-indicator">
              <i class="fas fa-reply"></i>
              <span>Respondiendo</span>
              <button class="cancel-reply" on:click={cancelReply} aria-label="Cancelar respuesta">
                <i class="fas fa-times"></i>
              </button>
            </div>
          {/if}
  
          <textarea
            bind:this={commentTextArea}
            bind:value={newComment}
            placeholder={replyingTo ? "Escribe tu respuesta..." : "¿Tienes alguna duda? ¡Compártela aquí..."}
            rows="3"
            disabled={isSubmitting}
          ></textarea>
  
          <div class="form-actions">
            {#if replyingTo}
              <button class="secondary-button" on:click={cancelReply}>Cancelar</button>
            {/if}
            <button
              class="primary-button"
              on:click={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
            >
              {#if isSubmitting}
                <span class="loading-dots"></span>
              {:else}
                <i class="fas fa-paper-plane"></i>
                Enviar
              {/if}
            </button>
          </div>
        </div>
  
        <!-- Lista de comentarios -->
        <div class="comments-list">
          {#if filteredComments.length > 0}
            {#each filteredComments as comment (comment.id)}
              <div class="comment-card" transition:fade>
                <div class="comment-header">
                  <div class="user-info">
                    <div class="avatar" style="background: {stringToColor(comment.usuario_nombre)}">
                      {comment.usuario_nombre[0]?.toUpperCase()}
                    </div>
                    <div class="user-meta">
                      <span class="username">{comment.usuario_nombre}</span>
                      <span class="date">
                        {format(new Date(comment.fecha_creacion), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
                      </span>
                    </div>
                  </div>
  
                  <button
                    class="like-button {comment.user_has_liked ? 'liked' : ''}"
                    on:click={() => handleLike(comment.id)}
                  >
                    <i class="fas fa-heart"></i>
                    {comment.likes_count}
                  </button>
                </div>
  
                <div class="comment-content">
                  {@html comment.contenido}
                </div>
  
                <div class="comment-actions">
                  <button on:click={() => startReply(comment)}>
                    <i class="fas fa-reply"></i>
                    Responder
                  </button>
                </div>
  
                <!-- Respuestas -->
                {#if comment.respuestas?.length}
                  <div class="replies">
                    {#each comment.respuestas as reply (reply.id)}
                      <div class="reply-card" transition:fade>
                        <div class="comment-header">
                          <div class="user-info">
                            <div class="avatar small" style="background: {stringToColor(reply.usuario_nombre)}">
                              {reply.usuario_nombre[0]?.toUpperCase()}
                            </div>
                            <div class="user-meta">
                              <span class="username">{reply.usuario_nombre}</span>
                              <span class="date">
                                {format(new Date(reply.fecha_creacion), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
                              </span>
                            </div>
                          </div>
  
                          <button
                            class="like-button small {reply.user_has_liked ? 'liked' : ''}"
                            on:click={() => handleLike(reply.id)}
                          >
                            <i class="fas fa-heart"></i>
                            {reply.likes_count}
                          </button>
                        </div>
                        <div class="comment-content">
                          {@html reply.contenido}
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          {:else}
            <div class="empty-state">
              <i class="fas fa-comments"></i>
              <p>No hay comentarios todavía</p>
              <p class="hint">¡Sé el primero en compartir una duda!</p>
            </div>
          {/if}
        </div>
      </div>
    </Modal>
  {/if}
  
  <style>
    /* ==============
       ESTILOS MEJORADOS 
       ============== */
    .comments-modal {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-height: 80vh;
      overflow: hidden;
    }
  
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
      flex-wrap: wrap;
    }
  
    .filters-section {
      position: relative;
    }
  
    .filter-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      color: #64748b;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
  
    .filter-button.active {
      background: #e0f2fe;
      color: #0f172a;
      border-color: #3b82f6;
    }
  
    .filter-button:hover {
      background: #f1f5f9;
      color: #0f172a;
      transform: translateY(-1px);
    }
  
    .filters-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 999;
      width: 250px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1rem;
      margin-top: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  
    .filter-group {
      margin-bottom: 1rem;
    }
    .filter-group:last-child {
      margin-bottom: 0;
    }
    .filter-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: #64748b;
      margin-bottom: 0.25rem;
    }
  
    .filter-select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: #ffffff;
      color: #0f172a;
    }
  
    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  
    .stats {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border-radius: 0.75rem;
      color: #64748b;
      font-size: 0.875rem;
    }
  
    .question-context {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1rem;
    }
  
    .question-context h4 {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .question-text {
      color: #0f172a;
      font-size: 0.875rem;
      line-height: 1.6;
    }
  
    .comment-form {
      background: #f8fafc;
      border-radius: 1rem;
      padding: 1rem;
      transition: background 0.3s ease;
    }
  
    .comment-form.replying {
      background: #eef2ff;
    }
  
    .reply-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #eff6ff;
      border-radius: 9999px;
      color: #3b82f6;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
  
    .cancel-reply {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }
  
    textarea {
      width: 100%;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      background: white;
      font-size: 0.875rem;
      resize: vertical;
      min-height: 100px;
      color: #0f172a;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
  
    textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
  
    .primary-button,
    .secondary-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
    }
  
    .primary-button {
      background: #3b82f6;
      color: white;
      border: none;
    }
    .primary-button:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }
  
    .primary-button:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }
  
    .secondary-button {
      background: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }
    .secondary-button:hover:not(:disabled) {
      background: #f8fafc;
      color: #0f172a;
      transform: translateY(-1px);
    }
  
    .comments-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 0.5rem;
      margin: 0 -0.5rem;
    }
  
    .comment-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .comment-card:hover {
      border-color: #cbd5e1;
      transform: scale(1.005);
    }
  
    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
  
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
  
    .avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    .avatar.small {
      width: 2rem;
      height: 2rem;
      font-size: 0.875rem;
    }
  
    .user-meta {
      display: flex;
      flex-direction: column;
    }
  
    .username {
      font-weight: 600;
      color: #0f172a;
      font-size: 0.875rem;
    }
  
    .date {
      font-size: 0.75rem;
      color: #64748b;
    }
  
    .like-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      color: #64748b;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .like-button:hover:not(:disabled),
    .like-button.liked {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #ef4444;
      transform: translateY(-1px);
    }
    .like-button.small {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
  
    .comment-content {
      padding: 1rem;
      color: #334155;
      font-size: 0.875rem;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  
    .comment-actions {
      padding: 0 1rem 1rem;
      display: flex;
      gap: 0.75rem;
    }
  
    .comment-actions button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      color: #64748b;
      font-size: 0.75rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .comment-actions button:hover {
      background: #f1f5f9;
      color: #0f172a;
      transform: translateY(-1px);
    }
  
    .replies {
      margin: 0 1rem 1rem;
      padding-left: 1.5rem;
      border-left: 2px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    .reply-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .reply-card:hover {
      background: #eef2ff;
      border-color: #cbd5e1;
    }
  
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      color: #64748b;
      text-align: center;
    }
    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }
    .empty-state .hint {
      color: #94a3b8;
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
  
    .loading-dots {
      display: inline-flex;
      align-items: center;
      height: 1.25rem;
    }
    .loading-dots::after {
      content: '...';
      animation: dots 1.5s steps(4, end) infinite;
    }
    @keyframes dots {
      0%, 20% { content: ''; }
      40% { content: '.'; }
      60% { content: '..'; }
      80%, 100% { content: '...'; }
    }
  
    .comments-list::-webkit-scrollbar {
      width: 0.375rem;
    }
    .comments-list::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 9999px;
    }
    .comments-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 9999px;
    }
    .comments-list::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  
    @media (max-width: 640px) {
      .modal-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      .filters-dropdown {
        width: 100%;
        right: 0;
      }
      .comment-form {
        padding: 0.75rem;
      }
      .form-actions {
        flex-direction: column;
      }
      .primary-button,
      .secondary-button {
        width: 100%;
        justify-content: center;
      }
      .replies {
        margin: 0 0.75rem 0.75rem;
        padding-left: 1rem;
      }
    }

    .comments-list {
    flex: 1;
    overflow-y: auto;
    max-height: 40vh; /* Ajusta a tu gusto */
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.5rem;
    margin: 0 -0.5rem;
  }

  .replies {
    margin: 0 1rem 1rem;
    padding-left: 1.5rem;
    border-left: 2px solid #e2e8f0;
    max-height: 300px; /* para subrespuestas, si quieres */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  </style>  