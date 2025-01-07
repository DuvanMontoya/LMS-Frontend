<!-- src/lib/components/study/QuestionCard.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import QuestionStatus from './QuestionStatus.svelte';
  import RatingBar from './RatingBar.svelte';
  import studyService from '../api/study/studyService.js'; // Asegúrate de importar studyService correctamente
  import { studyStore } from '../api/study/studyService.js'; // Importa el store si es necesario

  export let question;
  export let index;
  export let articleId; // Asegúrate de recibir el articleId como prop
  export const isActive = false;

  const dispatch = createEventDispatcher();
  let showExplanation = false;
  let token = ''; // Obtén el token de autenticación según tu implementación

  async function handleRate(event) {
    const { questionId, rating } = event.detail;

    try {
      await studyService.rateQuestion(articleId, questionId, rating, token);
      // Actualiza el estado del store si es necesario
      studyStore.updateQuestionRating(questionId, rating);
    } catch (error) {
      console.error('Error al calificar la pregunta:', error);
      // Maneja el error según tu lógica (mostrar notificación, etc.)
    }

    // Reenvía el evento hacia el padre si es necesario
    dispatch('rate', event.detail);
  }

  function openComments() {
    dispatch('openComments', { question });
  }
</script>

<!-- Resto del componente permanece igual -->

<div class="question-card" transition:slide>
  <div class="card-header">
    <div class="index-status">
      <h3>Pregunta {index + 1}</h3>
      <QuestionStatus
        superada={question.calificacion_usuario?.superada}
        favorita={question.calificacion_usuario?.favorita}
        enemiga={question.calificacion_usuario?.enemiga}
        repasar={question.calificacion_usuario?.repasar}
        variant="compact"
      />
    </div>
    <div class="rating-bar">
      <RatingBar
        value={question.calificacion_usuario?.calificacion || 5}
        questionId={question.id}
        on:rate={handleRate}
      />
    </div>
  </div>

  <div class="card-body">
    <p class="question-text" id={`question-context-${index}`}>
      {@html question.contexto}
    </p>

    <button class="toggle-explanation" on:click={() => (showExplanation = !showExplanation)}>
      {showExplanation ? 'Ocultar' : 'Ver'} explicación
    </button>

    {#if showExplanation}
      <div class="explanation" transition:slide>
        {@html question.explicacion}
      </div>
    {/if}

    <div class="actions">
      <button class="comments-btn" on:click={openComments}>
        <i class="fas fa-comments"></i>
        Comentarios ({question.comentarios?.length || 0})
      </button>
    </div>
  </div>
</div>


<style>
  .question-card {
    position: relative;
    background: white;
    border-radius: 1rem;
    padding: 1rem 2rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .question-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0,0,0,0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .index-status {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .rating-bar {
    position: sticky;
    top: 1rem;
    right: 0;
    align-self: flex-start;
    margin-left: auto;
    z-index: 10;
    background: white;
    padding: 0.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .question-text {
    font-size: 1rem;
    line-height: 1.8;
    color: #1f2937;
    margin: 0;
  }

  .toggle-explanation {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 0.9rem;
    text-decoration: underline;
  }

  .explanation {
    background: #f9fafb;
    border-left: 4px solid #3b82f6;
    padding: 1rem;
    border-radius: 0.5rem;
    color: #4b5563;
    line-height: 1.6;
  }

  .actions {
    margin-top: 0.5rem;
  }

  .comments-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: #3b82f6;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .comments-btn:hover {
    background: #2563eb;
  }

  @media (max-width: 768px) {
    .question-card {
      padding: 1rem;
    }
    .card-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }
    .rating-bar {
      align-self: flex-start;
    }
  }
</style>