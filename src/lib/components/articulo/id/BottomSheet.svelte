<!-- src/lib/components/articulo/id/BottomSheet.svelte -->
<script>
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Avatar from '$lib/components/articulo/id/Avatar.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { sessionStore } from '$lib/stores/sessionStore';
  import apiService from '$lib/api/articulos/articulos.js';

  import { Howl } from 'howler';

  export let activeContent = '';
  export let articleId = '';
  export let onClose;

  // Estado interno
  let selectedRating = 0;
  let isSubmittingRating = false;

  // Dispatch events if needed
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Función para manejar envío de calificación
  async function handleRating() {
    if (selectedRating < 1 || selectedRating > 5) return;

    isSubmittingRating = true;

    try {
      const token = get(sessionStore).access;
      if (!token) throw new Error('No se encontró token de autenticación');

      await apiService.rateArticle(articleId, selectedRating, token);
      
      // Play sound and show animation
      playRatingSound();
      showRatingAnimation();

      // Opcional: Informar al componente padre para actualizar datos
      // dispatch('ratingSubmitted', selectedRating);

      // Cerrar el bottom sheet
      onClose();
    } catch (error) {
      console.error('Error al calificar:', error);
      alert('Hubo un error al enviar la calificación.');
    } finally {
      isSubmittingRating = false;
    }
  }

  function playRatingSound() {
    const sound = new Howl({
      src: ['/sounds/rating_sound.mp3'],
      volume: 0.5
    });
    sound.play();
  }

  function showRatingAnimation() {
    // Implementar animación de calificación si es necesario
    // Por ejemplo, mostrar estrellas animadas
  }

  // Función para manejar otras acciones según activeContent
  // Por ahora, solo manejamos 'rating'
</script>

<!-- Overlay -->
<button
  type="button"
  class="bottomsheet-overlay"
  on:click={onClose}
  aria-label="Cerrar panel"
  transition:fade={{ duration: 300 }}
></button>

<!-- BottomSheet Content -->
<aside
  class="bottomsheet-panel"
  transition:fly={{ y: 100, duration: 500, easing: quintOut }}
>
  {#if activeContent === 'rating'}
    <div class="rating-section">
      <h2>Calificar Artículo</h2>
      <div class="stars">
        {#each [1,2,3,4,5] as star}
          <i
            class="fas fa-star {selectedRating >= star ? 'selected' : ''}"
            on:click={() => selectedRating = star}
          ></i>
        {/each}
      </div>
      <button
        class="submit-rating-button"
        on:click={handleRating}
        disabled={selectedRating === 0 || isSubmittingRating}
      >
        {#if isSubmittingRating}
          <i class="fas fa-spinner fa-spin"></i>
          Enviando...
        {:else}
          <i class="fas fa-paper-plane"></i>
          Enviar Calificación
        {/if}
      </button>
    </div>
  {:else if activeContent === 'other'}
    <!-- Implementar otro contenido si es necesario -->
    <p>Otro contenido</p>
  {/if}
</aside>

<style>
  /* Overlay */
  .bottomsheet-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
  }

  /* BottomSheet Panel */
  .bottomsheet-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 90vh;
    background-color: var(--background-elevated);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
  }

  /* Sección de calificación */
  .rating-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .rating-section h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-color);
  }

  .stars {
    display: flex;
    gap: 0.5rem;
    font-size: 2rem;
    color: #ddd;
    cursor: pointer;
  }

  .stars .fa-star.selected {
    color: var(--primary-color);
    animation: pop 0.3s ease;
  }

  @keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.5); }
    100% { transform: scale(1); }
  }

  .submit-rating-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transition-speed), transform var(--transition-speed);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .submit-rating-button:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
  }

  .submit-rating-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Animaciones opcionales */
</style>