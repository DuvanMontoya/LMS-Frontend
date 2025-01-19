<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { sessionStore } from '$lib/stores/sessionStore';
  import studyService, { studyStore } from '$lib/api/study/studyService';

  import ArticleHeader from '$lib/components/study/ArticleHeader.svelte';
  import QuestionPagination from '$lib/components/study/QuestionPagination.svelte';  // Nuevo componente
  import SingleQuestionView from '$lib/components/study/SingleQuestionView.svelte';  // Nuevo contenedor
  import CommentsModal from '$lib/components/study/CommentsModal.svelte';  
  import ErrorBanner from '$lib/components/study/ErrorBanner.svelte';
  import LoadingSpinner from '$lib/components/study/LoadingSpinner.svelte';
  import LoadingState from '$lib/components/study/LoadingState.svelte';
  import RatingModalContent from '$lib/components/study/RatingModalContent.svelte';  // Nuevo contenedor  

  let articleId = $page.params.id;
  let currentQuestionIndex = 0;       // Maneja qué pregunta se está mostrando
  let showCommentsModal = false;
  let questionForComments = null;
  let showRatingModal = false;
  let questionForRating = null;

  // Suscripción al store
  $: article      = $studyStore.article;
  $: questions    = $studyStore.questions;
  $: progress     = $studyStore.progress;
  $: error        = $studyStore.error;
  $: isLoading    = $studyStore.isLoading;

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

    const questionsWithComments = data.preguntas?.map(q => ({
      ...q,
      comentarios: Array.isArray(q.comentarios) ? q.comentarios : [],
      calificacion_usuario: q.calificacion_usuario || {}
    })) || [];

    studyStore.setArticle(data);
    studyStore.setQuestions(questionsWithComments);
    studyStore.updateProgress(data.progreso?.progreso || 0);
  }

  function dismissError() {
    studyStore.setError(null);
  }

  // === Manejo de comentarios ===
  function openComments(question) {
    questionForComments = question;
    showCommentsModal = true;
  }

  function closeCommentsModal() {
    showCommentsModal = false;
    questionForComments = null;
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
      const currentQuestion = $studyStore.questions.find(q => q.id === questionId);
      const updatedComments = [ newComment, ...(currentQuestion.comentarios || []) ];
      studyStore.updateQuestionStatus(questionId, 'comentarios', updatedComments);

      // Si el modal corresponde a esta pregunta, actualizamos
      if (questionForComments && questionForComments.id === questionId) {
        questionForComments = { ...questionForComments, comentarios: updatedComments };
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

      const currentQuestion = $studyStore.questions.find(q => q.id === questionId);
      const updatedComments = currentQuestion.comentarios.map(c => {
        if (c.id === commentId) {
          return { ...c, user_has_liked: liked, likes_count };
        }
        // Buscar en subrespuestas
        if (c.respuestas) {
          const updatedRespuestas = c.respuestas.map(r =>
            r.id === commentId ? { ...r, user_has_liked: liked, likes_count } : r
          );
          return { ...c, respuestas: updatedRespuestas };
        }
        return c;
      });

      studyStore.updateQuestionStatus(questionId, 'comentarios', updatedComments);

      if (questionForComments && questionForComments.id === questionId) {
        questionForComments = { ...questionForComments, comentarios: updatedComments };
      }
    } catch (err) {
      studyStore.setError('No se pudo procesar el like.');
    } finally {
      studyStore.setLoading(false);
    }
  }

  // === Manejo de calificación ===
  function openRating(question) {
    questionForRating = question;
    showRatingModal = true;
  }

  function closeRatingModal() {
    showRatingModal = false;
    questionForRating = null;
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

      // Cerrar modal y permitir avanzar
      showRatingModal = false;
      questionForRating = null;
    } catch (err) {
      studyStore.setError('No se pudo guardar la calificación. ' + err.message);
    } finally {
      studyStore.setLoading(false);
    }
  }

  // === Navegación entre preguntas (paginación) ===
  function goToQuestion(idx) {
    // Verificamos si la pregunta actual está calificada
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ?.calificacion_usuario?.calificacion && idx !== currentQuestionIndex) {
      // Si no tiene calificación, forzamos modal
      openRating(currentQ);
      return; 
    }
    // Cambiamos la pregunta
    currentQuestionIndex = idx;
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
    <LoadingState message="Cargando artículo..." />
  {:else if error}
    <ErrorBanner errorMessage={error} on:dismiss={dismissError} />
  {:else}
    <main class="content-wrapper">
      <article class="article-content">
        <!-- Ahora pasamos 'article' directamente -->
        <ArticleHeader {article} progress={progress} />

        <div class="article-body">
          {@html article?.contenido}
          
          <!-- Muestra UNA sola pregunta a la vez -->
          {#if questions && questions.length > 0}
            <SingleQuestionView
              question={questions[currentQuestionIndex]}
              index={currentQuestionIndex}
              total={questions.length}
              on:openComments={(e) => openComments(e.detail.question)}
              on:openRating={(e) => openRating(e.detail.question)}
            />
          {/if}
        </div>
      </article>

      <!-- Barra de paginación en círculos -->
      <aside class="pagination-sidebar">
        <QuestionPagination
          questions={questions}
          currentIndex={currentQuestionIndex}
          on:navigateToQuestion={(e) => goToQuestion(e.detail.index)}
        />
      </aside>
    </main>
  {/if}

  {#if isLoading}
    <div class="action-overlay">
      <LoadingSpinner />
    </div>
  {/if}

  <!-- Modal de Comentarios -->
  {#if showCommentsModal && questionForComments}
    <CommentsModal
      isOpen={showCommentsModal}
      articleId={articleId}
      question={questionForComments}
      on:close={closeCommentsModal}
      on:comment={handleComment}
      on:like={handleLikeComment}
    />
  {/if}

  <!-- Modal de Calificación -->
  {#if showRatingModal && questionForRating}
    <!-- Podríamos reusar el RatingBar, pero dentro de un modal nuevo -->
    <div class="modal-backdrop" on:click={() => closeRatingModal()}>
      <div 
        class="rating-modal" 
        on:click|stopPropagation
        role="dialog"
        aria-modal="true"
      >
        <h2>Calificar Pregunta {questions.indexOf(questionForRating) + 1}</h2>
        <p>Por favor califica qué tan bien entendiste esta pregunta antes de continuar.</p>

        <!-- Aquí podemos reusar un componente RatingBar o algo similar -->
        <RatingModalContent
          question={questionForRating}
          on:rate={handleRate}
        />

        <button class="close-btn" on:click={() => closeRatingModal()}>Cerrar</button>
      </div>
    </div>
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .article-body {
    padding: 2rem;
  }

  .pagination-sidebar {
    position: static;
    height: 100vh;
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

  @media (max-width: 1024px) {
    .content-wrapper {
      grid-template-columns: 1fr;
    }

    .pagination-sidebar {
      display: none;
    }
    .article-body {
      padding: 1.5rem;
    }
  }

  /* Modal de calificación */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  .rating-modal {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    max-width: 500px;
    width: 90%;
    text-align: center;
    position: relative;
  }
  .close-btn {
    margin-top: 1rem;
    background: #e5e7eb;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
  }
</style>