<!-- src/lib/components/articulo/CommentsPanel.svelte -->
<script>
  import { fade, fly } from 'svelte/transition';
  export let comments = [];
  export let onPostComment;
  export let onClose;
  
  let newComment = '';
  let isSubmitting = false;
</script>

<div
  class="comments-overlay"
  on:click={onClose}
  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose() }}
  role="button"
  tabindex="0"
  transition:fade
></div>

<aside class="comments-panel" transition:fly={{ x: 400, duration: 300 }}>
  <header class="panel-header">
    <h2>
      <i class="fas fa-comments"></i>
      Comentarios y Discusión
    </h2>
    <button class="close-button" on:click={onClose} aria-label="Cerrar">
      <i class="fas fa-times"></i>
    </button>
  </header>

  <div class="panel-content">
    {#if comments.length === 0}
      <div class="empty-state" transition:fade>
        <div class="empty-icon">
          <i class="far fa-comments"></i>
        </div>
        <h3>No hay comentarios aún</h3>
        <p>¡Sé el primero en iniciar la discusión!</p>
      </div>
    {:else}
      <div class="comments-list">
        {#each comments as comment}
          <article class="comment-card" transition:fade>
            <header class="comment-header">
              <img 
                src={comment.usuario.avatar || '/default-avatar.png'} 
                alt="" 
                class="avatar"
              />
              <div class="comment-meta">
                <h3 class="author">{comment.usuario.username}</h3>
                <time class="date">
                  {new Date(comment.creado).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </header>
            <div class="comment-content">
              <p>{comment.contenido}</p>
            </div>
            <footer class="comment-actions">
              <button class="action-button like">
                <i class="far fa-heart"></i>
                Me gusta
              </button>
              <button class="action-button reply">
                <i class="far fa-comment"></i>
                Responder
              </button>
            </footer>
          </article>
        {/each}
      </div>
    {/if}
  </div>

  <footer class="panel-footer">
    <div class="comment-form">
      <textarea
        bind:value={newComment}
        placeholder="Escribe tu comentario..."
        disabled={isSubmitting}
        rows="3"
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
          on:click={() => {
            onPostComment(newComment);
            newComment = '';
          }}
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
  .comments-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
  }

  .comments-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    max-width: 450px;
    height: 100vh;
    background-color: var(--background-color2);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 25px rgba(0, 0, 0, 0.1);
  }

  .panel-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    position: relative;
    overflow: hidden;
  }

  .panel-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0L19.515 8.485 17.343 10.657 28 0h-2.83zM32.656 0L41.142 8.485 39.728 9.9l-7.9-7.9h.828zm5.656 0l8.485 8.485-1.414 1.414-7.9-7.9h.83zm5.657 0l8.485 8.485-1.414 1.414-7.9-7.9h.83zM2.828 0L0 2.828v2.83L5.657 0H2.828zM54.627 60l.83-.828-1.415-1.415L51.8 60h2.827zM5.373 60l-.83-.828L5.96 57.757 8.2 60H5.374zM48.97 60l3.657-3.657-1.414-1.414L46.143 60h2.828zM11.03 60L7.372 56.343 8.787 54.93 13.857 60H11.03zm32.284 0L49.8 53.515l-1.414-1.414-7.9 7.9h2.83zM16.686 60L10.2 53.515l1.414-1.414 7.9 7.9h-2.83zM22.344 60L13.858 51.515l1.414-1.414 7.9 7.9h-.828zm5.656 0l-8.485-8.485-2.172-2.172L28 60h-2.83zM32.656 60l8.486-8.485-1.414-1.414-7.9 7.9h.828zm5.656 0l8.485-8.485-1.414-1.414-7.9 7.9h.83zm5.657 0l8.485-8.485-1.414-1.414-7.9 7.9h.83zM2.828 60L0 57.172v-2.83L5.657 60H2.828z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E") center/60px;
    opacity: 0.5;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all var(--transition-speed);
    z-index: 2;
  }

  .close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: rotate(90deg);
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
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

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .comment-card {
    background-color: var(--background-elevated);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    transition: all var(--transition-speed);
  }

  .comment-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--box-shadow);
  }

  .comment-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--primary-color);
    padding: 2px;
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

  .comment-content {
    color: var(--text-color);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .comment-content p {
    margin: 0;
  }

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
    color: #ef4444;
  }

  .panel-footer {
    padding: 1.5rem;
    background-color: var(--background-elevated);
    border-top: 1px solid rgba(var(--text-rgb), 0.1);
  }

  .comment-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid rgba(var(--text-rgb), 0.1);
    border-radius: var(--border-radius);
    background-color: var(--background-color2);
    color: var(--text-color);
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    transition: all var(--transition-speed);
  }

  textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .action-button.submit,
  .action-button.cancel {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
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
  }

  .action-button.cancel:hover {
    border-color: var(--text-color);
    color: var(--text-color);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .comments-panel {
      width: 100%;
      max-width: none;
    }
  }
</style>