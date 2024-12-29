<!-- SortDropdown.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  const dispatch = createEventDispatcher();

  export let value = 'relevance';

  const sortOptions = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'date-desc', label: 'Fecha: Más recientes' },
    { value: 'date-asc', label: 'Fecha: Más antiguos' },
    { value: 'title-asc', label: 'Título: A-Z' },
    { value: 'title-desc', label: 'Título: Z-A' },
    { value: 'views', label: 'Más vistos' },
    { value: 'rating', label: 'Mejor calificados' }
  ];

  function handleChange(event) {
    dispatch('change', event.target.value);
  }
</script>

<div class="sort-dropdown" transition:fade>
  <label for="sort-select" class="sort-dropdown__label">
    <i class="fas fa-sort-amount-down"></i>
    Ordenar por
  </label>
  
  <select
    id="sort-select"
    bind:value
    on:change={handleChange}
    class="sort-dropdown__select"
    aria-label="Ordenar artículos"
  >
    {#each sortOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>

<style>
  .sort-dropdown {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--background-elevated);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .sort-dropdown__label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-primary);
    font-weight: 500;
  }

  .sort-dropdown__label i {
    color: var(--primary-500);
  }

  .sort-dropdown__select {
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--border-radius);
    background-color: white;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5rem;
    appearance: none;
    font-size: 0.95rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-speed) ease;
  }

  .sort-dropdown__select:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px var(--primary-100);
  }
</style>