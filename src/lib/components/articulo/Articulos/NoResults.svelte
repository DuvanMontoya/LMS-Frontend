<!-- NoResults.svelte -->
<script>
  import { fade } from 'svelte/transition';
  export let onReset = () => {};
</script>

<div 
  class="no-results"
  in:fade={{ duration: 300 }}
>
  <div class="no-results__icon">
    <i class="fas fa-search"></i>
  </div>
  
  <h3 class="no-results__title">No se encontraron resultados</h3>
  <p class="no-results__description">No hay soluciones que coincidan con tus criterios de búsqueda. Intenta modificar los filtros o realizar una nueva búsqueda.</p>
  
  <button class="no-results__reset-button" on:click={onReset}>
    <i class="fas fa-undo"></i>
    Restablecer búsqueda
  </button>
</div>

<style>
  .no-results {
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

  .no-results__icon {
    width: 80px;
    height: 80px;
    background: var(--primary-100);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .no-results__icon i {
    font-size: 2rem;
    color: var(--accent-color);
  }

  .no-results__title {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
  }

  .no-results__description {
    color: var(--text-muted);
    margin: 0 0 2rem;
    max-width: 400px;
    line-height: 1.6;
  }

  .no-results__reset-button {
    padding: 0.75rem 1.5rem;
    background: var(--accent-color);
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

  .no-results__reset-button:hover {
    background: var(--primary-600);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
</style>