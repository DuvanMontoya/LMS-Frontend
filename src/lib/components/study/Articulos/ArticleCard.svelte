 <!-- src/lib/components/study/ArticleCard.svelte -->
<script>
  import { goto } from '$app/navigation';
  import ProgressBar from './ProgressBar.svelte';
  
  export let article;
  
  function handleClick() {
    goto(`/study/${article.id}`);
  }
  
  $: progress = article.progreso?.progreso || 0;
  
  $: status = progress === 0 ? 'not-started' :
              progress === 100 ? 'completed' :
              'in-progress';
              
  $: statusText = status === 'not-started' ? 'Por empezar' :
                  status === 'completed' ? 'Completado' :
                  'En progreso';
                  
  $: statusClass = status === 'not-started' ? 'bg-gray-100 text-gray-600' :
                   status === 'completed' ? 'bg-green-100 text-green-700' :
                   'bg-blue-100 text-blue-700';
</script>

<div
  class="article-card"
  role="button"
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
  tabindex="0"
>
  {#if article.portada_articulo}
    <img
      src={article.portada_articulo}
      alt={article.titulo}
      class="card-image"
    />
  {:else}
    <div class="placeholder-image">
      <i class="fas fa-book-open"></i>
    </div>
  {/if}
  
  <div class="card-content">
    <h3>{article.titulo}</h3>
    
    {#if article.descripcion}
      <p class="description">{article.descripcion}</p>
    {/if}
    
    <div class="metadata">
      <span class="author">
        <i class="fas fa-user"></i>
        {article.autor_nombre}
      </span>
      
      <span class="status" class:completed={status === 'completed'}>
        <i class="fas fa-circle"></i>
        {statusText}
      </span>
    </div>
    
    <div class="progress-section">
      <ProgressBar {progress} size="small" />
      <span class="progress-text">
        {progress}% completado
      </span>
    </div>
</div>
</div>

<style>
  .article-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }

  .article-card:hover,
  .article-card:focus {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .card-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }

  .placeholder-image {
    width: 100%;
    height: 160px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 2rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .description {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .metadata {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .author {
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status i {
    font-size: 0.625rem;
  }

  .progress-section {
    margin-top: 1rem;
  }

  .progress-text {
    display: block;
    text-align: right;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
</style>