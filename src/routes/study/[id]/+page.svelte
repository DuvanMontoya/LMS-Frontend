<!-- src/lib/pages/StudyPage.svelte -->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { sessionStore } from '$lib/stores/sessionStore';
  import studyService from '$lib/api/study/studyService';
  import { studyStore } from '$lib/api/study/studyService';
  
  import TableOfContents from '$lib/components/study/TableOfContents.svelte';
  import CommentsModal from '$lib/components/study/CommentsModal.svelte';
  import RatingBar from '$lib/components/study/RatingBar.svelte';

  let articleId = $page.params.id;
  let activeQuestionId = null;
  let showCommentsModal = false;
  let questionForComments = null;
  
  // Suscripción al store
  $: article = $studyStore.article;
  $: questions = $studyStore.questions;
  $: progress = $studyStore.progress;
  $: error = $studyStore.error;
  $: isLoading = $studyStore.isLoading;

  onMount(async () => {
    try {
      studyStore.setLoading(true);
      await loadData();
    } catch (err) {
      studyStore.setError(err.message);
    } finally {
      studyStore.setLoading(false);
    }

    if (typeof window !== 'undefined' && window.MathJax) {
      window.MathJax.typesetPromise()
        .catch(err => console.error('Error al renderizar MathJax:', err));
    }
  });

  async function loadData() {
    const token = $sessionStore.access;
    const data = await studyService.getStudyArticle(articleId, token);
    
    // Asegurarse que los comentarios estén inicializados correctamente
    const questionsWithComments = data.preguntas?.map(q => ({
      ...q,
      comentarios: Array.isArray(q.comentarios) ? q.comentarios : [],
      calificacion_usuario: q.calificacion_usuario || {}
    })) || [];

    studyStore.setArticle(data);
    studyStore.setQuestions(questionsWithComments);
    studyStore.updateProgress(data.progreso?.progreso || 0);
  }

  function openComments(question) {
    // Asegurar que tengamos los comentarios actualizados
    const updatedQuestion = $studyStore.questions.find(q => q.id === question.id);
    questionForComments = {
      ...updatedQuestion,
      pregunta_numero: question.pregunta_numero,
      comentarios: updatedQuestion.comentarios || []
    };
    showCommentsModal = true;
  }

  async function handleComment(event) {
    const { content, parentId, questionId } = event.detail;
    try {
      studyStore.setLoading(true);
      const token = $sessionStore.access;
      const newComment = await studyService.addComment(
        articleId,
        questionId,
        content,
        parentId,
        token
      );

      // Actualizar comentarios en el store
      const currentQuestion = $studyStore.questions.find(q => q.id === questionId);
      const updatedComments = [
        newComment,
        ...(currentQuestion.comentarios || [])
      ];

      studyStore.updateQuestionStatus(questionId, 'comentarios', updatedComments);

      // Actualizar el modal si está abierto
      if (questionForComments && questionForComments.id === questionId) {
        questionForComments = {
          ...questionForComments,
          comentarios: updatedComments
        };
      }
    } catch (err) {
      studyStore.setError('No se pudo guardar el comentario. ' + err.message);
    } finally {
      studyStore.setLoading(false);
    }
  }

  async function handleLikeComment(event) {
    const { commentId, questionId } = event.detail;
    try {
      studyStore.setLoading(true);
      const token = $sessionStore.access;
      const { liked, likes_count } = await studyService.toggleCommentLike(articleId, commentId, token);

      // Actualizar el comentario en el store
      const currentQuestion = $studyStore.questions.find(q => q.id === questionId);
      const updatedComments = currentQuestion.comentarios.map(c => {
        if (c.id === commentId) {
          return { ...c, user_has_liked: liked, likes_count };
        }
        // También buscar en respuestas
        if (c.respuestas) {
          const updatedRespuestas = c.respuestas.map(r =>
            r.id === commentId ? { ...r, user_has_liked: liked, likes_count } : r
          );
          return { ...c, respuestas: updatedRespuestas };
        }
        return c;
      });

      studyStore.updateQuestionStatus(questionId, 'comentarios', updatedComments);

      // Actualizar el modal si está abierto
      if (questionForComments && questionForComments.id === questionId) {
        questionForComments = {
          ...questionForComments,
          comentarios: updatedComments
        };
      }
    } catch (err) {
      studyStore.setError('No se pudo procesar el like.');
    } finally {
      studyStore.setLoading(false);
    }
  }

  async function handleRate({ detail }) {
    const { questionId, rating } = detail;
    try {
      studyStore.setLoading(true);
      const token = $sessionStore.access;
      const response = await studyService.rateQuestion(articleId, questionId, rating, token);
      
      studyStore.updateQuestionRating(questionId, rating);
      if (response.progreso) {
        studyStore.updateProgress(response.progreso.progreso);
      }
    } catch (err) {
      studyStore.setError('No se pudo guardar la calificación. ' + err.message);
    } finally {
      studyStore.setLoading(false);
    }
  }

  function handleActiveQuestionChange(questionId) {
    activeQuestionId = questionId;
  }

  function closeCommentsModal() {
    showCommentsModal = false;
    questionForComments = null;
  }

  function dismissError() {
    studyStore.setError(null);
  }
