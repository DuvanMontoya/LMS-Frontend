<script>
  import { onMount, afterUpdate } from 'svelte';
  import { get } from 'svelte/store';
  import { sessionStore } from '$lib/stores/sessionStore';
  import apiService from '$lib/api/articulos/articulos.js';
  import ArticleHeader from '$lib/components/articulo/ArticleHeader.svelte';
  import TableOfContents from '$lib/components/articulo/TableOfContents.svelte';
  import ArticleContent from '$lib/components/articulo/ArticleContent.svelte';
  import FloatingButtons from '$lib/components/articulo/FloatingButtons.svelte';
  import MobileNav from '$lib/components/articulo/MobileNav.svelte';
  import CommentsPanel from '$lib/components/articulo/CommentsPanel.svelte';
  import BottomSheet from '$lib/components/articulo/BottomSheet.svelte';
  import EnrollModal from '$lib/components/articulo/EnrollModal.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { Howl } from 'howler';
  import { page } from '$app/stores';

  // Variables reactivas
  let articleId = $page.params.id;
  $: articleId, loadInitialData();

  let article = null;
  let isLoading = true;
  let isEnrolled = false;
  let enrollmentStatus = null;
  let toc = [];
  let showEnrollModal = false;
  let activeSection = '';
  let readingProgress = 0;
  let isLiked = false;
  let likesCount = 0;
  let showComments = false;
  let comments = []; // Inicializar comments
  let isDarkMode = false;
  let isMobile = false;
  let showBottomSheet = false;
  let activeBottomSheetContent = '';

  // Funciones auxiliares
  const loadInitialData = async () => {
    isLoading = true;
    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error('No auth token provided');

      const [
        articleData,
        enrollmentData,
        statusData,
        likeData,
        commentsData,
      ] = await Promise.all([
        apiService.fetchArticleById(articleId, token),
        apiService.checkArticleEnrollment(articleId, token),
        apiService.fetchEnrollmentStatus(articleId, token),
        apiService.fetchLikeStatus(articleId, token),
        apiService.fetchComments(articleId, token),
      ]);

      article = articleData;
      isEnrolled = enrollmentData.matriculado;
      enrollmentStatus = statusData.status;
      isLiked = likeData.is_liked;
      likesCount = likeData.total_likes;
      comments = commentsData.results; // Asignar los resultados a comments

      generateTableOfContents();
      renderMathJax();
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      isLoading = false;
    }
  };

  const generateTableOfContents = () => {
    if (!article?.contenido_html) return;
    const contentElement = document.createElement('div');
    contentElement.innerHTML = article.contenido_html;
    const headings = contentElement.querySelectorAll('h2, h3, h4, h5, h6');
    toc = Array.from(headings).map((heading, index) => ({
      text: heading.innerText,
      id: `heading-${index}`,
      level: parseInt(heading.tagName.slice(1), 10),
    }));
    headings.forEach((heading, index) =>
      heading.setAttribute('id', `heading-${index}`)
    );
    article.contenido_html = contentElement.innerHTML;
  };

  // --- Acción swipe ---
  function swipe(node, { timeframe = 250, minSwipeDistance = 50 } = {}) {
    let x;
    let y;
    let startTime;

    const handleTouchStart = (event) => {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
      startTime = new Date().getTime();

      node.addEventListener('touchmove', handleTouchMove, { passive: false });
      node.addEventListener('touchend', handleTouchEnd);
    };

    const handleTouchMove = (event) => {
        event.preventDefault();
    };

    const handleTouchEnd = (event) => {
      const endTime = new Date().getTime();
      if (endTime - startTime < timeframe) {
        const deltaX = event.changedTouches[0].clientX - x;
        const deltaY = event.changedTouches[0].clientY - y;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > minSwipeDistance && absX > absY) {
          node.dispatchEvent(
            new CustomEvent('swipe', {
              detail: { direction: deltaX > 0 ? 'right' : 'left' },
            })
          );
        } else if (absY > minSwipeDistance && absY > absX) {
          node.dispatchEvent(
            new CustomEvent('swipe', {
              detail: { direction: deltaY > 0 ? 'down' : 'up' },
            })
          );
        }
      }

      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
    };

    node.addEventListener('touchstart', handleTouchStart);

    return {
      destroy() {
        node.removeEventListener('touchstart', handleTouchStart);
        node.removeEventListener('touchmove', handleTouchMove);
        node.removeEventListener('touchend', handleTouchEnd);
      },
    };
  }

  const handleSwipe = (event) => {
    const direction = event.detail.direction;
    if (direction === 'left' && !showBottomSheet) {
      showBottomSheet = true;
      activeBottomSheetContent = 'toc';
    } else if (direction === 'right' && showBottomSheet) {
      showBottomSheet = false;
    }
  };

  // --- Funciones de interacción ---
  const requestEnrollment = async (reason) => {
    try {
      await apiService.matricularArticulo(articleId, reason);
      enrollmentStatus = 'pending';
      showEnrollModal = false;
      await loadInitialData();
    } catch (err) {
      console.error('Error requesting enrollment:', err);
    }
  };

  const handleLikeClick = async () => {
    try {
      await apiService.updateLikeStatus(articleId, !isLiked);
      isLiked = !isLiked;
      likesCount = isLiked ? likesCount + 1 : likesCount - 1;
      if (isLiked) {
        showLikeAnimation();
        playLikeSound();
      }
    } catch (err) {
      console.error('Error updating like status:', err);
    }
  };

  const showLikeAnimation = () => {
    const heart = document.createElement('div');
    heart.classList.add('heart-animation');
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  };

  const playLikeSound = () => {
    const sound = new Howl({
      src: ['/sounds/like_sound.mp3'],
      volume: 0.5,
    });
    sound.play();
  };

  const handleRating = async () => {
    // Implementa la lógica de calificación
    showBottomSheet = false;
  };


  const handlePostComment = async (content) => {
    try {
      await apiService.postComment(articleId, content);
      showComments = false;
      await loadInitialData();
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

   //  Declarar onPostComment que usa handlePostComment
   const onPostComment = handlePostComment;

  const updateReadingProgress = () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    readingProgress = (winScroll / height) * 100;
  };

  const updateActiveSection = () => {
    const sections = document.querySelectorAll('h2, h3, h4, h5, h6');
    for (const section of sections) {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 100) {
        activeSection = section.getAttribute('id');
      }
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const onNavigate = scrollToSection;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode); // Persistir la preferencia
  };

  // --- Efectos ---
  onMount(async () => {
    await loadMathJax();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener(
      'resize',
      () => (isMobile = window.innerWidth <= 768)
    );
    isMobile = window.innerWidth <= 768;

    // Cargar preferencia de modo oscuro desde localStorage
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      isDarkMode = storedDarkMode === 'true';
      document.body.classList.toggle('dark-mode', isDarkMode);
    }
  });

  afterUpdate(() => {
    renderMathJax();
  });

  // --- Carga de MathJax (optimizado) ---
  const loadMathJax = async () => {
    if (window.MathJax) return;

    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;
    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ['$', '$'],
            ['\\(', '\\)'],
          ],
          displayMath: [
            ['$$', '$$'],
            ['\\[', '\\]'],
          ],
          processEscapes: true,
        },
      });
      renderMathJax();
    };
    document.head.appendChild(script);
  };

  const renderMathJax = () => {
    if (window.MathJax && window.MathJax.Hub) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
    }
  };
