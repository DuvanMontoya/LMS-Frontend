<!-- FilterToggleButton.svelte -->
<script>
  import { fade } from 'svelte/transition';
  
  export let isOpen = false;
  export let onClick = () => {};
</script>

<button 
  class="filter-toggle-button {isOpen ? 'filter-toggle-button--active' : ''}"
  on:click={onClick}
  aria-label={isOpen ? 'Cerrar filtros' : 'Abrir filtros'}
  transition:fade={{ duration: 200 }}
>
  <div class="filter-toggle-button__content">
    <i class="fas {isOpen ? 'fa-times' : 'fa-filter'}"></i>
    <span class="filter-toggle-button__text">
      {isOpen ? 'Cerrar' : 'Filtros'}
    </span>
  </div>
  
  {#if !isOpen}
    <div class="filter-toggle-button__badge" transition:fade>
      <span>4</span> <!-- Puedes dinamizar este número según los filtros aplicados -->
    </div>
  {/if}
</button>

<style>
  .filter-toggle-button {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--accent-color);
    border: none;
    border-radius: 3rem;
    padding: 1rem 1.5rem;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-index-dropdown);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .filter-toggle-button:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }

  .filter-toggle-button--active {
    background: var(--danger-gradient);
  }

  .filter-toggle-button__content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .filter-toggle-button__text {
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filter-toggle-button__badge {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: var(--accent-orange);
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 640px) {
    .filter-toggle-button {
      bottom: 1.5rem;
      right: 1.5rem;
      padding: 0.75rem 1.25rem;
    }
  }
</style>