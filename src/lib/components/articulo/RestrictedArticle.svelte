<!-- src/lib/components/articulo/RestrictedArticle.svelte -->
<script>
    import ArticleContent from '$lib/components/articulo/ArticleContent.svelte';
  
    export let preview_html = '';
    export let onRequestEnrollment = () => {};
  </script>
  
  <section class="restricted-article">
    <div class="enrollment-prompt">
      <div class="lock-icon">
        <i class="fas fa-lock"></i>
      </div>
      <h3>Contenido Restringido</h3>
      <p>Este artículo requiere solicitar acceso.</p>
  
      <div class="preview-content">
        <ArticleContent contenido_html={preview_html} isPreview={true} />
      </div>
  
      <button
        class="enroll-button"
        on:click={onRequestEnrollment}
      >
        <i class="fas fa-key"></i>
        Solicitar Acceso
      </button>
    </div>
  </section>
  
  <style>
    .restricted-article {
      position: relative;
      z-index: 1000;
    }
  
    .enrollment-prompt {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }
  
    .lock-icon {
      width: 100px;
      height: 100px;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: white;
    }
  
    .preview-content {
      margin: 2rem 0;
      position: relative;
      border-radius: var(--border-radius);
      overflow: hidden;
      box-shadow: var(--box-shadow-elevated);
      background-color: var(--background-color);
      padding: 1rem;
    }
  
    .enroll-button {
      padding: 1rem 2rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: 1.1rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin: 2rem auto 0;
      cursor: pointer;
      transition: all var(--transition-speed);
      z-index: 1001;
    }
  
    .enroll-button:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
    }
  </style>  