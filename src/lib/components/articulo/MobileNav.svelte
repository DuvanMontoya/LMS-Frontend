<!-- src/lib/components/articulo/MobileNav.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let isLiked = false;
  export let likesCount = 0;
  export let isDarkMode = false;

  function handleLike() {
    dispatch('like');
  }

  function handleComments() {
    dispatch('comments');
  }

  function handleRate() {
    dispatch('rate');
  }

  function handleToggleDarkMode() {
    dispatch('toggleDarkMode');
  }

  function handleScrollToTop() {
    dispatch('scrollToTop');
  }

  function handleToggleToc() {
    dispatch('toggleToc');
  }
</script>

<nav class="mobile-nav">
  <button on:click={handleToggleToc} aria-label="Abrir tabla de contenido">
    <i class="fas fa-list"></i>
  </button>
  <button on:click={handleLike} aria-label="Me gusta">
    <i class={isLiked ? 'fas fa-heart liked' : 'far fa-heart'}></i>
    <span>{likesCount}</span>
  </button>
  <button on:click={handleComments} aria-label="Comentarios">
    <i class="fas fa-comments"></i>
  </button>
  <button on:click={handleRate} aria-label="Calificar">
    <i class="fas fa-star"></i>
  </button>
  <button on:click={handleToggleDarkMode} aria-label="Toggle Dark Mode">
    <i class={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
  </button>
  <button on:click={handleScrollToTop} aria-label="Scroll to Top">
    <i class="fas fa-arrow-up"></i>
  </button>
</nav>

<style>
  .mobile-nav {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--background-color2);
    border-radius: 50px;
    box-shadow: var(--box-shadow-elevated);
    display: flex;
    gap: 1rem;
    padding: 0.5rem 1rem;
    z-index: 3000;
  }

  .mobile-nav button {
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 1.2rem;
    cursor: pointer;
    transition: color var(--transition-speed);
  }

  .mobile-nav button:hover {
    color: var(--primary-color);
  }

  .mobile-nav .liked {
    color: var(--secondary-color);
  }
</style>