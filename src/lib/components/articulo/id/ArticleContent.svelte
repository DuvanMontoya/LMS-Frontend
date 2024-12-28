<!-- ArticleContent.svelte -->
<script>
  import { onMount, afterUpdate, tick } from 'svelte';
  import DOMPurify from 'dompurify';

  // Propiedades que recibe el componente
  export let contenido_html = ''; // Contenido HTML que será renderizado
  export let isPreview = false; // Indica si estamos en modo de previsualización

  let articleRef; // Referencia al artículo en el DOM
  let processedContent = ''; // Contenido procesado y mejorado
  let contentLoaded = false; // Bandera para indicar si el contenido ha sido cargado completamente

  // Carga MathJax de forma dinámica
  async function loadMathJax() {
    if (window.MathJax) {
      return window.MathJax;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;

      script.onload = () => {
        console.log('MathJax cargado');
        resolve(window.MathJax);
      };

      script.onerror = () => {
        reject(new Error('No se pudo cargar MathJax desde el CDN.'));
      };

      document.head.appendChild(script);
    });
  }

  // Función para procesar y mejorar el contenido HTML
  function enhanceContent(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(html);

    // Procesar imágenes
    tempDiv.querySelectorAll('img').forEach(img => {
      const figure = document.createElement('figure');
      const caption = document.createElement('figcaption');

      img.classList.add('article-image');
      img.setAttribute('loading', 'lazy');

      if (img.alt) {
        caption.textContent = img.alt;
        img.replaceWith(figure);
        figure.appendChild(img);
        figure.appendChild(caption);
      }
    });

    // Procesar tablas
    tempDiv.querySelectorAll('table').forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.replaceWith(wrapper);
      wrapper.appendChild(table);
    });

    // Procesar bloques de código
    tempDiv.querySelectorAll('pre code').forEach(code => {
      const pre = code.parentNode;
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copiar';

      copyButton.addEventListener('click', async () => {
        await navigator.clipboard.writeText(code.textContent);
        copyButton.textContent = '¡Copiado!';
        setTimeout(() => (copyButton.textContent = 'Copiar'), 2000);
      });

      pre.appendChild(copyButton);
    });

    return tempDiv.innerHTML;
  }

  // Inicializa el contenido y MathJax
  async function initializeContent() {
    try {
      // Cargar MathJax
      await loadMathJax();

      // Procesar contenido
      processedContent = enhanceContent(contenido_html);
      await tick(); // Asegurar que el DOM se actualice antes de usar MathJax

      // Renderizar ecuaciones matemáticas
      if (window.MathJax && articleRef) {
        window.MathJax.typeset([articleRef]);
        contentLoaded = true;
      }
    } catch (error) {
      console.error('Error inicializando el contenido o MathJax:', error);
    }
  }

  // Ejecutar al montar el componente
  onMount(() => {
    initializeContent();
  });

  // Asegurar que MathJax procese ecuaciones después de actualizaciones
  afterUpdate(() => {
    if (window.MathJax && articleRef && !contentLoaded) {
      window.MathJax.typeset([articleRef]);
      contentLoaded = true;
    }
  });
</script>

<!-- Estructura HTML del componente -->
<article
  bind:this={articleRef}
  class="article-content {isPreview ? 'preview' : ''} {contentLoaded ? 'loaded' : ''}"
