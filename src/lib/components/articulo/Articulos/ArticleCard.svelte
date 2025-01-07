<script>
  import { onMount, createEventDispatcher, tick } from "svelte";
  import { fade, fly, slide, scale } from "svelte/transition";
  import { quintOut, elasticOut } from 'svelte/easing';
  import { sessionStore } from "$lib/stores/sessionStore";
  import {
    checkArticleEnrollment,
    updateLikeStatus,
    fetchLikeStatus,
  } from "$lib/api/articulos/articulos";
  import PDFViewer from "$lib/components/articulo/Articulos/PDFViewer.svelte";
  
  export let article;
  export let isInView = false; // Para animaciones basadas en viewport
  
  let isEnrolled = false;
  let accessToken = null;
  let likeStatus = null;
  let isPDFVisible = false;
  let isLoadingLike = false;
  let isHovered = false;
  let showHearts = false;
  let cardElement;
  let isAnimating = false;
  let hasInteracted = false;
  let intersectionObserver;
  
  const dispatch = createEventDispatcher();

  // Estados reactivos
  $: accessToken = $sessionStore?.access;
  $: cardClass = `
    article-card 
    ${isHovered ? 'hovered' : ''} 
    ${isInView ? 'in-view' : ''} 
    ${hasInteracted ? 'interacted' : ''}
    ${isAnimating ? 'animating' : ''}
  `;

  onMount(async () => {
    setupIntersectionObserver();
    if (article) {
      await Promise.all([
        checkEnrollment(),
        fetchLikeStatusForArticle()
      ]);
    }
    return () => {
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
    };
  });

  function setupIntersectionObserver() {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isInView = true;
            animateCardEntrance();
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '50px'
      }
    );

    if (cardElement) {
      intersectionObserver.observe(cardElement);
    }
  }

  async function animateCardEntrance() {
    if (!hasInteracted) {
      isAnimating = true;
      await tick();
      setTimeout(() => {
        isAnimating = false;
      }, 1000);
    }
  }

  async function handleCardInteraction() {
    if (!hasInteracted) {
      hasInteracted = true;
      dispatch('interaction', { articleId: article.id });
    }
  }

  async function checkEnrollment() {
    if (!accessToken || !article?.id) return;
    try {
      const response = await checkArticleEnrollment(article.id, accessToken);
      isEnrolled = response.matriculado;
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  }

  async function handleLike(event) {
    event.stopPropagation();
    if (!accessToken || !article?.id || isLoadingLike) return;
    
    isLoadingLike = true;
    try {
      const newLikeStatus = !likeStatus?.isLiked;
      await updateLikeStatus(article.id, newLikeStatus, accessToken);
      await fetchLikeStatusForArticle();
      showLikeAnimation();
      dispatch('like', { articleId: article.id, isLiked: newLikeStatus });
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
    event.stopPropagation();
    isPDFVisible = !isPDFVisible;
    dispatch('pdfToggle', { articleId: article.id, isVisible: isPDFVisible });
  }

  function showLikeAnimation() {
    showHearts = true;
    setTimeout(() => {
      showHearts = false;
    }, 1500);
  }

  function getFormattedDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getAuthorInitials(author) {
    if (!author) return "";
    return author
      .trim()
      .split(" ")
      .map(name => name.charAt(0).toUpperCase())
      .join("");
  }

  // Calculamos dinámicamente el porcentaje de progreso para la barra de avance
  $: progressPercentage = isEnrolled ? 
    Math.min((article.progreso || 0) * 100, 100) : 0;

  // Estado del badge basado en matrícula
  $: statusBadge = isEnrolled ? {
    text: 'Matriculado',
    color: '#16a34a', // Verde
    bgColor: '#dcfce7',
    icon: 'fa-check-circle'
  } : {
    text: 'Vista Previa',
    color: '#f59e0b', // Amarillo
    bgColor: '#fef3c7',
    icon: 'fa-eye'
  };
</script>

{#if article}
<article 
  class={cardClass}
  bind:this={cardElement}
  on:mouseenter={() => {
    isHovered = true;
    handleCardInteraction();
  }}
  on:mouseleave={() => isHovered = false}
  on:click={() => dispatch('click', { articleId: article.id })}
  transition:fade={{duration: 400}}
>
  <div class="card-inner">
    <!-- Imagen o Avatar -->
    <!-- <div class="card-media">
      {#if article.imagen_url}
        <img src={article.imagen_url} alt={article.titulo} class="article-image" />
      {:else}
        <div class="default-image">
          <i class="fas fa-book" aria-hidden="true"></i>
        </div>
      {/if}
    </div> -->

    <!-- Contenido Principal -->
    <div class="card-content">
      <!-- Header con metadata -->
      <header class="card-header">
        <div class="badges-container">
          <div class="badges">
            <span 
              class="type-badge"
              style="background-color: {article.tipo?.color || '#3b82f6'}; color: white;"
            >
              <i class="fas fa-bookmark" aria-hidden="true"></i>
              <span class="badge-text">{article.tipo?.nombre || 'Artículo'}</span>
            </span>
            
            {#if article.es_destacado}
              <span class="featured-badge" style="background-color: #fcd34d; color: #ca8a04;">
                <i class="fas fa-star" aria-hidden="true"></i>
                <span class="badge-text">Destacado</span>
              </span>
            {/if}

            <span 
              class="status-badge"
              style="
                background-color: {statusBadge.bgColor};
                color: {statusBadge.color};
              "
            >
              <i class={`fas ${statusBadge.icon}`} aria-hidden="true"></i>
              <span class="badge-text">{statusBadge.text}</span>
            </span>
          </div>
        </div>

        <h2 class="card-title">
          <a 
            href="/articulos/{article.id}"
            class="title-link"
          >
            {article.titulo}
          </a>
        </h2>

        <!-- Metadata -->
        <div class="card-meta">
          <div class="meta-group">
            <span class="meta-item">
              <i class="fas fa-calendar" aria-hidden="true"></i>
              <span>{getFormattedDate(article.creado)}</span>
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <i class="fas fa-book" aria-hidden="true"></i>
              <span>{article.curso?.nombre || 'Curso no especificado'}</span>
            </span>
          </div>
        </div>
      </header>

      <!-- Descripción y detalles -->
      <div class="content-wrapper">
        <p class="card-description">{article.descripcion}</p>
        
        <div class="card-details">
          <div class="detail-item university-info">
            <i class="fas fa-university" aria-hidden="true"></i>
            <span>{article.universidad?.nombre || 'Universidad no especificada'}</span>
          </div>
          
          <div class="detail-item area-info">
            <i class="fas fa-flask" aria-hidden="true"></i>
            <span>{article.area?.nombre || 'Área no especificada'}</span>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="card-stats">
          <div class="stat-item" title="Vistas">
            <i class="fas fa-eye" aria-hidden="true"></i>
            <span class="stat-value">{article.num_vistas || 0}</span>
          </div>
          <div class="stat-item" title="Calificación">
            <i class="fas fa-star" aria-hidden="true"></i>
            <span class="stat-value">
              {article.calificacion_promedio?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div class="stat-item" title="Me gusta">
            <i class="fas fa-heart" aria-hidden="true"></i>
            <span class="stat-value">
              {likeStatus?.totalLikes || article.num_favoritos || 0}
            </span>
          </div>
        </div>

        <!-- Barra de progreso para artículos matriculados -->
        {#if isEnrolled}
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                style="width: {progressPercentage}%"
              ></div>
            </div>
            <span class="progress-text">
              {progressPercentage}% completado
            </span>
          </div>
        {/if}
      </div>

      <!-- Footer con autor y acciones -->
      <footer class="card-footer">
        <div class="author-section">
          <div 
            class="author-avatar"
            class:pulse={isHovered}
          >
            <div class="avatar-content">
              {#if article.autor}
                {getAuthorInitials(article.autor)}
              {:else}
                <i class="fas fa-user" aria-hidden="true"></i>
              {/if}
            </div>
            <div class="avatar-ring"></div>
          </div>
          <div class="author-info">
            <span class="author-name">
              {article.autor || 'Autor desconocido'} 
            </span>
            <span class="author-role">
              {article.autor_rol || 'Profesor'}
            </span>
          </div>
        </div>

        <div class="action-buttons">
          <!-- Botón principal -->
          <a 
            href="/articulos/{article.id}" 
            class="primary-button {isEnrolled ? 'enrolled' : ''}"
            aria-label={isEnrolled ? 'Continuar leyendo' : 'Vista previa'}
          >
            <i 
              class="fas {isEnrolled ? 'fa-book-open' : 'fa-eye'}" 
              aria-hidden="true"
            ></i>
            <span>{isEnrolled ? 'Continuar leyendo' : 'Vista previa'}</span>
            <div class="button-background"></div>
          </a>

          <!-- Botón de PDF -->
          {#if article.archivo_adjunto}
            <button 
              class="pdf-button {isPDFVisible ? 'active' : ''}"
              on:click={togglePDFViewer}
              aria-label={isPDFVisible ? 'Cerrar PDF' : 'Ver PDF'}
            >
              <i 
                class="fas {isPDFVisible ? 'fa-times' : 'fa-file-pdf'}" 
                aria-hidden="true"
              ></i>
              <div class="button-background"></div>
            </button>
          {/if}

          <!-- Botón de Me gusta -->
          <button 
            class="like-button {likeStatus?.isLiked ? 'liked' : ''}"
            class:loading={isLoadingLike}
            on:click={handleLike}
            disabled={isLoadingLike}
            aria-label="Me gusta"
          >
            {#if isLoadingLike}
              <i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i>
            {:else}
              <i class="fas fa-heart" aria-hidden="true"></i>
            {/if}
            <div class="button-background"></div>
          </button>
        </div>
      </footer>
    </div>
  </div>

  <!-- Sección de PDF -->
  {#if isPDFVisible}
    <div 
      class="pdf-section"
      transition:slide={{duration: 400}}
    >
      <PDFViewer url={article.archivo_adjunto} />
    </div>
  {/if}

  <!-- Animación de corazones -->
  {#if showHearts}
    <div 
      class="hearts-container" 
      transition:fade={{duration: 200}}
    >
      {#each Array(8) as _, i}
        <div 
          class="heart-particle"
          style="
            --delay: {i * 0.1}s;
            --angle: {Math.random() * 60 - 30}deg;
            --distance: {100 + Math.random() * 50}px;
            --duration: {1 + Math.random() * 0.5}s
          "
        >
          <i class="fas fa-heart" aria-hidden="true"></i>
        </div>
      {/each}
    </div>
  {/if}
</article>
{/if}

<style>
  /* Core Card Styles */
  .article-card {
    position: relative;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 15px rgba(0,0,0,0.15);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    color: #333333;
    max-width: 1200px;
    margin: 1rem auto;
    border: 1px solid #e5e7eb;
  }

  .article-card.in-view {
    animation: cardEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .article-card.hovered {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 15px 20px rgba(0,0,0,0.15);
  }

  /* Card Inner Layout for Horizontal Design */
  .card-inner {
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  /* Media Section */
  .card-media {
    flex: 1 1 40%;
    position: relative;
    overflow: hidden;
    background-color: #f9fafb;
  }

  .article-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .article-card.hovered .article-image {
    transform: scale(1.05);
  }

  .default-image {
    width: 100%;
    height: 100%;
    background-color: #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-size: 3rem;
  }

  /* Content Section */
  .card-content {
    flex: 1 1 60%;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    position: relative;
  }

  /* Header Styles */
  .card-header {
    margin-bottom: 1rem;
  }

  .badges-container {
    margin-bottom: 0.5rem;
  }

  .badges {
    display: flex;
    gap: 0.5rem;
  }

  .type-badge,
  .featured-badge,
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .featured-badge {
    background-color: #fcd34d;
    color: #ca8a04;
  }

  .status-badge {
    background-color: var(--accent-orange, #f97316);
    color: white;
  }

  .badge-text {
    pointer-events: none;
  }

  /* Title Styling */
  .card-title {
    margin: 0.5rem 0;
    font-size: 1.5rem;
    line-height: 1.3;
    font-weight: 700;
    color: #1f2937;
    transition: color 0.3s ease;
  }

  .title-link {
    color: inherit;
    text-decoration: none;
    position: relative;
  }

  .title-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    left: 0;
    bottom: -2px;
    background-color: var(--accent-color, #3b82f6);
    transition: width 0.3s ease;
  }

  .title-link:hover::after {
    width: 100%;
  }

  /* Meta Information */
  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    color: #6b7280;
    font-size: 0.85rem;
  }

  .meta-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .meta-divider {
    color: #9ca3af;
  }

  /* Content Wrapper */
  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Description */
  .card-description {
    color: #4b5563;
    line-height: 1.6;
    margin: 0;
  }

  /* Details Section */
  .card-details {
    display: flex;
    gap: 1.5rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #6b7280;
    font-size: 0.85rem;
  }

  /* Stats Section */
  .card-stats {
    display: flex;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #6b7280;
    font-size: 0.85rem;
  }

  .stat-value {
    font-weight: 600;
    color: #1f2937;
  }

  /* Progress Bar */
  .progress-container {
    margin-top: 1rem;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--accent-color, #3b82f6);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #9ca3af;
  }

  /* Footer Section */
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  /* Author Section */
  .author-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .author-avatar {
    position: relative;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--accent-color, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    transition: transform 0.3s ease;
  }

  .author-avatar.pulse {
    animation: pulse 2s infinite;
  }

  .avatar-content {
    position: relative;
    z-index: 2;
  }

  .avatar-ring {
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: linear-gradient(135deg, var(--accent-orange, #f97316), var(--accent-orange, #f97316));
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    animation: spin 4s linear infinite;
  }

  .author-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .author-name {
    font-weight: 600;
    color: #1f2937;
    font-size: 0.9rem;
  }

  .author-role {
    font-size: 0.75rem;
    color: #6b7280;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 0.75rem;
  }

  /* Primary Button */
  .primary-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    background: var(--accent-color, #3b82f6);
    color: white;
    font-weight: 500;
    text-decoration: none;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .primary-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  }

  .primary-button:hover::before {
    opacity: 1;
  }

  .primary-button.enrolled {
    background: var(--accent-orange, #f97316);
  }

  /* PDF Button */
  .pdf-button {
    position: relative;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 9999px;
    background: #ef4444;
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease, background-color 0.3s ease;
    overflow: hidden;
    font-size: 1rem;
  }

  .pdf-button:hover {
    transform: translateY(-2px);
    background: #dc2626;
  }

  .pdf-button.active {
    background: #4b5563;
  }

  /* Like Button */
  .like-button {
    position: relative;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #d1d5db;
    border-radius: 9999px;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    transition: transform 0.3s ease, border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
    overflow: hidden;
    font-size: 1rem;
  }

  .like-button:hover {
    border-color: #ef4444;
    color: #ef4444;
    transform: translateY(-2px) scale(1.05);
  }

  .like-button.liked {
    background: #fee2e2;
    border-color: #ef4444;
    color: #ef4444;
  }

  .like-button.loading {
    pointer-events: none;
    opacity: 0.7;
  }

  /* Button Background Effect */
  .button-background {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  button:hover .button-background,
  .primary-button:hover .button-background {
    opacity: 1;
  }

  /* Hearts Animation */
  .hearts-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
  }

  .heart-particle {
    position: absolute;
    left: 50%;
    bottom: 50%;
    color: #ef4444;
    font-size: 1.2rem;
    filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.2));
    animation: floatHeart var(--duration) ease-out forwards;
    animation-delay: var(--delay);
  }

  /* PDF Section */
  .pdf-section {
    margin-top: 1rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  /* Animations */
  @keyframes cardEntrance {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes floatHeart {
    0% {
      transform: translate(-50%, 0) scale(0) rotate(0deg);
      opacity: 0;
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -20px) scale(1.2) rotate(var(--angle));
    }
    100% {
      transform: translate(-50%, calc(-1 * var(--distance))) scale(0) rotate(calc(var(--angle) * 2));
      opacity: 0;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(249, 234, 143, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(249, 234, 143, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(249, 234, 143, 0);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .article-card {
      flex-direction: column;
    }

    .card-inner {
      flex-direction: column;
    }

    .card-media {
      flex: 1 1 100%;
      height: 200px;
    }

    .card-content {
      flex: 1 1 100%;
      padding: 1rem;
    }

    .action-buttons {
      gap: 0.5rem;
    }

    .primary-button {
      width: 100%;
      justify-content: center;
    }
  }

  /* Dark Mode */
  /* Dado que no queremos depender de estilos globales, este bloque puede ser omitido
     o adaptado según las necesidades específicas de tu aplicación */

  /* Print Styles */
  @media print {
    .article-card {
      box-shadow: none;
      break-inside: avoid;
    }

    .action-buttons {
      display: none;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .article-card,
    .primary-button,
    .pdf-button,
    .like-button {
      transition: none;
    }

    .heart-particle {
      display: none;
    }
  }
</style>