<!-- src/lib/components/Article/EnrollModal.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';
  
    const dispatch = createEventDispatcher();
  
    let enrollmentReason = "";
  
    function handleRequestEnrollment() {
      dispatch('requestEnrollment', enrollmentReason);
    }
  
    function handleClose() {
      dispatch('close');
    }
  </script>
  
  <div class="modal-overlay" role="dialog" aria-modal="true">
    <button class="modal-backdrop" on:click={handleClose} on:keydown={e => e.key === 'Escape' && handleClose()} type="button">
      <span class="sr-only">Close modal</span>
    </button>
    <div class="modal-content" in:fly={{ y: -50, duration: 300, easing: backOut }}>
      <h2>Solicitar acceso al artículo completo</h2>
      <p>¿Deseas solicitar acceso al artículo completo "{title}"?</p>
      <textarea
        bind:value={enrollmentReason}
        placeholder="Explique brevemente por qué deseas acceder a este artículo (opcional)"
      ></textarea>
      <div class="modal-buttons">
        <Button variant="secondary" on:click={handleClose}>Cancelar</Button>
        <Button variant="primary" on:click={handleRequestEnrollment} disabled={!enrollmentReason.trim()}>
          Solicitar acceso
        </Button>
      </div>
    </div>
  </div>
  
  <style>
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
  
    .modal-content {
      background-color: var(--background-color2);
      border-radius: var(--border-radius);
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      box-shadow: var(--box-shadow);
    }
  
    .modal-content h2 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
  
    .modal-content p {
      margin-bottom: 1rem;
    }
  
    .modal-content textarea {
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
  
    .modal-content textarea:focus {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
    }
  
    .modal-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  </style>  