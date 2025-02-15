<!-- Este componente se encarga de renderizar la vista previa de un artículo, mostrando solo una parte del contenido y permitiendo al usuario solicitar acceso al artículo completo. El contenido se procesa y se trunca para mostrar solo una parte del mismo. Si el usuario solic ita acceso, se envía un evento con el ID del artículo y la fecha y hora de la solicitud. -->
<!-- lib/components/articulo/ArticlePreview.svelte -->
<script>
    import { createEventDispatcher, onMount, afterUpdate, getContext } from 'svelte';
    import DOMPurify from 'dompurify';
  
    export let article = {
      id: null,
      title: '',
      content: '',
      previewLength: 300,
      requiresAuth: true,
      author: '',
      publishDate: '',
      readingTime: ''
    };
  
    let isLoading = false;
    let error = null;
    let showFullContent = false;
    let truncatedContent = '';
    let requestSent = false;
  
    const dispatch = createEventDispatcher();
    const mathJax = getContext('mathjax'); // Obtén el contexto directamente
  
    onMount(() => {
      try {
        truncatedContent = truncateHTML(article.content, article.previewLength);
      } catch (err) {
        error = 'Error al cargar el preview del artículo';
        console.error('Error en ArticlePreview:', err);
      }
    });
  
    afterUpdate(async () => {
      if (showFullContent && mathJax) {
        const contentElement = document.getElementById(`content-${article.id}`);
        if (contentElement) {
          await mathJax.renderMath(contentElement);
        }
      }
    });
  
    function truncateHTML(html, maxLength) {
      const tmp = document.createElement('div');
      tmp.innerHTML = DOMPurify.sanitize(html);
  
      let textContent = tmp.textContent;
      if (textContent.length <= maxLength) return html;
  
      textContent = textContent.substr(0, maxLength);
      const lastSpace = textContent.lastIndexOf(' ');
      textContent = textContent.substr(0, lastSpace) + '...';
  
      return textContent;
    }
  
    function handleAccessRequest() {
      dispatch('requestAccess', {
        articleId: article.id,
        timestamp: new Date().toISOString()
      });
      requestSent = true;
    }
  </script>
  
<article class="article-preview">
  {#if error}
    <div class="error-message" role="alert">
      {error}
    </div>
  {/if}

  <header class="preview-header">
    <h2 class="preview-title">{article.title}</h2>
    <div class="preview-meta">
      {#if article.author}
        <span class="author">Por {article.author}</span>
      {/if}
      {#if article.publishDate}
        <span class="date">{new Date(article.publishDate).toLocaleDateString()}</span>
      {/if}
      {#if article.readingTime}
        <span class="reading-time">{article.readingTime} min de lectura</span>
      {/if}
    </div>
  </header>

  <div class="preview-content {showFullContent ? 'expanded' : ''}" id={`content-${article.id}`}>
    {#if showFullContent}
      {@html DOMPurify.sanitize(article.content)}
    {:else}
      {@html DOMPurify.sanitize(truncatedContent)}
    {/if}
  </div>

  <footer class="preview-footer">
    <button
      class="access-button"
      on:click={handleAccessRequest}
      disabled={isLoading || requestSent}
      aria-busy={isLoading}
    >
      {#if isLoading}
        <span class="spinner"></span>
      {/if}
      {article.requiresAuth ? (requestSent ? 'Solicitud Enviada' : 'Solicitar Acceso') : 'Leer Más'}
    </button>
  </footer>
</article>



  
  <style>
    .article-preview {
      background: var(--bg-color, #ffffff);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      margin: 1.5rem auto;
      max-width: 800px;
      overflow: hidden;
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
  
    .article-preview:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }
  
    .preview-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--border-color, #eaeaea);
    }
  
    .preview-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--title-color, #1a1a1a);
      margin: 0 0 0.75rem;
      line-height: 1.3;
    }
  
    .preview-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: var(--meta-color, #666);
    }
  
    .preview-content {
      padding: 1.5rem 2rem;
      font-size: 1.125rem;
      line-height: 1.6;
      color: var(--text-color, #333);
      position: relative;
      max-height: 300px;
      overflow: hidden;
    }
  
    .preview-content.expanded {
      max-height: none;
    }
  
    .preview-content::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100px;
      background: linear-gradient(transparent, var(--bg-color, #ffffff));
      pointer-events: none;
    }
  
    .preview-footer {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: flex-end;
      background: var(--footer-bg, #f8f9fa);
      border-top: 1px solid var(--border-color, #eaeaea);
    }
  
    .access-button {
      background: var(--primary-color, #0066cc);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 0.2s ease;
    }
  
    .access-button:hover:not(:disabled) {
      background: var(--primary-hover, #0052a3);
    }
  
    .access-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  
    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  
    .error-message {
      background: var(--error-bg, #fff3f3);
      color: var(--error-color, #dc3545);
      padding: 1rem;
      margin: 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }
  
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  
    @media (max-width: 768px) {
      .article-preview {
        margin: 1rem;
        border-radius: 8px;
      }
  
      .preview-header {
        padding: 1rem 1.25rem;
      }
  
      .preview-title {
        font-size: 1.5rem;
      }
  
      .preview-content {
        padding: 1rem 1.25rem;
        font-size: 1rem;
      }
  
      .preview-footer {
        padding: 1rem 1.25rem;
      }
  
      .preview-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
    
  </style>