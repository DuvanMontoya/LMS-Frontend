<!-- src/lib/components/articulo/ArticlePreview.svelte -->
<script>
    import { createEventDispatcher, onMount } from 'svelte';
  
    export let preview_html = '';
    export let title = '';
  
    const dispatch = createEventDispatcher();
  
    function requestEnrollment() {
      dispatch('requestEnrollment');
    }
  
    // Control MathJax en la vista previa
    let mathJaxLoaded = false;
  
    onMount(() => {
      if (window.MathJax) {
        renderMathJax();
      } else {
        loadMathJax();
      }
    });
  
    async function loadMathJax() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src =
          'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
  
        script.onload = () => {
          window.MathJax.Hub.Config({
            tex2jax: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true
            },
            messageStyle: 'none',
            showMathMenu: false
          });
          renderMathJax();
          resolve();
        };
  
        script.onerror = () => reject(new Error('MathJax failed to load'));
        document.head.appendChild(script);
      });
    }
  
    function renderMathJax() {
      if (window.MathJax?.Hub) {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
      }
    }
  </script>
  
  <div class="article-preview">
    <h2 class="preview-title">{title}</h2>
    <div class="preview-content" innerHTML={preview_html}></div>
    <button class="enroll-button" on:click={requestEnrollment}>
      Solicitar Acceso
    </button>
  </div>
  
  <style>
    .article-preview {
      padding: 1.5rem;
      background-color: var(--background-color2);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--box-shadow);
      text-align: left;
      max-height: 400px; /* Limitar la altura */
      overflow: hidden;
      position: relative;
    }
  
    .preview-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--text-color);
    }
  
    .preview-content {
      font-size: 1rem;
      color: var(--text-color-lighter);
      line-height: 1.6;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 8; /* Mostrar solo 8 líneas */
      -webkit-box-orient: vertical;
    }
  
    .enroll-button {
      position: absolute;
      bottom: 1.5rem;
      right: 1.5rem;
      padding: 0.75rem 1.5rem;
      background-color: var(--secondary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transition-speed);
    }
  
    .enroll-button:hover {
      background-color: var(--secondary-dark);
    }
  
    /* Responsiveness */
    @media (max-width: 768px), (max-height: 900px) and (min-width: 1200px) {
      .article-preview {
        padding: 1rem;
      }
  
      .preview-title {
        font-size: 1.25rem;
      }
  
      .preview-content {
        -webkit-line-clamp: 6; /* Mostrar menos líneas en pantallas pequeñas */
      }
  
      .enroll-button {
        padding: 0.5rem 1rem;
        bottom: 1rem;
        right: 1rem;
      }
    }
  </style>  