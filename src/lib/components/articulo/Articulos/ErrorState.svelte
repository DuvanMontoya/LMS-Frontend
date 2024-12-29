<!-- ErrorState.svelte -->
<script>
  import { fade } from 'svelte/transition';
  export let error = '';
  export let onRetry = () => {};
</script>

<div 
  class="error-state"
  in:fade={{ duration: 300 }}
>
  <div class="error-state__icon">
    <i class="fas fa-exclamation-triangle"></i>
  </div>
  
  <h3 class="error-state__title">Error al cargar datos</h3>
  <p class="error-state__description">{error}</p>
  
  <button class="error-state__retry-button" on:click={onRetry}>
    <i class="fas fa-redo"></i>
    Reintentar
  </button>
</div>

<style>
  .error-state {
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

  .error-state__icon {
    font-size: 3rem;
    color: var(--danger-500);
    margin-bottom: 1.5rem;
  }

  .error-state__title {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
  }

  .error-state__description {
    color: var(--text-muted);
    margin: 0 0 2rem;
    max-width: 400px;
    line-height: 1.6;
  }

  .error-state__retry-button {
    padding: 0.75rem 1.5rem;
    background: var(--primary-500);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all var(--transition-speed) ease;
  }

  .error-state__retry-button:hover {
    background: var(--primary-600);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
</style>