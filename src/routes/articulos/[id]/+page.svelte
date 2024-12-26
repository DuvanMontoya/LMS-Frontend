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
  import EnrolledArticle from '$lib/components/articulo/EnrolledArticle.svelte';
  import ArticlePreview from '$lib/components/articulo/ArticlePreview.svelte';
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
  let isTitleProgressVisible = false;

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
  let isVertical = false;
  let showTocMobile = false;

  // Matrícula
  let isEnrolled = false;
  let enrollmentStatus = null;
  let showEnrollModal = false;

  // Control MathJax
  let mathJaxLoaded = false;

  // Listener de scroll
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

    // Sección activa
    updateActiveSection();
  }

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
        likeData,
        commentsData
      ] = await Promise.all([
        apiService.fetchArticleById(articleId, token),
        apiService.checkArticleEnrollment(articleId, token),
        apiService.fetchEnrollmentStatus(articleId, token),
        apiService.fetchLikeStatus(articleId, token),
        apiService.fetchComments(articleId, token)
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
      comments = commentsData.results; // Asegúrate de que 'commentsData' tenga la estructura correcta

      // Generar TOC
      generateTableOfContents();

    } catch (err) {
      console.error('Error loading data:', err);
      error = err.message || 'Hubo un problema al cargar el artículo.';
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

      script.onerror = () => reject(new Error('MathJax failed to load'));
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

  function updateActiveSection() {
    if (!toc.length) return;

    const sections = document.querySelectorAll('h2, h3, h4, h5, h6');
    let current = '';
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) { // Mantener la sección en la mitad
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

    const offset = isMobile || isVertical ? 60 : 80; // Ajuste según el tamaño del header
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

  /** Manejar comentarios */
  async function handleComment(content, parentId = null) {
    try {
      const token = get(sessionStore).access;
      if (!token) {
        throw new Error('Debes iniciar sesión para comentar');
      }
      await apiService.postComment(articleId, content, token, parentId);
      await loadInitialData();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  }

  /** Manejar "Me gusta" en comentarios */
  async function handleLikeComment(commentId) {
    try {
      const token = get(sessionStore).access;
      if (!token) {
        throw new Error('No se proporcionó un token de autenticación');
      }
      await apiService.likeComment(commentId, token);
      await loadInitialData();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  }

  async function handleRating(rating) {
    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error('No se proporcionó un token de autenticación');

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

  // Escuchar el evento 'requestEnrollment' del componente EnrollModal
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
      alert('Hubo un error al enviar la solicitud.');
    }
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

  async function handleAccessRequest(event) {
    try {
      const { motivo } = event.detail; // Captura el motivo desde el evento
      showEnrollModal = true;
    } catch (error) {
      console.error('Error procesando la solicitud de acceso:', error);
    }
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
      {#if (!isMobile && !isVertical) && toc.length}
        <div class="toc-wrapper">
          <TableOfContents
            toc={toc}
            activeSection={activeSection}
            onNavigate={scrollToSection}
            isMobile={false}
            toggleTOC={toggleTocMobile}
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
              on:requestAccess={handleAccessRequest}
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
        on:rate={() => {
          showBottomSheet = true;
          activeBottomSheetContent = 'rating';
        }}
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
        on:rate={() => {
          showBottomSheet = true;
          activeBottomSheetContent = 'rating';
        }}
        on:toggleDarkMode={toggleDarkMode}
        on:scrollToTop={scrollToTop}
        on:toggleToc={toggleTocMobile}
      />
    {/if}
  {/if}

  <!-- Panel de comentarios -->
  {#if showComments && (isEnrolled || article?.acceso === 'gratis')}
    <CommentsPanel
      comments={comments}
      onPostComment={handleComment}
      onLikeComment={handleLikeComment} 
      onClose={() => (showComments = false)}
    />
  {/if}

  <!-- BottomSheet -->
  {#if showBottomSheet}
    <BottomSheet
      activeContent={activeBottomSheetContent}
      toc={toc}
      comments={comments}
      activeSection={activeSection}
      onNavigate={scrollToSection}
      onPostComment={handleComment}
      onRate={handleRating}
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
  {#if (isMobile || isVertical) && showTocMobile && toc.length}
    <div class="modal-overlay">
      <TableOfContents
        toc={toc}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        isMobile={true}
        toggleTOC={toggleTocMobile}
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
    z-index: 2000; /* Superior a la TOC pero inferior a modales */
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

  /* Envoltorio de la TOC para que sea sticky y se adapte al header */
  .toc-wrapper {
    position: sticky;
    top: 80px; /* Altura del header fijo */
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    z-index: 1500; /* Superior a la mayoría de los elementos */
  }

  .article-content-wrapper {
    background-color: var(--background-color2);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
    padding: 2rem;
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
    .toc-wrapper {
      position: static;
      max-height: none;
      margin-bottom: 2rem;
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

    .toc-wrapper {
      display: none; /* Ocultar TOC en desktop cuando es móvil o vertical */
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
  .modal-overlay > * {
    position: relative;
    z-index: 1;
  }

  /* Mejoras adicionales */
  /* Scrollbar personalizado para TOC */
  .toc-wrapper::-webkit-scrollbar {
    width: 8px;
  }

  .toc-wrapper::-webkit-scrollbar-track {
    background: var(--background-color2);
  }

  .toc-wrapper::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 4px;
    border: 2px solid var(--background-color2);
  }

  /* Scrollbar personalizado para modal TOC */
  .table-of-contents.mobile .toc-content::-webkit-scrollbar {
    width: 6px;
  }

  .table-of-contents.mobile .toc-content::-webkit-scrollbar-track {
    background: var(--background-color2);
  }

  .table-of-contents.mobile .toc-content::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 3px;
    border: 2px solid var(--background-color2);
  }

  /* Botón para abrir TOC en móviles y vertical screens */
  .open-toc-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--box-shadow-elevated);
    z-index: 2001; /* Superior a otros elementos */
    transition: background-color var(--transition-speed), transform var(--transition-speed);
  }

  .open-toc-button:hover {
    background-color: var(--primary-dark);
    transform: scale(1.05);
  }
</style>