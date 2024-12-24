<!-- src/lib/components/Article/BottomSheet.svelte -->
<script>
    import Button from '$lib/components/ui/Button.svelte';
    export let activeContent = "";
    export let toc = [];
    export let comments = [];
    export let onClose = () => {};
    export let onNavigate = (id) => {};
    export let onPostComment = () => {};
    export let onRate = () => {};
    let newComment = '';
  </script>
  
  <div class="bottom-sheet">
    <div class="bottom-sheet-header">
      <h3>
        {#if activeContent === "toc"}
          Índice
        {:else if activeContent === "comments"}
          Comentarios
        {:else if activeContent === "rating"}
          Calificar artículo
        {/if}
      </h3>
      <Button variant="link" on:click={onClose} aria-label="Cerrar">
        <i class="fas fa-times"></i>
      </Button>
    </div>
    <div class="bottom-sheet-content">
      {#if activeContent === "toc"}
        <nav class="mobile-toc">
          {#each toc as item}
            <a
              href={`#${item.id}`}
              class="toc-item level-{item.level} {activeSection === item.id ? 'active' : ''}"
              on:click|preventDefault={() => { onNavigate(item.id); onClose(); }}
            >
              {item.text}
            </a>
          {/each}
        </nav>
      {:else if activeContent === "comments"}
        <div class="comments-section">
          {#each comments as comment}
            <div class="comment">
              <div class="comment-header">
                <img src={comment.usuario.avatar || '/default-avatar.png'} alt="Avatar" class="comment-avatar">
                <span class="comment-author">{comment.usuario.username}</span>
                <span class="comment-date">{new Date(comment.creado).toLocaleDateString()}</span>
              </div>
              <p>{comment.contenido}</p>
              <div class="comment-actions">
                <Button variant="link" on:click={() => onReply(comment.id)}>Responder</Button>
                {#if comment.usuario.id === get(sessionStore).userId}
                  <Button variant="link" on:click={() => onDelete(comment.id)}>Eliminar</Button>
                {/if}
              </div>
            </div>
          {/each}
          <div class="new-comment">
            <textarea bind:value={newComment} placeholder="Escribe tu comentario..."></textarea>
            <Button
              variant="primary"
              on:click={() => { onPostComment(newComment); newComment = ''; }}
              disabled={!newComment.trim()}
            >
              Enviar comentario
            </Button>
          </div>
        </div>
      {:else if activeContent === "rating"}
        <div class="rating-section">
          <p>¿Qué calificación le darías a "{article.title}"?</p>
          <div class="star-rating">
            {#each Array(5) as _, i}
              <span
                class="star {i < userRating ? 'active' : ''}"
                on:click={() => (userRating = i + 1)}
                on:keydown={(e) => e.key === 'Enter' && (userRating = i + 1)}
                role="button"
                tabindex="0"
                aria-label={`Calificar ${i + 1} estrellas`}
              >
                ★
              </span>
            {/each}
          </div>
          <Button
            variant="primary"
            on:click={onRate}
            disabled={userRating === 0}
          >
            Enviar calificación
          </Button>
        </div>
      {/if}
    </div>
  </div>
  
  <style>
    .bottom-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: var(--background-color2);
      border-top-left-radius: var(--border-radius);
      border-top-right-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      z-index: 1001;
      max-height: 80vh;
      overflow-y: auto;
      transition: all var(--transition-speed);
    }
  
    .bottom-sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--light-text-color);
    }
  
    .bottom-sheet-header h3 {
      color: var(--primary-color);
    }
  
    .bottom-sheet-content {
      padding: 1rem;
    }
  
    .mobile-toc {
      max-height: 60vh;
      overflow-y: auto;
    }
  
    .toc-item {
      display: block;
      padding: 0.5rem 0;
      color: var(--text-color);
      text-decoration: none;
      transition: all var(--transition-speed);
      font-size: 0.9rem;
      border-left: 3px solid transparent;
      padding-left: 10px;
    }
  
    .toc-item:hover {
      color: var(--accent-color);
      background-color: rgba(255, 215, 0, 0.1);
    }
  
    .toc-item.active {
      font-weight: bold;
      color: var(--accent-color);
      border-left-color: var(--accent-color);
    }
  
    .level-2 { padding-left: 1rem; }
    .level-3 { padding-left: 2rem; }
    .level-4 { padding-left: 3rem; }
    .level-5 { padding-left: 4rem; }
    .level-6 { padding-left: 5rem; }
  
    .comments-section {
      max-height: 60vh;
      overflow-y: auto;
    }
  
    .comment {
      background-color: var(--background-color);
      border-radius: var(--border-radius);
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: var(--box-shadow);
    }
  
    .comment-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
  
    .comment-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 1rem;
    }
  
    .comment-author {
      font-weight: bold;
      margin-right: 0.5rem;
    }
  
    .comment-date {
      font-size: 0.8rem;
      color: var(--light-text-color);
    }
  
    .comment-actions {
      display: flex;
      gap: 1rem;
    }
  
    .new-comment textarea {
      width: 100%;
      height: 100px;
      margin-bottom: 1rem;
      padding: 0.75rem;
      border: 1px solid var(--light-text-color);
      border-radius: var(--border-radius);
      background-color: var(--background-color);
      color: var(--text-color);
      resize: vertical;
      transition: all var(--transition-speed);
    }
  
    .new-comment textarea:focus {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
    }
  
    .star-rating {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      font-size: 2.5rem;
      margin: 1rem 0;
    }
  
    .star {
      cursor: pointer;
      transition: transform 0.2s, color 0.2s;
    }
  
    .star.active {
      color: var(--accent-color);
      transform: scale(1.2);
    }
  
    .star:hover {
      color: var(--accent-color);
      transform: scale(1.2);
    }
  </style>  