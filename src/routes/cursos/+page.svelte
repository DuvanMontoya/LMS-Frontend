<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { sessionStore } from '$lib/stores/sessionStore';
  import { getCourses } from '$lib/api/cursos/cursos';
  import CursoCard from '$lib/components/curso/CursoCard.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  let cursos = [];
  let isLoading = true;
  let error = null;
  let searchTerm = '';
  let selectedCategory = '';
  let selectedLevel = '';
  let selectedModality = '';
  let priceRange = 1000000;
  let ratingFilter = 0;
  let sortBy = 'relevance';

  let allCategories = [];
  let allLevels = [];
  let allModalities = [];

  let currentPage = 1;
  const coursesPerPage = 20;

  $: filteredCursos = cursos
    .filter(curso => curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(curso => !selectedCategory || curso.categoria?.nombre === selectedCategory)
    .filter(curso => !selectedLevel || curso.dificultad === selectedLevel)
    .filter(curso => !selectedModality || curso.modalidad === selectedModality)
    .filter(curso => parseFloat(curso.precio) <= priceRange)
    .filter(curso => parseFloat(curso.calificacion_promedio) >= ratingFilter);

  $: sortedCursos = sortCursos(filteredCursos, sortBy);

  $: paginatedCursos = sortedCursos.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);

  $: totalPages = Math.ceil(sortedCursos.length / coursesPerPage);

  function sortCursos(cursos, criteria) {
    switch (criteria) {
      case 'price-asc':
        return [...cursos].sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
      case 'price-desc':
        return [...cursos].sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
      case 'rating':
        return [...cursos].sort((a, b) => parseFloat(b.calificacion_promedio) - parseFloat(a.calificacion_promedio));
      case 'newest':
        return [...cursos].sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
      default:
        return cursos;
    }
  }

  onMount(async () => {
    if (!$sessionStore.isAuthenticated) {
      goto('/login');
      return;
    }
    await loadCourses();
  });

  async function loadCourses() {
    isLoading = true;
    error = null;
    try {
      const authToken = $sessionStore.access;
      if (!authToken) {
        throw new Error('No auth token provided');
      }
      const data = await getCourses(authToken);
      if (data && data.results && Array.isArray(data.results)) {
        cursos = data.results;
        console.log('Cursos cargados:', cursos);
        allCategories = ['', ...new Set(cursos.map(curso => curso.categoria?.nombre).filter(Boolean))];
        allLevels = ['', ...new Set(cursos.map(curso => curso.dificultad).filter(Boolean))];
        allModalities = ['', ...new Set(cursos.map(curso => curso.modalidad).filter(Boolean))];
      } else {
        cursos = [];
      }
    } catch (e) {
      console.error('Error fetching courses:', e);
      error = e.message;
    } finally {
      isLoading = false;
    }
  }

  function resetFilters() {
    searchTerm = '';
    selectedCategory = '';
    selectedLevel = '';
    selectedModality = '';
    priceRange = 1000000;
    ratingFilter = 0;
    sortBy = 'relevance';
    currentPage = 1;
  }

  function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
    }
  }
</script>

<main>
  <div class="cursos-container">
    <div class="search-container">
      <input 
        type="text" 
        bind:value={searchTerm} 
        placeholder="Buscar cursos..." 
        class="search-input"
      />
    </div>

    <div class="cursos-header">
      <h1>Explora nuestros cursos</h1>
      <div class="sort-container">
        <label for="sort-select">Ordenar por:</label>
        <select id="sort-select" bind:value={sortBy}>
          <option value="relevance">Relevancia</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="rating">Calificación</option>
          <option value="newest">Más recientes</option>
        </select>
      </div>
    </div>

    {#if isLoading}
      <div class="loading" in:fade={{ duration: 300, delay: 300 }}>
        <div class="loader"></div>
        <p class="loading-text">Cargando cursos...</p>
      </div>
    {:else if error}
      <div class="error" in:fade={{ duration: 300 }}>Error: {error}</div>
    {:else if cursos.length === 0}
      <div class="no-results" in:fade={{ duration: 300 }}>
        No se encontraron cursos. ¡Sé el primero en crear uno!
      </div>
    {:else}
      <div class="cursos-grid" in:fade={{ duration: 300 }}>
        {#each paginatedCursos as curso (curso.id)}
          <div in:fly={{ y: 20, duration: 300, delay: 300, easing: quintOut }}>
            <CursoCard {curso} />
          </div>
        {/each}
      </div>
      {#if paginatedCursos.length === 0}
        <div class="no-results" in:fade={{ duration: 300 }}>
          No se encontraron cursos que coincidan con tus criterios de búsqueda.
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
      <label for="category-select">Categoría</label>
      <select id="category-select" bind:value={selectedCategory}>
        <option value="">Todas las categorías</option>
        {#each allCategories as category}
          {#if category}
            <option value={category}>{category}</option>
          {/if}
        {/each}
      </select>
    </div>
    <div class="filter-section">
      <label for="level-select">Nivel</label>
      <select id="level-select" bind:value={selectedLevel}>
        <option value="">Todos los niveles</option>
        {#each allLevels as level}
          {#if level}
            <option value={level}>{level}</option>
          {/if}
        {/each}
      </select>
    </div>
    <div class="filter-section">
      <label for="modality-select">Modalidad</label>
      <select id="modality-select" bind:value={selectedModality}>
        <option value="">Todas las modalidades</option>
        {#each allModalities as modality}
          {#if modality}
            <option value={modality}>{modality}</option>
          {/if}
        {/each}
      </select>
    </div>
    <div class="filter-section">
      <label for="price-range">Precio máximo: {priceRange}$</label>
      <input type="range" id="price-range" bind:value={priceRange} min="0" max="1000000" step="10000">
    </div>
    <div class="filter-section">
      <label for="rating-filter">Calificación mínima: {ratingFilter}</label>
      <input type="range" id="rating-filter" bind:value={ratingFilter} min="0" max="5" step="0.5">
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
  
    .cursos-container {
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
  
    .cursos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
  
    .cursos-header h1 {
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
  
    .filter-section select,
    .filter-section input[type="range"] {
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
  
    .cursos-grid {
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
  
      .cursos-container {
        order: 2;
      }
    }
  
    @media (max-width: 768px) {
      .cursos-header {
        flex-direction: column;
        align-items: flex-start;
      }
  
      .sort-container {
        margin-top: 10px;
      }
    }
  </style>