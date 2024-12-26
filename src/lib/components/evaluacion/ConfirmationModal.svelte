<script>
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Icon from '@iconify/svelte';
  import { createEventDispatcher, onMount } from 'svelte';

  export let title = '';
  export let message = '';
  export let confirmText = 'Confirmar';
  export let cancelText = 'Cancelar';

  let showModal = false;
  const dispatch = createEventDispatcher();

  export function show(options = {}) {
    title = options.title || title;
    message = options.message || message;
    confirmText = options.confirmText || confirmText;
    cancelText = options.cancelText || cancelText;
    showModal = true;

    // Focus on the modal for accessibility
    onMount(() => {
      document.querySelector('.modal-content')?.focus();
    });
  }

  function confirm() {
    dispatch('confirm');
    close();
  }

  function cancel() {
    dispatch('cancel');
    close();
  }

  function close() {
    showModal = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      cancel();
    }
  }
</script>

{#if showModal}
  <div 
    class="modal-overlay" 
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <dialog
      class="modal-content"
      in:fly="{{ y: 50, duration: 500, easing: quintOut }}"
      on:keydown={handleKeydown}
      open
    >
      <div class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button class="close-button" on:click={cancel} aria-label="Cerrar">
          <Icon icon="mdi:close" width="24" height="24" />
        </button>
      </div>
      <div class="modal-body">
        <p>{message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={cancel}>
          <Icon icon="mdi:close" width="20" height="20" />
          {cancelText}
        </button>
        <button class="btn btn-primary" on:click={confirm}>
          <Icon icon="mdi:check" width="20" height="20" />
          {confirmText}
        </button>
      </div>
    </dialog>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 90%;
    max-width: 500px;
    overflow: hidden;
    outline: none; /* Remove default focus outline */
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background-color: #f7fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d3748;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #718096;
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: #2d3748;
  }

  .modal-body {
    padding: 1.5rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #4a5568;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 1.5rem;
    background-color: #f7fafc;
    border-top: 1px solid #e2e8f0;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .btn-primary {
    background-color: #4299e1;
    color: #ffffff;
    margin-left: 0.75rem;
  }

  .btn-primary:hover {
    background-color: #3182ce;
  }

  .btn-secondary {
    background-color: #edf2f7;
    color: #4a5568;
  }

  .btn-secondary:hover {
    background-color: #e2e8f0;
  }

  @media (max-width: 640px) {
    .modal-content {
      width: 95%;
    }
  }
</style>