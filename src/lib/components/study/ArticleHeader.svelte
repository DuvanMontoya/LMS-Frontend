<!-- src/lib/components/study/ArticleHeader.svelte -->
<script>
    import { fade } from 'svelte/transition';
    import ProgressBar from '$lib/components/study/ProgressBar.svelte';
    
    // El artículo (y su progreso) se recibe como prop
    export let article = null; // Asignamos un valor por defecto
    export let progress;
  
    // En tu caso, si 'article.progreso' es un entero, podrías
    // no necesitar 'progress' como prop por separado.
    // Lo dejamos si lo deseas.
  </script>
  
  {#if article}
  <header class="article-header" transition:fade>
    <div class="header-content">
      <!-- Migas de pan -->
      <div class="breadcrumbs">
        {#if article.universidad?.nombre}
          <span class="breadcrumb-item">
            <i class="fas fa-university"></i>
            {article.universidad.nombre}
          </span>
        {/if}
        {#if article.facultad?.nombre}
          <span class="separator">/</span>
          <span class="breadcrumb-item">
            <i class="fas fa-building"></i>
            {article.facultad.nombre}
          </span>
        {/if}
        {#if article.pregrado?.nombre}
          <span class="separator">/</span>
          <span class="breadcrumb-item">
            <i class="fas fa-graduation-cap"></i>
            {article.pregrado.nombre}
          </span>
        {/if}
      </div>
  
      <div class="main-info">
        <div class="title-section">
          <h1>{article.titulo || 'Sin título'}</h1>
          {#if article.descripcion}
            <p class="description">{article.descripcion}</p>
          {/if}
        </div>
  
        <div class="status-badges">
          {#if article.publicado}
            <span class="badge published">
              <i class="fas fa-check-circle"></i>
              Publicado
            </span>
          {/if}
          {#if article.es_publico}
            <span class="badge public">
              <i class="fas fa-globe"></i>
              Público
            </span>
          {/if}
          {#if article.es_destacado}
            <span class="badge featured">
              <i class="fas fa-star"></i>
              Destacado
            </span>
          {/if}
        </div>
      </div>
  
      <div class="meta-grid">
        {#if article.curso?.nombre}
          <div class="meta-card course">
            <div class="meta-icon">
              <i class="fas fa-book"></i>
            </div>
            <div class="meta-info">
              <span class="meta-label">Curso</span>
              <span class="meta-value">{article.curso.nombre}</span>
            </div>
          </div>
        {/if}
  
        {#if article.profesor}
          <div class="meta-card professor">
            <div class="meta-icon">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div class="meta-info">
              <span class="meta-label">Profesor</span>
              <span class="meta-value">{article.profesor}</span>
            </div>
          </div>
        {/if}
  
        {#if article.tipo?.nombre}
          <div class="meta-card type">
            <div class="meta-icon">
              <i class="fas fa-tag"></i>
            </div>
            <div class="meta-info">
              <span class="meta-label">Tipo</span>
              <span class="meta-value">{article.tipo.nombre}</span>
            </div>
          </div>
        {/if}
  
        {#if article.posicion !== undefined && article.posicion !== null}
          <div class="meta-card position">
            <div class="meta-icon">
              <i class="fas fa-sort-numeric-up"></i>
            </div>
            <div class="meta-info">
              <span class="meta-label">Posición</span>
              <span class="meta-value">#{article.posicion}</span>
            </div>
          </div>
        {/if}
  
        {#if article.semestre}
          <div class="meta-card semester">
            <div class="meta-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="meta-info">
              <span class="meta-label">Semestre</span>
              <span class="meta-value">{article.semestre}</span>
            </div>
          </div>
        {/if}
  
        {#if article.tiempo_lectura}
          <div class="meta-card reading-time">
            <div class="meta-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="meta-info">
              <span class="meta-label">Tiempo de lectura</span>
              <span class="meta-value">{article.tiempo_lectura} minutos</span>
            </div>
          </div>
        {/if}
      </div>
  
      <!-- Sección de progreso -->
      <div class="progress-section">
        <div class="progress-info">
          <h3>Progreso de lectura</h3>
          <span class="progress-percentage">{progress}%</span>
        </div>
        <ProgressBar {progress} />
      </div>
  
      {#if article.temas?.length > 0}
        <div class="topics-section">
          <h4>Temas</h4>
          <div class="topics-list">
            {#each article.temas as tema}
              <span class="topic-tag">
                <i class="fas fa-hashtag"></i>
                {tema.nombre}
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </header>
  {/if}
  
  <style>
    .article-header {
      background: linear-gradient(145deg, #ffffff, #f8fafc);
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      overflow: hidden;
      animation: fadeSlideIn 0.5s ease-out;
    }
  
    .header-content {
      padding: 2rem;
    }
  
    .breadcrumbs {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }
  
    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      transition: color 0.2s ease;
    }
  
    .breadcrumb-item:hover {
      color: #3b82f6;
    }
  
    .separator {
      color: #d1d5db;
    }
  
    .main-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      margin-bottom: 2rem;
    }
  
    .title-section {
      flex: 1;
    }
  
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
  
    .description {
      font-size: 1.1rem;
      color: #4b5563;
      line-height: 1.6;
    }
  
    .status-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
  
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease;
    }
  
    .badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }
  
    .badge:hover {
      transform: translateY(-2px);
    }
  
    .badge:hover::before {
      transform: translateX(100%);
    }
  
    .badge.published {
      background: #d1fae5;
      color: #059669;
    }
  
    .badge.public {
      background: #dbeafe;
      color: #1d4ed8;
    }
  
    .badge.featured {
      background: #fef3c7;
      color: #d97706;
    }
  
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
  
    .meta-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05),
                  0 1px 2px rgba(0, 0, 0, 0.1);
      animation: fadeSlideIn 0.5s ease-out;
      animation-fill-mode: both;
    }
  
    .meta-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05),
                  0 2px 4px rgba(0, 0, 0, 0.1),
                  0 8px 16px rgba(0, 0, 0, 0.1);
    }
  
    .meta-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 1.25rem;
    }
  
    .meta-info {
      display: flex;
      flex-direction: column;
    }
  
    .meta-label {
      font-size: 0.75rem;
      color: #6b7280;
    }
  
    .meta-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }
  
    /* Ejemplos de colores para cada meta-card */
    .meta-card.course .meta-icon {
      background: #dbeafe;
      color: #2563eb;
    }
  
    .meta-card.professor .meta-icon {
      background: #fce7f3;
      color: #db2777;
    }
  
    .meta-card.type .meta-icon {
      background: #dcfce7;
      color: #16a34a;
    }
  
    .meta-card.position .meta-icon {
      background: #fef3c7;
      color: #d97706;
    }
  
    .meta-card.semester .meta-icon {
      background: #f3e8ff;
      color: #7e22ce;
    }
  
    .meta-card.reading-time .meta-icon {
      background: #ffe4e6;
      color: #e11d48;
    }
  
    .progress-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      margin-bottom: 1.5rem;
    }
  
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
  
    .progress-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }
  
    .progress-percentage {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }
  
    .topics-section {
      margin-top: 1.5rem;
    }
  
    .topics-section h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.75rem;
    }
  
    .topics-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  
    .topic-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: #f3f4f6;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: #4b5563;
      transition: all 0.2s ease;
    }
  
    .topic-tag:hover {
      background: #e5e7eb;
      color: #1f2937;
      transform: translateY(-1px);
    }
  
    .topic-tag i {
      color: #6b7280;
    }
  
    @media (max-width: 1024px) {
      .main-info {
        flex-direction: column;
      }
  
      .status-badges {
        margin-top: 1rem;
      }
  
      .meta-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }
  
    @media (max-width: 768px) {
      .header-content {
        padding: 1.5rem;
      }
  
      h1 {
        font-size: 1.75rem;
      }
  
      .description {
        font-size: 1rem;
      }
  
      .meta-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
    }
  
    @media (max-width: 640px) {
      .breadcrumbs {
        display: none;
      }
  
      .meta-grid {
        grid-template-columns: 1fr;
      }
  
      .meta-card {
        padding: 0.875rem;
      }
  
      .topics-list {
        margin-top: 0.5rem;
      }
  
      .badge {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
      }
    }
  
    @keyframes fadeSlideIn {
      0% {
        opacity: 0;
        transform: translateY(10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>  