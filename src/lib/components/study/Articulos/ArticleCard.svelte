<!-- src/lib/components/study/ArticleCard.svelte -->
<script>
  import { goto } from '$app/navigation';
  import ProgressBar from '../ProgressBar.svelte';

  // Recibimos el artículo como prop
  export let article;

  function handleClick() {
    // Ir a la página de estudio del artículo
    // Ajusta la ruta si tu routing es distinto
    goto(`/study/${article.id}`);
  }

  // Si en tu JSON final se llama "progreso" directamente (no hay un objeto "progreso")
  // Usa lo siguiente:
  $: progress = article.progreso || 0;

  // Manejamos el estado en base a 'progress'
  $: status = progress === 0 ? 'not-started'
               : progress === 100 ? 'completed'
               : 'in-progress';
  
  $: statusText =
    status === 'not-started' ? 'Por empezar'
    : status === 'completed' ? 'Completado'
    : 'En progreso';

  // Clases CSS para el chip
  $: statusClass =
    status === 'not-started' ? 'bg-gray-100 text-gray-600'
    : status === 'completed' ? 'bg-green-100 text-green-700'
    : 'bg-blue-100 text-blue-700';
</script>

<div
  class="article-card"
  role="button"
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
  tabindex="0"
>
  <div class="media-section">
    {#if article.portada_articulo}
      <img
        src={article.portada_articulo}
        alt={article.titulo}
        class="card-image"
      />
    {:else}
      <div class="placeholder-image">
        <i class="fas fa-book-open"></i>
      </div>
    {/if}

    <!-- Estado de publicación -->
    {#if article.publicado}
      <div class="publish-badge">
        <i class="fas fa-check-circle"></i>
        <span>Publicado</span>
      </div>
    {/if}
  </div>

  <div class="card-content">
    <!-- Información institucional -->
    <div class="institution-info">
      {#if article.universidad?.nombre}
        <span class="info-tag university">
          <i class="fas fa-university"></i>
          {article.universidad.nombre}
        </span>
      {/if}
      {#if article.pregrado?.nombre}
        <span class="info-tag program">
          <i class="fas fa-graduation-cap"></i>
          {article.pregrado.nombre}
        </span>
      {/if}
    </div>

    <h3 class="title">{article.titulo}</h3>

    {#if article.descripcion}
      <p class="description">{article.descripcion}</p>
    {/if}

    <!-- Información detallada -->
    <div class="details-grid">
      {#if article.profesor}
        <div class="detail-item">
          <i class="fas fa-chalkboard-teacher"></i>
          <span>{article.profesor}</span>
        </div>
      {/if}

      {#if article.curso?.nombre}
        <div class="detail-item">
          <i class="fas fa-book"></i>
          <span>{article.curso.nombre}</span>
        </div>
      {/if}

      {#if article.tipo?.nombre}
        <div class="detail-item">
          <i class="fas fa-tag"></i>
          <span>{article.tipo.nombre}</span>
        </div>
      {/if}

      {#if article.semestre}
        <div class="detail-item">
          <i class="fas fa-calendar"></i>
          <span>Semestre {article.semestre}</span>
        </div>
      {/if}

      {#if article.posicion}
        <div class="detail-item">
          <i class="fas fa-sort-numeric-up"></i>
          <span>Posición {article.posicion}</span>
        </div>
      {/if}
    </div>

    <div class="metadata">
      <span class="author">
        <i class="fas fa-user"></i>
        {article.autor_nombre}
      </span>

      <!-- Ejemplo de status (para "Por empezar", "En Progreso", "Completado") -->
      <span class="status" class:completed={status === 'completed'}>
        <i class="fas fa-circle"></i>
        {statusText}
      </span>
    </div>

    <div class="progress-section">
      <ProgressBar {progress} size="small" />
      <span class="progress-text">
        {progress}% completado
      </span>
    </div>
  </div>
</div>

<style>
  .article-card {
    position: relative;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .article-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }

  .media-section {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .article-card:hover .card-image {
    transform: scale(1.05);
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 2.5rem;
  }

  .publish-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(16, 185, 129, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(4px);
  }

  .card-content {
    padding: 1.5rem;
  }

  .institution-info {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 1rem;
  }

  .info-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .university {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .program {
    background: #e0e7ff;
    color: #4338ca;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.75rem;
    line-height: 1.4;
  }

  .description {
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: #4b5563;
  }

  .detail-item i {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 6px;
    color: #6b7280;
  }

  .metadata {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem 0;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    background: #f3f4f6;
    color: #6b7280;
  }

  .status.completed {
    background: #d1fae5;
    color: #059669;
  }

  .progress-section {
    padding: 1rem;
    background: #f9fafb;
    border-radius: 12px;
  }

  .progress-text {
    display: block;
    text-align: right;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }

  @media (max-width: 640px) {
    .details-grid {
      grid-template-columns: 1fr;
    }
  }
</style>