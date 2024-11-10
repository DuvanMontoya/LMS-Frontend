<script>
  import { onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import {
    articles,
    categories,
    areas,
    subjects,
    searchQuery,
    currentPage,
    sessionStore,
  } from "$lib/stores/sessionStore";
  import ArticleCard from "$lib/components/articulo/ArticleCard.svelte";
  import {
    fetchArticulos,
    fetchCategorias,
    fetchAreas,
    fetchTemas,
    fetchUniversidad,
  } from "$lib/api/articulos/articulos";

  let filteredArticles = [];
  let isLoading = true;
  let error = null;
  let searchTerm = "";
  let selectedCategory = "";
  let selectedArea = "";
  let selectedUniversity = "";
  let selectedProgram = "";
  let selectedCourse = "";
  let selectedType = "";
  let accessFilter = "all";
  let hasAttachmentFilter = "all";
  let sortBy = "relevance";
  let isFilterPanelOpen = false;

  const articlesPerPage = 10;

  function handleError(message, err) {
    console.error(message, err);
    error =
      "Hubo un problema al cargar los datos. Por favor, intenta de nuevo más tarde.";
  }

  function ensureNumber(value, defaultValue = 0) {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  function cleanArticleData(article) {
    return {
      id: ensureNumber(article.id, 0),
      titulo: article.titulo || "Sin título",
      descripcion: article.descripcion || "Sin descripción",
      imagen_url: article.imagen_url || "/default-image.jpg",
      creado: article.creado || new Date().toISOString(),
      universidad: article.universidad || { id: 0, nombre: "Sin universidad" },
      pregrado: article.pregrado || { id: 0, nombre: "Sin pregrado" },
      curso: article.curso || { id: 0, nombre: "Sin curso" },
      tipo: article.tipo || { id: 0, nombre: "No especificado" },
      area: article.area || { id: 0, nombre: "Sin área" },
      categoria_articulo: article.categoria_articulo || {
        id: 0,
        nombre: "Sin categoría",
      },
      autor: typeof article.autor === 'string' ? article.autor : (article.autor?.nombre || "Autor desconocido"),
      nivel: article.nivel || "No especificado",
      acceso: article.acceso || "gratuito",
      num_vistas: ensureNumber(article.num_vistas, 0),
      calificacion_promedio: ensureNumber(article.calificacion_promedio, 0),
      num_favoritos: ensureNumber(article.num_favoritos, 0),
      es_destacado: article.es_destacado || false,
      archivo_adjunto: article.archivo_adjunto || null,
      archivo_url: article.archivo_url || null,
    };
  }

  onMount(async () => {
    try {
      const [
        articulosResponse,
        categoriasResponse,
        areasResponse,
        temasResponse,
        universidadesResponse
      ] = await Promise.all([
        fetchArticulos($sessionStore.access),
        fetchCategorias($sessionStore.access),
        fetchAreas($sessionStore.access),
        fetchTemas($sessionStore.access),
        fetchUniversidad($sessionStore.access),
      ]);

      const articulosArray = Array.isArray(articulosResponse.results) ? articulosResponse.results : [];
      articles.set(articulosArray.map(cleanArticleData));

      categories.set(Array.isArray(categoriasResponse.results) ? categoriasResponse.results : []);
      areas.set(Array.isArray(areasResponse.results) ? areasResponse.results : []);
      subjects.set(Array.isArray(temasResponse.results) ? temasResponse.results : []);

      updateFilteredArticles();
    } catch (err) {
      handleError("Error al cargar los datos", err);
    } finally {
      isLoading = false;
    }
  });

  $: {
    if ($articles.length) {
      updateFilteredArticles();
    }
  }

  function updateFilteredArticles() {
    let filtered = $articles;

    if (!Array.isArray(filtered)) {
      console.error("$articles no es un array:", filtered);
      filtered = [];
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.titulo.toLowerCase().includes(query) ||
          article.descripcion.toLowerCase().includes(query) ||
          (typeof article.autor === 'string' ? article.autor.toLowerCase().includes(query) : false),
      );
    }

    if (selectedUniversity) {
      filtered = filtered.filter(
        (article) => article.universidad?.id === parseInt(selectedUniversity),
      );
    }

    if (selectedProgram) {
      filtered = filtered.filter(
        (article) => article.pregrado?.id === parseInt(selectedProgram),
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter(
        (article) => article.curso?.id === parseInt(selectedCourse),
      );
    }

    if (selectedArea) {
      filtered = filtered.filter(
        (article) => article.area?.id === parseInt(selectedArea),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (article) =>
          article.categoria_articulo?.id === parseInt(selectedCategory),
      );
    }

    if (selectedType) {
      filtered = filtered.filter(
        (article) => article.tipo?.id === parseInt(selectedType),
      );
    }

    if (accessFilter !== "all") {
      filtered = filtered.filter((article) => article.acceso === accessFilter);
    }

    if (hasAttachmentFilter !== "all") {
      filtered = filtered.filter((article) =>
        hasAttachmentFilter === "yes"
          ? article.archivo_adjunto
          : !article.archivo_adjunto,
      );
    }

    filtered = sortArticles(filtered, sortBy);

    filteredArticles = filtered;
  }

  function sortArticles(articles, criteria) {
    switch (criteria) {
      case "date-asc":
        return [...articles].sort(
          (a, b) => new Date(a.creado) - new Date(b.creado),
        );
      case "date-desc":
        return [...articles].sort(
          (a, b) => new Date(b.creado) - new Date(a.creado),
        );
      case "title-asc":
        return [...articles].sort((a, b) => a.titulo.localeCompare(b.titulo));
      case "title-desc":
        return [...articles].sort((a, b) => b.titulo.localeCompare(a.titulo));
      case "views":
        return [...articles].sort((a, b) => b.num_vistas - a.num_vistas);
      case "rating":
        return [...articles].sort(
          (a, b) => b.calificacion_promedio - a.calificacion_promedio,
        );
      default:
        return articles;
    }
  }

  function resetFilters() {
    searchTerm = "";
    selectedCategory = "";
    selectedArea = "";
    selectedUniversity = "";
    selectedProgram = "";
    selectedCourse = "";
    selectedType = "";
    accessFilter = "all";
    hasAttachmentFilter = "all";
    sortBy = "relevance";
    currentPage.set(1);
    updateFilteredArticles();
  }

  function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage.set(newPage);
    }
  }

  function toggleFilterPanel() {
    isFilterPanelOpen = !isFilterPanelOpen;
  }

  $: totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  $: paginatedArticles = filteredArticles.slice(
    ($currentPage - 1) * articlesPerPage,
    $currentPage * articlesPerPage,
  );
