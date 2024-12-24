<script>
    import { createEventDispatcher } from 'svelte';
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
  </script>
  
  <div class="sort-container">
    <label for="sort-select" class="sort-label">
      <i class="fas fa-sort-amount-down"></i>
      Ordenar por
    </label>
    
    <select
      id="sort-select"
      bind:value
      on:change={() => dispatch('change', value)}
      class="sort-select"
    >
      {#each sortOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
  
  <style>
    .sort-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
    }
  
    .sort-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-primary);
      font-weight: 500;
    }
  
    .sort-label i {
      color: var(--primary-500);
    }
  
    .sort-select {
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
  
    .sort-select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }
  </style>