</script>

<svelte:head>
  <title>{article ? article.titulo : 'Cargando...'}</title>
  <meta name="description" content={article ? article.resumen : 'Cargando descripción...'}>
  <link
    href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Roboto:wght@300;400;500&display=swap"
    rel="stylesheet"
  />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css" integrity="sha512-SzlrxWUlpfuzQ+pcUCosxcglQRNAq/DZjVsC0lE40xsADsfeQoEypE+enwcOiGjk/bSuGGKHEyjSoQ1zVisanQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<main
  class="article-main {isDarkMode ? 'dark-mode' : ''}"
  use:swipe
  on:swipe={handleSwipe}
>
  <div
    class="reading-progress-bar"
    style="width: {readingProgress}%"
  ></div>

  {#if isMobile}
    <MobileNav
      {isLiked}
      likesCount={likesCount}
      onLike={handleLikeClick}
      onComments={() => (showComments = true)}
      onRate={() => {
        showBottomSheet = true;
        activeBottomSheetContent = 'rating';
      }}
      onToggleDarkMode={toggleDarkMode}
      onScrollToTop={scrollToTop}
    />
  {/if}

  <ArticleHeader
    title={article?.titulo}
    author={article?.autor.usuario.username}
    date={article?.fecha_publicacion}
    category={article?.categoria_articulo.nombre}
  />

  <div class="article-layout">
    {#if !isMobile}
      <TableOfContents
        {toc}
        {activeSection}
        onNavigate={scrollToSection}
      />
    {/if}

    <article class="article-content-container">
      {#if isLoading}
        <div class="loading-spinner">
          <Spinner size="50px" color="var(--accent-color)" />
          <p>Cargando...</p>
        </div>
      {:else if article}
        {#if isEnrolled}
          <ArticleContent contenido_html={article.contenido_html} />
        {:else if enrollmentStatus === 'pending'}
          <div class="enrollment-status-message">
            <p>Tu solicitud está pendiente de aprobación.</p>
            <div class="preview-content">
              <div class="preview-text">
                {@html article.preview_html}
              </div>
              <div class="preview-overlay"></div>
            </div>
          </div>
        {:else if enrollmentStatus === 'rejected'}
          <div class="enrollment-status-message">
            <p>
              Tu solicitud fue rechazada. Intenta de nuevo o contacta al
              administrador.
            </p>
            <div class="preview-content">
              <div class="preview-text">
                {@html article.preview_html}
              </div>
              <div class="preview-overlay"></div>
            </div>
            <Button on:click={() => (showEnrollModal = true)}>
              Solicitar acceso
            </Button>
          </div>
        {:else}
          <div class="article-preview">
            <div class="preview-content">
              <div class="preview-text">
                {@html article.preview_html}
              </div>
              <div class="preview-overlay"></div>
            </div>
            <Button on:click={() => (showEnrollModal = true)}>
              Solicitar acceso
            </Button>
          </div>
        {/if}
        {#if article.archivo_adjunto}
          <div class="attachment-section">
            <h3>Archivo adjunto</h3>
            <a
              href={article.archivo_adjunto}
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-secondary"
            >
              <i class="fas fa-file-download"></i>
              Descargar
            </a>
          </div>
        {/if}
      {:else}
        <ErrorMessage message="No se encontró el artículo." />
      {/if}
    </article>
  </div>

  {#if !isMobile}
    <FloatingButtons
      {isLiked}
      likesCount={likesCount}
      onLike={handleLikeClick}
      onComments={() => (showComments = true)}
      onRate={() => {
        showBottomSheet = true;
        activeBottomSheetContent = 'rating';
      }}
      onToggleDarkMode={toggleDarkMode}
      onScrollToTop={scrollToTop}
    />
  {/if}

  <BottomSheet
    {activeBottomSheetContent}
    {toc}
    {comments}
    on:close={() => (showBottomSheet = false)}
    {onNavigate}
    {onPostComment}
    on:rate={handleRating}
/>

  {#if showComments}
    <CommentsPanel
      {comments}
      on:postComment={handlePostComment}
      on:close={() => (showComments = false)}
    />
  {/if}

  {#if showEnrollModal}
    <EnrollModal
      onRequestEnrollment={requestEnrollment}
      on:close={() => (showEnrollModal = false)}
      title={article?.titulo}
    />
  {/if}
</main>

<style>
  :root {
    --primary-color: #007bff; /* Azul vibrante */
    --secondary-color: #28a745; /* Verde esmeralda */
    --accent-color: #ffc107; /* Amarillo dorado */
    --background-color: #f8f9fa; /* Gris claro */
    --background-color2: #ffffff; /* Blanco */
    --text-color: #343a40; /* Gris oscuro */
    --light-text-color: #6c757d; /* Gris medio */
    --header-background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); /* Gradiente para encabezados */
    --box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Sombra más pronunciada */
    --border-radius: 10px; /* Bordes más redondeados */
    --transition-speed: 0.4s; /* Transiciones más suaves */
    --font-family-serif: 'Merriweather', serif;
    --font-family-sans: 'Roboto', sans-serif;
  }

  .dark-mode {
    --primary-color: #6610f2;
    --secondary-color: #20c997;
    --accent-color: #fd7e14;
    --background-color: #212529;
    --background-color2: #343a40;
    --text-color: #f8f9fa;
    --light-text-color: #adb5bd;
    --header-background: #343a40;
    --box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1); /* Sombra más pronunciada en modo oscuro */

  }

  .article-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: var(--font-family-sans);
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color var(--transition-speed), color var(--transition-speed);
  }

  .reading-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 6px;
    background-color: var(--accent-color);
    z-index: 1000;
    transition: width var(--transition-speed) ease-out;
  }

  .article-layout {
    display: flex;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .article-content-container {
    flex: 1;
    background-color: var(--background-color2);
    padding: 3rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    transition: background-color var(--transition-speed), box-shadow var(--transition-speed);
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
  }

  .enrollment-status-message,
  .article-preview {
    text-align: center;
    padding: 3rem;
    background-color: var(--background-color2);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    margin-bottom: 3rem;
    transition: background-color var(--transition-speed), box-shadow var(--transition-speed);
  }

  .preview-content {
    position: relative;
    max-height: 350px;
    overflow: hidden;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .preview-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(transparent, var(--background-color));
  }

  .attachment-section {
    margin-top: 3rem;
    padding-top: 3rem;
    border-top: 2px solid var(--accent-color);
  }

  .attachment-section h3 {
    color: var(--text-color);
    margin-bottom: 1.5rem;
    font-family: var(--font-family-serif);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    background-color: var(--primary-color);
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color var(--transition-speed), transform var(--transition-speed);
    text-decoration: none;
    box-shadow: var(--box-shadow);
  }
  .btn i{
    margin-right: 0.5rem;
  }

  .btn:hover {
    background-color: #0056b3;
    transform: translateY(-2px); /* Efecto de elevación al hacer hover */
  }

  .btn-secondary {
    background-color: var(--secondary-color);
  }

  .btn-secondary:hover {
    background-color: #008000;
  }

  /* Estilos para el corazón de la animación de like */
  :global(.heart-animation) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    animation: heartAnimation 1s ease-out;
  }

  :global(.heart-animation) i {
    color: #dc3545;
    font-size: 60px;
  }

  @keyframes heartAnimation {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.8);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .article-layout {
      flex-direction: column;
    }

    .article-content-container {
      padding: 2.5rem;
    }

    .enrollment-status-message,
    .article-preview {
      padding: 2.5rem;
    }
  }

  @media (max-width: 768px) {
    .article-main {
      padding: 1.5rem;
    }

    .article-content-container {
      padding: 2rem;
    }

    .enrollment-status-message,
    .article-preview {
      padding: 2rem;
    }

    .btn {
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
    }
    .preview-content {
      max-height: 300px;
    }
    .preview-overlay {
      height: 100px;
    }
  }

  @media (max-width: 480px) {
    .article-main {
      padding: 1rem;
    }

    .article-content-container {
      padding: 1.5rem;
    }

    .enrollment-status-message,
    .article-preview {
      padding: 1.5rem;
    }

    .btn {
      padding: 0.7rem 1.2rem;
      font-size: 0.9rem;
    }
    .preview-content {
      max-height: 250px;
    }
    .preview-overlay {
      height: 80px;
    }
  }
</style>