<script>
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
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
  
  <aside 
    class="filter-panel {isOpen ? 'open' : ''}"
    transition:fly={{ x: -300, duration: 300 }}
  >
    <div class="filter-header">
      <h2>
        <i class="fas fa-filter"></i>
        Filtros avanzados
      </h2>
      <button class="close-button" on:click={() => dispatch('close')} aria-label="Close filter panel">
        <i class="fas fa-times"></i>
      </button>
    </div>
  
    <div class="filter-content">
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
          { id: 'all', name: 'Todos' },
          { id: 'free', name: 'Gratuito' },
          { id: 'paid', name: 'De pago' }
        ]}
        bind:value={filters.access}
        on:change={() => dispatch('filter', filters)}
      />
  
      <FilterSection
        label="Archivo adjunto"
        options={[
          { id: 'all', name: 'Todos' },
          { id: 'yes', name: 'Con archivo' },
          { id: 'no', name: 'Sin archivo' }
        ]}
        bind:value={filters.hasAttachment}
        on:change={() => dispatch('filter', filters)}
      />
    </div>
  
    <div class="filter-footer">
      <button class="reset-button" on:click={handleReset}>
        <i class="fas fa-undo"></i>
        Restablecer filtros
      </button>
    </div>
  </aside>
  
  <style>
    .filter-panel {
      display: flex;
      flex-direction: column;
      width: 320px;
      height: 100%;
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      position: fixed;
      top: 0;
      right: 0;
      z-index: 50;
    }
  
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: var(--primary-gradient);
      border-top-left-radius: var(--border-radius-lg);
      border-top-right-radius: var(--border-radius-lg);
    }
  
    .filter-header h2 {
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
    }
  
    .close-button {
      background: none;
      border: none;
      color: white;
      padding: 0.5rem;
      cursor: pointer;
      transition: transform var(--transition-speed) ease;
    }
  
    .close-button:hover {
      transform: rotate(90deg);
    }
  
    .filter-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
  
    .filter-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--gray-200);
    }
  
    .reset-button {
      width: 100%;
      padding: 1rem;
      background: var(--danger-500);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all var(--transition-speed) ease;
    }
  
    .reset-button:hover {
      background: var(--danger-600);
      transform: translateY(-2px);
    }
  
    @media (max-width: 768px) {
      .filter-panel {
        width: 100%;
      }
    }
  </style>