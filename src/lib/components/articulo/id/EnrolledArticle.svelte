<!-- src/lib/components/articulo/EnrolledArticle.svelte -->
<script>
    import ArticleContent from '$lib/components/articulo/id/ArticleContent.svelte';
  
    export let contenido_html = '';
    export let archivo_adjunto = '';
  </script>
  
  <section class="enrolled-article">
    <ArticleContent {contenido_html} />
  
    {#if archivo_adjunto}
      <div class="attachment-section">
        <h3>
          <i class="fas fa-paperclip"></i>
          Material Complementario
        </h3>
        <a
          href={archivo_adjunto}
          class="download-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="fas fa-file-download"></i>
          Descargar Archivo
        </a>
      </div>
    {/if}
  </section>
  
  <style>
    .enrolled-article {
      position: relative;
      z-index: 1000;
    }
  
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
      z-index: 1001;
    }
  
    .download-button:hover {
      background-color: var(--secondary-dark);
      transform: translateY(-2px);
    }
  </style>  