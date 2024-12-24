<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  const dispatch = createEventDispatcher();

  export let value = '';
  export let placeholder = 'Buscar soluciones...';

  function handleInput(event) {
    dispatch('input', event.target.value);
  }
</script>

<div class="search-wrapper" transition:fade>
  <div class="search-container">
    <input
      type="text"
      bind:value
      on:input={handleInput}
      {placeholder}
      class="search-input"
    />
    <i class="fas fa-search search-icon"></i>

    {#if value}
      <button 
        class="clear-button"
        aria-label="Clear search"
        on:click={() => {
          value = '';
          dispatch('input', '');
        }}
      >
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>
</div>

<style>
  .search-wrapper {
    position: relative;
    width: 100%;
  }

  .search-container {
    position: relative;
    background: white;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-speed) ease;
  }

  .search-container:hover {
    box-shadow: var(--shadow-md);
  }

  .search-container:focus-within {
    box-shadow: var(--shadow-lg);
  }

  .search-input {
    width: 100%;
    padding: 1rem 3rem;
    border: 2px solid transparent;
    border-radius: var(--border-radius-lg);
    font-size: 1rem;
    color: var(--text-primary);
    background: transparent;
    transition: all var(--transition-speed) ease;
  }

  .search-input::placeholder {
    color: var(--text-muted);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-500);
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary-500);
    font-size: 1.2rem;
    pointer-events: none;
    transition: color var(--transition-speed) ease;
  }

  .clear-button {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all var(--transition-speed) ease;
  }

  .clear-button:hover {
    background-color: var(--gray-100);
    color: var(--danger-500);
  }
</style>