<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import {
    articles,
    categories,
    areas,
    subjects,
    searchQuery,
    currentPage,
    sessionStore,
  } from '$lib/stores/sessionStore';
  import { 
    fetchArticulos,
    fetchCategorias,
    fetchAreas,
    fetchTemas,
    fetchUniversidad,
  } from '$lib/api/articulos/articulos';

  // Importar componentes
  import SearchBar from '$lib/components/articulo/SearchBar.svelte';
  import SortDropdown from '$lib/components/articulo/SortDropdown.svelte';
  import FilterPanel from '$lib/components/articulo/FilterPanel.svelte';
  import ArticlesList from '$lib/components/articulo/ArticlesList.svelte';
  import Pagination from '$lib/components/articulo/Pagination.svelte';
  import FilterToggleButton from '$lib/components/articulo/FilterToggleButton.svelte';

  // Estado
  let filteredArticles = [];
  let isLoading = true;
  let error = null;
  let searchTerm = '';
  let sortBy = 'relevance';
  let isFilterPanelOpen = false;

  // Filtros
  let filters = {
    university: '',
    program: '',
    course: '',
    area: '',
    category: '',
    type: '',
    access: 'all',
    hasAttachment: 'all'
  };

  const articlesPerPage = 12;

  // Funciones auxiliares
  function cleanArticleData(article) {
    return {
      id: Number(article.id) || 0,
      titulo: article.titulo || 'Sin título',
      descripcion: article.descripcion || 'Sin descripción',
      imagen_url: article.imagen_url || '/default-image.jpg',
      creado: article.creado || new Date().toISOString(),
      universidad: article.universidad || { id: 0, nombre: 'Sin universidad' },
      pregrado: article.pregrado || { id: 0, nombre: 'Sin pregrado' },
      curso: article.curso || { id: 0, nombre: 'Sin curso' },
      tipo: article.tipo || { id: 0, nombre: 'No especificado' },
      area: article.area || { id: 0, nombre: 'Sin área' },
      categoria_articulo: article.categoria_articulo || { id: 0, nombre: 'Sin categoría' },
      autor: typeof article.autor === 'string' ? article.autor : (article.autor?.nombre || 'Autor desconocido'),
      nivel: article.nivel || 'No especificado',
      acceso: article.acceso || 'gratuito',
      num_vistas: Number(article.num_vistas) || 0,
      calificacion_promedio: Number(article.calificacion_promedio) || 0,
      num_favoritos: Number(article.num_favoritos) || 0,
      es_destacado: Boolean(article.es_destacado),
      archivo_adjunto: article.archivo_adjunto || null,
      archivo_url: article.archivo_url || null,
    };
  }

  // Cargar datos iniciales
  onMount(async () => {
    try {
      const token = $sessionStore.access;
      const [
        articulosResponse,
        categoriasResponse,
        areasResponse,
        temasResponse,
      ] = await Promise.all([
        fetchArticulos(token),
        fetchCategorias(token),
        fetchAreas(token),
        fetchTemas(token),
      ]);

      const articulosArray = Array.isArray(articulosResponse.results) 
        ? articulosResponse.results 
        : [];

      articles.set(articulosArray.map(cleanArticleData));
      categories.set(Array.isArray(categoriasResponse.results) ? categoriasResponse.results : []);
      areas.set(Array.isArray(areasResponse.results) ? areasResponse.results : []);
      subjects.set(Array.isArray(temasResponse.results) ? temasResponse.results : []);

      updateFilteredArticles();
    } catch (err) {
      console.error('Error loading data:', err);
      error = 'Hubo un problema al cargar los datos. Por favor, intenta de nuevo.';
    } finally {
      isLoading = false;
    }
  });

  // Funciones de filtrado y ordenamiento
  function updateFilteredArticles() {
    let filtered = $articles;

    // Buscar
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(article => 
        article.titulo.toLowerCase().includes(query) ||
        article.descripcion.toLowerCase().includes(query) ||
        (typeof article.autor === 'string' && article.autor.toLowerCase().includes(query))
      );
    }

    // Aplicar filtros
    if (filters.university) {
      filtered = filtered.filter(article => 
        article.universidad?.id === parseInt(filters.university)
      );
    }

    if (filters.program) {
      filtered = filtered.filter(article => 
        article.pregrado?.id === parseInt(filters.program)
      );
    }

    if (filters.course) {
      filtered = filtered.filter(article => 
        article.curso?.id === parseInt(filters.course)
      );
    }

    if (filters.area) {
      filtered = filtered.filter(article => 
        article.area?.id === parseInt(filters.area)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(article => 
        article.categoria_articulo?.id === parseInt(filters.category)
      );
    }

    if (filters.type) {
      filtered = filtered.filter(article => 
        article.tipo?.id === parseInt(filters.type)
      );
    }

    if (filters.access !== 'all') {
      filtered = filtered.filter(article => 
        article.acceso === filters.access
      );
    }

    if (filters.hasAttachment !== 'all') {
      filtered = filtered.filter(article => 
        filters.hasAttachment === 'yes' ? article.archivo_adjunto : !article.archivo_adjunto
      );
    }

    // Ordenar
    filtered = sortArticles(filtered, sortBy);

    filteredArticles = filtered;
  }

  function sortArticles(articles, criteria) {
    const sorted = [...articles];
    
    switch (criteria) {
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.creado) - new Date(b.creado));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.creado) - new Date(a.creado));
      case 'title-asc':
        return sorted.sort((a, b) => a.titulo.localeCompare(b.titulo));
      case 'title-desc':
        return sorted.sort((a, b) => b.titulo.localeCompare(a.titulo));
      case 'views':
        return sorted.sort((a, b) => b.num_vistas - a.num_vistas);
      case 'rating':
        return sorted.sort((a, b) => b.calificacion_promedio - a.calificacion_promedio);
      default:
        return sorted;
    }
  }

  // Event handlers
  function handleSearch(event) {
    searchTerm = event.detail;
    updateFilteredArticles();
    currentPage.set(1);
  }

  function handleSort(event) {
    sortBy = event.detail;
    updateFilteredArticles();
  }

  function handleFilter() {
    updateFilteredArticles();
    currentPage.set(1);
  }

  function handleReset() {
    searchTerm = '';
    sortBy = 'relevance';
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
    updateFilteredArticles();
    currentPage.set(1);
  }

  function handlePageChange(newPage) {
    currentPage.set(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Computed values
  $: totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  $: paginatedArticles = filteredArticles.slice(
    ($currentPage - 1) * articlesPerPage,
    $currentPage * articlesPerPage
  );
</script>

<svelte:head>
  <title>Soluciones académicas paso a paso | LAILA</title>
  <meta
    name="description"
    content="Accede a soluciones detalladas para tus actividades académicas. Encuentra ayuda para talleres, evaluaciones y más en diversas áreas del conocimiento."
  />
</svelte:head>

<main 
  class="articles-page"
  in:fade={{ duration: 300 }}
>
  <!-- Header con búsqueda y ordenamiento -->
  <header class="page-header">
    <div class="header-content">
      <div class="search-section">
        <SearchBar
          value={searchTerm}
          on:input={handleSearch}
        />
      </div>
      
      <div class="sort-section">
        <SortDropdown
          value={sortBy}
          on:change={handleSort}
        />
      </div>
    </div>
  </header>

  <div class="page-content">
    <!-- Panel de filtros -->
    <FilterPanel
      isOpen={isFilterPanelOpen}
      {filters}
      universities={$articles
        .map(a => a.universidad)
        .filter((v, i, a) => a.findIndex(t => t?.id === v?.id) === i)}
      programs={$articles
        .map(a => a.pregrado)
        .filter((v, i, a) => a.findIndex(t => t?.id === v?.id) === i)}
      courses={$articles
        .map(a => a.curso)
        .filter((v, i, a) => a.findIndex(t => t?.id === v?.id) === i)}
      areas={$areas}
      categories={$categories}
      types={$articles
        .map(a => a.tipo)
        .filter((v, i, a) => a.findIndex(t => t?.id === v?.id) === i)}
      on:filter={handleFilter}
      on:reset={handleReset}
      on:close={() => isFilterPanelOpen = false}
    />

    <!-- Lista de artículos -->
    <ArticlesList
      articles={paginatedArticles}
      {isLoading}
      {error}
      onRetry={() => window.location.reload()}
      onReset={handleReset}
    />

    <!-- Paginación -->
    {#if filteredArticles.length > 0}
      <Pagination
        currentPage={$currentPage}
        {totalPages}
        onPageChange={handlePageChange}
      />
    {/if}
  </div>

  <!-- Botón flotante de filtros -->
  <FilterToggleButton
    isOpen={isFilterPanelOpen}
    onClick={() => isFilterPanelOpen = !isFilterPanelOpen}
  />
</main>

<style>
  :root {
    --primary-50: #eef2ff;
    --primary-100: #e0e7ff;
    --primary-200: #c7d2fe;
    --primary-300: #a5b4fc;
    --primary-400: #818cf8;
    --primary-500: #6366f1;
    --primary-600: #4f46e5;
    --primary-700: #4338ca;
    --primary-800: #3730a3;
    --primary-900: #312e81;

    --accent-500: #f59e0b;
    --accent-600: #d97706;
    
    --danger-100: #fee2e2;
    --danger-500: #ef4444;
    --danger-600: #dc2626;
    --danger-700: #b91c1c;
    
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;

    --text-primary: var(--gray-900);
    --text-secondary: var(--gray-700);
    --text-muted: var(--gray-500);

    --background-main: var(--gray-50);
    --background-elevated: white;

    --primary-gradient: linear-gradient(135deg, var(--primary-600), var(--primary-500));
    --danger-gradient: linear-gradient(135deg, var(--danger-600), var(--danger-500));
    --accent-gradient: linear-gradient(135deg, var(--accent-600), var(--accent-500));

    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

    --border-radius: 0.5rem;
    --border-radius-lg: 0.75rem;
    --border-radius-full: 9999px;

    --transition-speed: 0.2s;

    --header-height: 70px;
    --filter-panel-width: 320px;
  }

  /* Temas oscuro - se activará cuando se implemente el toggle */
  :global(.dark) {
    --text-primary: var(--gray-100);
    --text-secondary: var(--gray-300);
    --text-muted: var(--gray-400);

    --background-main: var(--gray-900);
    --background-elevated: var(--gray-800);

    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
  }

  .articles-page {
    min-height: 100vh;
    background-color: var(--background-main);
    padding-bottom: 4rem;
  }

  .page-header {
    position: sticky;
    top: 0;
    background-color: var(--background-elevated);
    border-bottom: 1px solid var(--gray-200);
    padding: 1rem 0;
    z-index: 40;
    box-shadow: var(--shadow-sm);
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .search-section {
    flex: 1;
    max-width: 600px;
  }

  .sort-section {
    width: auto;
  }

  .page-content {
    max-width: 1400px;
    margin: 2rem auto 0;
    padding: 0 1.5rem;
    position: relative;
  }

  @media (max-width: 1024px) {
    .header-content {
      padding: 0 1rem;
    }

    .page-content {
      padding: 0 1rem;
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 1rem;
    }

    .search-section,
    .sort-section {
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .page-header {
      padding: 0.75rem 0;
    }

    .header-content {
      padding: 0 0.75rem;
    }

    .page-content {
      margin-top: 1.5rem;
      padding: 0 0.75rem;
    }
  }

  /* Animaciones globales */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

</style>