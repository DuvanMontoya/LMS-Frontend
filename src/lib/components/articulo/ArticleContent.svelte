<script>
  import { onMount, afterUpdate } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let contenido_html = '';
  export let isPreview = false;

  // Función para procesar y mejorar el contenido
  function enhanceContent() {
    if (!contenido_html) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contenido_html;

    // Procesar imágenes
    tempDiv.querySelectorAll('img').forEach(img => {
      const figure = document.createElement('figure');
      const caption = document.createElement('figcaption');
      
      // Añadir clases y atributos
      img.classList.add('article-image');
      img.setAttribute('loading', 'lazy');
      
      // Crear caption si hay alt text
      if (img.getAttribute('alt')) {
        caption.textContent = img.getAttribute('alt');
        img.parentNode.insertBefore(figure, img);
        figure.appendChild(img);
        figure.appendChild(caption);
      }
    });

    // Mejorar tablas
    tempDiv.querySelectorAll('table').forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    // Mejorar bloques de código
    tempDiv.querySelectorAll('pre code').forEach(code => {
      const pre = code.parentElement;
      pre.classList.add('code-block');
      
      // Añadir botón de copiar
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.innerHTML = '<i class="fas fa-copy"></i>';
      copyButton.onclick = () => {
        navigator.clipboard.writeText(code.textContent);
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      };
      pre.appendChild(copyButton);
    });

    contenido_html = tempDiv.innerHTML;
  }

  onMount(() => {
    enhanceContent();
  });

  afterUpdate(() => {
    if (window.MathJax?.Hub) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
    }
  });
</script>

<article 
  class="article-content {isPreview ? 'preview' : ''}"
  transition:fade={{ duration: 300 }}
>
  {@html contenido_html}
</article>

<style>
  .article-content {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-color);
    max-width: 100%;
    overflow-x: hidden;
  }

  .article-content :global(h2),
  .article-content :global(h3),
  .article-content :global(h4),
  .article-content :global(h5),
  .article-content :global(h6) {
    color: var(--text-color);
    font-family: var(--font-family-serif);
    margin: 2.5rem 0 1.5rem;
    line-height: 1.3;
    scroll-margin-top: 100px;
  }

  .article-content :global(h2) {
    font-size: 2.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--accent-color);
  }

  .article-content :global(h3) {
    font-size: 1.85rem;
  }

  .article-content :global(h4) {
    font-size: 1.5rem;
  }

  .article-content :global(h5) {
    font-size: 1.25rem;
  }

  .article-content :global(h6) {
    font-size: 1.1rem;
    color: var(--text-color-light);
  }

  .article-content :global(p) {
    margin-bottom: 1.5rem;
  }

  .article-content :global(a) {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all var(--transition-speed);
  }

  .article-content :global(a:hover) {
    color: var(--primary-dark);
    border-bottom-color: currentColor;
  }

  .article-content :global(figure) {
    margin: 2rem 0;
    text-align: center;
  }

  .article-content :global(.article-image) {
    max-width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    transition: all var(--transition-speed);
  }

  .article-content :global(.article-image:hover) {
    transform: scale(1.01);
    box-shadow: var(--box-shadow-elevated);
  }

  .article-content :global(figcaption) {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: var(--text-color-lighter);
    font-style: italic;
  }

  .article-content :global(.table-wrapper) {
    margin: 2rem 0;
    overflow-x: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .article-content :global(table) {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--background-color2);
  }

  .article-content :global(th),
  .article-content :global(td) {
    padding: 1rem;
    border: 1px solid rgba(var(--text-rgb), 0.1);
    text-align: left;
  }

  .article-content :global(th) {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    font-weight: 600;
  }

  .article-content :global(tr:nth-child(even)) {
    background-color: var(--background-elevated);
  }

  .article-content :global(blockquote) {
    margin: 2rem 0;
    padding: 2rem;
    background-color: var(--background-elevated);
    border-left: 4px solid var(--accent-color);
    border-radius: var(--border-radius);
    font-style: italic;
    position: relative;
    box-shadow: var(--box-shadow);
  }

  .article-content :global(blockquote::before) {
    content: '"';
    position: absolute;
    top: 0;
    left: 1rem;
    font-size: 4rem;
    color: var(--accent-color);
    opacity: 0.2;
    font-family: Georgia, serif;
    line-height: 1;
  }

  .article-content :global(ul),
  .article-content :global(ol) {
    margin: 1.5rem 0;
    padding-left: 2rem;
  }

  .article-content :global(li) {
    margin-bottom: 0.5rem;
    position: relative;
  }

  .article-content :global(ul li::before) {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 0.6rem;
    width: 6px;
    height: 6px;
    background-color: var(--primary-color);
    border-radius: 50%;
  }

  .article-content :global(.code-block) {
    position: relative;
    margin: 2rem 0;
    padding: 1.5rem;
    background-color: var(--background-elevated);
    border-radius: var(--border-radius);
    overflow-x: auto;
  }

  .article-content :global(.code-block code) {
    font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .article-content :global(.copy-button) {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.5rem;
    background: rgba(var(--text-rgb), 0.1);
    border: none;
    border-radius: var(--border-radius);
    color: var(--text-color);
    cursor: pointer;
    transition: all var(--transition-speed);
  }

  .article-content :global(.copy-button:hover) {
    background: rgba(var(--text-rgb), 0.2);
  }

  .article-content :global(.MathJax_Display) {
    margin: 2rem 0 !important;
    padding: 1.5rem;
    background-color: var(--background-elevated);
    border-radius: var(--border-radius);
    overflow-x: auto;
    box-shadow: var(--box-shadow);
  }

  .article-content.preview {
    position: relative;
    max-height: 400px;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  }

  @media (max-width: 768px) {
    .article-content {
      font-size: 1rem;
    }

    .article-content :global(h2) {
      font-size: 1.85rem;
    }

    .article-content :global(h3) {
      font-size: 1.6rem;
    }

    .article-content :global(h4) {
      font-size: 1.35rem;
    }

    .article-content :global(h5) {
      font-size: 1.15rem;
    }

    .article-content :global(h6) {
      font-size: 1rem;
    }

    .article-content :global(blockquote) {
      padding: 1.5rem;
      margin: 1.5rem 0;
    }
  }
</style>