<!-- src/lib/components/study/StudyHeader.svelte -->
<script>
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  
  export let searchQuery = '';
  export let filterStatus = 'all';
  export let totalArticles = 0;
  export let completedArticles = 0;
  export let inProgressArticles = 0;
  
  const dispatch = createEventDispatcher();
  let showFilters = false;
  
  const statusOptions = [
    { value: 'all', label: 'Todos los artículos', icon: 'book' },
    { value: 'not-started', label: 'Por empezar', icon: 'circle' },
    { value: 'in-progress', label: 'En progreso', icon: 'clock' },
    { value: 'completed', label: 'Completados', icon: 'check-circle' }
  ];

  function handleSearch(event) {
    dispatch('search', event.target.value);
  }

  function handleFilter(value) {
    filterStatus = value;
    dispatch('filter', value);
  }
</script>

<header class="study-header" transition:fade>
  <div class="header-content">
    <!-- Sección superior -->
    <div class="header-top">
      <div class="title-section">
        <h1>Material de estudio</h1>
        <p class="subtitle">Gestiona y realiza seguimiento de tu aprendizaje</p>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-value">{totalArticles}</div>
          <div class="stat-label">Total artículos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{completedArticles}</div>
          <div class="stat-label">Completados</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{inProgressArticles}</div>
          <div class="stat-label">En progreso</div>
        </div>
      </div>
    </div>

    <!-- Sección de filtros -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          bind:value={searchQuery}
          on:input={handleSearch}
          placeholder="Buscar en tus artículos..."
          aria-label="Buscar artículos"
        />
        {#if searchQuery}
          <button 
            class="clear-search"
            on:click={() => searchQuery = ''}
            aria-label="Limpiar búsqueda"
          >
            <i class="fas fa-times"></i>
          </button>
        {/if}
      </div>

      <div class="filters-menu">
        <button 
          class="filter-toggle"
          class:active={showFilters}
          on:click={() => showFilters = !showFilters}
          aria-expanded={showFilters}
          aria-controls="filters-dropdown"
        >
          <i class="fas fa-filter"></i>
          <span>Filtrar por estado</span>
          <i class="fas fa-chevron-{showFilters ? 'up' : 'down'}"></i>
        </button>

        {#if showFilters}
          <div 
            id="filters-dropdown"
            class="filters-dropdown"
            transition:fade={{ duration: 200 }}
          >
            {#each statusOptions as option}
              <button
                class="filter-option"
                class:active={filterStatus === option.value}
                on:click={() => handleFilter(option.value)}
              >
                <i class="fas fa-{option.icon}"></i>
                <span>{option.label}</span>
                {#if filterStatus === option.value}
                  <i class="fas fa-check"></i>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>

<style>
  .study-header {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .header-content {
    padding: 2rem;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }

  .title-section h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
    line-height: 1.2;
  }

  .subtitle {
    color: #6b7280;
    font-size: 1rem;
    margin: 0;
  }

  .stats-section {
    display: flex;
    gap: 1.5rem;
  }

  .stat-card {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 0.75rem;
    min-width: 120px;
    text-align: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .filters-section {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-box {
    position: relative;
    flex: 1;
  }

  .search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }

  input[type="text"] {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    color: #1f2937;
    background: white;
    transition: all 0.2s ease;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px #dbeafe;
  }

  .clear-search {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 9999px;
    transition: all 0.2s ease;
  }

  .clear-search:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .filters-menu {
    position: relative;
  }

  .filter-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    color: #6b7280;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .filter-toggle:hover,
  .filter-toggle.active {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #1f2937;
  }

  .filters-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    min-width: 200px;
    z-index: 20;
  }

  .filter-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: #6b7280;
    font-size: 0.875rem;
    text-align: left;
    transition: all 0.2s ease;
  }

  .filter-option:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .filter-option.active {
    background: #f0f9ff;
    color: #0369a1;
  }

  .filter-option i:last-child {
    margin-left: auto;
    color: #0369a1;
  }

  @media (max-width: 768px) {
    .header-content {
      padding: 1.5rem;
    }

    .header-top {
      flex-direction: column;
      gap: 1.5rem;
    }

    .stats-section {
      width: 100%;
      justify-content: space-between;
    }

    .stat-card {
      min-width: 0;
      flex: 1;
    }

    .filters-section {
      flex-direction: column;
      align-items: stretch;
    }

    .filters-dropdown {
      position: static;
      margin-top: 0.5rem;
    }
  }
</style>