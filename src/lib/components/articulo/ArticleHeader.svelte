<!-- src/lib/components/Article/ArticleHeader.svelte -->
<script>
    export let title = "Título del Artículo";
    export let author = "Autor";
    export let date = "Fecha de Publicación";
    export let category = "Categoría";
    import { fly } from 'svelte/transition'; // Importar fly
    import { quintOut } from 'svelte/easing';


  </script>
  
  <header class="article-header" in:fly={{ y: -50, duration: 800, delay: 200, easing: quintOut }}>
    <div class="header-content">
      <h1>{title}</h1>
      <div class="article-meta">
        <span class="author">
          <i class="fas fa-user-graduate"></i>
          {author}
        </span>
        <span class="date">
          <i class="fas fa-calendar-alt"></i>
          {new Date(date).toLocaleDateString()}
        </span>
        <span class="category">
          <i class="fas fa-tags"></i>
          {category}
        </span>
      </div>
    </div>
  </header>
  
  <style>
    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--light-text-color);
    }
  
    .header-content h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--primary-color);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  
    .article-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.9rem;
      color: var(--light-text-color);
    }
  
    .article-meta span {
      display: flex;
      align-items: center;
    }
  
    .article-meta i {
      margin-right: 0.5rem;
    }
  
    @media (max-width: 768px) {
      .header-content h1 {
        font-size: 2rem;
      }
  
      .article-meta {
        font-size: 0.8rem;
      }
    }
  </style>  