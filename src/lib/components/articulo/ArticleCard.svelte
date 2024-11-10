<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { slide, fade } from "svelte/transition";
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
    if (!accessToken || !article?.id) return;
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

  function togglePDFViewer() {
    isPDFVisible = !isPDFVisible;
  }

  function showLikeAnimation() {
    const heart = document.createElement("div");
    heart.classList.add("heart-animation");
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }

  onMount(() => {
    checkEnrollment();
    fetchLikeStatusForArticle();
  });

  function safeValue(value, defaultValue = "N/A") {
    return value !== undefined && value !== null ? value : defaultValue;
  }

  function getFormatIcon(tipo) {
    const icons = {
      Taller: "fa-tools",
      Artículo: "fa-file-alt",
      Curso: "fa-graduation-cap",
    };
    return icons[tipo] || "fa-file";
  }

  function getAuthorInitials(author) {
    if (!author) return "";
    const names = author.split(" ");
    return names.map(name => name.charAt(0).toUpperCase()).join("");
  }
</script>

<article class="article-card">
  <div class="article-header">
    <div class="article-type-badge" style="background: {article.tipo?.color || '#3a5a78'}">
      <i class="fas {getFormatIcon(safeValue(article?.tipo?.nombre))}"></i>
      <span>{safeValue(article?.tipo?.nombre, "Artículo")}</span>
    </div>
    <h2 class="article-title">
      {safeValue(article.titulo, "Título no disponible")}
    </h2>
    <div class="article-meta">
      <span class="meta-item"><i class="fas fa-university"></i> {safeValue(article.universidad?.nombre, "Universidad no especificada")}</span>
      <span class="meta-item"><i class="fas fa-book"></i> {safeValue(article.curso?.nombre, "Curso no especificado")}</span>
      <span class="meta-item"><i class="fas fa-flask"></i> {safeValue(article.area?.nombre, "Área no especificada")}</span>
    </div>
  </div>

  <div class="article-content">
    <div class="article-main">
      <p class="article-description">
        {safeValue(article.descripcion, "Descripción no disponible")}
      </p>
      <div class="article-stats">
        <div class="stat-item">
          <i class="fas fa-eye"></i>
          <span>{safeValue(article.num_vistas, 0)} vistas</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-heart"></i>
          <span>{safeValue(article.num_favoritos, 0)} favoritos</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-star"></i>
          <span>
            {article.calificacion_promedio === null
              ? "Sin calificación"
              : `${article.calificacion_promedio.toFixed(1)} calificación`}
          </span>
        </div>
      </div>
    </div>
    <div class="article-side">
      <div class="article-author">
        <div class="author-avatar">
          {#if article.autor}
            <svg viewBox="0 0 100 100" class="avatar-svg">
              <defs>
                <linearGradient id="avatar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3a5a78;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#2c4a68;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#avatar-gradient)" />
              <text
                x="50"
                y="50"
                text-anchor="middle"
                dy="0.35em"
                fill="#ffffff"
                font-size="40"
              >
                {getAuthorInitials(article.autor)}
              </text>
            </svg>
          {:else}
            <i class="fas fa-user"></i>
          {/if}
        </div>
        <div class="author-info">
          <span class="author-name">{safeValue(article.autor, "Autor desconocido")}</span>
          <span class="author-role">Experto en {safeValue(article.area?.nombre, "el área")}</span>
        </div>
      </div>
      <div class="article-actions">
        {#if isEnrolled}
          <a href="/articulos/{article.id}" class="btn btn-primary">
            <i class="fas fa-book-open"></i> Leer artículo
          </a>
        {:else}
          <a href="/articulos/{article.id}" class="btn btn-secondary">
            <i class="fas fa-eye"></i> Vista previa
          </a>
        {/if}
        <button
          class="btn btn-like"
          on:click={handleLike}
          class:liked={likeStatus?.isLiked}
          disabled={isLoadingLike}
        >
          {#if isLoadingLike}
            <i class="fas fa-spinner fa-spin"></i>
          {:else}
            <i class="fas fa-thumbs-up"></i>
          {/if}
          <span class="like-count">{likeStatus?.totalLikes || article.num_favoritos}</span>
        </button>
        {#if article.archivo_adjunto}
          <button class="btn btn-pdf" on:click={togglePDFViewer}>
            <i class="fas fa-file-pdf"></i> {isPDFVisible ? "Cerrar PDF" : "Ver PDF"}
          </button>
        {/if}
      </div>
    </div>
  </div>

  {#if isPDFVisible}
    <div class="pdf-viewer-wrapper" transition:slide={{ y: 50, duration: 500 }}>
      {#if article.archivo_url}
        <PDFViewer url={`http://localhost:8000/api${article.archivo_url}`} />
      {:else}
        <p>No hay PDF disponible para este artículo.</p>
      {/if}
    </div>
  {/if}
</article>

<style>
  .article-card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid #e2e8f0;
  }

  .article-card:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
  }

  .article-header {
    background: linear-gradient(135deg, #f6f8fa 0%, #e9ecef 100%);
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .article-type-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .article-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2d3748;
    margin: 0 0 1rem 0;
    line-height: 1.3;
  }

  .article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.9rem;
    color: #4a5568;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .article-content {
    display: flex;
    padding: 1.5rem;
  }

  .article-main {
    flex: 2;
    padding-right: 2rem;
  }

  .article-side {
    flex: 1;
    border-left: 1px solid #e2e8f0;
    padding-left: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .article-description {
    font-size: 1rem;
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .article-stats {
    display: flex;
    justify-content: space-between;
    padding: 1rem 0;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }

  .stat-item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #4a5568;
    gap: 0.5rem;
  }

  .stat-item i {
    color: #3a5a78;
  }

  .article-author {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .author-avatar {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .avatar-svg {
    width: 100%;
    height: 100%;
  }

  .author-info {
    display: flex;
    flex-direction: column;
  }

  .author-name {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
  }

  .author-role {
    font-size: 0.85rem;
    color: #4a5568;
  }

  .article-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3a5a78 0%, #2c4a68 100%);
    color: #ffffff;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #2c4a68 0%, #1e3a58 100%);
  }

  .btn-secondary {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    color: #4a5568;
  }

  .btn-secondary:hover {
    background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
  }

  .btn-like {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    color: #4a5568;
  }

  .btn-like.liked {
    background: linear-gradient(135deg, #fed7d7 0%, #fbb6b6 100%);
    color: #e53e3e;
  }

  .btn-pdf {
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
  }

  .btn-pdf:hover {
    background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
  }

  .pdf-viewer-wrapper {
    margin-top: 1rem;
    padding: 1.5rem;
    background-color: #f7fafc;
    border-top: 1px solid #e2e8f0;
  }

  .heart-animation {
    position: fixed;
    top: 50%;
left: 50%;
transform: translate(-50%, -50%);
font-size: 100px;
color: #e53e3e;
opacity: 0;
animation: heartBeat 1s ease-in-out;
pointer-events: none;
z-index: 9999;
}
@keyframes heartBeat {
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
@media (max-width: 1024px) {
.article-content {
flex-direction: column;
}
.article-main {
  padding-right: 0;
  margin-bottom: 1.5rem;
}

.article-side {
  border-left: none;
  padding-left: 0;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.article-actions {
  flex-direction: row;
  flex-wrap: wrap;
}

.btn {
  flex: 1 1 calc(50% - 0.5rem);
}
}
@media (max-width: 768px) {
.article-header {
padding: 1.25rem;
}
.article-title {
  font-size: 1.25rem;
}

.article-type-badge {
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
}

.article-meta {
  flex-direction: column;
  gap: 0.5rem;
}

.article-content {
  padding: 1.25rem;
}

.article-description {
  font-size: 0.9rem;
}

.stat-item {
  font-size: 0.8rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
}

.author-name {
  font-size: 0.9rem;
}

.author-role {
  font-size: 0.8rem;
}

.btn {
  font-size: 0.85rem;
  padding: 0.6rem 0.8rem;
}

}
@media (max-width: 480px) {
.article-header {
padding: 1rem;
}

.article-title {
  font-size: 1.1rem;
}

.article-content {
  padding: 1rem;
}

.article-description {
  font-size: 0.85rem;
}

.article-stats {
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  justify-content: space-between;
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
}

.btn {
  font-size: 0.8rem;
  padding: 0.5rem 0.7rem;
}

}
/* Mejoras de accesibilidad */
.btn:focus, .article-header:focus-within {
outline: 2px solid #3a5a78;
outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
.article-card, .btn, .heart-animation {
transition: none;
animation: none;
}
}
/* Efectos de hover adicionales */
.article-type-badge {
transition: transform 0.3s ease;
}
.article-card:hover .article-type-badge {
transform: scale(1.05);
}
.stat-item {
transition: color 0.3s ease;
}
.stat-item:hover {
color: #3a5a78;
}
.author-avatar {
transition: transform 0.3s ease;
}
.article-author:hover .author-avatar {
transform: scale(1.1);
}
/* Mejoras para la legibilidad */
.article-description {
text-align: justify;
hyphens: auto;
}
.article-title {
text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}
/* Efecto de profundidad para los botones */
.btn {
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.btn:hover {
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
transform: translateY(-2px);
}
.btn:active {
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
transform: translateY(0);
}
/* Efecto de brillo para el avatar */
.avatar-svg {
position: relative;
overflow: hidden;
}
.avatar-svg::after {
content: '';
position: absolute;
top: -50%;
left: -50%;
width: 200%;
height: 200%;
background: linear-gradient(
to bottom right,
rgba(255, 255, 255, 0) 0%,
rgba(255, 255, 255, 0.1) 50%,
rgba(255, 255, 255, 0) 100%
);
transform: rotate(45deg);
animation: shineEffect 3s infinite;
}
@keyframes shineEffect {
0% { transform: translateX(-100%) rotate(45deg); }
100% { transform: translateX(100%) rotate(45deg); }
}
/* Mejora para el fondo del encabezado */
.article-header::before {
content: '';
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.05" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E');
opacity: 0.5;
z-index: 0;
}
.article-header > * {
position: relative;
z-index: 1;
}
</style>