 <!-- src/routes/study/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { sessionStore } from '$lib/stores/sessionStore';
  import studyService from '$lib/api/study/studyService';
  
  import ArticleCard from '$lib/components/study/Articulos/ArticleCard.svelte';
  import StudyHeader from '$lib/components/study/Articulos/StudyHeader.svelte';
  
  let articles = [];
  let isLoading = true;
  let error = null;
  let searchQuery = '';
  let filterStatus = 'all';

  onMount(async () => {
    try {
      const token = $sessionStore.access;
      const response = await studyService.getMyStudies(token);
      articles = response;
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  });

  $: filteredArticles = articles.filter(article => {
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!article.titulo.toLowerCase().includes(query) &&
          !article.descripcion.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Filtrar por estado
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed' && article.progreso?.progreso !== 100) return false;
      if (filterStatus === 'in-progress' && 
          (article.progreso?.progreso === 0 || article.progreso?.progreso === 100)) return false;
      if (filterStatus === 'not-started' && article.progreso?.progreso > 0) return false;
    }
    
    return true;
  });
</script>

<svelte:head>
  <title>Mis Artículos de Estudio</title>
</svelte:head>

<div class="study-page">
  <StudyHeader bind:searchQuery bind:filterStatus />
  
  <main class="content">
    {#if isLoading}
      <!-- <LoadingSpinner /> -->
    {:else if error}
      <!-- <ErrorMessage message={error} /> -->
    {:else if filteredArticles.length === 0}
      <div class="empty-state">
        <i class="fas fa-book-open text-4xl text-gray-400 mb-4"></i>
        {#if articles.length === 0}
          <h3 class="text-xl font-semibold mb-2">No hay artículos para estudiar</h3>
          <p class="text-gray-600">Aún no has comenzado a estudiar ningún artículo.</p>
        {:else}
          <h3 class="text-xl font-semibold mb-2">No se encontraron resultados</h3>
          <p class="text-gray-600">Prueba con otros filtros de búsqueda.</p>
        {/if}
      </div>
    {:else}
      <div class="articles-grid">
        {#each filteredArticles as article (article.id)}
          <ArticleCard {article} />
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  .study-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .content {
    margin-top: 2rem;
  }

  .articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    padding: 1rem 0;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .study-page {
      padding: 1rem;
    }
  }
</style>