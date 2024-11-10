<!-- src/lib/routes/evaluaciones/+page.svelte -->

<script>
  import { onMount } from 'svelte';
  import { getEvaluaciones } from '$lib/api/evaluaciones/evaluaciones';
  import { sessionStore } from '$lib/stores/sessionStore';
  import EvaluacionCard from '$lib/components/evaluacion/EvaluacionCard.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  let evaluaciones = [];
  let isLoading = true;
  let error = null;
  let searchTerm = '';
  let selectedType = '';
  let selectedStatus = '';
  let sortBy = 'fecha_inicio';

  const evaluacionesPerPage = 20;
  let currentPage = 1;

  $: filteredEvaluaciones = Array.isArray(evaluaciones) 
  ? evaluaciones
      .filter(evaluacion => {
        console.log('Filtering evaluacion:', evaluacion);
        return evaluacion.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter(evaluacion => !selectedType || evaluacion.tipo === selectedType)
      .filter(evaluacion => {
        if (!selectedStatus) return true;
        const now = new Date();
        const endDate = new Date(evaluacion.fecha_fin);
        return selectedStatus === 'active' ? endDate > now : endDate <= now;
      })
  : [];

$: sortedEvaluaciones = sortEvaluaciones(filteredEvaluaciones, sortBy);

  $: paginatedEvaluaciones = sortedEvaluaciones.slice(
    (currentPage - 1) * evaluacionesPerPage,
    currentPage * evaluacionesPerPage
  );

  $: totalPages = Math.ceil(sortedEvaluaciones.length / evaluacionesPerPage);

  onMount(async () => {
  if (!$sessionStore.isAuthenticated) {
    goto('/login');
    return;
  }
  await loadEvaluaciones();
});

async function loadEvaluaciones() {
  isLoading = true;
  error = null;
  try {
    const authToken = $sessionStore.access;
    if (!authToken) {
      throw new Error('No auth token provided');
    }
    const result = await getEvaluaciones(authToken);
    console.log('Fetched evaluaciones:', result);
    if (Array.isArray(result)) {
      evaluaciones = result;
    } else if (result && Array.isArray(result.results)) {
      evaluaciones = result.results;
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (e) {
    console.error('Error fetching evaluaciones:', e);
    error = e.message;
  } finally {
    isLoading = false;
  }
}

function sortEvaluaciones(evaluaciones, criteria) {
  if (!Array.isArray(evaluaciones)) {
    console.error('sortEvaluaciones received non-array:', evaluaciones);
    return [];
  }
  switch (criteria) {
    case 'fecha_inicio':
      return [...evaluaciones].sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
    case 'titulo':
      return [...evaluaciones].sort((a, b) => a.titulo.localeCompare(b.titulo));
    case 'tipo':
      return [...evaluaciones].sort((a, b) => a.tipo.localeCompare(b.tipo));
    default:
      return evaluaciones;
  }
}

  function resetFilters() {
    searchTerm = '';
    selectedType = '';
    selectedStatus = '';
    sortBy = 'fecha_inicio';
    currentPage = 1;
  }

  function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
    }
  }
</script>

<main>
  <div class="evaluaciones-container">
    <div class="search-container">
      <input 
        type="text" 
        bind:value={searchTerm} 
        placeholder="Buscar evaluaciones..." 
        class="search-input"
      />
    </div>

    <div class="evaluaciones-header">
      <h1>Explora tus evaluaciones</h1>
      <div class="sort-container">
        <label for="sort-select">Ordenar por:</label>
        <select id="sort-select" bind:value={sortBy}>
          <option value="fecha_inicio">Fecha de inicio</option>
          <option value="titulo">Título</option>
          <option value="tipo">Tipo</option>
        </select>
      </div>
    </div>

    {#if isLoading}
      <div class="loading" in:fade={{ duration: 300, delay: 300 }}>
        <div class="loader"></div>
        <p class="loading-text">Cargando evaluaciones...</p>
      </div>
    {:else if error}
      <div class="error" in:fade={{ duration: 300 }}>Error: {error}</div>
    {:else}
      <div class="evaluaciones-grid" in:fade={{ duration: 300 }}>
        {#each paginatedEvaluaciones as evaluacion (evaluacion.id)}
          <div in:fly={{ y: 20, duration: 300, delay: 300, easing: quintOut }}>
            <EvaluacionCard {evaluacion} />
          </div>
        {/each}
      </div>
      {#if paginatedEvaluaciones.length === 0}
        <div class="no-results" in:fade={{ duration: 300 }}>
          No se encontraron evaluaciones que coincidan con tus criterios de búsqueda.
        </div>
      {/if}
    {/if}

    <div class="pagination">
      <button on:click={() => changePage(1)} disabled={currentPage === 1}>«</button>
      <button on:click={() => changePage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
      {#each Array(totalPages) as _, i}
        {#if i + 1 === currentPage || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
          <button class:active={currentPage === i + 1} on:click={() => changePage(i + 1)}>{i + 1}</button>
        {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
          <span>...</span>
        {/if}
      {/each}
      <button on:click={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
      <button on:click={() => changePage(totalPages)} disabled={currentPage === totalPages}>»</button>
    </div>
  </div>

  <div class="filter-panel">
    <h2>Filtros</h2>
    <div class="filter-section">
      <label for="type-select">Tipo de evaluación</label>
      <select id="type-select" bind:value={selectedType}>
        <option value="">Todos los tipos</option>
        <option value="Examen">Examen</option>
        <option value="Quiz">Quiz</option>
        <option value="Tarea">Tarea</option>
      </select>
    </div>
    <div class="filter-section">
      <label for="status-select">Estado</label>
      <select id="status-select" bind:value={selectedStatus}>
        <option value="">Todos los estados</option>
        <option value="active">Activas</option>
        <option value="expired">Expiradas</option>
      </select>
    </div>
    <button class="reset-filters" on:click={resetFilters}>Restablecer filtros</button>
  </div>
</main>

<style>
  main {
    display: flex;
    max-width: 1600px;
    margin: 0 auto;
    padding: 40px 20px;
    gap: 40px;
  }

  .evaluaciones-container {
    flex-grow: 1;
    order: 1;
  }

  .search-container {
    margin-bottom: 20px;
  }

  .search-input {
    width: 100%;
    padding: 12px 20px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .evaluaciones-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .evaluaciones-header h1 {
    font-size: 2rem;
    color: #1a202c;
  }

  .sort-container {
    display: flex;
    align-items: center;
  }

  .sort-container label {
    margin-right: 10px;
    font-weight: 600;
  }

  .sort-container select {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background-color: white;
    font-size: 0.9rem;
  }

  .filter-panel {
    width: 300px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 20px;
    height: fit-content;
    order: 2;
  }

  .filter-panel h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #2d3748;
  }

  .filter-section {
    margin-bottom: 20px;
  }

  .filter-section label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #4a5568;
  }

  .filter-section select {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background-color: white;
    font-size: 0.9rem;
  }

  .reset-filters {
    width: 100%;
    padding: 10px;
    background-color: #EDF2F7;
    border: none;
    border-radius: 6px;
    color: #4A5568;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .reset-filters:hover {
    background-color: #E2E8F0;
  }

  .evaluaciones-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .loading, .error, .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
    width: 100%;
  }

  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #6366F1;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    font-size: 1.2rem;
    color: #4B5563;
  }

  .error {
    color: #EF4444;
    font-size: 1.2rem;
  }

  .no-results {
    color: #4B5563;
    font-size: 1.2rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    gap: 10px;
  }

  .pagination button {
    background-color: #EDF2F7;
    border: none;
    color: #4A5568;
    padding: 8px 16px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    margin: 4px 2px;
    cursor: pointer;
    transition: background-color 0.3s;
    border-radius: 4px;
  }

  .pagination button:hover:not(:disabled) {
    background-color: #E2E8F0;
  }

  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination button.active {
    background-color: #6366F1;
    color: white;
  }

  @media (max-width: 1200px) {
    main {
      flex-direction: column;
    }

    .filter-panel {
      width: 100%;
      order: 1;
      position: static;
      margin-bottom: 20px;
    }

    .evaluaciones-container {
      order: 2;
    }
  }

  @media (max-width: 768px) {
    .evaluaciones-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .sort-container {
      margin-top: 10px;
    }
  }
</style>