>
  {#if contentLoaded}
    <div>{@html processedContent}</div>
  {:else}
    <div class="loading-skeleton">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>
  {/if}
</article>



<style>
  .article-content {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-color);
    max-width: 100%;
    overflow-x: hidden;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .article-content.loaded {
    opacity: 1;
  }

  /* Loading Skeleton */
  .loading-skeleton {
    padding: 2rem;
  }

  .skeleton-line {
    height: 1.2rem;
    background: linear-gradient(90deg, 
      var(--background-elevated) 25%, 
      var(--background-color2) 50%, 
      var(--background-elevated) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: var(--border-radius);
    margin-bottom: 1rem;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Títulos */
  .article-content :global(h2),
  .article-content :global(h3),
  .article-content :global(h4),
  .article-content :global(h5),
  .article-content :global(h6) {
    color: var(--text-color);
    font-family: var(--font-family-serif);
    margin: 3rem 0 1.5rem;
    line-height: 1.3;
    scroll-margin-top: 100px;
    position: relative;
  }

  .article-content :global(h2) {
    font-size: 2.5rem;
    padding-bottom: 0.75rem;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    border-bottom: 2px solid;
    border-image: linear-gradient(90deg, var(--primary-color), var(--secondary-color)) 1;
  }

  .article-content :global(h3) {
    font-size: 2rem;
  }

  .article-content :global(h4) {
    font-size: 1.65rem;
  }

  /* Párrafos y enlaces */
  .article-content :global(p) {
    margin-bottom: 1.8rem;
    text-align: justify;
    hyphens: auto;
  }

  .article-content :global(a) {
    color: var(--primary-color);
    text-decoration: none;
    background-image: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    background-repeat: no-repeat;
    background-position: bottom left;
    background-size: 0% 2px;
    transition: background-size 0.3s ease-in-out;
  }

  .article-content :global(a:hover) {
    background-size: 100% 2px;
  }

  /* Imágenes */
  .article-content :global(figure) {
    margin: 3rem 0;
    text-align: center;
  }

  .article-content :global(.image-wrapper) {
    position: relative;
    overflow: hidden;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .article-content :global(.article-image) {
    max-width: 100%;
    height: auto;
    transition: transform 0.3s ease-in-out;
  }

  .article-content :global(.image-wrapper:hover .article-image) {
    transform: scale(1.05);
  }

  .article-content :global(figcaption) {
    margin-top: 1.2rem;
    font-size: 0.95rem;
    color: var(--text-color-lighter);
    font-style: italic;
    line-height: 1.6;
  }

  /* Tablas */
  .article-content :global(.table-wrapper) {
    margin: 2.5rem 0;
    overflow-x: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    background: var(--background-color2);
  }

  .article-content :global(.premium-table) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: transparent;
  }

  .article-content :global(.premium-table th) {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 1.2rem 1.5rem;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .article-content :global(.premium-table td) {
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid rgba(var(--text-rgb), 0.1);
    transition: background-color 0.2s ease;
  }

  .article-content :global(.premium-table tr:hover td) {
    background-color: rgba(var(--primary-rgb), 0.05);
  }

  /* Bloques de código */
  .article-content :global(.code-block.premium) {
    margin: 2.5rem 0;
    background-color: var(--background-elevated);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    overflow: hidden;
  }

  .article-content :global(.code-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    color: white;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .article-content :global(.code-block pre) {
    margin: 0;
    padding: 1.5rem;
    overflow-x: auto;
  }

  .article-content :global(.code-block pre code) {
    font-family: 'Fira Code', monospace;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .article-content :global(.copy-button) {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.25rem;
    transition: transform 0.2s ease;
  }

  .article-content :global(.copy-button:hover) {
    transform: scale(1.1);
  }

  /* Ecuaciones MathJax */
  .article-content :global(.MathJax) {
    outline: none;
    transition: transform 0.2s ease;
  }

  .article-content :global(.MathJax:hover) {
    transform: scale(1.02);
  }

  .article-content :global(.MathJax_Display) {
    margin: 2.5rem 0 !important;
    padding: 2rem;
    background: var(--background-elevated);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    position: relative;
    overflow-x: auto;
    background: linear-gradient(145deg, var(--background-elevated), var(--background-color2));
  }

  .article-content :global(.MathJax_Display::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  /* Blockquotes */
  .article-content :global(blockquote) {
    margin: 2.5rem 0;
    padding: 2rem 2.5rem;
    background: var(--background-elevated);
    border-radius: var(--border-radius);
    position: relative;
    box-shadow: var(--box-shadow);
    font-style: italic;
    background: linear-gradient(145deg, var(--background-elevated), var(--background-color2));
  }

  .article-content :global(blockquote::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
    border-radius: var(--border-radius) 0 0 var(--border-radius);
  }

  .article-content :global(blockquote::after) {
    content: '"';
    position: absolute;
    top: 1rem;
    right: 1.5rem;
    font-size: 4rem;
    color: var(--primary-color);
    opacity: 0.2;
    font-family: Georgia, serif;
    line-height: 1;
  }

  /* Listas */
  .article-content :global(ul),
  .article-content :global(ol) {
    margin: 1.8rem 0;
    padding-left: 2.5rem;
  }

  .article-content :global(li) {
    margin-bottom: 0.8rem;
    position: relative;
    padding-left: 0.5rem;
  }

  .article-content :global(ul li::before) {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 0.7rem;
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-radius: 50%;
    transform: scale(0.8);
    transition: transform 0.2s ease;
  }

  .article-content :global(ul li:hover::before) {
    transform: scale(1);
  }

  .article-content :global(ol) {
    counter-reset: item;
  }

  .article-content :global(ol li) {
    counter-increment: item;
  }

  .article-content :global(ol li::before) {
    content: counter(item);
    position: absolute;
    left: -2.5rem;
    top: 0;
    width: 1.5rem;
    height: 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    transform: scale(0.8);
    transition: transform 0.2s ease;
  }

  .article-content :global(ol li:hover::before) {
    transform: scale(1);
  }

  /* Preview mode */
  .article-content.preview {
    position: relative;
    max-height: 500px;
    overflow: hidden;
  }

  .article-content.preview::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(transparent, var(--background-color));
    pointer-events: none;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .article-content {
      font-size: 1rem;
    }

    .article-content :global(h2) {
      font-size: 2rem;
    }

    .article-content :global(h3) {
      font-size: 1.75rem;
    }

    .article-content :global(h4) {
      font-size: 1.5rem;
    }

    .article-content :global(blockquote) {
      padding: 1.5rem 2rem;
      margin: 2rem 0;
    }

    .article-content :global(.MathJax_Display) {
      padding: 1.5rem;
      margin: 2rem 0 !important;
    }

    .article-content :global(.table-wrapper) {
      margin: 2rem 0;
    }

    .article-content :global(.premium-table th),
    .article-content :global(.premium-table td) {
      padding: 1rem;
    }
  }

  /* Print styles */
  @media print {
    .article-content {
      font-size: 12pt;
    }

    .article-content :global(a) {
      text-decoration: underline;
      color: #000;
    }

    .article-content :global(.MathJax_Display) {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .article-content :global(figure),
    .article-content :global(table),
    .article-content :global(pre) {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }

  /* Dark mode enhancements */
  @media (prefers-color-scheme: dark) {
    .article-content :global(.code-block),
    .article-content :global(.MathJax_Display),
    .article-content :global(blockquote) {
      background: linear-gradient(145deg, 
        rgba(var(--text-rgb), 0.1),
        rgba(var(--text-rgb), 0.05)
      );
    }
  }
</style>