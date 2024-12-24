<!-- src/lib/components/Article/CommentsPanel.svelte -->
<script>
    import { onMount } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Spinner from '$lib/components/ui/Spinner.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
    
    export let comments = [];
    export let onPostComment = () => {};
    export let onClose = () => {};
    export let onReply = (commentId) => {};
    export let onDelete = (commentId) => {};
    export let isLoading = false;
    export let error = null;
    
    let newComment = "";
  </script>
  
  <div class="comments-panel">
    <div class="comments-panel-header">
      <h3>Comentarios</h3>
      <button on:click={onClose} class="close-button" aria-label="Cerrar comentarios">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="comments-panel-content">
      {#if isLoading}
        <Spinner size="40px" color="var(--accent-color)" />
      {:else if error}
        <ErrorMessage message={error} />
      {:else}
        <div class="comments-list">
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
        </div>
        <div class="new-comment">
          <textarea
            bind:value={newComment}
            placeholder="Escribe tu comentario..."
          ></textarea>
          <Button
            variant="primary"
            on:click={() => { onPostComment(newComment); newComment = ''; }}
            disabled={!newComment.trim()}
          >
            Enviar comentario
          </Button>
        </div>
      {/if}
    </div>
  </div>
  
  <style>
    .comments-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  
    .comments-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--light-text-color);
    }
  
    .comments-panel-header h3 {
      color: var(--primary-color);
    }
  
    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-color);
      cursor: pointer;
      transition: all var(--transition-speed);
    }
  
    .close-button:hover {
      color: var(--accent-color);
    }
  
    .comments-panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
  
    .comments-list {
      margin-bottom: 1rem;
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
  
    .comment p {
      margin-bottom: 0.5rem;
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
  
    .new-comment button {
      align-self: flex-end;
    }
  </style>  