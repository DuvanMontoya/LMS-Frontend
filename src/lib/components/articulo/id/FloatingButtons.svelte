<!-- src/lib/components/articulo/FloatingButtons.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  export let isLiked = false;
  export let likesCount = 0;
  export let isDarkMode = false;
  export let isMobile = false;
  export let isVertical = false;

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

<div class="floating-buttons">
  <button on:click={like} class="floating-button like-button" aria-label="Me gusta">
      <i class={isLiked ? 'fas fa-heart liked' : 'far fa-heart'}></i>
      {#if likesCount > 0}
          <span class="count">{likesCount}</span>
      {/if}
  </button>
  <button on:click={comments} class="floating-button comment-button" aria-label="Comentarios">
      <i class="fas fa-comments"></i>
  </button>
  <button on:click={rate} class="floating-button rate-button" aria-label="Calificar">
      <i class="fas fa-star"></i>
  </button>
  <button on:click={toggleDark} class="floating-button darkmode-button" aria-label="Toggle Dark Mode">
      <i class={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
  </button>
  <button on:click={scrollToTop} class="floating-button scroll-top-button" aria-label="Scroll to Top">
      <i class="fas fa-arrow-up"></i>
  </button>
  <!-- {#if !isMobile && !isVertical}
      <button on:click={toggleToc} class="floating-button toc-button" aria-label="Abrir tabla de contenido">
          <i class="fas fa-list"></i>
      </button>
  {/if} -->
</div>

<style>
  .floating-buttons {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      z-index: 2000;
  }

  .floating-button {
      width: 40px;
      height: 40px;
      background-color: var(--accent-color);
      color: white;
      border: none;
      border-radius: 50%;
      box-shadow: var(--box-shadow-elevated);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-speed), transform var(--transition-speed);
      position: relative;
  }

  .floating-button:hover {
      background-color: var(--primary-dark);
      transform: scale(1.1);
  }

  .floating-button i {
      font-size: 1.2rem;
  }

  .floating-button.like-button .fas.fa-heart.liked {
      color: #ff6b6b;
  }

  .floating-button .count {
      position: absolute;
      bottom: -5px;
      right: -5px;
      background-color: #ff6b6b;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.75rem;
      font-weight: bold;
  }

  /* Botón de TOC específico */
  .toc-button {
      background-color: var(--secondary-color);
      transition: background-color var(--transition-speed), transform var(--transition-speed);
  }

  .toc-button:hover {
      background-color: var(--secondary-dark);
      transform: scale(1.05);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
      .floating-button {
          width: 40px;
          height: 40px;
          font-size: 1rem;
      }

      .floating-button .count {
          font-size: 0.7rem;
          padding: 1px 4px;
      }
  }
</style>