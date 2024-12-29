<!-- FilterPanel.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import FilterSection from './FilterSection.svelte';
  
  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let universities = [];
  export let programs = [];
  export let courses = [];
  export let areas = [];
  export let categories = [];
  export let types = [];
  export let filters = {
    university: '',
    program: '',
    course: '',
    area: '',
    category: '',
    type: '',
    access: 'all',
    hasAttachment: 'all'
  };

  function handleReset() {
    filters = {
      university: '',
      program: '',
      course: '',
      area: '',
      category: '',
      type: '',
      access: 'all',
      hasAttachment: 'all'
    };
    dispatch('reset');
  }
</script>

<aside class="filter-panel {isOpen ? 'filter-panel--open' : ''}" aria-hidden={!isOpen}>
  <div class="filter-panel__header">
    <h2 class="filter-panel__title">
      <i class="fas fa-filter"></i>
      Filtros avanzados
    </h2>
    <button
      class="filter-panel__close-button"
      on:click={() => dispatch('close')}
      aria-label="Cerrar panel de filtros"
    >
      <i class="fas fa-times"></i>
    </button>
  </div>

  <div class="filter-panel__content">
    <FilterSection
      label="Universidad"
      options={universities}
      bind:value={filters.university}
      on:change={() => dispatch('filter', filters)}
    />
    <FilterSection
      label="Programa"
      options={programs}
      bind:value={filters.program}
      on:change={() => dispatch('filter', filters)}
    />
    <FilterSection
      label="Curso"
      options={courses}
      bind:value={filters.course}
      on:change={() => dispatch('filter', filters)}
    />
    <FilterSection
      label="Área"
      options={areas}
      bind:value={filters.area}
      on:change={() => dispatch('filter', filters)}
    />
    <FilterSection
      label="Categoría"
      options={categories}
      bind:value={filters.category}
      on:change={() => dispatch('filter', filters)}
    />
    <FilterSection
      label="Tipo de actividad"
      options={types}
      bind:value={filters.type}
      on:change={() => dispatch('filter', filters)}
    />
    <FilterSection
      label="Acceso"
      options={[
        { id: 'all', nombre: 'Todos' },
        { id: 'free', nombre: 'Gratuito' },
        { id: 'paid', nombre: 'De pago' }
      ]}
      bind:value={filters.access}
      on:change={() => dispatch('filter', filters)}
    />
    <FilterSection
      label="Archivo adjunto"
      options={[
        { id: 'all', nombre: 'Todos' },
        { id: 'yes', nombre: 'Con archivo' },
        { id: 'no', nombre: 'Sin archivo' }
      ]}
      bind:value={filters.hasAttachment}
      on:change={() => dispatch('filter', filters)}
    />
  </div>

  <div class="filter-panel__footer">
    <button class="filter-panel__reset-button" on:click={handleReset}>
      <i class="fas fa-undo"></i>
      Restablecer filtros
    </button>
  </div>
</aside>

<style>
  .filter-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: var(--filter-panel-width);
    height: 100vh;
    background: var(--background-elevated);
    box-shadow: var(--shadow-lg);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }

  .filter-panel--open {
    transform: translateX(0);
  }

  .filter-panel__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--accent-color);
    border-bottom: 1px solid var(--gray-200);
  }

  .filter-panel__title {
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .filter-panel__close-button {
    background: none;
    border: none;
    color: white;
    padding: 0.5rem;
    cursor: pointer;
    transition: transform var(--transition-speed) ease;
  }

  .filter-panel__close-button:hover {
    transform: rotate(90deg);
  }

  .filter-panel__content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .filter-panel__footer {
    padding: 1.5rem;
    border-top: 1px solid var(--gray-200);
  }

  .filter-panel__reset-button {
    width: 100%;
    padding: 1rem;
    background: var(--danger-500);
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

  .filter-panel__reset-button:hover {
    background: var(--danger-600);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 768px) {
    .filter-panel {
      width: 100%;
    }
  }
</style>