<script>
    import { createEventDispatcher } from 'svelte';
  
    export let rating = 0;
    export let maxRating = 5;
    export let size = 24;
    export let color = '#ffd700';
    export let backgroundColor = '#e0e0e0';
  
    const dispatch = createEventDispatcher();
  
    function handleRating(value) {
      rating = value;
      dispatch('rating', { rating: value });
    }
  </script>
  
  <div class="rating">
    {#each Array(maxRating) as _, i}
      <span
        class="star"
        on:click={() => handleRating(i + 1)}
        on:keydown={(e) => e.key === 'Enter' && handleRating(i + 1)}
        role="button"
        tabindex="0"
        aria-label={`Rate ${i + 1} out of ${maxRating}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? color : backgroundColor}
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </span>
    {/each}
  </div>
  
  <style>
    .rating {
      display: flex;
      align-items: center;
    }
  
    .star {
      cursor: pointer;
      display: inline-block;
      transition: transform 0.1s ease-in-out;
    }
  
    .star:hover {
      transform: scale(1.1);
    }
  </style>