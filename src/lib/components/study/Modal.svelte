<script>
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';
  
    export let title = '';
    export let size = 'default'; // small, default, large, fullscreen
    export let showClose = true;
    export let closeOnClickOutside = true;
  
    const dispatch = createEventDispatcher();
  
    function handleClose() {
      dispatch('close');
    }
  
    function handleClickOutside(event) {
      if (closeOnClickOutside && event.target === event.currentTarget) {
        handleClose();
      }
    }
  
    function handleKeydown(event) {
      if (event.key === 'Escape' && closeOnClickOutside) {
        handleClose();
      }
    }
  </script>
  
  <svelte:window on:keydown={handleKeydown} />
  
  <!-- Backdrop -->
  <div
    class="modal-backdrop"
    on:click={handleClickOutside}
    transition:fade={{ duration: 200 }}
  >
    <!-- Contenedor principal -->
    <div
      class="modal-container {size}"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      transition:fly={{ y: 20, duration: 300, easing: cubicOut }}
    >
      <header class="modal-header">
        <h2 id="modal-title">{title}</h2>
        {#if showClose}
          <button
            class="close-button"
            on:click={handleClose}
            aria-label="Cerrar modal"
          >
            <i class="fas fa-times"></i>
          </button>
        {/if}
      </header>
  
      <div class="modal-content">
        <slot></slot>
      </div>
  
      <footer class="modal-footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
  
  <style>
    /* Revisa tu propio CSS. A continuación, un ejemplo resumido: */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 999;
      backdrop-filter: blur(4px);
    }
  
    .modal-container {
      background: white;
      border-radius: 1.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      width: 100%;
      overflow: hidden;
      position: relative;
      animation: modal-appear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-container.small { max-width: 24rem; }
    .modal-container.default { max-width: 32rem; }
    .modal-container.large { max-width: 56rem; }
    .modal-container.fullscreen {
      max-width: none;
      width: 95vw;
      height: 95vh;
    }
  
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(to bottom, #f8fafc, white);
      border-bottom: 1px solid #e2e8f0;
    }
    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }
    .close-button {
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      background: #f8fafc;
      color: #64748b;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .close-button:hover {
      background: #f1f5f9;
      color: #0f172a;
      transform: rotate(90deg);
    }
  
    .modal-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    .modal-footer {
      padding: 1.25rem 1.5rem;
      background: linear-gradient(to top, #f8fafc, white);
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  
    @keyframes modal-appear {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  </style>  