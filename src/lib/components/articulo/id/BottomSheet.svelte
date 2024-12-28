<!-- src/lib/components/articulo/BottomSheet.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  const dispatch = createEventDispatcher();
  
  export let activeContent = '';
  export let toc = [];
  export let comments = [];
  export let onNavigate;
  export let onPostComment;
  export let onRate;
  
  let userRating = 0;
  let newComment = '';
  let isSubmitting = false;
</script>

<button 
  type="button"
  class="bottom-sheet-backdrop" 
  on:click={() => dispatch('close')}
  transition:fade={{ duration: 200 }}
  aria-label="Close"
></button>

<div 
  class="bottom-sheet"
  transition:fly={{ y: '100%', duration: 300 }}
  role="dialog"
  aria-modal="true"
>
  <div class="sheet-handle"></div>

  <header class="sheet-header">
    <h3>
      {#if activeContent === 'toc'}
        <i class="fas fa-list-ul"></i>
        Índice del Artículo
      {:else if activeContent === 'comments'}
        <i class="fas fa-comments"></i>
        Comentarios
      {:else if activeContent === 'rating'}
        <i class="fas fa-star"></i>
        Calificar Artículo
      {/if}
    </h3>
    
    <button 
      class="close-button"
      on:click={() => dispatch('close')}
      aria-label="Cerrar"
    >
      <i class="fas fa-times"></i>
    </button>
  </header>

  <div class="sheet-content">
    {#if activeContent === 'toc'}
      <nav class="bottom-toc">
        {#each toc as item}
          <button
            class="toc-item level-{item.level} {activeSection === item.id ? 'active' : ''}"
            on:click={() => {
              onNavigate(item.id);
              dispatch('close');
            }}
          >
            <div class="toc-marker">
              <div class="marker-dot"></div>
              {#if item.level > 1}
                <div class="marker-line"></div>
              {/if}
            </div>
            <span class="toc-text">{item.text}</span>
          </button>
        {/each}
      </nav>
      
    {:else if activeContent === 'comments'}
      <div class="bottom-comments">
        {#if comments.length === 0}
          <div class="empty-state">
            <div class="empty-icon">
              <i class="far fa-comment-dots"></i>
            </div>
            <h4>No hay comentarios aún</h4>
            <p>¡Sé el primero en iniciar la discusión!</p>
          </div>
        {:else}
          <div class="comments-list">
            {#each comments as comment}
              <article class="comment-card">
                <header class="comment-header">
                  <img 
                    src={comment.usuario.avatar || '/default-avatar.png'} 
                    alt="" 
                    class="avatar"
                  />
                  <div class="comment-meta">
                    <h4>{comment.usuario.username}</h4>
                    <time>{new Date(comment.creado).toLocaleDateString()}</time>
                  </div>
                </header>
                
                <div class="comment-content">
                  <p>{comment.contenido}</p>
                </div>
              </article>
            {/each}
          </div>
        {/if}

        <div class="comment-form">
          <textarea
            bind:value={newComment}
            placeholder="Escribe tu comentario..."
            rows="3"
            disabled={isSubmitting}
          ></textarea>
          
          <button
            class="submit-button"
            on:click={() => {
              onPostComment(newComment);
              dispatch('close');
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
      
    {:else if activeContent === 'rating'}
      <div class="bottom-rating">
        <div class="rating-stars">
          {#each Array(5) as _, i}
            <button
              class="star-button {i < userRating ? 'active' : ''}"
              on:click={() => userRating = i + 1}
              disabled={isSubmitting}
              aria-label={`Calificar con ${i + 1} estrellas`}
            >
              <i class="fas fa-star"></i>
            </button>
          {/each}
        </div>
        
        <p class="rating-label">
          {#if userRating === 0}
            Selecciona tu calificación
            {:else if userRating === 1}
            Malo
          {:else if userRating === 2}
            Regular
          {:else if userRating === 3}
            Bueno
          {:else if userRating === 4}
            Muy bueno
          {:else}
            Excelente
          {/if}
        </p>
        
        <button 
          class="rating-submit"
          on:click={() => {
            onRate(userRating);
            dispatch('close');
          }}
          disabled={userRating === 0 || isSubmitting}
        >
          {#if isSubmitting}
            <i class="fas fa-spinner fa-spin"></i>
            Enviando...
          {:else}
            <i class="fas fa-check"></i>
            Enviar calificación
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .bottom-sheet-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
  }

  .bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--background-color2);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    z-index: 1001;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.15);
  }

  .sheet-handle {
    width: 40px;
    height: 4px;
    background-color: var(--text-color-lighter);
    border-radius: 2px;
    margin: 0.75rem auto;
    opacity: 0.3;
  }

  .sheet-header {
    padding: 0 1.5rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }

  .sheet-header h3 {
    margin: 0;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-color);
  }

  .close-button {
    background: none;
    border: none;
    color: var(--text-color);
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 50%;
    transition: all var(--transition-speed);
  }

  .close-button:hover {
    background-color: rgba(var(--text-rgb), 0.1);
    transform: rotate(90deg);
  }

  .sheet-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 1.5rem 1.5rem;
  }

  /* Estilos para TOC */
  .bottom-toc {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toc-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 0.95rem;
    text-align: left;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all var(--transition-speed);
  }

  .toc-marker {
    position: relative;
    display: flex;
    align-items: center;
    padding-top: 0.25rem;
  }

  .marker-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--text-color-lighter);
    transition: all var(--transition-speed);
  }

  .marker-line {
    position: absolute;
    left: 4px;
    top: 100%;
    width: 2px;
    height: calc(100% + 0.75rem);
    background-color: var(--text-color-lighter);
    opacity: 0.2;
    transform-origin: top;
    transition: all var(--transition-speed);
  }

  .toc-text {
    flex: 1;
    transition: all var(--transition-speed);
    padding: 0.25rem 0;
  }

  .toc-item:hover {
    background-color: var(--background-elevated);
    color: var(--primary-color);
  }

  .toc-item:hover .marker-dot {
    background-color: var(--primary-color);
    transform: scale(1.2);
  }

  .toc-item.active {
    background-color: rgba(var(--primary-rgb), 0.1);
    color: var(--primary-color);
    font-weight: 500;
  }

  .toc-item.active .marker-dot {
    background-color: var(--primary-color);
    transform: scale(1.4);
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.2);
  }

  .level-2 { padding-left: 2rem; }
  .level-3 { padding-left: 3rem; }
  .level-4 { padding-left: 4rem; }

  /* Estilos para comentarios */
  .bottom-comments {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem 0;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 1.75rem;
    color: white;
  }

  .empty-state h4 {
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
    gap: 1rem;
  }

  .comment-card {
    background-color: var(--background-elevated);
    border-radius: var(--border-radius);
    padding: 1rem;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--primary-color);
    padding: 2px;
  }

  .comment-meta {
    flex: 1;
  }

  .comment-meta h4 {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
    color: var(--text-color);
  }

  .comment-meta time {
    font-size: 0.85rem;
    color: var(--text-color-lighter);
  }

  .comment-content p {
    margin: 0;
    line-height: 1.6;
    color: var(--text-color);
  }

  .comment-form {
    position: sticky;
    bottom: 0;
    background-color: var(--background-color2);
    padding-top: 1rem;
    border-top: 1px solid rgba(var(--text-rgb), 0.1);
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

  .submit-button,
  .rating-submit {
    width: 100%;
    padding: 1rem;
    margin-top: 1rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all var(--transition-speed);
  }

  .submit-button:hover:not(:disabled),
  .rating-submit:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
  }

  /* Estilos para calificación */
  .bottom-rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem 0;
  }

  .rating-stars {
    display: flex;
    gap: 1rem;
  }

  .star-button {
    background: none;
    border: none;
    font-size: 2.5rem;
    color: var(--text-color-lighter);
    cursor: pointer;
    transition: all var(--transition-speed);
    padding: 0.5rem;
  }

  .star-button:hover,
  .star-button.active {
    color: var(--accent-color);
    transform: scale(1.1);
  }

  .star-button:hover ~ .star-button {
    color: var(--text-color-lighter);
  }

  .rating-label {
    font-size: 1.25rem;
    margin: 0;
    color: var(--text-color);
    font-weight: 500;
    text-align: center;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>