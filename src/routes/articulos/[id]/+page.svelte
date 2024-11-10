<script>
  import { onMount, afterUpdate } from "svelte";
  import { get } from "svelte/store";
  import { sessionStore } from "$lib/stores/sessionStore";
  import { page } from "$app/stores";
  import {
    fetchArticleById,
    checkArticleEnrollment,
    requestArticleEnrollment,
    fetchEnrollmentStatus,
    updateLikeStatus,
    fetchLikeStatus,
    rateArticle,
    fetchComments,
    postComment,
  } from "$lib/api/articulos/articulos";
  import { fly, fade, slide, scale } from "svelte/transition";
  import { quintOut, backOut, elasticOut } from "svelte/easing";
  import { swipe } from "svelte-gestures";
  import { Howl } from "howler";

  let articleId;
  $: articleId = $page.params.id;

  let error = null;
  let article = null;
  let isLoading = true;
  let isEnrolled = false;
  let enrollmentStatus = null;
  let toc = [];
  let showEnrollModal = false;
  let activeSection = "";
  let readingProgress = 0;
  let isDataLoaded = false;
  let enrollmentReason = "";
  let isLiked = false;
  let likesCount = 0;
  let userRating = 0;
  let showComments = false;
  let comments = [];
  let newComment = "";
  let isDarkMode = false;
  let isMobile = false;
  let showMobileMenu = false;
  let showBottomSheet = false;
  let activeBottomSheetContent = "";
  let showTableOfContents = false;
  let showFloatingButtons = false;

  $: if (articleId) {
    loadInitialData();
  }

  async function loadInitialData() {
    isLoading = true;
    error = null;
    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error("No auth token provided");

      const [articleData, enrollmentData, statusData, likeData, commentsData] =
        await Promise.all([
          fetchArticleById(articleId, token),
          checkArticleEnrollment(articleId, token),
          fetchEnrollmentStatus(articleId, token),
          fetchLikeStatus(articleId, token),
          fetchComments(articleId, token, { page: 1, limit: 10 }),
        ]);

      article = articleData;
      isEnrolled = enrollmentData.matriculado;
      enrollmentStatus = statusData.status;
      isLiked = likeData.is_liked;
      likesCount = likeData.total_likes;
      comments = commentsData.results;

      generateTableOfContents();
      isDataLoaded = true;
      renderMathJax();
    } catch (err) {
      console.error("Error loading data:", err);
      error =
        "Ha ocurrido un error al cargar el artículo. Por favor, intenta de nuevo más tarde.";
    } finally {
      isLoading = false;
    }
  }

  // Carga MathJax solo una vez
  async function loadMathJax() {
    return new Promise((resolve, reject) => {
      if (window.MathJax) {
        resolve();  // MathJax ya está cargado
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
      script.async = true;
      script.onload = () => {
        window.MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [
              ["$", "$"],
              ["\\(", "\\)"],
            ],
            displayMath: [
              ["$$", "$$"],
              ["\\[", "\\]"],
            ],
            processEscapes: true,
          },
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Renderiza las ecuaciones con MathJax
  async function renderMathJax() {
    if (!window.MathJax || !window.MathJax.Hub) return;
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

  function generateTableOfContents() {
    if (!article?.contenido_html) return;
    const contentElement = document.createElement("div");
    contentElement.innerHTML = article.contenido_html;
    const headings = contentElement.querySelectorAll("h2, h3, h4, h5, h6");
    toc = Array.from(headings).map((heading, index) => ({
      text: heading.innerText,
      id: `heading-${index}`,
      level: parseInt(heading.tagName.slice(1), 10),
    }));
    headings.forEach((heading, index) =>
      heading.setAttribute("id", `heading-${index}`),
    );
    article.contenido_html = contentElement.innerHTML;
  }

  // Funciones para otras características como el manejo de likes, comentarios y matrícula
  async function requestEnrollment() {
    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error("No auth token provided");
      await requestArticleEnrollment(articleId, token, enrollmentReason);
      enrollmentStatus = "pending";
      showEnrollModal = false;
      await loadInitialData();
    } catch (err) {
      error = "Error al solicitar la matrícula. Por favor, intenta de nuevo.";
      console.error("Error requesting enrollment:", err);
    }
  }

  async function handleLikeClick() {
    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error("No auth token provided");
      const response = await updateLikeStatus(articleId, !isLiked, token);
      isLiked = response.is_liked;
      likesCount = response.total_likes;
      if (isLiked) {
        showLikeAnimation();
        playLikeSound();
      }
    } catch (err) {
      console.error("Error updating like status:", err);
    }
  }

  function showLikeAnimation() {
    const heart = document.createElement("div");
    heart.classList.add("heart-animation");
    heart.innerHTML = '<i class="fas fa-heart"></i>';
    document.body.appendChild(heart);
    setTimeout(() => {
      heart.remove();
    }, 1000);
  }

  function playLikeSound() {
    const sound = new Howl({
      src: ["/sounds/like_sound.mp3"],
      volume: 0.5,
    });
    sound.play();
  }

  async function handleRating() {
    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error("No auth token provided");
      await rateArticle(articleId, userRating, token);
      showBottomSheet = false;
      await loadInitialData();
    } catch (err) {
      error = "Error al calificar el artículo. Por favor, intenta de nuevo.";
      console.error("Error rating article:", err);
    }
  }

  async function handlePostComment() {
    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error("No auth token provided");
      await postComment(articleId, newComment, token);
      newComment = "";
      await loadInitialData();
    } catch (err) {
      error = "Error al publicar el comentario. Por favor, intenta de nuevo.";
      console.error("Error posting comment:", err);
    }
  }

  function updateReadingProgress() {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    readingProgress = (winScroll / height) * 100;
    showFloatingButtons = winScroll > 300;
  }

  function updateActiveSection() {
    const sections = document.querySelectorAll("h2, h3, h4, h5, h6");
    let current = "";
    for (const section of sections) {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 100) {
        current = section.getAttribute("id");
      }
    }
    activeSection = current;
  }

  function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode", isDarkMode);
    updateColorScheme();
  }

  function updateColorScheme() {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty("--primary-color", "#3498db");
      root.style.setProperty("--secondary-color", "#2ecc71");
      root.style.setProperty("--accent-color", "#f1c40f");
      root.style.setProperty("--background-color", "#2C2C2C");
      root.style.setProperty("--background-color2", "#3A3A3A");
      root.style.setProperty("--text-color", "#E0E0E0");
      root.style.setProperty("--light-text-color", "#BDBDBD");
    } else {
      root.style.setProperty("--primary-color", "#1A374D");
      root.style.setProperty("--secondary-color", "#406882");
      root.style.setProperty("--accent-color", "#FFD700");
      root.style.setProperty("--background-color", "#F0F4F8");
      root.style.setProperty("--background-color2", "#FFFFFF");
      root.style.setProperty("--text-color", "#333333");
      root.style.setProperty("--light-text-color", "#666666");
    }
  }

  onMount(async () => {
    await loadMathJax();
    const scrollHandler = () => {
      updateReadingProgress();
      updateActiveSection();
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });

    const resizeHandler = () => {
      isMobile = window.innerWidth <= 768;
    };
    window.addEventListener("resize", resizeHandler);
    resizeHandler();

    await renderMathJax();  // Renderiza MathJax al cargar
  });

  function handleSwipe(event) {
    const direction = event.detail.direction;
    if (direction === "left" && !showBottomSheet) {
      showBottomSheet = true;
      activeBottomSheetContent = "toc";
    } else if (direction === "right" && showBottomSheet) {
      showBottomSheet = false;
    }
  }

  afterUpdate(() => {
    if (isDataLoaded) {
      updateActiveSection();
      renderMathJax();
    }
  });