</script>


<svelte:head>
  {#if article}
    <title>{article.titulo} | Estudio</title>
    <meta name="description" content={article.descripcion} />
  {/if}
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
      },
      startup: {
        ready: () => {
          MathJax.startup.defaultReady();
        }
      }
    };
  </script>
</svelte:head>

<div class="study-layout">
  {#if isLoading && !article}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando artículo...</p>
    </div>
  {:else if error}
    <div class="error-banner">
      <p>{error}</p>
      <button on:click={dismissError}>Cerrar</button>
    </div>
  {:else}
    <main class="content-wrapper">
      <article class="article-content">
        <header class="article-header">
          <h1>{article?.titulo}</h1>
          <p class="subtitle">{article?.descripcion}</p>
          <div class="progress-container">
            <div class="progress-info">
              <span class="progress-text">Progreso del estudio</span>
              <span class="progress-percentage">{progress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {progress}%"></div>
            </div>
          </div>
        </header>

        <div class="article-body">
          {@html article?.contenido}

          <div class="questions-section">
            {#each questions as question, idx (question.id)}
              <div class="question-card" id={`question-${question.id}`}>
                <div class="question-header">
                  <div class="question-meta">
                    <span class="question-number">Pregunta {idx + 1}</span>
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
                      on:click={() => openComments(question)}
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
            {/each}
          </div>
        </div>
      </article>

      <aside class="toc-sidebar">
        <div class="toc-wrapper">
          <TableOfContents
            {questions}
            {activeQuestionId}
            on:navigate={({ detail }) => {
              const elem = document.getElementById(`question-${detail.questionId}`);
              if (elem) {
                elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            on:activeQuestionChange={handleActiveQuestionChange}
          />
        </div>
      </aside>
    </main>
  {/if}

  {#if isLoading}
    <div class="action-overlay">
      <div class="spinner"></div>
    </div>
  {/if}

  {#if showCommentsModal && questionForComments}
    <CommentsModal
      isOpen={showCommentsModal}
      {articleId}
      question={questionForComments}
      on:close={closeCommentsModal}
      on:comment={handleComment}
      on:like={handleLikeComment}
    />
  {/if}
</div>


<style>
  .study-layout {
    position: relative;
    min-height: 100vh;
    background: #f8fafc;
    overflow-x: hidden;
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 2rem;
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
  }

  .article-content {
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .article-header {
    padding: 2rem;
    background: linear-gradient(to right, #f8fafc, #f1f5f9);
    border-bottom: 1px solid #e2e8f0;
  }

  .article-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #64748b;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .progress-container {
    background: white;
    padding: 1.25rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .progress-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
  }

  .progress-percentage {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
  }

  .progress-bar {
    height: 0.5rem;
    background: #e2e8f0;
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 9999px;
    transition: width 0.5s ease;
  }

  .article-body {
    padding: 2rem;
  }

  .questions-section {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

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

  .toc-sidebar {
    position: static;
    height: 100vh;
  }

  .toc-wrapper {
    position: fixed;
    top: 2rem;
    width: 300px;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 10;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  .toc-wrapper::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    gap: 1rem;
  }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-state p {
    color: #64748b;
    font-size: 0.875rem;
  }

  .error-banner {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: #fee2e2;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 50;
  }

  .error-banner p {
    color: #991b1b;
    margin: 0;
  }

  .error-banner button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .error-banner button:hover {
    background: #b91c1c;
  }

  .action-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1280px) {
    .content-wrapper {
      grid-template-columns: 1fr 280px;
      padding: 1.5rem;
      gap: 1.5rem;
    }
  }

  @media (max-width: 1024px) {
    .content-wrapper {
      grid-template-columns: 1fr;
    }

    .toc-sidebar {
      display: none;
    }

    .article-header {
      padding: 1.5rem;
    }

    .article-header h1 {
      font-size: 1.75rem;
    }

    .article-body {
      padding: 1.5rem;
    }
  }

  @media (max-width: 640px) {
    .content-wrapper {
      padding: 1rem;
    }

    .article-header {
      padding: 1.25rem;
    }

    .article-body {
      padding: 1.25rem;
    }

    .rating-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }
</style>