<script>
  import { createEventDispatcher } from 'svelte';

  // Recibimos estos props para mostrar estado (no son callbacks):
  export let isLiked = false;
  export let likesCount = 0;
  export let isDarkMode = false;

  // Creamos dispatcher para lanzar eventos
  const dispatch = createEventDispatcher();

  /**
   * Maneja el click en cada botón y emite el evento correspondiente
   */
  function handleButtonClick(action) {
    if (action === 'like') {
      dispatch('like');
    } else if (action === 'comments') {
      dispatch('comments');
    } else if (action === 'rate') {
      dispatch('rate');
    } else if (action === 'toggleDarkMode') {
      dispatch('toggleDarkMode');
    } else if (action === 'scrollToTop') {
      dispatch('scrollToTop');
    }
  }
</script>

<style>
  .floating-buttons {
    position: fixed;
    bottom: 2rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 999;
  }

  .fab-button {
    background-color: var(--background-color2);
    box-shadow: var(--box-shadow);
    border: none;
    border-radius: 50%;
    width: 52px;
    height: 52px;
    color: var(--text-color);
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color var(--transition-speed), transform var(--transition-speed);
  }

  .fab-button:hover {
    transform: translateY(-2px);
    background-color: var(--background-elevated);
  }

  .like-indicator {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .like-indicator .fa-heart {
    color: #e63946;
  }
</style>

<div class="floating-buttons">
  <!-- Botón Like -->
  <button
    class="fab-button"
    on:click={() => handleButtonClick('like')}
    title="Like"
  >
    {#if isLiked}
      <i class="fas fa-heart"></i>
    {:else}
      <i class="far fa-heart"></i>
    {/if}
  </button>

  <!-- Indicador de likes (opcional), podría ser un simple badge -->
  <div class="like-indicator">
    <i class="fas fa-heart"></i>
    <span>{likesCount}</span>
  </div>

  <!-- Botón Comments -->
  <button
    class="fab-button"
    on:click={() => handleButtonClick('comments')}
    title="Comentarios"
    aria-label="Abrir comentarios"
  >
    <i class="fas fa-comments"></i>
  </button>

  <!-- Botón Rate -->
  <button
    class="fab-button"
    on:click={() => handleButtonClick('rate')}
    title="Calificar"
    aria-label="Calificar artículo"
  >
    <i class="fas fa-star"></i>
  </button>

  <!-- Botón Toggle Dark Mode -->
  <button
    class="fab-button"
    on:click={() => handleButtonClick('toggleDarkMode')}
    title="Cambiar tema"
  >
    {#if isDarkMode}
      <i class="fas fa-sun"></i>
    {:else}
      <i class="fas fa-moon"></i>
    {/if}
  </button>

  <!-- Botón Scroll to top -->
  <button
    class="fab-button"
    on:click={() => handleButtonClick('scrollToTop')}
    title="Ir arriba"
    aria-label="Volver al inicio de la página"
  >
    <i class="fas fa-arrow-up"></i>
  </button>
</div>
