<!-- src/lib/components/Article/MobileNav.svelte -->
<script>
    import Button from '$lib/components/ui/Button.svelte';
    export let isLiked = false;
    export let likesCount = 0;
    export let onLike = () => {};
    export let onComments = () => {};
    export let onRate = () => {};
    export let onToggleDarkMode = () => {};
  </script>
  
  <nav class="mobile-nav">
    <Button
      variant="primary"
      class="nav-button"
      on:click={onLike}
      aria-label="Me gusta"
    >
      <i class={`fas fa-heart ${isLiked ? 'liked' : ''}`}></i>
      <span>{likesCount}</span>
    </Button>
    
    <Button
      variant="primary"
      class="nav-button"
      on:click={onComments}
      aria-label="Comentarios"
    >
      <i class="fas fa-comments"></i>
      <span>Comentarios</span>
    </Button>
    
    <Button
      variant="primary"
      class="nav-button"
      on:click={onRate}
      aria-label="Calificar"
    >
      <i class="fas fa-star"></i>
      <span>Calificar</span>
    </Button>
    
    <Button
      variant="primary"
      class="nav-button"
      on:click={onToggleDarkMode}
      aria-label="Cambiar modo oscuro"
    >
      <i class={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
      <span>{isDarkMode ? "Claro" : "Oscuro"}</span>
    </Button>
  </nav>
  
  <style>
    .mobile-nav {
      display: flex;
      justify-content: space-around;
      align-items: center;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: var(--background-color2);
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      padding: 0.75rem 0;
      transition: all var(--transition-speed);
    }
  
    .nav-button {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      background: none;
      border: none;
      color: var(--text-color);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all var(--transition-speed);
    }
  
    .nav-button i {
      font-size: 1.4rem;
      margin-bottom: 0.25rem;
    }
  
    .nav-button:hover {
      color: var(--accent-color);
    }
  
    .liked {
      color: #ff4136;
    }
  </style>  