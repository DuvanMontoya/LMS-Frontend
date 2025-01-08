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
      <div class="question-text scientific-content">
        {@html question.contexto}
      </div>
  
      <div class="question-explanation">
        <div class="explanation-content scientific-content">
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
    /* Estilos base de la tarjeta */
    .question-card {
        background: white;
        border-radius: 1.25rem;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .question-card:hover {
        box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        transform: translateY(-4px);
    }

    /* Encabezado */
    .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background: linear-gradient(to right, #f8fafc, #f1f5f9);
        border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    }

    .question-meta {
        display: flex;
        align-items: center;
        gap: 1.25rem;
    }

    .question-number {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
        letter-spacing: -0.025em;
    }

    /* Badges de estado */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s ease;
    }

    .status-badge.success {
        background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        color: #15803d;
    }

    .status-badge.pending {
        background: linear-gradient(135deg, #ffe4e6, #fecdd3);
        color: #be123c;
    }

    /* Botón de comentarios */
    .comments-button {
        display: inline-flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 1.25rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        color: #475569;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .comments-button:hover {
        background: #f8fafc;
        color: #0f172a;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    /* Contenido principal */
    .question-content {
        padding: 2rem;
    }

    /* Estilos para contenido científico */
    .scientific-content {
        font-family: "Charter", "Georgia", serif;
        font-size: 1.125rem;
        line-height: 1.8;
        color: #1e293b;
    }

    /* Estilos para ecuaciones matemáticas */
    .scientific-content :global(.math-display),
    .scientific-content :global(.katex-display) {
        margin: 2rem 0;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 0.5rem;
        overflow-x: auto;
        font-size: 1.1em;
    }

    .scientific-content :global(.katex) {
        font-size: 1.1em;
    }

    /* Estilos para tablas científicas */
    .scientific-content :global(table) {
        width: 100%;
        margin: 2rem 0;
        border-collapse: collapse;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 0 0 1px #e2e8f0;
    }

    .scientific-content :global(th) {
        background: #f8fafc;
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: #1e293b;
        border-bottom: 2px solid #e2e8f0;
    }

    .scientific-content :global(td) {
        padding: 1rem;
        border-bottom: 1px solid #e2e8f0;
        color: #475569;
    }

    .scientific-content :global(tr:hover) {
        background: #f8fafc;
    }

    /* Estilos para figuras e imágenes */
    .scientific-content :global(figure) {
        margin: 2.5rem 0;
        text-align: center;
    }

    .scientific-content :global(figcaption) {
        margin-top: 1rem;
        font-size: 0.875rem;
        color: #64748b;
        font-style: italic;
    }

    .scientific-content :global(img) {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* Estilos para referencias y citas */
    .scientific-content :global(.reference),
    .scientific-content :global(.citation) {
        font-size: 0.875rem;
        color: #64748b;
        margin: 0.5rem 0;
        padding-left: 2rem;
        text-indent: -2rem;
        line-height: 1.6;
    }

    /* Estilos para bloques de código */
    .scientific-content :global(pre),
    .scientific-content :global(code) {
        font-family: "Fira Code", monospace;
        background: #f8fafc;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
        font-size: 0.875rem;
        line-height: 1.7;
        border: 1px solid #e2e8f0;
    }

    /* Estilos para listas */
    .scientific-content :global(ul),
    .scientific-content :global(ol) {
        padding-left: 1.5rem;
        margin: 1rem 0;
    }

    .scientific-content :global(li) {
        margin: 0.5rem 0;
        color: #475569;
    }

    /* Estilos para encabezados dentro del contenido */
    .scientific-content :global(h1),
    .scientific-content :global(h2),
    .scientific-content :global(h3),
    .scientific-content :global(h4) {
        color: #1e293b;
        font-weight: 600;
        margin: 2rem 0 1rem;
        line-height: 1.3;
    }

    .scientific-content :global(h1) { font-size: 1.875rem; }
    .scientific-content :global(h2) { font-size: 1.5rem; }
    .scientific-content :global(h3) { font-size: 1.25rem; }
    .scientific-content :global(h4) { font-size: 1.125rem; }

    /* Estilos para notas al pie y referencias cruzadas */
    .scientific-content :global(.footnote),
    .scientific-content :global(.cross-reference) {
        font-size: 0.75rem;
        color: #6b7280;
        vertical-align: super;
        margin: 0 0.25rem;
        text-decoration: none;
    }

    /* Estilos para bloques de citas */
    .scientific-content :global(blockquote) {
        margin: 2rem 0;
        padding: 1rem 1.5rem;
        border-left: 4px solid #3b82f6;
        background: #f8fafc;
        color: #1e293b;
        font-style: italic;
        border-radius: 0 0.5rem 0.5rem 0;
    }

    /* Sección de explicación */
    .question-explanation {
        margin-top: 2rem;
        padding: 2rem;
        background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
    }

    /* Sección de calificación */
    .rating-section {
        margin-top: 2.5rem;
        padding: 1.5rem;
        background: white;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }

    .rating-label {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
    }

    .rating-label span:first-child {
        font-weight: 500;
        color: #0f172a;
    }

    .rating-hint {
        font-size: 0.875rem;
        color: #64748b;
    }

    /* Estilos responsivos */
    @media (max-width: 768px) {
        .question-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .scientific-content {
            font-size: 1rem;
        }

        .rating-section {
            flex-direction: column;
            align-items: stretch;
        }
    }

    /* Estilos para impresión */
    @media print {
        .question-card {
            box-shadow: none;
            border: 1px solid #e2e8f0;
        }

        .rating-section {
            display: none;
        }
    }
</style>