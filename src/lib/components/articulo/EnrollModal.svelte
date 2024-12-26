<!-- src/lib/components/articulo/EnrollModal.svelte -->
<script>
  import { fade, fly } from 'svelte/transition';
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  export let title = '';

  let reason = '';
  let isSubmitting = false;
  let maxLength = 500;
  let currentLength = 0;
  $: currentLength = reason.length;

  async function handleSubmit() {
    if (!reason.trim() || isSubmitting) return;

    try {
      isSubmitting = true;
      dispatch('requestEnrollment', { reason });
      dispatch('close');
    } catch (error) {
      console.error('Error submitting enrollment:', error);
    } finally {
      isSubmitting = false;
    }
  }

  // Close modal on Escape key
  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      dispatch('close');
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<!-- Backdrop and Modal Container -->
<div class="modal-overlay" transition:fade={{ duration: 200 }}>
  <form 
    class="modal-container"
    on:submit|preventDefault={handleSubmit}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    transition:fly={{ y: 20, duration: 300 }}
  >
    <div class="modal-content">
      <header class="modal-header">
        <h2 id="modal-title">
          <i class="fas fa-key"></i>
          Solicitar Acceso
        </h2>
        <button 
          type="button"
          class="close-button"
          on:click={() => dispatch('close')}
          aria-label="Cerrar"
        >
          <i class="fas fa-times"></i>
        </button>
      </header>

      <div class="modal-body">
        <div class="article-info">
          <i class="fas fa-file-alt article-icon"></i>
          <div class="info-text">
            <h3>"{title}"</h3>
            <p>Este es un artículo de acceso restringido. Por favor, explica por qué estás interesado en acceder a este contenido.</p>
          </div>
        </div>

        <div class="form-group">
          <label for="reason">¿Por qué te interesa este artículo?</label>
          <div class="textarea-container">
            <textarea
              id="reason"
              bind:value={reason}
              maxlength={maxLength}
              rows="5"
              placeholder="Describe brevemente tu interés en este contenido..."
              disabled={isSubmitting}
              required
            ></textarea>
            <div class="char-counter {currentLength > maxLength * 0.9 ? 'near-limit' : ''}">
              {currentLength}/{maxLength}
            </div>
          </div>
        </div>

        <div class="enrollment-tips">
          <h4>
            <i class="fas fa-lightbulb"></i>
            Consejos para tu solicitud
          </h4>
          <ul>
            <li>Explica cómo este contenido se relaciona con tu área de estudio o trabajo</li>
            <li>Menciona tus objetivos de aprendizaje específicos</li>
            <li>Sé conciso pero detallado en tu explicación</li>
          </ul>
        </div>
      </div>

      <footer class="modal-footer">
        <button 
          type="button"
          class="cancel-button"
          on:click={() => dispatch('close')}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          class="submit-button"
          disabled={!reason.trim() || isSubmitting}
        >
          {#if isSubmitting}
            <div class="loading-spinner"></div>
            Enviando solicitud...
          {:else}
            <i class="fas fa-paper-plane"></i>
            Enviar solicitud
          {/if}
        </button>
      </footer>
    </div>
  </form>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--modal-overlay-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: var(--modal-z-index); /* Superior a otros elementos */
  }

  .modal-container {
    width: 100%;
    max-width: 600px;
    background-color: var(--background-color2);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow-elevated);
    overflow: hidden;
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 2rem);
  }

  .modal-header {
    padding: 1.5rem;
    background: var(--header-gradient);
    color: white;
    position: relative;
    overflow: hidden;
  }

  .modal-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0L19.515 8.485 17.343 10.657 28 0h-2.83zM32.656 0L41.142 8.485 39.728 9.9l-7.9-7.9h.828zm5.656 0l8.485 8.485-1.414 1.414-7.9-7.9h.83zm5.657 0l8.485 8.485-1.414 1.414-7.9-7.9h.83zM2.828 0L0 2.828v2.83L5.657 0H2.828zM54.627 60l.83-.828-1.415-1.415L51.8 60h2.827zM5.373 60l-.83-.828L5.96 57.757 8.2 60H5.374zM48.97 60l3.657-3.657-1.414-1.414L46.143 60h2.828zM11.03 60L7.372 56.343 8.787 54.93 13.857 60H11.03zm32.284 60L49.8 53.515l-1.414-1.414-7.9 7.9h2.83zM16.686 60L10.2 53.515l1.414-1.414 7.9 7.9h-2.83zM22.344 60L13.858 51.515l1.414-1.414 7.9 7.9h-.828zm5.656 60l-8.485-8.485-2.172-2.172L28 60h-2.83zM32.656 60l8.486-8.485-1.414-1.414-7.9 7.9h.828zm5.656 60l8.485-8.485-1.414-1.414-7.9 7.9h.83zM5.657 60l0-5.657L5.657 60z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E") center/60px;
    opacity: 0.5;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
    font-family: var(--font-family-serif);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 50%;
    transition: all var(--transition-speed);
    z-index: 1;
  }

  .close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: rotate(90deg);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }

  .article-info {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--background-elevated);
    border-radius: var(--border-radius);
    margin-bottom: 1.5rem;
  }

  .article-icon {
    font-size: 2rem;
    color: var(--primary-color);
    padding: 1rem;
    background-color: rgba(var(--primary-rgb), 0.1);
    border-radius: var(--border-radius);
  }

  .info-text h3 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: var(--text-color);
    font-style: italic;
  }

  .info-text p {
    margin: 0;
    color: var(--text-color-lighter);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-color);
    font-weight: 500;
  }

  .textarea-container {
    position: relative;
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
    resize: vertical;
    transition: all var(--transition-speed);
  }

  textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }

  .char-counter {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-color-lighter);
    background-color: var(--background-color2);
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius);
    transition: all var(--transition-speed);
  }

  .char-counter.near-limit {
    color: var(--accent-color);
    font-weight: 500;
  }

  .enrollment-tips {
    background-color: var(--background-elevated);
    border-radius: var(--border-radius);
    padding: 1.5rem;
  }

  .enrollment-tips h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .enrollment-tips h4 i {
    color: var(--accent-color);
  }

  .enrollment-tips ul {
    margin: 0;
    padding-left: 1.5rem;
    color: var(--text-color-lighter);
    font-size: 0.95rem;
  }

  .enrollment-tips li {
    margin-bottom: 0.5rem;
  }

  .enrollment-tips li:last-child {
    margin-bottom: 0;
  }

  .modal-footer {
    padding: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    background-color: var(--background-elevated);
    border-top: 1px solid rgba(var(--text-rgb), 0.1);
  }

  .cancel-button,
  .submit-button {
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-speed);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cancel-button {
    background: none;
    border: 1px solid var(--text-color-lighter);
    color: var(--text-color);
  }

  .cancel-button:hover:not(:disabled) {
    border-color: var(--text-color);
    background-color: rgba(var(--text-rgb), 0.05);
  }

  .submit-button {
    background-color: var(--primary-color);
    border: none;
    color: white;
    min-width: 180px;
  }

  .submit-button:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px), (max-height: 900px) and (min-width: 1200px) {
    .modal-container {
      height: 100%;
      max-height: 100%;
      border-radius: 0;
    } 

    .modal-content {
      height: 100%;
    }

    .modal-footer {
      flex-direction: column;
    }

    .cancel-button,
    .submit-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>