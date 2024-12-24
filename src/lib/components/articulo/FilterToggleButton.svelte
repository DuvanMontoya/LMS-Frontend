<script>
    import { fly, fade } from 'svelte/transition';
    export let isOpen = false;
    export let onClick = () => {};
  </script>
  
  <button 
    class="filter-toggle {isOpen ? 'active' : ''}"
    on:click={onClick}
    aria-label={isOpen ? 'Cerrar filtros' : 'Abrir filtros'}
    transition:fade={{ duration: 200 }}
  >
    <div class="button-content">
      <i class="fas {isOpen ? 'fa-times' : 'fa-filter'}"></i>
      <span class="button-text">
        {isOpen ? 'Cerrar' : 'Filtros'}
      </span>
    </div>
    
    {#if !isOpen}
      <div class="filter-badge" transition:fade>
        <span>4</span>
      </div>
    {/if}
  </button>
  
  <style>
    .filter-toggle {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--primary-gradient);
      border: none;
      border-radius: 3rem;
      padding: 1rem 1.5rem;
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-lg);
      z-index: 50;
    }
  
    .filter-toggle:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }
  
    .filter-toggle.active {
      background: var(--danger-gradient);
    }
  
    .button-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
  
    .button-text {
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  
    .filter-badge {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      background: var(--accent-500);
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
      .filter-toggle {
        bottom: 1.5rem;
        right: 1.5rem;
        padding: 0.75rem 1.25rem;
      }
    }
  </style>