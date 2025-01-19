<!-- src/routes/study/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { sessionStore } from '$lib/stores/sessionStore';
  import studyService from '$lib/api/study/studyService';
  
  import ArticleCard from '$lib/components/study/Articulos/ArticleCard.svelte';
  import StudyHeader from '$lib/components/study/Articulos/StudyHeader.svelte';
  
  import Modal from '$lib/components/study/Modal.svelte'; // Asegúrate de tener este componente
  
  let articles = [];
  let isLoading = true;
  let error = null;
  let searchQuery = '';
  let filterStatus = 'all';

  // Suscribirse al store para acceder a los valores
  let isAuthenticated = false;
  let accessToken = null;
  const unsubscribe = sessionStore.subscribe(state => {
    isAuthenticated = state.isAuthenticated;
    accessToken = state.access;
  });

  // Estados para modales
  let showEnrollModal = false;
  let enrollArticleId = null;
  
  let showLoginModal = false;

  // Estado para notificaciones
  let notifications = [];

  onMount(async () => {
    try {
      if (!accessToken) {
        // Obtener artículos públicos sin token
        const publicArticles = await studyService.getPublicStudyArticles();
        articles = publicArticles;
      } else {
        // Obtener mis estudios si está autenticado
        const response = await studyService.getMyStudies(accessToken);
        articles = response;
      }
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

  // Manejar eventos emitidos desde ArticleCard
  function handleShowEnrollModal(event) {
    enrollArticleId = event.detail.articleId;
    showEnrollModal = true;
  }

  function handleShowLoginModal() {
    showLoginModal = true;
  }

  function handleNotification(event) {
    const { type, message } = event.detail;
    const id = Date.now();
    notifications = [...notifications, { id, type, message }];
  }

  function closeEnrollModal() {
    showEnrollModal = false;
    enrollArticleId = null;
  }

  function closeLoginModal() {
    showLoginModal = false;
  }

  function addNotification(type, message) {
    const id = Date.now();
    notifications = [...notifications, { id, type, message }];
  }

  function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
  }

  // Cleanup subscription
  onDestroy(() => {
    unsubscribe();
  });
</script>

<svelte:head>
  <title>Mis Artículos de Estudio</title>
</svelte:head>

<div class="study-page">
  <StudyHeader bind:searchQuery bind:filterStatus />
  
  <main class="content">
    {#if isLoading}
      <!-- Componente de carga -->
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
        <p>Cargando artículos...</p>
      </div>
    {:else if error}
      <!-- Componente de error -->
      <div class="error-state">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-semibold mb-2">Error</h3>
        <p class="text-gray-600">{error}</p>
      </div>
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
          <ArticleCard {article} 
            on:showEnrollModal={handleShowEnrollModal}
            on:showLoginModal={handleShowLoginModal}
            on:notification={handleNotification}
          />
        {/each}
      </div>
    {/if}
  </main>
</div>

<!-- Modal de inscripción -->
{#if showEnrollModal}
  <Modal title="Matricularme en el Artículo" isOpen={showEnrollModal} on:close={closeEnrollModal}>
    <p>¿Deseas matricularte en este artículo para continuar estudiando?</p>
    <div class="modal-actions">
      <button 
        class="cancel-btn"
        on:click={closeEnrollModal}
      >
        Cancelar
      </button>
      <button 
        class="submit-btn"
        on:click={async () => {
          try {
            // Implementa la lógica de matriculación aquí
            // Por ejemplo, llamar a una función del servicio para matricular al usuario
            await studyService.matricular(article.id, accessToken); // Asegúrate de tener esta función en studyService
            addNotification('success', 'Te has matriculado exitosamente.');
          } catch (err) {
            addNotification('error', err.message);
          } finally {
            showEnrollModal = false;
          }
        }}
      >
        Confirmar
      </button>
    </div>
  </Modal>
{/if}

<!-- Modal de inicio de sesión -->
{#if showLoginModal}
  <Modal title="Iniciar Sesión" isOpen={showLoginModal} on:close={closeLoginModal}>
    <p>Por favor, inicia sesión para realizar esta acción.</p>
    <!-- Implementa tu formulario de inicio de sesión aquí -->
    <button 
      class="submit-btn"
      on:click={async () => {
        try {
          // Implementa la lógica de inicio de sesión aquí, e.g., redirigir a la página de inicio de sesión
          window.location.href = '/login';
        } catch (err) {
          addNotification('error', 'Error al iniciar sesión.');
        } finally {
          showLoginModal = false;
        }
      }}
    >
      Iniciar Sesión
    </button>
  </Modal>
{/if}

<style>
  /* Estilos Mejorados para una Apariencia más Premium */

  .study-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    background-color: #f3f4f6;
    min-height: 100vh;
  }

  .content {
    margin-top: 2rem;
  }

  .articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    padding: 1rem 0;
  }

  .empty-state, .error-state, .loading-state {
    text-align: center;
    padding: 4rem 2rem;
    background: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .empty-state h3, .error-state h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.75rem;
  }

  .empty-state p, .error-state p, .loading-state p {
    font-size: 1rem;
    color: #6b7280;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media (max-width: 768px) {
    .study-page {
      padding: 1rem;
    }

    .articles-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  /* Estilos para modales de inscripción y inicio de sesión */
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .cancel-btn, .submit-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 1rem;
  }

  .cancel-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 1rem;
    background-color: #ffffff;
    color: #4b5563;
    border: 1px solid #d1d5db;
    cursor: pointer;
  }

  .cancel-btn:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #9ca3af;
    transform: translateY(-1px);
  }

  .submit-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 1rem;
    background-color: #2563eb;
    color: #ffffff;
    border: none;
    cursor: pointer;
  }

  .submit-btn:hover:not(:disabled) {
    background-color: #1d4ed8;
    transform: translateY(-1px);
  }

  .submit-btn:disabled, .cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>