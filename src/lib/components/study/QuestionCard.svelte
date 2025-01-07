<!-- src/lib/components/study/QuestionCard.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    import RatingBar from '$lib/components/study/RatingBar.svelte';
    
    export let question;
    export let index;
    export let isLoading;
  
    const dispatch = createEventDispatcher();
  
    function openComments() {
      dispatch('openComments', { question });
    }
  
    function handleRate(event) {
      dispatch('rate', event.detail);
    }
  </script>
  
  <div class="question-card" id={`question-${question.id}`}>
    <div class="question-header">
      <div class="question-meta">
        <span class="question-number">Pregunta {index + 1}</span>
        {#if question.calificacion_usuario?.superada}
          <span class="status-badge success">
            <i class="fas fa-check"></i> Completada
          </span>
        {:else}
          <span class="status-badge pending">
            <i class="fas fa-clock"></i> Pendiente
          </span>
        {/if}
      </div>
      
      <div class="question-actions">
        <button 
          class="comments-button" 
          on:click={openComments}
          title="Ver dudas y comentarios"
        >
          <i class="fas fa-comments"></i>
          <span>Dudas ({question.comentarios?.length || 0})</span>
        </button>
      </div>
    </div>
  
    <div class="question-content">
      <div class="question-text">
        {@html question.contexto}
      </div>
  
      <div class="question-explanation">
        <div class="explanation-content">
          {@html question.explicacion}
        </div>
      </div>
  
      <div class="rating-section">
        <div class="rating-label">
          <span>¿Qué tan bien entendiste esta pregunta?</span>
          <span class="rating-hint">Desliza para calificar</span>
        </div>
        <RatingBar
          value={question.calificacion_usuario?.calificacion || 5}
          questionId={question.id}
          disabled={isLoading}
          on:rate={handleRate}
        />
      </div>
    </div>
  </div>
  
  <style>
    .question-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }
  
    .question-card:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
  
    .question-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  
    .question-number {
      font-size: 1.1rem;
      font-weight: 600;
      color: #0f172a;
    }
  
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
  
    .status-badge.success {
      background: #dcfce7;
      color: #166534;
    }
  
    .status-badge.pending {
      background: #fff1f2;
      color: #be123c;
    }
  
    .question-actions {
      display: flex;
      gap: 1rem;
    }
  
    .comments-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
    }
  
    .comments-button:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: translateY(-1px);
    }
  
    .question-content {
      padding: 1.5rem;
    }
  
    .question-text {
      color: #1e293b;
      line-height: 1.8;
      font-size: 1.05rem;
    }
  
    .question-explanation {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
    }
  
    .explanation-content {
      color: #475569;
      line-height: 1.7;
    }
  
    .rating-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }
  
    .rating-label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  
    .rating-label span:first-child {
      font-weight: 500;
      color: #0f172a;
    }
  
    .rating-hint {
      font-size: 0.875rem;
      color: #64748b;
    }
  </style>  