<script>
    import { createEventDispatcher } from 'svelte';
  
    export let questions = [];
    export let currentIndex = 0;
  
    const dispatch = createEventDispatcher();
  
    function navigate(idx) {
      dispatch('navigateToQuestion', { index: idx });
    }
  
    function getColor(q) {
      let rating = q?.calificacion_usuario?.calificacion || 0;
      if (rating <= 3) return 'red';
      if (rating <= 7) return 'yellow';
      return 'green';
    }
  </script>
  
  <div class="question-pagination">
    {#each questions as q, i}
      <div
        class="circle {getColor(q)} {i === currentIndex ? 'active' : ''}"
        on:click={() => navigate(i)}
      >
        {i + 1}
      </div>
    {/each}
  </div>
  
  <style>
    .question-pagination {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 2rem 0;
      align-items: center;
      justify-content: flex-start;
    }
  
    .circle {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: #e5e7eb;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
  
    .circle:hover {
      transform: scale(1.1);
    }
  
    .circle.active {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
    }
  
    .circle.red {
      background: #ef4444;
    }
    .circle.yellow {
      background: #f59e0b;
    }
    .circle.green {
      background: #10b981;
    }
  </style>  