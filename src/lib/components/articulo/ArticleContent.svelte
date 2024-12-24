<!-- src/lib/components/Article/ArticleContent.svelte -->
<script>
    import { onMount, afterUpdate } from 'svelte';
  
    export let contenido_html = "";
  
    function renderMathJax() {
      if (window.MathJax && window.MathJax.Hub) {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
      }
    }
  
    onMount(() => {
      renderMathJax();
    });
  
    afterUpdate(() => {
      renderMathJax();
    });
  </script>
  
  <article class="article-content">
    {@html contenido_html}
  </article>
  
  <style>
    .article-content {
      font-size: 1.1rem;
      line-height: 1.8;
      animation: fadeIn 0.5s ease-out;
    }
  
    .article-content h2,
    .article-content h3,
    .article-content h4,
    .article-content h5,
    .article-content h6 {
      color: var(--primary-color);
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
  
    .article-content p {
      margin-bottom: 1.5rem;
    }
  
    .article-content a {
      color: var(--secondary-color);
      text-decoration: none;
      border-bottom: 1px solid var(--secondary-color);
      transition: all var(--transition-speed);
    }
  
    .article-content a:hover {
      color: var(--accent-color);
      border-bottom-color: var(--accent-color);
    }
  
    /* Estilos para ecuaciones matemáticas renderizadas por MathJax */
    .MathJax_Display {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      margin: 1.5rem 0;
      padding: 1rem;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: var(--border-radius);
    }
  
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .article-content {
        font-size: 1rem;
      }
    }
  </style>  