<!-- src/lib/components/study/StudyHeader.svelte -->
<script>
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  
  // Props que recibe este componente
  export let searchQuery = '';
  export let filterStatus = 'all';
  export let totalArticles = 0;
  export let completedArticles = 0;
  export let inProgressArticles = 0;

  // Dispatcher para emitir eventos al padre
  const dispatch = createEventDispatcher();
  let showFilters = false;

  // Nuevos estados para filtros avanzados
  let filters = {
    universidad: '',
    facultad: '',
    pregrado: '',
    curso: '',
    tipo: '',
    area: '',
    categoria: '',
    nivel: '',
    acceso: '',
    formato: '',
    semestre: '',
    publicado: 'all',
    es_publico: 'all'
  };
  
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
    dispatch('filter', { status: value, ...filters });
  }

  function handleAdvancedFilter(field, value) {
    filters[field] = value;
    dispatch('filter', { status: filterStatus, ...filters });
  }

  function clearFilters() {
    filters = {
      universidad: '',
      facultad: '',
      pregrado: '',
      curso: '',
      tipo: '',
      area: '',
      categoria: '',
      nivel: '',
      acceso: '',
      formato: '',
      semestre: '',
      publicado: 'all',
      es_publico: 'all'
    };
    filterStatus = 'all';
    dispatch('filter', { status: 'all', ...filters });
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
        <div class="stat-card total">
          <i class="fas fa-book-open"></i>
          <div class="stat-info">
            <div class="stat-value">{totalArticles}</div>
            <div class="stat-label">Total artículos</div>
          </div>
        </div>
        <div class="stat-card completed">
          <i class="fas fa-check-circle"></i>
          <div class="stat-info">
            <div class="stat-value">{completedArticles}</div>
            <div class="stat-label">Completados</div>
          </div>
        </div>
        <div class="stat-card progress">
          <i class="fas fa-spinner"></i>
          <div class="stat-info">
            <div class="stat-value">{inProgressArticles}</div>
            <div class="stat-label">En progreso</div>
          </div>
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
          placeholder="Buscar por título, profesor, descripción..."
          aria-label="Buscar artículos"
        />
        {#if searchQuery}
          <button 
            class="clear-search"
            on:click={() => {
              searchQuery = '';
              dispatch('search', '');
            }}
            aria-label="Limpiar búsqueda"
          >
            <i class="fas fa-times"></i>
          </button>
        {/if}
      </div>

      <div class="filters-container">
        <button 
          class:active={showFilters}
          class="filter-toggle"
          on:click={() => showFilters = !showFilters}
        >
          <i class="fas fa-sliders-h"></i>
          Filtros avanzados
          <i class="fas fa-chevron-{showFilters ? 'up' : 'down'}"></i>
        </button>

        {#if showFilters}
          <div class="filters-panel" transition:fade={{ duration: 200 }}>
            <div class="filters-grid">
              <!-- Status filter -->
              <div class="filter-group">
                <label for="status-filter">Estado</label>
                <div class="status-options" id="status-filter">
                  {#each statusOptions as option}
                    <button
                      class:active={filterStatus === option.value}
                      class="status-option"
                      on:click={() => handleFilter(option.value)}
                    >
                      <i class="fas fa-{option.icon}"></i>
                      {option.label}
                    </button>
                  {/each}
                </div>
              </div>

              <!-- Institution filters -->
              <div class="filter-group">
                <label for="universidad-filter">Universidad</label>
                <select 
                  id="universidad-filter"
                  bind:value={filters.universidad}
                  on:change={() => handleAdvancedFilter('universidad', filters.universidad)}
                >
                  <option value="">Todas las universidades</option>
                  <!-- Add universities dynamically -->
                </select>
              </div>

              <div class="filter-group">
                <label for="facultad-filter">Facultad</label>
                <select 
                  id="facultad-filter"
                  bind:value={filters.facultad}
                  on:change={() => handleAdvancedFilter('facultad', filters.facultad)}
                >
                  <option value="">Todas las facultades</option>
                  <!-- Add faculties dynamically -->
                </select>
              </div>

              <div class="filter-group">
                <label for="pregrado-filter">Pregrado</label>
                <select 
                  id="pregrado-filter"
                  bind:value={filters.pregrado}
                  on:change={() => handleAdvancedFilter('pregrado', filters.pregrado)}
                >
                  <option value="">Todos los pregrados</option>
                  <!-- Add programs dynamically -->
                </select>
              </div>

              <!-- Academic filters -->
              <div class="filter-group">
                <label for="curso-filter">Curso</label>
                <select 
                  id="curso-filter"
                  bind:value={filters.curso}
                  on:change={() => handleAdvancedFilter('curso', filters.curso)}
                >
                  <option value="">Todos los cursos</option>
                  <!-- Add courses dynamically -->
                </select>
              </div>

              <div class="filter-group">
                <label for="tipo-filter">Tipo</label>
                <select 
                  id="tipo-filter"
                  bind:value={filters.tipo}
                  on:change={() => handleAdvancedFilter('tipo', filters.tipo)}
                >
                  <option value="">Todos los tipos</option>
                  <!-- Add types dynamically -->
                </select>
              </div>

              <div class="filter-group">
                <label for="area-filter">Área</label>
                <select 
                  id="area-filter"
                  bind:value={filters.area}
                  on:change={() => handleAdvancedFilter('area', filters.area)}
                >
                  <option value="">Todas las áreas</option>
                  <!-- Add areas dynamically -->
                </select>
              </div>

              <!-- Additional filters -->
              <div class="filter-group">
                <label for="semestre-filter">Semestre</label>
                <select 
                  id="semestre-filter"
                  bind:value={filters.semestre}
                  on:change={() => handleAdvancedFilter('semestre', filters.semestre)}
                >
                  <option value="">Todos los semestres</option>
                  {#each Array(10) as _, i}
                    <option value={i + 1}>Semestre {i + 1}</option>
                  {/each}
                </select>
              </div>

              <div class="filter-group">
                <label for="publicado-filter">Estado de publicación</label>
                <select 
                  id="publicado-filter"
                  bind:value={filters.publicado}
                  on:change={() => handleAdvancedFilter('publicado', filters.publicado)}
                >
                  <option value="all">Todos</option>
                  <option value="true">Publicados</option>
                  <option value="false">No publicados</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="acceso-filter">Acceso</label>
                <select 
                  id="acceso-filter"
                  bind:value={filters.acceso}
                  on:change={() => handleAdvancedFilter('acceso', filters.acceso)}
                >
                  <option value="">Todos los accesos</option>
                  <!-- Add access types dynamically -->
                </select>
              </div>
            </div>

            <div class="filters-actions">
              <button class="clear-filters" on:click={clearFilters}>
                <i class="fas fa-times"></i>
                Limpiar filtros
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>

<style>
  .study-header {
    position: relative;
    background: linear-gradient(to right, #ffffff, #f8fafc);
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
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
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
    line-height: 1.2;
  }

  .subtitle {
    color: #6b7280;
    font-size: 1.1rem;
  }

  .stats-section {
    display: flex;
    gap: 1rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    background: white;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .stat-card i {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  }

  .stat-card.total i {
    background: #dbeafe;
    color: #2563eb;
  }

  .stat-card.completed i {
    background: #d1fae5;
    color: #059669;
  }

  .stat-card.progress i {
    background: #fef3c7;
    color: #d97706;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  .filters-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .search-box {
    position: relative;
  }

  .search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .search-box input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
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
  }

  .filters-container {
    position: relative;
  }

  .filter-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    color: #4b5563;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .filter-toggle.active {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .filters-panel {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    z-index: 10;
    animation: slideDown 0.3s ease-out;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .filter-group select {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    color: #1f2937;
    background-color: white;
    transition: all 0.2s ease;
  }

  .filter-group select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .status-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .status-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #6b7280;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .status-option:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .status-option.active {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #1d4ed8;
  }

  .filters-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .clear-filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    color: #6b7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .clear-filters:hover {
    color: #ef4444;
  }

  @media (max-width: 1024px) {
    .header-top {
      flex-direction: column;
      gap: 1.5rem;
    }

    .stats-section {
      width: 100%;
    }

    .stat-card {
      flex: 1;
    }
  }

  @media (max-width: 768px) {
    .header-content {
      padding: 1.5rem;
    }

    .stats-section {
      flex-direction: column;
    }

    .stat-card {
      width: 100%;
    }

    .filters-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }
  }

  @media (max-width: 640px) {
    .title-section h1 {
      font-size: 1.5rem;
    }

    .subtitle {
      font-size: 0.875rem;
    }

    .filters-grid {
      grid-template-columns: 1fr;
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>