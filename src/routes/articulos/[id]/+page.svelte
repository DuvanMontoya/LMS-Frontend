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
  import ArticleHeader from '$lib/components/articulo/ArticleHeader.svelte';
  import TableOfContents from '$lib/components/articulo/TableOfContents.svelte';
  import ArticleContent from '$lib/components/articulo/ArticleContent.svelte';
  import FloatingButtons from '$lib/components/articulo/FloatingButtons.svelte';
  import MobileNav from '$lib/components/articulo/MobileNav.svelte';
  import CommentsPanel from '$lib/components/articulo/CommentsPanel.svelte';
  import BottomSheet from '$lib/components/articulo/BottomSheet.svelte';
  import EnrollModal from '$lib/components/articulo/EnrollModal.svelte';

  /* Estado principal */
  let articleId = $page.params.id;
  let article = null;
  let isLoading = true;
  let error = null;

  // TOC y lectura
  let toc = [];
  let activeSection = '';
  let readingProgress = 0;
  let lastScrollY = 0;
  let isHeaderVisible = true;

  // Interacciones
  let isLiked = false;
  let likesCount = 0;
  let showComments = false;
  let comments = [];
  let showBottomSheet = false;
  let activeBottomSheetContent = '';

  // UI
  let isDarkMode = false;
  let isMobile = false;
  let showTocMobile = false;

  // Matrícula
  let isEnrolled = false;
  let enrollmentStatus = null;
  let showEnrollModal = false;

  // Control MathJax
  let mathJaxLoaded = false;

  onMount(() => {
    // Detectar si es mobile
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    isMobile = mediaQuery.matches;
    mediaQuery.addListener(e => (isMobile = e.matches));

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
    };
  });

  // Cuando abres el bottom sheet:
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

      const [articleData, enrollmentData, statusData, likeData, commentsData] =
        await Promise.all([
          apiService.fetchArticleById(articleId, token),
          apiService.checkArticleEnrollment(articleId, token),
          apiService.fetchEnrollmentStatus(articleId, token),
          apiService.fetchLikeStatus(articleId, token),
          apiService.fetchComments(articleId, token)
        ]);

      // Asignar
      article = articleData;
      isEnrolled = enrollmentData.matriculado;
      enrollmentStatus = statusData.status;
      isLiked = likeData.is_liked;
      likesCount = likeData.total_likes;
      comments = commentsData.results;

      // Generar TOC
      generateTableOfContents();

      // MathJax
      if (!mathJaxLoaded) {
        mathJaxLoaded = true;
        await initializeMathJax();
      } else {
        renderMathJax();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      error = 'Hubo un problema al cargar el artículo.';
    } finally {
      isLoading = false;
    }
  }

  /** Manejo MathJax */
  async function initializeMathJax() {
    if (window.MathJax) {
      renderMathJax();
      return;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
      script.async = true;

      script.onload = () => {
        window.MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true
          },
          messageStyle: 'none',
          showProcessingMessages: false,
          showMathMenu: false
        });
        renderMathJax();
        resolve();
      };

      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function renderMathJax() {
    if (window.MathJax?.Hub) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
    }
  }

  /** Genera la tabla de contenido (TOC) */
  function generateTableOfContents() {
    if (!article?.contenido_html) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.contenido_html;
    const headings = Array.from(tempDiv.querySelectorAll('h2, h3, h4, h5, h6'));

    toc = headings.map((heading, index) => {
      const id = `section-${index}`;
      heading.id = id;
      return {
        id,
        text: heading.textContent.trim(),
        level: parseInt(heading.tagName.slice(1), 10)
      };
    });

    // Reemplazar el HTML con IDs
    article.contenido_html = tempDiv.innerHTML;
  }

  /** Scroll: progreso de lectura y header visible/oculto */
  function handleScroll() {
    const currentScrollY = window.scrollY;
    isHeaderVisible = currentScrollY <= lastScrollY || currentScrollY < 100;
    lastScrollY = currentScrollY;

    // Progreso de lectura
    const winScroll = document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    readingProgress = (winScroll / height) * 100;

    // Sección activa
    updateActiveSection();
  }

  function updateActiveSection() {
    if (!toc.length) return;

    const sections = document.querySelectorAll('h2, h3, h4, h5, h6');
    let current = '';
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100) {
        current = section.id;
      }
    }
    if (current !== activeSection) {
      activeSection = current;
    }
  }

  function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    element.classList.add('highlight-section');
    setTimeout(() => element.classList.remove('highlight-section'), 2000);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (showTocMobile) {
      showTocMobile = false;
    }
  }

  /** Interacciones */
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
      z-index: 9999;
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

