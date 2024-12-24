<script>
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import ArticleCard from './ArticleCard.svelte';
    import LoadingState from './LoadingState.svelte';
    import ErrorState from './ErrorState.svelte';
    import NoResults from './NoResults.svelte';
  
    export let articles = [];
    export let isLoading = false;
    export let error = null;
    export let onRetry = () => {};
    export let onReset = () => {};
  </script>
  
  <section 
    class="articles-section"
    transition:fade={{ duration: 300 }}
  >
    {#if isLoading}
      <LoadingState />
    {:else if error}
      <ErrorState {error} {onRetry} />
    {:else if articles.length === 0}
      <NoResults onReset={onReset} />
    {:else}
      <div class="articles-grid">
        {#each articles as article (article.id)}
          <div 
            class="article-item"
            in:fly={{ 
              y: 20, 
              duration: 400, 
              delay: 100, 
              easing: quintOut 
            }}
          >
            <ArticleCard {article} />
          </div>
        {/each}
      </div>
    {/if}
  </section>
  
  <style>
    .articles-section {
      width: 100%;
      min-height: 400px;
    }
  
    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 0.5rem;
    }
  
    .article-item {
      height: 100%;
      transition: transform var(--transition-speed) ease;
    }
  
    .article-item:hover {
      transform: translateY(-4px);
    }
  
    @media (max-width: 640px) {
      .articles-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>