<!-- LoadingState.svelte -->
<script>
  import { fade } from 'svelte/transition';
</script>

<div 
  class="loading-state"
  in:fade={{ duration: 300, delay: 200 }}
>
  <div class="loading-state__loader">
    <div class="loading-state__spinner">
      <div class="loading-state__double-bounce1"></div>
      <div class="loading-state__double-bounce2"></div>
    </div>
  </div>
  <h3 class="loading-state__title">Cargando soluciones académicas</h3>
  <p class="loading-state__description">Por favor espera mientras preparamos el contenido...</p>
</div>

<style>
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
    text-align: center;
    background: var(--background-elevated);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
  }

  .loading-state__loader {
    margin-bottom: 2rem;
  }

  .loading-state__spinner {
    width: 60px;
    height: 60px;
    position: relative;
    margin: 0 auto;
  }

  .loading-state__double-bounce1, .loading-state__double-bounce2 {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: var(--primary-500);
    opacity: 0.6;
    position: absolute;
    top: 0;
    left: 0;
    animation: loadingState-bounce 2.0s infinite ease-in-out;
  }

  .loading-state__double-bounce2 {
    animation-delay: -1.0s;
  }

  @keyframes loadingState-bounce {
    0%, 100% { 
      transform: scale(0.0);
    } 50% { 
      transform: scale(1.0);
    }
  }

  .loading-state__title {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
  }

  .loading-state__description {
    color: var(--text-muted);
    margin: 0;
  }
</style>