</script>

<svelte:head>
  <title>{article ? article.titulo : "Cargando artículo académico..."}</title>
  <meta
    name="description"
    content="Explora artículos académicos avanzados con fórmulas interactivas y visualizaciones dinámicas."
  />
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
</svelte:head>

<main
  class="article-main {isDarkMode ? 'dark-mode' : ''}"
  use:swipe={{ timeframe: 300, minSwipeDistance: 60 }}
  on:swipe={handleSwipe}
>
  <div class="reading-progress-bar" style="width: {readingProgress}%"></div>

  <header class="article-header" in:fly={{ y: -50, duration: 800, delay: 200, easing: quintOut }}>
    <div class="header-content">
      <h1>{article ? article.titulo : "Cargando..."}</h1>
      <div class="article-meta">
        <span class="author" in:fly={{ x: -20, duration: 500, delay: 400, easing: quintOut }}>
          <i class="fas fa-user-graduate"></i>
          {article?.autor}
        </span>
        <span class="date" in:fly={{ x: -20, duration: 500, delay: 500, easing: quintOut }}>
          <i class="fas fa-calendar-alt"></i>
          {article
            ? new Date(article.fecha_publicacion).toLocaleDateString()
            : ""}
        </span>
        <span class="category" in:fly={{ x: -20, duration: 500, delay: 600, easing: quintOut }}>
          <i class="fas fa-tags"></i>
          {article?.categoria}
        </span>
      </div>
    </div>
  </header>

  <div class="article-layout">
    {#if !isMobile}
      <nav
        class="table-of-contents"
        class:show-toc={showTableOfContents}
        transition:slide={{ duration: 300, easing: quintOut }}
      >
        <h2>Índice</h2>
        {#each toc as item}
          <a
            href="#{item.id}"
            class="toc-item level-{item.level}"
            class:active={activeSection === item.id}
            on:click|preventDefault={() => scrollToSection(item.id)}
          >
            {item.text}
          </a>
        {/each}
      </nav>
    {/if}

    <article class="article-content">
      {#if isLoading}
        <div class="loading-spinner" in:fade={{ duration: 300 }}>
          <div class="spinner"></div>
          <p>Cargando artículo académico...</p>
        </div>
      {:else if error}
        <div class="error-message" in:fly={{ y: 20, duration: 300, easing: backOut }}>
          <i class="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button class="btn btn-primary" on:click={loadInitialData}>
            Reintentar
          </button>
        </div>
      {:else if article}
        {#if isEnrolled}
        <div class="article-body tex2jax_process">
          {@html article.contenido_html}
        </div>
      {:else if enrollmentStatus === "pending"}
        <div
          class="enrollment-status-message"
          in:fly={{ y: 20, duration: 300, easing: backOut }}
        >
          <p>Tu solicitud de matrícula está pendiente de aprobación.</p>
          <div class="preview-content">
            <div class="preview-text tex2jax_process">
              {@html article.preview_html}
            </div>
            <div class="preview-overlay"></div>
          </div>
        </div>
      {:else if enrollmentStatus === "rejected"}
        <div
          class="enrollment-status-message"
          in:fly={{ y: 20, duration: 300, easing: backOut }}
        >
          <p>
            Tu solicitud de matrícula ha sido rechazada. Puedes intentar
            nuevamente o contactar al administrador para más información.
          </p>
          <div class="preview-content">
            <div class="preview-text tex2jax_process">
              {@html article.preview_html}
            </div>
            <div class="preview-overlay"></div>
          </div>
          <button
            class="cta-button"
            on:click={() => (showEnrollModal = true)}
          >
            Solicitar acceso nuevamente
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      {:else}
        <div class="article-preview" in:fly={{ y: 20, duration: 300, easing: backOut }}>
          <div class="preview-content">
            <div class="preview-text tex2jax_process">
              {@html article.preview_html}
            </div>
            <div class="preview-overlay"></div>
          </div>
          <button
            class="cta-button"
            on:click={() => (showEnrollModal = true)}
          >
            Solicitar acceso al artículo completo
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      {/if}
      {#if article.archivo_adjunto}
        <div
          class="attachment-section"
          in:fly={{ y: 20, duration: 300, delay: 200, easing: backOut }}
        >
          <h3>Archivo adjunto</h3>
          <a
            href={article.archivo_adjunto}
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary"
          >
            <i class="fas fa-file-download"></i> Descargar archivo
          </a>
        </div>
      {/if}
    {:else}
      <div class="article-not-found" in:fly={{ y: 20, duration: 300, easing: backOut }}>
        <i class="fas fa-search"></i>
        <p>No se encontró el artículo solicitado.</p>
        <a href="/" class="btn btn-primary">Volver a la página principal</a>
      </div>
    {/if}
  </article>
</div>

{#if isMobile}
  <nav class="mobile-nav" in:slide={{ y: 100, duration: 300, easing: quintOut }}>
    <button
      on:click={() => {
        showBottomSheet = true;
        activeBottomSheetContent = "toc";
      }}
      class="nav-button"
    >
      <i class="fas fa-list"></i>
      <span>Índice</span>
    </button>
    <button on:click={handleLikeClick} class="nav-button">
      <i class="fas fa-heart" class:liked={isLiked}></i>
      <span>Me gusta</span>
    </button>
    <button
      on:click={() => {
        showBottomSheet = true;
        activeBottomSheetContent = "comments";
      }}
      class="nav-button"
    >
      <i class="fas fa-comments"></i>
      <span>Comentarios</span>
    </button>
    <button
      on:click={() => {
        showBottomSheet = true;
        activeBottomSheetContent = "rating";
      }}
      class="nav-button"
    >
      <i class="fas fa-star"></i>
      <span>Calificar</span>
    </button>
    <button on:click={toggleDarkMode} class="nav-button">
      <i class="fas {isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>
      <span>{isDarkMode ? "Claro" : "Oscuro"}</span>
    </button>
  </nav>
{:else}
  <div class="floating-buttons" class:show={showFloatingButtons}>
    <button on:click={handleLikeClick} class="floating-button like-button" aria-label="Me gusta">
      <i class="fas fa-heart" class:liked={isLiked}></i>
      <span>{likesCount}</span>
    </button>
    <button on:click={() => (showComments = true)} class="floating-button" aria-label="Comentarios">
      <i class="fas fa-comments"></i>
    </button>
    <button on:click={() => (showBottomSheet = true)} class="floating-button" aria-label="Calificar">
      <i class="fas fa-star"></i>
    </button>
    <button on:click={toggleDarkMode} class="floating-button" aria-label="Cambiar modo oscuro">
      <i class="fas {isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>
    </button>
    <button on:click={scrollToTop} class="floating-button" aria-label="Volver arriba">
      <i class="fas fa-arrow-up"></i>
    </button>
  </div>
{/if}
</main>

{#if showBottomSheet}
  <div
    class="bottom-sheet"
    transition:slide={{ duration: 300, easing: quintOut }}
  >
    <div class="bottom-sheet-header">
      <h3>
        {#if activeBottomSheetContent === "toc"}
          Índice
        {:else if activeBottomSheetContent === "comments"}
          Comentarios
        {:else if activeBottomSheetContent === "rating"}
          Calificar artículo
        {/if}
      </h3>
      <button on:click={() => (showBottomSheet = false)} class="close-button" aria-label="Cerrar">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="bottom-sheet-content">
      {#if activeBottomSheetContent === "toc"}
        <nav class="mobile-toc">
          {#each toc as item}
            <a
              href="#{item.id}"
              class="toc-item level-{item.level}"
              class:active={activeSection === item.id}
              on:click|preventDefault={() => {
                scrollToSection(item.id);
                showBottomSheet = false;
              }}
            >
              {item.text}
            </a>
          {/each}
        </nav>
      {:else if activeBottomSheetContent === "comments"}
        <div class="comments-section">
          <div class="comments-list">
            {#each comments as comment}
              <div class="comment">
                <div class="comment-header">
                  <img src={comment.usuario.avatar || '/default-avatar.png'} alt="Avatar" class="comment-avatar">
                  <span class="comment-author">{comment.usuario.username}</span>
                  <span class="comment-date">{new Date(comment.creado).toLocaleDateString()}</span>
                </div>
                <p>{comment.contenido}</p>
                <div class="comment-actions">
                  <button class="btn-link">Responder</button>
                  {#if comment.usuario.id === get(sessionStore).userId}
                    <button class="btn-link">Eliminar</button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
          <div class="new-comment">
            <textarea
              bind:value={newComment}
              placeholder="Escribe tu comentario..."
            ></textarea>
            <button class="btn btn-primary" on:click={handlePostComment} disabled={!newComment.trim()}>
              Enviar comentario
            </button>
          </div>
        </div>
      {:else if activeBottomSheetContent === "rating"}
        <div class="rating-section">
          <p>¿Qué calificación le darías a "{article.titulo}"?</p>
          <div class="star-rating">
            {#each Array(5) as _, i}
              <span
                class="star"
                class:active={i < userRating}
                on:click={() => (userRating = i + 1)}
                on:keydown={(e) => e.key === 'Enter' && (userRating = i + 1)}
                role="button"
                tabindex="0"
                aria-label="Calificar {i + 1} estrellas"
              >
                ★
              </span>
            {/each}
          </div>
          <button class="btn btn-primary" on:click={handleRating}>
            Enviar calificación
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if showComments}
  <div class="comments-panel" transition:slide={{ duration: 300, axis: "x", easing: quintOut }}>
    <div class="comments-panel-header">
      <h3>Comentarios</h3>
      <button on:click={() => (showComments = false)} class="close-button" aria-label="Cerrar comentarios">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="comments-panel-content">
      <div class="comments-list">
        {#each comments as comment}
          <div class="comment">
            <div class="comment-header">
              <img src={comment.usuario.avatar || '/default-avatar.png'} alt="Avatar" class="comment-avatar">
              <span class="comment-author">{comment.usuario.username}</span>
              <span class="comment-date">{new Date(comment.creado).toLocaleDateString()}</span>
            </div>
            <p>{comment.contenido}</p>
            <div class="comment-actions">
              <button class="btn-link">Responder</button>
              {#if comment.usuario.id === get(sessionStore).userId}
                <button class="btn-link">Eliminar</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      <div class="new-comment">
        <textarea bind:value={newComment} placeholder="Escribe tu comentario..."></textarea>
        <button class="btn btn-primary" on:click={handlePostComment} disabled={!newComment.trim()}>
          Enviar comentario
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showEnrollModal}
  <div
    class="modal-overlay"
    transition:fade={{ duration: 300 }}
    on:click|self={() => (showEnrollModal = false)}
  >
    <div
      class="modal-content"
      transition:fly={{ y: -50, duration: 300, easing: backOut }}
    >
      <h2>Solicitar acceso al artículo completo</h2>
      <p>¿Desea solicitar acceso al artículo completo "{article.titulo}"?</p>
      <textarea
        bind:value={enrollmentReason}
        placeholder="Por favor, explique brevemente por qué desea acceder a este artículo (opcional)"
      ></textarea>
      <div class="modal-buttons">
        <button
          class="btn btn-secondary"
          on:click={() => (showEnrollModal = false)}
        >
          Cancelar
        </button>
        <button class="btn btn-primary" on:click={requestEnrollment}>
          Solicitar acceso
        </button>
      </div>
    </div>
  </div>
{/if}

<style>

:root {
--primary-color: #1A374D;
--secondary-color: #406882;
--accent-color: #FFD700;
--background-color: #F0F4F8;
--background-color2: #FFFFFF;
--text-color: #333333;
--light-text-color: #666666;
--border-radius: 10px;
--transition-speed: 0.3s;
--box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark-mode {
--primary-color: #3498db;
--secondary-color: #2ecc71;
--accent-color: #f1c40f;
--background-color: #2C2C2C;
--background-color2: #3A3A3A;
--text-color: #E0E0E0;
--light-text-color: #BDBDBD;
--box-shadow: 0 4px 6px rgba(255, 255, 255, 0.1);
}

* {
box-sizing: border-box;
margin: 0;
padding: 0;
}

body {
font-family: 'Roboto', Arial, sans-serif;
background-color: var(--background-color);
color: var(--text-color);
line-height: 1.6;
transition: background-color var(--transition-speed), color var(--transition-speed);
}

h1, h2, h3, h4, h5, h6 {
font-family: 'Merriweather', Georgia, serif;
}

.article-main {
max-width: 1400px;
margin: 0 auto;
padding: 1rem;
display: flex;
flex-direction: column;
min-height: 100vh;
}

.reading-progress-bar {
position: fixed;
top: 0;
left: 0;
height: 4px;
background-color: var(--accent-color);
z-index: 1000;
transition: width 0.3s ease-out;
}

.article-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 2rem;
padding-bottom: 1rem;
border-bottom: 1px solid var(--light-text-color);
}

.header-content h1 {
font-size: 2.5rem;
margin-bottom: 1rem;
color: var(--primary-color);
text-transform: uppercase;
letter-spacing: 1px;
}

.article-meta {
display: flex;
flex-wrap: wrap;
gap: 1rem;
font-size: 0.9rem;
color: var(--light-text-color);
}

.article-meta span {
    display: flex;
    align-items: center;
  }

  .article-meta i {
    margin-right: 0.5rem;
  }

  .article-layout {
    display: flex;
    gap: 2rem;
    overflow: visible; /* Asegura que no interrumpa el comportamiento sticky */
  }

  .table-of-contents {
    width: 250px;
    position: -webkit-sticky; /* Para compatibilidad con navegadores antiguos */
    position: sticky;
    top: 2rem;
    align-self: flex-start;
    background-color: var(--background-color2);
    padding: 1rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    transition: all var(--transition-speed);
    z-index: 100; /* Asegura que esté por encima de otros elementos */
}


  .table-of-contents h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
    border-bottom: 2px solid var(--accent-color);
    padding-bottom: 0.5rem;
  }

  .toc-item {
    display: block;
    padding: 0.5rem 0;
    color: var(--text-color);
    text-decoration: none;
    transition: all var(--transition-speed);
    font-size: 0.9rem;
    border-left: 3px solid transparent;
    padding-left: 10px;
  }

  .toc-item:hover {
    color: var(--accent-color);
    background-color: rgba(255, 215, 0, 0.1);
  }

  .toc-item.active {
    font-weight: bold;
    color: var(--accent-color);
    border-left-color: var(--accent-color);
  }

  .level-2 { padding-left: 1rem; }
  .level-3 { padding-left: 2rem; }
  .level-4 { padding-left: 3rem; }
  .level-5 { padding-left: 4rem; }
  .level-6 { padding-left: 5rem; }

  .article-content {
    flex: 1;
    background-color: var(--background-color2);
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    transition: all var(--transition-speed);
  }

  .article-body {
    font-size: 1.1rem;
    line-height: 1.8;
  }

  .article-body h2,
  .article-body h3,
  .article-body h4,
  .article-body h5,
  .article-body h6 {
    color: var(--primary-color);
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .article-body p {
    margin-bottom: 1.5rem;
  }

  .article-body a {
    color: var(--secondary-color);
    text-decoration: none;
    border-bottom: 1px solid var(--secondary-color);
    transition: all var(--transition-speed);
  }

  .article-body a:hover {
    color: var(--accent-color);
    border-bottom-color: var(--accent-color);
  }

  .article-preview {
    position: relative;
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--box-shadow);
  }

  .preview-content {
    position: relative;
    max-height: 300px;
    overflow: hidden;
  }

  .preview-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(transparent, var(--background-color));
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    background-color: var(--primary-color);
    color: #fff;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
    cursor: pointer;
    transition: all var(--transition-speed);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .cta-button:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .cta-button i {
    margin-left: 0.5rem;
  }

  .enrollment-status-message {
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    padding: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    box-shadow: var(--box-shadow);
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
  }

  .spinner {
    border: 4px solid var(--background-color);
    border-top: 4px solid var(--accent-color);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-message {
    background-color: #ff6b6b;
    color: #fff;
    padding: 1.5rem;
    border-radius: var(--border-radius);
    text-align: center;
    margin-bottom: 2rem;
    box-shadow: var(--box-shadow);
  }

  .error-message i {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .attachment-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--light-text-color);
  }

  .attachment-section h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
    cursor: pointer;
    transition: all var(--transition-speed);
    text-decoration: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-primary {
    background-color: var(--primary-color);
    color: #fff;
  }

  .btn-primary:hover {
    background-color: var(--secondary-color);
  }

  .btn-secondary {
    background-color: var(--secondary-color);
    color: #fff;
  }

  .btn-secondary:hover {
    background-color: var(--primary-color);
  }

  .mobile-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--background-color2);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 0.75rem 0;
    transition: all var(--transition-speed);
  }

  .nav-button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all var(--transition-speed);
  }

  .nav-button i {
    font-size: 1.4rem;
    margin-bottom: 0.25rem;
  }

  .nav-button:hover {
    color: var(--accent-color);
  }

  .floating-buttons {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    opacity: 0;
    transform: translateY(100%);
    transition: all var(--transition-speed);
  }

  .floating-buttons.show {
    opacity: 1;
    transform: translateY(0);
  }

  .floating-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all var(--transition-speed);
    box-shadow: var(--box-shadow);
  }

  .floating-button:hover {
    background-color: var(--secondary-color);
    transform: scale(1.1);
  }

  .floating-button.like-button {
    position: relative;
  }

  .floating-button.like-button span {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--accent-color);
    color: var(--text-color);
    font-size: 0.8rem;
    padding: 2px 5px;
    border-radius: 10px;
  }

  .bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--background-color2);
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    z-index: 1001;
    max-height: 80vh;
    overflow-y: auto;
    transition: all var(--transition-speed);
  }

  .bottom-sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--light-text-color);
  }

  .bottom-sheet-header h3 {
    color: var(--primary-color);
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all var(--transition-speed);
  }

  .close-button:hover {
    color: var(--accent-color);
  }

  .bottom-sheet-content {
    padding: 1rem;
  }

  .mobile-toc {
    max-height: 60vh;
    overflow-y: auto;
  }

  .comments-section,
  .comments-panel-content {
    max-height: 60vh;
    overflow-y: auto;
  }

  .comments-list {
    margin-bottom: 1rem;
  }

  .comment {
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: var(--box-shadow);
  }

  .comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 1rem;
  }

  .comment-author {
    font-weight: bold;
    margin-right: 0.5rem;
  }

  .comment-date {
    font-size: 0.8rem;
    color: var(--light-text-color);
  }

  .comment p {
    margin-bottom: 0.5rem;
  }

  .comment-actions {
    display: flex;
    gap: 1rem;
  }

  .btn-link {
    background: none;
    border: none;
    color: var(--secondary-color);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0;
    transition: all var(--transition-speed);
  }

  .btn-link:hover {
    color: var(--accent-color);
    text-decoration: underline;
  }

  .new-comment textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--light-text-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    color: var(--text-color);
    resize: vertical;
    transition: all var(--transition-speed);
  }

  .new-comment textarea:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .modal-content {
    background-color: var(--background-color2);
    border-radius: var(--border-radius);
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    box-shadow: var(--box-shadow);
  }

  .modal-content h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }

  .modal-content textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--light-text-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    color: var(--text-color);
    resize: vertical;
    transition: all var(--transition-speed);
  }

  .modal-content textarea:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .star-rating {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }

  .star {
    cursor: pointer;
    color: var(--light-text-color);
    transition: all var(--transition-speed);
  }

  .star.active {
    color: var(--accent-color);
  }

  .star:hover {
    transform: scale(1.2);
  }

  .heart-animation {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 100px;
    color: #ff4136;
    opacity: 0;
    animation: heartbeat 1s ease-in-out;
    z-index: 9999;
  }

  @keyframes heartbeat {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }

  .comments-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 350px;
    background-color: var(--background-color2);
    box-shadow: var(--box-shadow);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    transition: transform var(--transition-speed);
  }

  .comments-panel-header {
    padding: 1rem;
    border-bottom: 1px solid var(--light-text-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .comments-panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  /* Styles for math equations */
  .article-body .math-inline {
    display: inline-block;
    max-width: 100%;
    overflow-x: auto;
    vertical-align: middle;
  }

  .article-body .math-display {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: var(--border-radius);
  }

  /* Responsive styles */
  @media (max-width: 1200px) {
    .article-main {
      padding: 1rem;
    }

    .article-layout {
      flex-direction: column;
    }

    .table-of-contents {
      width: 100%;
      position: relative;
      top: 0;
      margin-bottom: 2rem;
    }
  }

  @media (max-width: 768px) {
    .article-main {
      padding: 0.5rem;
    }

    .article-header {
      flex-direction: column;
    }

    .header-content h1 {
      font-size: 2rem;
    }

    .article-meta {
      font-size: 0.8rem;
    }

    .article-layout {
      flex-direction: column;
    }

    .table-of-contents {
      display: none;
    }

    .article-content {
      padding: 1.5rem;
    }

    .article-body {
      font-size: 1rem;
    }

    .mobile-nav {
      display: flex;
    }

    .bottom-sheet {
      padding-bottom: env(safe-area-inset-bottom);
    }

    .floating-buttons {
      display: none;
    }

    .comments-panel {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .article-main {
      padding: 0.25rem;
    }

    .article-header {
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }

    .header-content h1 {
      font-size: 1.75rem;
    }

    .article-meta {
      font-size: 0.75rem;
    }

    .article-content {
      padding: 1rem;
    }

    .article-body {
      font-size: 0.95rem;
    }

    .btn {
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
    }

    .modal-content {
      padding: 1.5rem;
    }
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .article-content {
    animation: fadeIn 0.5s ease-out;
  }

  .article-header, .article-meta span, .table-of-contents, .floating-buttons {
    animation: slideUp 0.5s ease-out;
  }

  .btn, .floating-button, .nav-button {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .btn:active, .floating-button:active, .nav-button:active {
    transform: scale(0.95);
  }

  /* Accessibility improvements */
  .btn:focus, .floating-button:focus, .nav-button:focus, 
  .close-button:focus, .toc-item:focus, .star:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  /* Dark mode enhancements */
  .dark-mode .article-body .math-display {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .dark-mode .btn:focus, .dark-mode .floating-button:focus, 
  .dark-mode .nav-button:focus, .dark-mode .close-button:focus, 
  .dark-mode .toc-item:focus, .dark-mode .star:focus {
    outline-color: var(--secondary-color);
  }

  /* Improved scrollbar for better UX */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background-color);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--secondary-color);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
  }

  .preview-content {
    position: relative;
    max-height: 300px;
    overflow: hidden;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .preview-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(transparent, var(--background-color));
  }

  .enrollment-status-message {
    text-align: center;
    padding: 2rem;
    background-color: var(--background-color2);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .star-rating {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 2.5rem;
    margin: 1rem 0;
  }

  .star {
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;
  }

  .star:hover,
  .star.active {
    transform: scale(1.2);
    color: var(--accent-color);
  }

  .heart-animation {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 100px;
    color: #ff4136;
    opacity: 0;
    animation: heartbeat 1s ease-in-out;
    z-index: 9999;
  }

  @keyframes heartbeat {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }

  .comments-panel,
  .bottom-sheet {
    background-color: var(--background-color2);
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
  }

  .comments-list {
    max-height: 60vh;
    overflow-y: auto;
  }

  .comment {
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 1rem;
  }

  .new-comment textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--light-text-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    color: var(--text-color);
    resize: vertical;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .modal-content {
    background-color: var(--background-color2);
    border-radius: var(--border-radius);
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    box-shadow: var(--box-shadow);
  }

  /* Improved dark mode styles */
  .dark-mode {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --accent-color: #f1c40f;
    --background-color: #2C2C2C;
    --background-color2: #3A3A3A;
    --text-color: #E0E0E0;
    --light-text-color: #BDBDBD;
  }

  .dark-mode .article-body .math-display {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .dark-mode .btn:focus,
  .dark-mode .floating-button:focus,
  .dark-mode .nav-button:focus,
  .dark-mode .close-button:focus,
  .dark-mode .toc-item:focus,
  .dark-mode .star:focus {
    outline-color: var(--secondary-color);
  }

  /* Responsive design improvements */
  @media (max-width: 768px) {
    .article-main {
      padding: 0.5rem;
    }

    .article-header {
      flex-direction: column;
    }

    .header-content h1 {
      font-size: 1.8rem;
    }

    .article-meta {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .article-content {
      padding: 1rem;
    }

    .preview-content {
      max-height: 200px;
    }

    .modal-content {
      width: 95%;
      padding: 1.5rem;
    }

    .star-rating {
      font-size: 2rem;
    }
  }

  /* Accessibility improvements */
  .btn:focus,
  .floating-button:focus,
  .nav-button:focus,
  .close-button:focus,
  .toc-item:focus,
  .star:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }

  /* Performance optimizations */
  .article-body,
  .preview-content,
  .comment {
    will-change: transform;
  }

  /* Improved scrollbar for better UX */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background-color);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--secondary-color);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .article-content {
    animation: fadeIn 0.5s ease-out;
  }

  .article-header,
  .article-meta span,
  .table-of-contents,
  .floating-buttons {
    animation: slideUp 0.5s ease-out;
  }

  /* Transition improvements */
  .btn,
  .floating-button,
  .nav-button,
  .toc-item,
  .star {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .btn:active,
  .floating-button:active,
  .nav-button:active {
    transform: scale(0.95);
  }

  /* MathJax specific styles */
  .article-body .math-inline {
    display: inline-block;
    max-width: 100%;
    overflow-x: auto;
    vertical-align: middle;
  }

  .article-body .math-display {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: var(--border-radius);
  }
</style>