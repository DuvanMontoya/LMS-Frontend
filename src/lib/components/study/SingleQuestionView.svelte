<script>
    import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
    import QuestionToc from './QuestionToc.svelte';
  
    export let question;
    export let index;
    export let total;
  
    const dispatch = createEventDispatcher();
  
    // Cuando el usuario hace clic en “Comentarios”
    function handleCommentsClick() {
      dispatch('openComments', { question });
    }
  
    // Cuando el usuario hace clic en “Calificar”
    function handleRatingClick() {
      dispatch('openRating', { question });
    }
  
    // Renderiza MathJax tras actualizar
    afterUpdate(() => {
      if (typeof window !== 'undefined' && window.MathJax) {
        window.MathJax.typesetPromise();
      }
    });
  </script>
  
  <div class="single-question-view">
    <header class="question-header">
      <h2>Pregunta {index + 1} de {total}</h2>
      <div class="question-buttons">
        <button class="comments-btn" on:click={handleCommentsClick}>
          <i class="fas fa-comments"></i> Comentarios
          <span>({question?.comentarios?.length || 0})</span>
        </button>
        <button class="rating-btn" on:click={handleRatingClick}>
          <i class="fas fa-star"></i> Calificar
        </button>
      </div>
    </header>
  
    <!-- Contenido de la pregunta -->
    <div class="question-content scientific-content">
      {@html question?.contexto}
    </div>
  
    <!-- Explicación -->
    <div class="explanation-section">
      <h3>Explicación</h3>
      <div class="scientific-content">
        {@html question?.explicacion}
      </div>
      
      <!-- TOC dinámico para la explicación -->
      <QuestionToc htmlContent={question?.explicacion} />
    </div>
  </div>
  
  <style>
    .single-question-view {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  
    .question-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  
    .question-buttons {
      display: flex;
      gap: 1rem;
    }
  
    .comments-btn, .rating-btn {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: #f8fafc;
      cursor: pointer;
    }
  
    .comments-btn:hover,
    .rating-btn:hover {
      background: #f1f5f9;
    }
  
    .explanation-section {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 1rem;
      padding: 1rem;
    }
  </style>  