async function handleComment(content) {
  try {
    const token = $sessionStore?.access;
    if (!token) {
      throw new Error('Debes iniciar sesión para comentar');
    }
    await apiService.postComment(articleId, content, token);
    await loadInitialData();
  } catch (error) {
    console.error('Error posting comment:', error);
  }
}

  async function handleRating(rating) {
  try {
    const token = $sessionStore.access;
    if (!token) throw new Error('No auth token');
    
    await apiService.rateArticle(articleId, rating, token);
    showBottomSheet = false;
  } catch (error) {
    console.error('Error al calificar:', error);
  }
}

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', String(isDarkMode));
  }

  async function handleEnrollment(reason) {
    try {
      const token = get(sessionStore).access;
      await apiService.matricularArticulo(articleId, reason, token);
      enrollmentStatus = 'pending';
      showEnrollModal = false;
      await loadInitialData();
    } catch (err) {
      console.error('Error requesting enrollment:', err);
    }
  }

  function openComments() {
    showComments = true;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
<main class="article-page theme-transition {isDarkMode ? 'dark-mode' : ''}" class:loading={isLoading}>
  <!-- Barra de progreso -->
  <div class="reading-progress" style="width: {readingProgress}%"></div>

  <!-- Header fijo (solo desktop) -->
  {#if isHeaderVisible && !isMobile}
    <div class="sticky-header">
      <div class="header-content">
        <h1 class="header-title">{article?.titulo || 'Cargando...'}</h1>
        <div class="header-progress">
          <div class="progress-bar" style="width: {readingProgress}%"></div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Contenido principal -->
  <div class="article-container">
    <!-- Header del artículo -->
    {#if article}
      <ArticleHeader
        title={article.titulo}
        author={article.autor.usuario.username}
        date={article.fecha_publicacion}
        category={article.categoria_articulo.nombre}
      />
    {/if}

    <!-- LAYOUT: Grid con 2 columnas: TOC + contenido -->
    <div class="article-layout">
      {#if !isMobile && toc.length}
        <div class="toc-wrapper">
          <TableOfContents
            {toc}
            {activeSection}
            on:navigate={scrollToSection}
          />
        </div>
      {/if}

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
          {#if isEnrolled}
            <!-- CONTENIDO COMPLETO -->
            <ArticleContent contenido_html={article.contenido_html} />

            {#if article.archivo_adjunto}
              <div class="attachment-section">
                <h3>
                  <i class="fas fa-paperclip"></i>
                  Material complementario
                </h3>
                <a
                  href={article.archivo_adjunto}
                  class="download-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i class="fas fa-file-download"></i>
                  Descargar archivo
                </a>
              </div>
            {/if}

          {:else}
            <!-- SIN ACCESO COMPLETO -->
            <div class="enrollment-section">
              {#if enrollmentStatus === 'pending'}
                <div class="status-message pending">
                  <div class="status-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <h3>Solicitud en revisión</h3>
                  <p>Tu solicitud de acceso está siendo evaluada.</p>
                </div>

              {:else if enrollmentStatus === 'rejected'}
                <div class="status-message rejected">
                  <div class="status-icon">
                    <i class="fas fa-times-circle"></i>
                  </div>
                  <h3>Solicitud rechazada</h3>
                  <p>Lo sentimos, tu solicitud fue rechazada.</p>
                  <button
                    class="action-button"
                    on:click={() => (showEnrollModal = true)}
                  >
                    Solicitar acceso nuevamente
                  </button>
                </div>

              {:else}
                <!-- VISTA PREVIA -->
                <div class="enrollment-prompt">
                  <div class="lock-icon">
                    <i class="fas fa-lock"></i>
                  </div>
                  <h3>Contenido restringido</h3>
                  <p>Este artículo requiere solicitar acceso.</p>

                  <div class="preview-content">
                    <ArticleContent
                      contenido_html={article.preview_html}
                      isPreview={true}
                    />
                  </div>

                  <button
                    class="enroll-button"
                    on:click={() => (showEnrollModal = true)}
                  >
                    <i class="fas fa-key"></i>
                    Solicitar acceso
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      </article>
    </div>
  </div>

  <!-- Navegación MÓVIL vs Botones flotantes DESKTOP -->
  {#if isMobile}
    <MobileNav
      isLiked={isLiked}
      likesCount={likesCount}
      onLike={handleLikeClick}    
      onComments={() => (showComments = true)}
      onRate={() => {
        showBottomSheet = true;
        activeBottomSheetContent = 'rating';
      }}
      onToggleDarkMode={toggleDarkMode}
      onScrollToTop={scrollToTop}
      isDarkMode={isDarkMode}
    />
  {:else}
    <!-- Capturamos eventos emitidos por FloatingButtons -->
    <FloatingButtons
      isLiked={isLiked}
      likesCount={likesCount}
      isDarkMode={isDarkMode}
      on:like={handleLikeClick}
      on:comments={openComments}
      on:rate={() => {
        showBottomSheet = true;
        activeBottomSheetContent = 'rating';
      }}
      on:toggleDarkMode={toggleDarkMode}
      on:scrollToTop={scrollToTop}
    />
  {/if}

  <!-- Panel de comentarios -->
  {#if showComments}
    <CommentsPanel
      comments={comments}
      onPostComment={handleComment}
      onClose={() => (showComments = false)}
    />
  {/if}

  <!-- BottomSheet -->
  {#if showBottomSheet}
  <BottomSheet
    activeContent={activeBottomSheetContent}
    {toc}
    {comments}
    {activeSection}
    onNavigate={scrollToSection}
    onPostComment={handleComment}
    onRate={handleRating}
    on:close={() => {
      showBottomSheet = false;
      activeBottomSheetContent = '';
    }}
  />
{/if}

  <!-- Modal de matrícula -->
  {#if showEnrollModal}
    <EnrollModal
      title={article?.titulo}
      onRequestEnrollment={handleEnrollment}
      onClose={() => (showEnrollModal = false)}
    />
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
    z-index: 1000;
    transition: width 0.2s ease-out;
  }

  .sticky-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: var(--background-color2);
    box-shadow: var(--box-shadow);
    z-index: 100;
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

  .header-progress {
    height: 3px;
    background-color: rgba(var(--text-rgb), 0.1);
    margin-top: 0.5rem;
    border-radius: 1px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
    transition: width 0.2s ease-out;
  }

  .article-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
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

  /* Envoltorio de la TOC para que sea sticky y se adapte al header */
  .toc-wrapper {
    position: sticky;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
  }

  .article-content-wrapper {
    background-color: var(--background-color2);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    padding: 2rem;
    transition: all var(--transition-speed);
    min-width: 0;
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
  /*** Sección de matrícula / restricciones ***/
  .enrollment-section {
    text-align: center;
    padding: 2rem;
  }

  .status-message {
    padding: 2rem;
    border-radius: var(--border-radius);
    background-color: var(--background-elevated);
    margin-bottom: 1rem;
  }
  .status-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }
  .status-message.pending .status-icon {
    background-color: rgba(var(--accent-rgb), 0.1);
    color: var(--accent-color);
  }
  .status-message.rejected .status-icon {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .enrollment-prompt {
    max-width: 600px;
    margin: 0 auto;
  }
  .lock-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: white;
  }
  .preview-content {
    margin: 2rem 0;
    position: relative;
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .enroll-button,
  .action-button {
    padding: 1rem 2rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1.1rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    margin: 2rem auto 0;
    cursor: pointer;
    transition: all var(--transition-speed);
  }
  .enroll-button:hover,
  .action-button:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
  }

  /*****************************************************/
  /*** Archivo Adjunto ***/
  .attachment-section {
    margin-top: 3rem;
    padding-top: 3rem;
    border-top: 2px solid var(--accent-color);
  }
  .attachment-section h3 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-color);
    margin-bottom: 1.5rem;
  }
  .download-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background-color: var(--secondary-color);
    color: white;
    border-radius: var(--border-radius);
    text-decoration: none;
    font-weight: 500;
    transition: all var(--transition-speed);
  }
  .download-button:hover {
    background-color: var(--secondary-dark);
    transform: translateY(-2px);
  }

  /*****************************************************/
  /*** Resalte de sección al navegar ***/
  :global(.highlight-section) {
    animation: highlightSection 2s ease-out;
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
    z-index: 9999;
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
    .toc-wrapper {
      position: static;
      max-height: none;
      margin-bottom: 2rem;
    }
  }

  @media (max-width: 768px) {
    .article-container {
      padding: 1rem;
    }

    .sticky-header {
      padding: 0.75rem;
    }
    .header-content {
      padding: 0 1rem;
    }
    .header-title {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .article-container {
      padding: 0.5rem;
    }
    .article-content-wrapper {
      padding: 1rem;
    }
    .enrollment-section {
      padding: 1rem;
    }
  }

  /*****************************************************/
  /*** Transición suave de tema ***/
  .theme-transition {
    transition: background-color var(--transition-speed), color var(--transition-speed);
  }
</style>
