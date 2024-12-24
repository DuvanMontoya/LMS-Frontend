<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { slide, fade, fly } from "svelte/transition";
  import { quintOut } from 'svelte/easing';
  import { sessionStore } from "$lib/stores/sessionStore";
  import {
    checkArticleEnrollment,
    updateLikeStatus,
    fetchLikeStatus,
  } from "$lib/api/articulos/articulos";
  import PDFViewer from "$lib/components/articulo/PDFViewer.svelte";

  export let article;
  let isEnrolled = false;
  let accessToken = null;
  let likeStatus = null;
  let isPDFVisible = false;
  let isLoadingLike = false;
  let isHovered = false;
  const dispatch = createEventDispatcher();

  $: accessToken = $sessionStore?.access;

  async function checkEnrollment() {
    if (!accessToken || !article?.id) return;
    try {
      const response = await checkArticleEnrollment(article.id, accessToken);
      isEnrolled = response.matriculado;
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  }

  async function handleLike() {
    if (!accessToken || !article?.id || isLoadingLike) return;
    isLoadingLike = true;
    try {
      const newLikeStatus = !likeStatus?.isLiked;
      await updateLikeStatus(article.id, newLikeStatus, accessToken);
      await fetchLikeStatusForArticle();
      showLikeAnimation();
    } catch (error) {
      console.error("Error updating like status:", error);
    } finally {
      isLoadingLike = false;
    }
  }

  async function fetchLikeStatusForArticle() {
    if (!accessToken || !article?.id) return;
    try {
      likeStatus = await fetchLikeStatus(article.id, accessToken);
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  }

  function togglePDFViewer(event) {
    event.preventDefault();
    isPDFVisible = !isPDFVisible;
  }

  let showHearts = false;

  function showLikeAnimation() {
    showHearts = true;
    setTimeout(() => {
      showHearts = false;
    }, 1500);
  }

  onMount(() => {
    checkEnrollment();
    fetchLikeStatusForArticle();
  });

  function getFormattedDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getAuthorInitials(author) {
    if (!author) return "";
    const names = author.split(" ");
    return names.map(name => name.charAt(0).toUpperCase()).join("");
  }

  $: statusBadge = isEnrolled ? {
    text: 'Matriculado',
    color: 'var(--success-500)',
    icon: 'fa-check-circle'
  } : {
    text: 'Vista Previa',
    color: 'var(--warning-500)',
    icon: 'fa-eye'
  };
</script>

<article 
  class="article-card"
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => isHovered = false}
  class:hovered={isHovered}
>
  <div class="card-content">
    <!-- Header y metadata -->
    <header class="card-header">
      <div class="header-content">
        <div class="badges">
          <span class="type-badge" style="--badge-color: {article.tipo?.color || '#3b82f6'}">
            <i class="fas fa-bookmark"></i>
            {article.tipo?.nombre || 'Artículo'}
          </span>
          {#if article.es_destacado}
            <span class="featured-badge">
              <i class="fas fa-star"></i>
              Destacado
            </span>
          {/if}
        </div>
        <h2 class="card-title">
          <a href="/articulos/{article.id}">{article.titulo}</a>
        </h2>
        <div class="card-meta">
          <span class="meta-item">
            <i class="fas fa-calendar"></i>
            {getFormattedDate(article.creado)}
          </span>
          <span class="meta-divider">•</span>
          <span class="meta-item">
            <i class="fas fa-book"></i>
            {article.curso?.nombre || 'Curso no especificado'}
          </span>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="card-body">
      <div class="content-wrapper">
        <p class="card-description">{article.descripcion}</p>
        
        <div class="card-details">
          <div class="university-info">
            <i class="fas fa-university"></i>
            <span>{article.universidad?.nombre || 'Universidad no especificada'}</span>
          </div>
          
          <div class="area-info">
            <i class="fas fa-flask"></i>
            <span>{article.area?.nombre || 'Área no especificada'}</span>
          </div>
        </div>

        <div class="card-stats">
          <div class="stat-group">
            <div class="stat-item" title="Vistas">
              <i class="fas fa-eye"></i>
              <span>{article.num_vistas || 0}</span>
            </div>
            <div class="stat-item" title="Calificación">
              <i class="fas fa-star"></i>
              <span>{article.calificacion_promedio?.toFixed(1) || '0.0'}</span>
            </div>
            <div class="stat-item" title="Favoritos">
              <i class="fas fa-heart"></i>
              <span>{likeStatus?.totalLikes || article.num_favoritos || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Autor y acciones -->
      <div class="card-footer">
        <div class="author-section">
          <div class="author-avatar">
            <div class="avatar-content">
              {#if article.autor}
                {getAuthorInitials(article.autor)}
              {:else}
                <i class="fas fa-user"></i>
              {/if}
            </div>
          </div>
          <div class="author-info">
            <span class="author-name">{article.autor || 'Autor desconocido'}</span>
            <span class="author-role">Experto académico</span>
          </div>
        </div>

        <div class="action-buttons">
          <a 
            href="/articulos/{article.id}" 
            class="primary-button"
            class:enrolled={isEnrolled}
          >
            <i class="fas {isEnrolled ? 'fa-book-open' : 'fa-eye'}"></i>
            <span>{isEnrolled ? 'Leer artículo' : 'Vista previa'}</span>
          </a>

          {#if article.archivo_adjunto}
              <button 
                class="pdf-button"
                class:active={isPDFVisible}
                on:click={togglePDFViewer}
                aria-label={isPDFVisible ? 'Close PDF viewer' : 'Open PDF viewer'}
              >
                <i class="fas {isPDFVisible ? 'fa-times' : 'fa-file-pdf'}"></i>
              </button>
          {/if}
          <button 
            class="like-button"
            class:liked={likeStatus?.isLiked}
            class:loading={isLoadingLike}
            on:click={handleLike}
            disabled={isLoadingLike}
            aria-label={likeStatus?.isLiked ? 'Unlike article' : 'Like article'}
          >
            {#if isLoadingLike}
              <i class="fas fa-circle-notch fa-spin"></i>
            {:else}
              <i class="fas fa-heart"></i>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  {#if isPDFVisible}
    <div 
      class="pdf-section"
      transition:slide={{ duration: 300 }}
    >
      <PDFViewer url={`http://localhost:8000/api${article.archivo_url}`} />
    </div>
  {/if}
</article>
  {#if isPDFVisible}
    <div 
      class="pdf-section"
      transition:slide={{ duration: 300 }}
    >
      <PDFViewer url={`http://localhost:8000/api${article.archivo_url}`} />
    </div>
  {/if}

    {#if showHearts}
      <div class="hearts-container" transition:fade>
        {#each Array(5) as _, i}
          <div 
            class="heart-particle"
            style="--delay: {i * 0.1}s; --angle: {Math.random() * 60 - 30}deg"
          >
            <i class="fas fa-heart"></i>
          </div>
        {/each}
      </div>
    {/if}
  
  <style>
    .article-card {
      position: relative;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
        0 2px 4px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

  .article-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, var(--primary-500), var(--secondary-500));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .article-card.hovered {
    transform: translateY(-4px);
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -6px rgba(0, 0, 0, 0.05);
  }

  .article-card.hovered::before {
    opacity: 1;
  }

  .card-content {
    padding: 1.5rem;
  }

  .card-header {
    margin-bottom: 1.5rem;
  }

  .header-content {
    position: relative;
  }

  .badges {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .type-badge,
  .featured-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
  }

  .type-badge {
    background-color: var(--badge-color);
    color: white;
  }

  .featured-badge {
    background-color: var(--warning-100);
    color: var(--warning-700);
  }

  .card-title {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    line-height: 1.3;
    font-weight: 700;
  }

  .card-title a {
    color: var(--gray-900);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .card-title a:hover {
    color: var(--primary-600);
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--gray-500);
    font-size: 0.875rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .meta-divider {
    color: var(--gray-300);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .card-description {
    color: var(--gray-600);
    line-height: 1.6;
    margin: 0;
  }

  .card-details {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .university-info,
  .area-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-700);
    font-size: 0.875rem;
  }

  .card-stats {
    padding-top: 1rem;
    border-top: 1px solid var(--gray-100);
  }

  .stat-group {
    display: flex;
    gap: 1.5rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-600);
    font-size: 0.875rem;
  }

  .stat-item i {
    color: var(--primary-500);
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--gray-100);
  }

  .author-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .author-avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    position: relative;
    overflow: hidden;
  }

  .avatar-content {
    position: relative;
    z-index: 1;
  }

  .author-info {
    display: flex;
    flex-direction: column;
  }

  .author-name {
    color: var(--gray-900);
    font-weight: 600;
  }

  .author-role {
    color: var(--gray-500);
    font-size: 0.875rem;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .primary-button,
  .pdf-button,
  .like-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    cursor: pointer;
  }

  .primary-button {
    background: linear-gradient(
      135deg, 
      var(--primary-500), 
      var(--primary-600)
    );
    color: white;
    text-decoration: none;
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
  }

  .primary-button.enrolled {
    background: linear-gradient(
      135deg,
      var(--success-500),
      var(--success-600)
    );
  }

  .pdf-button,
  .like-button {
    width: 42px;
    height: 42px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-size: 1.1rem;
  }

  .pdf-button {
    background: linear-gradient(
      135deg,
      var(--danger-500),
      var(--danger-600)
    );
    color: white;
  }

  .pdf-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--danger-rgb), 0.2);
  }

  .pdf-button.active {
    background: var(--gray-700);
  }

  .like-button {
    background: white;
    border: 2px solid var(--gray-200);
    color: var(--gray-400);
  }

  .like-button:hover {
    border-color: var(--danger-200);
    color: var(--danger-500);
    transform: translateY(-2px);
  }

  .like-button.liked {
    background: var(--danger-50);
    border-color: var(--danger-500);
    color: var(--danger-500);
  }

  .like-button.loading {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .pdf-section {
    padding: 1.5rem;
    background: var(--gray-50);
    border-top: 1px solid var(--gray-200);
  }

  /* Animaciones y efectos */
  .hearts-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    pointer-events: none;
  }

  .heart-particle {
    position: absolute;
    color: var(--danger-500);
    font-size: 2rem;
    animation: floatHeart 1.5s ease-out forwards;
    animation-delay: var(--delay);
  }

  @keyframes floatHeart {
    0% {
      transform: 
        translate(0, 0) 
        rotate(var(--angle)) 
        scale(0);
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    100% {
      transform: 
        translate(var(--angle), -100px) 
        rotate(calc(var(--angle) * 2)) 
        scale(1);
      opacity: 0;
    }
  }

  /* Avatar shine effect */
  .author-avatar::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    transform: rotate(45deg);
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% { transform: translate(-100%, -100%) rotate(45deg); }
    100% { transform: translate(100%, 100%) rotate(45deg); }
  }

  /* Responsive styles */
  @media (max-width: 768px) {
    .card-content {
      padding: 1.25rem;
    }

    .card-title {
      font-size: 1.25rem;
    }

    .card-footer {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .action-buttons {
      justify-content: space-between;
    }

    .primary-button {
      flex: 1;
    }
  }

  @media (max-width: 640px) {
    .badges {
      flex-wrap: wrap;
    }

    .card-meta {
      flex-direction: column;
      gap: 0.5rem;
    }

    .meta-divider {
      display: none;
    }

    .card-details {
      flex-direction: column;
    }

    .stat-group {
      justify-content: space-between;
    }
  }

  /* Soporte para modo oscuro */
  :global(.dark) .article-card {
    background: var(--gray-800);
  }

  :global(.dark) .card-title a {
    color: var(--gray-100);
  }

  :global(.dark) .card-description {
    color: var(--gray-300);
  }

  :global(.dark) .card-stats,
  :global(.dark) .card-footer {
    border-top-color: var(--gray-700);
  }

  :global(.dark) .pdf-section {
    background: var(--gray-900);
    border-top-color: var(--gray-700);
  }

  :global(.dark) .like-button {
    background: var(--gray-700);
    border-color: var(--gray-600);
    color: var(--gray-400);
  }

  :global(.dark) .like-button.liked {
    background: var(--danger-900);
    border-color: var(--danger-500);
    color: var(--danger-400);
  }

  /* Variables de color requeridas */
  :root {
    /* Colores primarios */
    --primary-rgb: 59, 130, 246;
    --primary-50: #eff6ff;
    --primary-100: #dbeafe;
    --primary-400: #60a5fa;
    --primary-500: #3b82f6;
    --primary-600: #2563eb;
    
    /* Colores de éxito */
    --success-500: #10b981;
    --success-600: #059669;
    
    /* Colores de peligro */
    --danger-rgb: 239, 68, 68;
    --danger-50: #fef2f2;
    --danger-100: #fee2e2;
    --danger-200: #fecaca;
    --danger-400: #f87171;
    --danger-500: #ef4444;
    --danger-600: #dc2626;
    --danger-900: #7f1d1d;
    
    /* Colores de advertencia */
    --warning-100: #fef3c7;
    --warning-500: #f59e0b;
    --warning-700: #b45309;
    
    /* Escala de grises */
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
  }

  /* Utilitarios de accesibilidad */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }


  /* Manejo de enfoque */
  :focus-visible {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }
</style>
    