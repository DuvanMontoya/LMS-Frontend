<!-- src/lib/components/extras/LoadingSpinner.svelte -->

<script>
  export let size = '60px';
  export let color = '#3498db';
  export let speed = '1s';
  export let message = 'Cargando...';
  export let showMessage = true;
</script>

<div class="spinner-container" aria-live="polite" aria-busy="true">
  <div 
    class="spinner" 
    style="width: {size}; height: {size}; border-top-color: {color}; border-right-color: transparent; animation-duration: {speed};"
    role="status"
    aria-label={message}
  ></div>
  {#if showMessage}
    <span class="spinner-message">{message}</span>
  {/if}
</div>

<style>
  .spinner-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    gap: 1rem;
  }

  .spinner {
    border: 6px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 6px solid #3498db;
    animation: spin infinite linear;
  }

  .spinner-message {
    font-size: 1rem;
    color: #555;
    font-weight: 500;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 480px) {
    .spinner-message {
      font-size: 0.9rem;
    }
  }
</style>