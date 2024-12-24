<!-- src/lib/components/curso/Rating.svelte -->
<script>
  import { createEventDispatcher } from "svelte";
  export let rating = 0;
  const dispatch = createEventDispatcher();

  function setRating(value) {
    rating = value;
    dispatch('input', rating);
  }
</script>

<div class="rating">
  {#each Array(5) as _, i}
    <i 
      class="fas fa-star" 
      class:filled={i < rating}
      on:click={() => setRating(i + 1)}
      on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') setRating(i + 1) }}
      tabindex="0"
      role="button"
      aria-label={`Calificar con ${i + 1} estrellas`}
    ></i>
  {/each}
</div>

<style>
  .rating {
    display: flex;
    gap: 0.5rem;
    font-size: 2rem;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .fas.fa-star {
    cursor: pointer;
    color: #e0e0e0;
    transition: color 0.2s ease;
  }

  .fas.fa-star.filled {
    color: #f1c40f;
  }

  .fas.fa-star:focus {
    outline: 2px solid #3498db;
    outline-offset: 2px;
  }
</style>