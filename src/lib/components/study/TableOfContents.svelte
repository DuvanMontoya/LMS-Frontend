<!-- src/lib/components/study/TableOfContents.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
  
    export let questions = [];
    export let activeQuestionId;
  
    const dispatch = createEventDispatcher();
  
    // Calcula el progreso
    $: progress = questions.length
      ? Math.round((questions.filter(q => q.calificacion_usuario?.superada).length / questions.length) * 100)
      : 0;
  
    function navigateToQuestion(questionId) {
      dispatch('navigate', { questionId });
    }
  
    let hoveredIndex = null;
  </script>
  
  <div class="toc-container">
    <header class="toc-header">
      <h3>Contenido del estudio</h3>
      <div class="progress-pill">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            style="width: {progress}%"
            transition:fly={{ x: -100, duration: 1000 }}
          ></div>
        </div>
        <span class="progress-text">{progress}%</span>
      </div>
    </header>
  
    <div class="questions-list">
      {#each questions as question, idx (question.id)}
        <button
          class="question-card"
          class:active={activeQuestionId === question.id}
          on:click={() => navigateToQuestion(question.id)}
          on:mouseenter={() => hoveredIndex = idx}
          on:mouseleave={() => hoveredIndex = null}
        >
          <div class="question-info">
            <div class="question-number">
              <span class="number">{idx + 1}</span>
              {#if question.calificacion_usuario?.superada}
                <i class="fas fa-check-circle status-icon completed"></i>
              {:else if question.calificacion_usuario?.calificacion}
                <i class="fas fa-clock status-icon in-progress"></i>
              {:else}
                <i class="fas fa-circle status-icon pending"></i>
              {/if}
            </div>
            <div class="question-details">
              <span class="question-title">Pregunta {idx + 1}</span>
            </div>
          </div>
          {#if hoveredIndex === idx}
            <i class="fas fa-chevron-right nav-arrow" transition:fade={{ duration: 150 }}></i>
          {/if}
        </button>
      {/each}
    </div>
  </div> 
  
  
  <style>
    .toc-container {
      background: white;
      border-radius: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
      max-height: calc(100vh - 4rem);
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }

    .toc-container::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
  
    .toc-header {
      padding: 1.5rem;
      background: linear-gradient(to bottom, #f8fafc, white);
      border-bottom: 1px solid #e2e8f0;
    }
  
    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
    }
  
    .progress-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
    }
  
    .progress-bar {
      flex: 1;
      height: 0.5rem;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
  
    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, #3b82f6, #2563eb);
      border-radius: 9999px;
      transition: width 1s ease-in-out;
    }
  
    .progress-text {
      font-size: 0.875rem;
      font-weight: 600;
      color: #3b82f6;
      min-width: 3rem;
      text-align: right;
    }
  
    .questions-list {
      flex: 1;
      overflow-y: auto;
      padding: 0 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  
    .question-card {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
  
    .question-card:hover {
      transform: translateX(0.25rem);
      background: #f1f5f9;
    }

    .question-card.active {
    background: #eff6ff;
    border-color: #bfdbfe;
    transform: translateX(0.25rem);
  }

  .question-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .question-number {
    position: relative;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .number {
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    z-index: 1;
  }

  .status-icon {
    position: absolute;
    bottom: -0.25rem;
    right: -0.25rem;
    font-size: 0.875rem;
    background: white;
    border-radius: 50%;
    padding: 0.125rem;
  }

  .status-icon.completed {
    color: #16a34a;
  }

  .status-icon.in-progress {
    color: #eab308;
  }

  .status-icon.pending {
    color: #94a3b8;
    font-size: 0.625rem;
  }

  .question-details {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  .question-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }


  .nav-arrow {
    color: #64748b;
    font-size: 0.875rem;
    margin-left: 0.5rem;
  } 

  /* Estilizado del scrollbar para mejor integración visual */
  .questions-list::-webkit-scrollbar {
    width: 0.375rem;
  }

  .questions-list::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 9999px;
  }

  .questions-list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 9999px;
  }

  .questions-list::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Animaciones */
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  .status-icon.completed {
    animation: pulse 2s infinite;
  }

  /* Responsive adjustments */
  @media (max-width: 1280px) {
    .toc-container {
      max-height: none;
      position: sticky;
      top: 2rem;
    }

    .questions-list {
      max-height: calc(100vh - 16rem);
    }
  }

  @media (max-width: 768px) {
    .toc-header {
      padding: 1rem;
    }

    .questions-list {
      padding: 0 0.75rem;
    }

    .question-card {
      padding: 0.625rem 0.875rem;
    }

    .question-number {
      width: 1.75rem;
      height: 1.75rem;
    }
   
  }

  /* Animaciones de transición para elementos dinámicos */
  .question-card {
    position: relative;
    overflow: hidden;
  }

  .question-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .question-card:hover::after {
    opacity: 1;
  }

  .question-card.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0.25rem;
    background: #3b82f6;
    border-radius: 0.25rem 0 0 0.25rem;
  }

  /* Efectos de hover mejorados */
  .question-card:hover .question-number .number {
    color: #0f172a;
  }

  .question-card:hover .nav-arrow {
    color: #3b82f6;
    transform: translateX(0.25rem);
    transition: transform 0.2s ease;
  }

  .question-card.active:hover {
    transform: translateX(0.375rem);
  }

  /* Estilo para preguntas completadas */
  .question-card:has(.status-icon.completed) .question-title {
    color: #16a34a;
  }

  /* Mejoras de accesibilidad */
  .question-card:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
  }

  .question-card:focus:not(:focus-visible) {
    box-shadow: none;
  }

  /* Modo oscuro (opcional, si tu aplicación lo soporta) */
  @media (prefers-color-scheme: dark) {
    .toc-container {
      background: #1e293b;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }

    .toc-header {
      background: linear-gradient(to bottom, #1e293b, #0f172a);
      border-bottom-color: #334155;
    }

    h3 {
      color: #f8fafc;
    }

    .progress-pill {
      background: #334155;
      border-color: #475569;
    }

    .question-card {
      background: #334155;
      border-color: #475569;
    }

    .question-card:hover {
      background: #475569;
    }

    .question-card.active {
      background: #1e40af;
      border-color: #3b82f6;
    }

    .question-title {
      color: #f8fafc;
    }

    .number {
      color: #cbd5e1;
    }

    .status-icon {
      background: #1e293b;
    }   
  }
</style>