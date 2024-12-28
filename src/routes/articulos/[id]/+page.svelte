<!-- src/routes/articulos/[id]/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { page } from '$app/stores';
  import { sessionStore } from '$lib/stores/sessionStore';
  import { Howl } from 'howler';

  /* Servicios de API */
  import apiService from '$lib/api/articulos/articulos.js';

  /* Componentes */
  // import ArticleHeader from '$lib/components/articulo/id/ArticleHeader.svelte';
  import TableOfContents from '$lib/components/articulo/id/TableOfContents.svelte';
  import EnrolledArticle from '$lib/components/articulo/id/EnrolledArticle.svelte';
  import ArticlePreview from '$lib/components/articulo/id/ArticlePreview.svelte';
  import FloatingButtons from '$lib/components/articulo/id/FloatingButtons.svelte';
  import MobileNav from '$lib/components/articulo/id/MobileNav.svelte';
  import CommentsPanel from '$lib/components/articulo/id/CommentsPanel.svelte';
  import BottomSheet from '$lib/components/articulo/id/BottomSheet.svelte';
  import EnrollModal from '$lib/components/articulo/id/EnrollModal.svelte';

  /* Estado principal */
  let articleId = $page.params.id;
  let article = null;
  let isLoading = true;
  let error = null;

  // Interacciones
  let isLiked = false;
  let likesCount = 0;
  let showComments = false;
  let showBottomSheet = false;
  let activeBottomSheetContent = '';

  // UI
  let isDarkMode = false;
  let isMobile = false;
  let isVertical = false;
  let showTocMobile = false;

  // Matrícula
  let isEnrolled = false;
  let enrollmentStatus = null;
  let showEnrollModal = false;

  onMount(() => {
    // Detectar si es mobile o vertical
    const mediaQueryMobile = window.matchMedia('(max-width: 768px)');
    const mediaQueryVertical = window.matchMedia('(max-height: 900px) and (min-width: 1200px)');
    isMobile = mediaQueryMobile.matches;
    isVertical = mediaQueryVertical.matches;

    const mediaQueryMobileListener = (e) => {
      isMobile = e.matches;
    };

    const mediaQueryVerticalListener = (e) => {
      isVertical = e.matches;
    };

    mediaQueryMobile.addEventListener('change', mediaQueryMobileListener);
    mediaQueryVertical.addEventListener('change', mediaQueryVerticalListener);

    // Revisar tema previo
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme) {
      isDarkMode = storedTheme === 'true';
      document.documentElement.classList.toggle('dark', isDarkMode);
    }

    // Listener de scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cargar datos si hay ID
    if (articleId) loadInitialData();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      mediaQueryMobile.removeEventListener('change', mediaQueryMobileListener);
      mediaQueryVertical.removeEventListener('change', mediaQueryVerticalListener);
    };
  });

  // Listener de scroll
  let readingProgress = 0;
  let lastScrollY = 0;
  let isHeaderVisible = true;
  let isTitleProgressVisible = false;

  function handleScroll() {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    isHeaderVisible = !scrollingDown || currentScrollY < 100;
    isTitleProgressVisible = !scrollingDown && currentScrollY > 100;
    lastScrollY = currentScrollY;

    // Progreso de lectura
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    readingProgress = (winScroll / height) * 100;
  }

  // Función para abrir el bottom sheet
  function openBottomSheet(content) {
    activeBottomSheetContent = content;
    showBottomSheet = true;
  }

  /**
   * Carga la info del artículo y estados asociados (matrícula, likes, etc.)
   */
  async function loadInitialData() {
    isLoading = true;
    error = null;

    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error('No se encontró token de autenticación');

      const [
        articleData,
        enrollmentData,
        statusData,
        likeData
      ] = await Promise.all([
        apiService.fetchArticleById(articleId, token),
        apiService.checkArticleEnrollment(articleId, token),
        apiService.fetchEnrollmentStatus(articleId, token),
        apiService.fetchLikeStatus(articleId, token)
      ]);

      // Validar que 'acceso' exista
      if (!articleData.acceso) {
        throw new Error('El artículo no tiene definido el campo "acceso".');
      }

      // Asignar
      article = articleData;
      isEnrolled = enrollmentData.matriculado;
      enrollmentStatus = statusData.status;
      isLiked = likeData.is_liked;
      likesCount = likeData.total_likes;

    } catch (err) {
      console.error('Error loading data:', err);
      error = err.message || 'Hubo un problema al cargar el artículo.';
    } finally {
      isLoading = false;
    }
  }

  /** Interacciones */

  // Manejar "Me gusta" en el artículo
  async function handleLikeClick() {
    try {
      const token = get(sessionStore).access;
      await apiService.updateLikeStatus(articleId, !isLiked, token);
      isLiked = !isLiked;
      likesCount += isLiked ? 1 : -1;
      if (isLiked) {
        showLikeAnimation();
        playLikeSound();
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  }

  function showLikeAnimation() {
    const container = document.createElement('div');
    container.className = 'heart-animation-container';
    container.style.cssText = `
      position: fixed;
      bottom: 50px;
      right: 50px;
      pointer-events: none;
      z-index: 2000;
    `;
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('i');
      heart.className = `fas fa-heart floating-heart heart-${i + 1}`;
      heart.style.setProperty('--delay', `${i * 0.1}s`);
      heart.style.setProperty('--angle', `${Math.random() * 60 - 30}deg`);
      container.appendChild(heart);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1500);
  }

  function playLikeSound() {
    const sound = new Howl({
      src: ['/sounds/like_sound.mp3'],
      volume: 0.5
    });
    sound.play();
  }

  // Manejar la solicitud de matriculación desde EnrollModal
  async function handleEnrollment(event) {
    const { motivo } = event.detail;
    try {
      const token = get(sessionStore).access;
      await apiService.matricularArticulo(articleId, motivo, token);
      enrollmentStatus = 'pendiente';
      showEnrollModal = false;
      await loadInitialData();
      alert('Solicitud de acceso enviada exitosamente.');
    } catch (err) {
      console.error('Error solicitando matriculación:', err);
      alert(err.message || 'Hubo un error al enviar la solicitud.');
    }
  }

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', String(isDarkMode));
  }

  function openComments() {
    showComments = true;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleTocMobile() {
    showTocMobile = !showTocMobile;
  }
  function openEnrollModal() {
    showEnrollModal = true;
  }

  function handleRequestAccess() {
    openEnrollModal();
  }
</script>

<svelte:head>
  <title>{article ? article.titulo : 'Cargando...'}</title>
  <meta name="description" content={article?.resumen || 'Cargando...'} />
  <link
    href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Roboto:wght@300;400;500&family=Fira+Code:wght@400;500&display=swap"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
</svelte:head>

<!-- CONTENEDOR PRINCIPAL -->
<main class="article-page theme-transition {isDarkMode ? 'dark-mode' : ''} {isLoading ? 'loading' : ''}">
  <!-- Barra de progreso superior -->
  {#if isHeaderVisible}
    <div class="reading-progress" style="width: {readingProgress}%"></div>
  {/if}

  <!-- Barra de progreso en el título -->
  {#if isTitleProgressVisible}
    <div class="title-progress">
      <div class="progress-bar" style="width: {readingProgress}%"></div>
    </div>
  {/if}

  <!-- Header fijo (solo desktop y no vertical) -->
  {#if isHeaderVisible && !isMobile && !isVertical}
    <div class="sticky-header">
      <div class="header-content">
        <h1 class="header-title">{article?.titulo || 'Cargando...'}</h1>
      </div>
    </div>
  {/if}

  <!-- Contenido principal -->
  <div class="article-container">
    <!-- Header del artículo -->
    <!-- {#if article}
      <ArticleHeader
        title={article.titulo}
        author={article.autor.usuario.username}
        date={article.fecha_publicacion}
        category={article.categoria_articulo.nombre}
      />
    {/if} -->

    <!-- LAYOUT: Grid con 2 columnas: TOC + contenido -->
    <div class="article-layout">
      <TableOfContents
        articleContent={article?.contenido_html}
        isMobile={isMobile || isVertical}
        showTocMobile={showTocMobile}
        toggleTocMobile={toggleTocMobile}
        articleId={articleId}
      />

      <article class="article-content-wrapper">
        {#if isLoading}
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando artículo...</p>
          </div>

        {:else if error}
          <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error al cargar el artículo</h3>
            <p>{error}</p>
            <button class="retry-button" on:click={loadInitialData}>
              Intentar de nuevo
            </button>
          </div>

        {:else if article}
          {#if isEnrolled || article.acceso === 'gratis'}
            <EnrolledArticle
              contenido_html={article.contenido_html}
              archivo_adjunto={article.archivo_adjunto}
            />
          {:else}
          <ArticlePreview 
          article={{
            id: article.id,
            title: article.titulo || 'Sin título',
            content: article.contenido_html || 'Contenido no disponible',
            previewLength: 300,
            requiresAuth: article.acceso !== 'gratis',
            author: article.autor?.usuario?.username || 'Autor desconocido',
            publishDate: article.fecha_publicacion || '',
            readingTime: article.tiempo_lectura || ''
          }}
          on:requestAccess={handleRequestAccess}
        />
          {/if}
        {/if}
      </article>
    </div>
  </div>

  <!-- Navegación MÓVIL vs Botones flotantes DESKTOP -->
  {#if isEnrolled || article?.acceso === 'gratis'}
    {#if isMobile || isVertical}
      <MobileNav
        isLiked={isLiked}
        likesCount={likesCount}
        on:like={handleLikeClick}    
        on:comments={openComments}
        on:rate={() => openBottomSheet('rating')}
        on:toggleDarkMode={toggleDarkMode}
        on:scrollToTop={scrollToTop}
        isDarkMode={isDarkMode}
        on:toggleToc={toggleTocMobile}
      />
    {:else}
      <!-- Capturamos eventos emitidos por FloatingButtons -->
      <FloatingButtons
        isLiked={isLiked}
        likesCount={likesCount}
        isDarkMode={isDarkMode}
        on:like={handleLikeClick}
        on:comments={openComments}
        on:rate={() => openBottomSheet('rating')}
        on:toggleDarkMode={toggleDarkMode}
        on:scrollToTop={scrollToTop}
        on:toggleToc={toggleTocMobile}
      />
    {/if}
  {/if}

  <!-- Panel de comentarios -->
  {#if showComments && (isEnrolled || article?.acceso === 'gratis')}
    <CommentsPanel
      articleId={articleId}
      onClose={() => (showComments = false)}
    />
  {/if}

  <!-- BottomSheet -->
  {#if showBottomSheet}
    <BottomSheet
      activeContent={activeBottomSheetContent}
      articleId={articleId}
      onClose={() => {
        showBottomSheet = false;
        activeBottomSheetContent = '';
      }}
    />
  {/if}

  <!-- Modal de matrícula -->
  {#if showEnrollModal}
  <EnrollModal
  title={article?.titulo}
  on:requestEnrollment={handleEnrollment}
  on:close={() => (showEnrollModal = false)}
/>
  {/if}

  <!-- TOC en móvil y vertical -->
  {#if (isMobile || isVertical) && showTocMobile && article?.contenido_html}
    <div class="modal-overlay">
      <TableOfContents
        articleContent={article.contenido_html}
        isMobile={true}
        showTocMobile={showTocMobile}
        toggleTocMobile={toggleTocMobile}
        articleId={articleId}
      />
    </div>
  {/if}
</main>


<style>
  /*****************************************************/
  /*** Variables y tema ***/
  :root {
    --background-color: #ffffff;
    --background-color2: #fdfdfd;
    --background-elevated: #f8f8f8;
    --text-color: #333;
    --text-color-lighter: #555;
    --primary-color: #0066cc;
    --primary-dark: #004da6;
    --secondary-color: #f97316;
    --secondary-dark: #ea580c;
    --accent-color: #22c55e;
    --accent-rgb: 34, 197, 94;
    --primary-rgb: 0, 102, 204;
    --text-rgb: 51, 51, 51;
    --border-radius: 6px;
    --border-radius-lg: 10px;
    --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    --box-shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.15);
    --transition-speed: 0.3s;
    --modal-overlay-bg: rgba(0, 0, 0, 0.5);
    --modal-z-index: 2500; /* Mayor que otros elementos */
    --header-gradient: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  }

  :root.dark {
    --background-color: #1f1f1f;
    --background-color2: #2c2c2c;
    --background-elevated: #333333;
    --text-color: #ddd;
    --text-color-lighter: #bbb;
    --primary-color: #3794ff;
    --primary-dark: #0066cc;
    --secondary-color: #fb923c;
    --secondary-dark: #f97316;
    --accent-color: #4ade80;
    --accent-rgb: 74, 222, 128;
    --box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
    --box-shadow-elevated: 0 4px 16px rgba(255, 255, 255, 0.15);
  }

  /*****************************************************/
  /*** Contenedor principal ***/
  .article-page {
    min-height: 100vh;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color var(--transition-speed), color var(--transition-speed);
    position: relative;
    overflow-x: hidden;
    z-index: 1; /* Base */
  }

  .article-page.loading {
    pointer-events: none;
  }

  .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
    z-index: 3000; /* Mayor que la mayoría de los elementos */
    transition: width 0.2s ease-out;
  }

  .title-progress {
    position: fixed;
    top: 60px; /* Ajustar según el tamaño del header */
    left: 0;
    width: 100%;
    height: 3px;
    background-color: rgba(var(--text-rgb), 0.1);
    z-index: 2500; /* Superior a la TOC pero inferior a modales */
  }

  .title-progress .progress-bar {
    height: 100%;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
    transition: width 0.2s ease-out;
  }

  .sticky-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: var(--background-color2);
    box-shadow: var(--box-shadow);
    z-index: 999; /* Superior a la TOC pero inferior a modales */
    padding: 1rem;
    backdrop-filter: blur(10px);
  }

  .header-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .header-title {
    font-size: 1.25rem;
    margin: 0;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .article-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
    padding-top: 4.5rem; /* Ajuste para el header fijo */
  }

  /*****************************************************/
  /*** Layout con Grid para TOC y contenido ***/
  .article-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    margin-top: 1rem;
    position: relative;
  }

  .article-content-wrapper {
    background-color: var(--background-color2);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    padding: 0rem 2rem;
    transition: all var(--transition-speed);
    min-width: 0;
    position: relative;
    z-index: 1000;
  }

  .article-content-wrapper:hover {
    box-shadow: var(--box-shadow-elevated);
  }

  /*****************************************************/
  /*** Estados de carga y error ***/
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    position: relative;
    z-index: 1001;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(var(--primary-rgb), 0.3);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  .error-state i {
    font-size: 3rem;
    color: #ef4444;
    margin-bottom: 1rem;
  }

  .error-state h3 {
    margin: 0 0 0.5rem;
    color: var(--text-color);
  }

  .error-state p {
    margin: 0 0 1.5rem;
    color: var(--text-color-lighter);
  }

  .retry-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-speed);
    z-index: 1001;
  }

  .retry-button:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /*****************************************************/
  /*** Resalte de sección al navegar ***/
  :global(.highlight-section) {
    animation: highlightSection 2s ease-out;
    position: relative;
    z-index: 1001;
  }

  @keyframes highlightSection {
    0% {
      background-color: transparent;
    }
    20% {
      background-color: rgba(var(--accent-rgb), 0.1);
    }
    80% {
      background-color: rgba(var(--accent-rgb), 0.1);
    }
    100% {
      background-color: transparent;
    }
  }

  /*** Animación de corazones flotantes (like) ***/
  :global(.heart-animation-container) {
    position: fixed;
    bottom: 50px;
    right: 50px;
    pointer-events: none;
    z-index: 2000; /* Superior a la mayoría de los elementos */
  }

  :global(.floating-heart) {
    position: absolute;
    font-size: 2rem;
    color: #ff6b6b;
    animation: floatUp 1.5s ease forwards;
    opacity: 0;
  }

  @keyframes floatUp {
    0% {
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-50px, -100px) rotate(var(--angle)) scale(0.5);
      opacity: 0;
    }
  }

  /*****************************************************/
  /*** Adaptaciones responsive ***/
  @media (max-width: 1200px) {
    .article-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px), (max-height: 900px) and (min-width: 1200px) {
    .article-container {
      padding: 1rem;
      padding-top: 3rem; /* Ajuste para header móvil */
    }

    .sticky-header {
      padding: 0.75rem;
      z-index: 2000; /* Asegurar que el header móvil esté por encima */
    }
    .header-content {
      padding: 0 1rem;
    }
    .header-title {
      font-size: 1rem;
    }

    .article-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .article-container {
      padding: 0.5rem;
    }
    .article-content-wrapper {
      padding: 1rem;
    }
  }

  /*****************************************************/
  /*** Transición suave de tema ***/
  .theme-transition {
    transition: background-color var(--transition-speed), color var(--transition-speed);
  }

  /*****************************************************/
  /*** Modal Overlay ***/
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--modal-overlay-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: var(--modal-z-index); /* Superior a otros elementos */
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Evitar que la opacidad afecte al contenido del modal */
  :global(.modal-overlay > *) {
    position: relative;
    z-index: 1;
  }

</style>