</script>

<svelte:head>
  <title>Soluciones académicas paso a paso | LAILA</title>
  <meta
    name="description"
    content="Accede a soluciones detalladas para tus actividades académicas. Encuentra ayuda para talleres, evaluaciones y más en diversas áreas del conocimiento."
  />
</svelte:head>

<main>
  <div class="page-layout">
    <div class="content-area">
      <div class="search-and-sort">
        <div class="search-container">
          <input
            type="text"
            bind:value={searchTerm}
            on:input={updateFilteredArticles}
            placeholder="Buscar soluciones..."
            class="search-input"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
        <div class="sort-container">
          <label for="sort-select">Ordenar por:</label>
          <select
            id="sort-select"
            bind:value={sortBy}
            on:change={updateFilteredArticles}
          >
            <option value="relevance">Relevancia</option>
            <option value="date-desc">Fecha: Más recientes</option>
            <option value="date-asc">Fecha: Más antiguos</option>
            <option value="title-asc">Título: A-Z</option>
            <option value="title-desc">Título: Z-A</option>
            <option value="views">Más vistos</option>
            <option value="rating">Mejor calificados</option>
          </select>
        </div>
      </div>

      {#if isLoading}
        <div class="loading" in:fade={{ duration: 300, delay: 300 }}>
          <div class="loader"></div>
          <p class="loading-text">Cargando soluciones académicas...</p>
        </div>
      {:else if error}
        <div class="error" in:fade={{ duration: 300 }}>
          <p>{error}</p>
          <button class="btn btn-primary" on:click={() => window.location.reload()}>Intentar de nuevo</button>
        </div>
      {:else}
        <div class="articles-list" in:fade={{ duration: 300 }}>
          {#each paginatedArticles as article (article.id)}
            <div
              class="article-item"
              in:fly={{ y: 20, duration: 300, delay: 300, easing: quintOut }}
            >
              <ArticleCard {article} />
            </div>
          {/each}
        </div>
        {#if paginatedArticles.length === 0}
          <div class="no-results" in:fade={{ duration: 300 }}>
            <i class="fas fa-search fa-3x"></i>
            <p>
              No se encontraron soluciones que coincidan con tus criterios de
              búsqueda.
            </p>
            <button class="reset-search" on:click={resetFilters}
              >Restablecer búsqueda</button
            >
          </div>
        {/if}
      {/if}

      <div class="pagination">
        <button on:click={() => changePage(1)} disabled={$currentPage === 1}>
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button
          on:click={() => changePage($currentPage - 1)}
          disabled={$currentPage === 1}
        >
          <i class="fas fa-angle-left"></i>
        </button>
        {#each Array(totalPages) as _, i}
          {#if i + 1 === $currentPage || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= $currentPage - 1 && i + 1 <= $currentPage + 1)}
            <button
              class:active={$currentPage === i + 1}
              on:click={() => changePage(i + 1)}>{i + 1}</button
            >
          {:else if i + 1 === $currentPage - 2 || i + 1 === $currentPage + 2}
            <span>...</span>
          {/if}
        {/each}
        <button
          on:click={() => changePage($currentPage + 1)}
          disabled={$currentPage === totalPages}
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button
          on:click={() => changePage(totalPages)}
          disabled={$currentPage === totalPages}
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>

    <aside class="filter-panel" class:open={isFilterPanelOpen}>
      <h2>Filtros avanzados</h2>

      <div class="filter-section">
        <label for="university-select">Universidad</label>
        <select
          id="university-select"
          bind:value={selectedUniversity}
          on:change={updateFilteredArticles}
        >
          <option value="">Todas las universidades</option>
          {#each $articles
            .map((a) => a.universidad)
            .filter((v, i, a) => a.findIndex((t) => t?.id === v?.id) === i) as university}
            {#if university}
              <option value={university.id}>{university.nombre}</option>
            {/if}
          {/each}
        </select>
      </div>

      <div class="filter-section">
        <label for="program-select">Programa</label>
        <select
          id="program-select"
          bind:value={selectedProgram}
          on:change={updateFilteredArticles}
        >
          <option value="">Todos los programas</option>
          {#each $articles
            .map((a) => a.pregrado)
            .filter((v, i, a) => a.findIndex((t) => t?.id === v?.id) === i) as program}
            {#if program}
              <option value={program.id}>{program.nombre}</option>
            {/if}
          {/each}
        </select>
      </div>

      <div class="filter-section">
        <label for="course-select">Curso</label>
        <select
          id="course-select"
          bind:value={selectedCourse}
          on:change={updateFilteredArticles}
        >
          <option value="">Todos los cursos</option>
          {#each $articles
            .map((a) => a.curso)
            .filter((v, i, a) => a.findIndex((t) => t?.id === v?.id) === i) as course}
            {#if course}
              <option value={course.id}>{course.nombre}</option>
            {/if}
          {/each}
        </select>
      </div>

      <div class="filter-section">
        <label for="area-select">Área</label>
        <select
          id="area-select"
          bind:value={selectedArea}
          on:change={updateFilteredArticles}
        >
          <option value="">Todas las áreas</option>
          {#each $areas as area}
            <option value={area.id}>{area.nombre}</option>
          {/each}
        </select>
      </div>

      <div class="filter-section">
        <label for="category-select">Categoría</label>
        <select
          id="category-select"
          bind:value={selectedCategory}
          on:change={updateFilteredArticles}
        >
          <option value="">Todas las categorías</option>
          {#each $categories as category}
            <option value={category.id}>{category.nombre}</option>
          {/each}
        </select>
      </div>

      <div class="filter-section">
        <label for="type-select">Tipo de actividad</label>
        <select
          id="type-select"
          bind:value={selectedType}
          on:change={updateFilteredArticles}
        >
          <option value="">Todos los tipos</option>
          {#each $articles
            .map((a) => a.tipo)
            .filter((v, i, a) => a.findIndex((t) => t?.id === v?.id) === i) as type}
            {#if type}
              <option value={type.id}>{type.nombre}</option>
            {/if}
          {/each}
        </select>
      </div>

      <div class="filter-section">
        <label for="access-select">Acceso</label>
        <select
          id="access-select"
          bind:value={accessFilter}
          on:change={updateFilteredArticles}
        >
          <option value="all">Todos</option>
          <option value="gratuito">Gratuito</option>
          <option value="pago">De pago</option>
        </select>
      </div>

      <div class="filter-section">
        <label for="attachment-select">Archivo adjunto</label>
        <select
          id="attachment-select"
          bind:value={hasAttachmentFilter}
          on:change={updateFilteredArticles}
        >
          <option value="all">Todos</option>
          <option value="yes">Con archivo</option>
          <option value="no">Sin archivo</option>
        </select>
      </div>

      <button class="reset-filters" on:click={resetFilters}
        >Restablecer filtros</button
      >
    </aside>
  </div>
</main>

<button class="filter-toggle" on:click={toggleFilterPanel}>
  <i class="fas {isFilterPanelOpen ? 'fa-times' : 'fa-filter'}"></i>
</button>

<style>
  :root {
    --primary-color: #4f46e5;
    --secondary-color: #3b82f6;
    --accent-color: #10b981;
    --background-color: #f3f4f6;
    --text-color: #1f2937;
    --border-color: #e5e7eb;
    --shadow-color: rgba(0, 0, 0, 0.1);
  }

  main {
    max-width: 1800px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: 'Poppins', sans-serif;
    color: var(--text-color);
    background-color: var(--background-color);
  }

  .page-layout {
    display: flex;
    gap: 40px;
  }

  .content-area {
    flex: 1;
  }

  .filter-panel {
    width: 300px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px var(--shadow-color);
    position: sticky;
    top: 20px;
    height: calc(100vh - 40px);
    overflow-y: auto;
    transition: all 0.3s ease;
  }

  .search-and-sort {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;
    background-color: white;
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 4px var(--shadow-color);
  }

  .search-container {
    flex-grow: 1;
    max-width: 500px;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    border: 2px solid var(--border-color);
    border-radius: 9999px;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }

  .search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary-color);
    font-size: 1.2rem;
  }

 
  .sort-container {
    display: flex;
    align-items: center;
  }

  .sort-container label {
    margin-right: 10px;
    font-weight: 600;
    color: var(--text-color);
  }

  .sort-container select,
  .filter-section select {
    padding: 10px 15px;
    border-radius: 9999px;
    border: 2px solid var(--border-color);
    background-color: white;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234f46e5'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 20px;
    padding-right: 40px;
  }

  .sort-container select:focus,
  .filter-section select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }

  .filter-panel h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: var(--primary-color);
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 10px;
  }

  .filter-section {
    margin-bottom: 20px;
  }

  .filter-section label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--text-color);
  }

  .filter-section select {
    width: 100%;
  }

  .reset-filters {
    width: 100%;
    padding: 12px;
    background-color: var(--accent-color);
    border: none;
    border-radius: 9999px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .reset-filters:hover {
    background-color: #0ea5e9;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .articles-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .article-item {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px var(--shadow-color);
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .article-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px var(--shadow-color);
  }

  .loading,
  .error,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px var(--shadow-color);
    padding: 40px;
  }

  .loader {
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
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

  .loading-text,
  .error,
  .no-results {
    font-size: 1.2rem;
    color: var(--text-color);
  }

  .no-results i {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 3rem;
  }

  .reset-search {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .reset-search:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    gap: 10px;
  }

  .pagination button {
    background-color: white;
    border: 2px solid var(--border-color);
    color: var(--text-color);
    padding: 10px 15px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    margin: 4px 2px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 9999px;
  }

  .pagination button:hover:not(:disabled) {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }

  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination button.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .filter-toggle {
    display: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 1001;
    transition: all 0.3s ease;
  }

  .filter-toggle:hover {
    background-color: var(--secondary-color);
    transform: scale(1.1);
  }

  @media (max-width: 1200px) {
    .page-layout {
      flex-direction: column;
    }

    .filter-panel {
      width: 100%;
      height: auto;
      position: static;
      margin-bottom: 20px;
    }
  }

  @media (max-width: 768px) {
    .search-and-sort {
      flex-direction: column;
    }

    .search-container,
    .sort-container {
      width: 100%;
    }

    .filter-panel {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
    }

    .filter-panel.open {
      transform: translateX(0);
    }

    .filter-toggle {
      display: flex;
    }
  }

  @media (max-width: 480px) {
    main {
      padding: 20px 10px;
    }

    .pagination button {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
</style>