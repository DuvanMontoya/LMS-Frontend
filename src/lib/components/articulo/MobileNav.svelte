<!-- src/lib/components/articulo/MobileNav.svelte -->
<script>
  export let isLiked = false;
  export let likesCount = 0;
  export let isDarkMode = false;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function like() {
    dispatch('like');
  }

  function comments() {
    dispatch('comments');
  }

  function rate() {
    dispatch('rate');
  }

  function toggleDark() {
    dispatch('toggleDarkMode');
  }

  function scrollToTop() {
    dispatch('scrollToTop');
  }

  function toggleToc() {
    dispatch('toggleToc');
  }
</script>

<div class="mobile-nav">
  <button on:click={like} class="nav-button like-button" aria-label="Me gusta">
    <i class={isLiked ? 'fas fa-heart liked' : 'far fa-heart'}></i>
    {#if likesCount > 0}
      <span class="count">{likesCount}</span>
    {/if}
  </button>
  <button on:click={comments} class="nav-button comment-button" aria-label="Comentarios">
    <i class="fas fa-comments"></i>
  </button>
  <button on:click={rate} class="nav-button rate-button" aria-label="Calificar">
    <i class="fas fa-star"></i>
  </button>
  <button on:click={toggleDark} class="nav-button darkmode-button" aria-label="Toggle Dark Mode">
    <i class={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
  </button>
  <button on:click={scrollToTop} class="nav-button scroll-top-button" aria-label="Scroll to Top">
    <i class="fas fa-arrow-up"></i>
  </button>
  <button on:click={toggleToc} class="nav-button toc-button" aria-label="Abrir tabla de contenido">
    <i class="fas fa-list"></i>
  </button>
</div>

<style>
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--background-color2);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0.5rem 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 2000;
  }

  .nav-button {
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 1.2rem;
    position: relative;
    cursor: pointer;
    transition: color var(--transition-speed), transform var(--transition-speed);
  }

  .nav-button:hover {
    color: var(--primary-color);
    transform: scale(1.1);
  }

  .nav-button .fas.fa-heart.liked {
    color: #ff6b6b;
  }

  .nav-button .count {
    position: absolute;
    top: -5px;
    right: -10px;
    background-color: #ff6b6b;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 0.7rem;
    font-weight: bold;
  }
</style>