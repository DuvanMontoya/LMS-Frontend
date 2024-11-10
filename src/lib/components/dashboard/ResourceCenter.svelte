<!-- src/components/dashboard/ResourceCenter.svelte -->
<script>
    export let articulos = [];
  
    $: recentArticles = articulos
      .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
      .slice(0, 3);
  
    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  </script>
  
  <section class="resource-center">
    <h2>Centro de Recursos</h2>
    
    <div class="articles-list">
      {#each recentArticles as articulo}
        <div class="article-item">
          <img src={articulo.imagen} alt={articulo.titulo} class="article-image">
          <div class="article-info">
            <h3>{articulo.titulo}</h3>
            <p class="article-excerpt">{articulo.resumen}</p>
            <div class="article-meta">
              <span class="article-date">{formatDate(articulo.fecha_publicacion)}</span>
              <a href="/articulos/{articulo.id}" class="read-more">Leer más</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  
    <div class="resource-actions">
      <a href="/articulos" class="view-all-articles">Ver todos los artículos</a>
      <a href="/recursos" class="explore-resources">Explorar recursos adicionales</a>
    </div>
  </section>
  
  <style>
    .resource-center {
      background-color: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }
  
    h2 {
      font-size: 1.5rem;
      color: #333;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
  
    .articles-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  
    .article-item {
      display: flex;
      background-color: #f8f9fa;
      border-radius: 10px;
      overflow: hidden;
    }
  
    .article-image {
      width: 120px;
      height: 120px;
      object-fit: cover;
    }
  
    .article-info {
      flex-grow: 1;
      padding: 1rem;
    }
  
    h3 {
      font-size: 1.2rem;
      margin: 0 0 0.5rem;
      color: #333;
    }
  
    .article-excerpt {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
  
    .article-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }
  
    .article-date {
      color: #888;
    }
  
    .read-more {
      color: #2196F3;
      text-decoration: none;
      font-weight: 500;
    }
  
    .read-more:hover {
      text-decoration: underline;
    }
  
    .resource-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }
  
    .view-all-articles, .explore-resources {
      color: #2196F3;
      text-decoration: none;
      font-weight: 500;
    }
  
    .view-all-articles:hover, .explore-resources:hover {
      text-decoration: underline;
    }
  </style>