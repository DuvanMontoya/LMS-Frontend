<!-- src/lib/components/articulo/MobileNav.svelte -->
<script>
  import { slide, fade, fly } from "svelte/transition";
  export let isLiked;
  export let likesCount;
  export let onLike;
  export let onComments;
  export let onRate;
  export let onToggleDarkMode;
  export let onScrollToTop;
  export let isDarkMode;
  export let showToc;

  let lastScrollY = 0;
  let isVisible = true;

  function handleScroll() {
    const currentScrollY = window.scrollY;
    isVisible = currentScrollY <= lastScrollY || currentScrollY < 100;
    lastScrollY = currentScrollY;
  }
</script>

<svelte:window on:scroll={handleScroll} />

{#if isVisible}
<nav 
  class="mobile-nav"
  transition:fly={{ y: 100, duration: 200 }}
>
  <div class="nav-group primary">
    <button 
      class="nav-button like {isLiked ? 'liked' : ''}"
      on:click={onLike}
      aria-label="Me gusta"
    >
      <i class="fas fa-heart"></i>
      {#if likesCount > 0}
        <span class="count-badge">{likesCount}</span>
      {/if}
    </button>
    
    <button 
      class="nav-button"
      on:click={onComments}
      aria-label="Comentarios"
    >
      <i class="fas fa-comments"></i>
    </button>
    
    <button 
      class="nav-button"
      on:click={onRate}
      aria-label="Calificar"
    >
      <i class="fas fa-star"></i>
    </button>
  </div>

  <div class="nav-group secondary">
    <button 
      class="nav-button"
      on:click={() => showToc = !showToc}
      aria-label="Índice"
      class:active={showToc}
    >
      <i class="fas fa-list"></i>
    </button>
    
    <button 
      class="nav-button"
      on:click={onToggleDarkMode}
      aria-label="Cambiar tema"
    >
      <i class={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
    </button>
    
    <button 
      class="nav-button"
      on:click={onScrollToTop}
      aria-label="Volver arriba"
    >
      <i class="fas fa-arrow-up"></i>
    </button>
  </div>
</nav>
{/if}

<style>
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--background-color2);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .nav-group {
    display: flex;
    gap: 1rem;
  }

  .nav-button {
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius);
    border: none;
    background: none;
    color: var(--text-color);
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all var(--transition-speed);
  }

  .nav-button:hover,
  .nav-button.active {
    background-color: var(--background-elevated);
    color: var(--primary-color);
    transform: translateY(-2px);
  }

  .nav-button.like {
    color: var(--text-color-lighter);
  }

  .nav-button.like.liked {
    color: #ef4444;
    animation: likeEffect 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .count-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: var(--primary-color);
    color: white;
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
  }

  @keyframes likeEffect {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  @media (max-width: 480px) {
    .mobile-nav {
      padding: 0.75rem;
    }

    .nav-button {
      width: 42px;
      height: 42px;
      font-size: 1.1rem;
    }
  }
</style>