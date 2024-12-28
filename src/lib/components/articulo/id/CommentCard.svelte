<script>
    import { fade, fly, slide, scale } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { Howl } from 'howler';
  
    export let comment;
    export let activeReply = '';
    export let updateReply;
    export let cancelReply;
  
    const dispatch = createEventDispatcher();
  
    // Sonidos
    const sounds = {
      submit: new Howl({ src: ['/sounds/comment-submit.mp3'], volume: 0.5 }),
      like: new Howl({ src: ['/sounds/like-action.mp3'], volume: 0.3 }),
      reply: new Howl({ src: ['/sounds/reply-start.mp3'], volume: 0.4 }),
      error: new Howl({ src: ['/sounds/error-notif.mp3'], volume: 0.4 })
    };
  
    // Manejo de eventos
    function handleReply() {
      dispatch('reply', comment.id);
      sounds.reply.play();
    }
  
    function handleLike() {
      dispatch('like', comment.id);
    }
  
    function submitReply() {
      if (activeReply.trim()) {
        dispatch('submitReply', { content: activeReply, parentId: comment.id });
        sounds.submit.play();
      }
    }
  </script>
  
  <article
    class="comment-card"
    class:optimistic={comment.isOptimistic}
    data-comment-id={comment.id}
    transition:slide|local={{ duration: 300 }}
  >
    <div class="comment-main">
      <!-- HEADER DEL COMENTARIO -->
      <header class="comment-header">
        <div class="user-info">
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
          on:click={handleReply}
        >
          <i class="far fa-comment"></i>
          <span>Responder</span>
        </button>
        <button
          class="action-button like-button"
          class:liked={comment.isLikedByMe}
          on:click={handleLike}
          aria-label={comment.isLikedByMe ? 'Quitar Me gusta' : 'Dar Me gusta'}
        >
          <i class="far fa-heart"></i>
          <span>{comment.likes_count || ''}</span>
        </button>
      </footer>
    </div>
  
    <!-- FORMULARIO DE RESPUESTA -->
    {#if activeReply !== undefined}
      <div class="reply-form" transition:slide|local>
        <div class="reply-header">
          <div class="avatar">?</div>
          <span>Respondiendo a {comment.usuario.username}</span>
        </div>
        
        <textarea
          placeholder="Escribe tu respuesta..."
          rows="3"
          bind:value={activeReply}
          on:input={(e) => updateReply(e.target.value)}
        ></textarea>
        
        <div class="form-actions">
          <button 
            class="cancel-button"
            on:click={cancelReply}
          >
            Cancelar
          </button>
          <button
            class="submit-button primary"
            disabled={!activeReply.trim()}
            on:click={submitReply}
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
          <CommentCard 
            comment={reply} 
            on:reply={id => dispatch('reply', id)} 
            on:like={id => dispatch('like', id)}
            activeReply={activeReply}
            updateReply={updateReply}
            cancelReply={cancelReply}
          />
        {/each}
      </div>
    {/if}
  </article>
  
  <style>
    /* Estilos específicos para el componente CommentCard */
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
      background: rgba(255, 96, 96, 0.15);
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
      background: rgba(0, 102, 204, 0.03);
      border-radius: var(--radius-lg);
      margin-bottom: 1rem;
      transition: var(--transition-all);
    }
    .reply-card:hover {
      background: rgba(0, 102, 204, 0.06);
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .reply-form .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }
  </style>  