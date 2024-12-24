<!-- src/lib/components/Article/FloatingButtons.svelte -->
<script>
    import Button from '$lib/components/ui/Button.svelte';
    // import { swipe } from '$lib/transitions/swipe.js'; // Ruta correcta
    // import { swipe } from 'svelte-swipe-action';
    export let isLiked = false;
    export let likesCount = 0;
    export let onLike = () => {};
    export let onComments = () => {};
    export let onRate = () => {};
    export let onToggleDarkMode = () => {};
    export let onScrollToTop = () => {};
    export let show = false; // Asegúrate de definir la prop 'show'
  </script>
  
  {#if show}
    <div class="floating-buttons">
      <Button
        variant="primary"
        class="floating-button like-button"
        on:click={onLike}
        aria-label="Me gusta"
      >
        <i class={`fas fa-heart ${isLiked ? 'liked' : ''}`}></i>
        <span>{likesCount}</span>
      </Button>
      
      <Button
        variant="primary"
        class="floating-button"
        on:click={onComments}
        aria-label="Comentarios"
      >
        <i class="fas fa-comments"></i>
      </Button>
      
      <Button
        variant="primary"
        class="floating-button"
        on:click={onRate}
        aria-label="Calificar"
      >
        <i class="fas fa-star"></i>
      </Button>
      
      <Button
        variant="primary"
        class="floating-button"
        on:click={onToggleDarkMode}
        aria-label="Cambiar modo oscuro"
      >
        <i class={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
      </Button>
      
      <Button
        variant="secondary"
        class="floating-button"
        on:click={onScrollToTop}
        aria-label="Volver arriba"
      >
        <i class="fas fa-arrow-up"></i>
      </Button>
    </div>
  {/if}
  
  <style>
    .floating-buttons {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all var(--transition-speed);
      z-index: 1000;
    }
  
    .floating-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      cursor: pointer;
      transition: all var(--transition-speed);
      box-shadow: var(--box-shadow);
    }
  
    .floating-button:hover {
      background-color: var(--secondary-color);
      transform: scale(1.1);
    }
  
    .like-button {
      position: relative;
    }
  
    .like-button span {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: var(--accent-color);
      color: var(--text-color);
      font-size: 0.8rem;
      padding: 2px 5px;
      border-radius: 10px;
    }
  
    .liked {
      color: #ff4136;
    }
  </style>  