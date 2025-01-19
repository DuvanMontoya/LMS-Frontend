<script>
    import { createEventDispatcher } from 'svelte';
    import RatingBar from '$lib/components/study/RatingBar.svelte'; // Reusa tu RatingBar
    export let question;
  
    const dispatch = createEventDispatcher();
  
    function handleRate(event) {
      dispatch('rate', event.detail);
    }
  </script>
  
  {#if question}
    <div class="rating-modal-content">
      <RatingBar
        value={question.calificacion_usuario?.calificacion || 5}
        questionId={question.id}
        on:rate={handleRate}
      />
    </div>
  {/if}
  
  <style>
    .rating-modal-content {
      margin: 1rem 0;
    }
  </style>  