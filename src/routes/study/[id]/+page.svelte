<!-- src/lib/pages/StudyPage.svelte -->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { sessionStore } from '$lib/stores/sessionStore';
  import studyService, { studyStore } from '$lib/api/study/studyService';
  
  import TableOfContents from '$lib/components/study/TableOfContents.svelte';
  import CommentsModal from '$lib/components/study/CommentsModal.svelte';
  
  import ArticleHeader from '$lib/components/study/ArticleHeader.svelte';
  import QuestionCard from '$lib/components/study/QuestionCard.svelte';
  import LoadingState from '$lib/components/study/LoadingState.svelte';
  import ErrorBanner from '$lib/components/study/ErrorBanner.svelte';
  import LoadingSpinner from '$lib/components/study/LoadingSpinner.svelte';
  
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
  
  // Corregido: Recibir el evento y extraer el question
  function openComments(event) {
    const question = event.detail.question;
    if (!question) {
      console.error('No se proporcionó la pregunta en el evento openComments.');
      return;
    }

    // Asegurar que tengamos los comentarios actualizados
    const updatedQuestion = $studyStore.questions.find(q => q.id === question.id);
    if (!updatedQuestion) {
      console.error(`No se encontró la pregunta con id: ${question.id}`);
      return;
    }

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
    <LoadingState message="Cargando artículo..." />
  {:else if error}
    <ErrorBanner errorMessage={error} on:dismiss={dismissError} />
  {:else}
    <main class="content-wrapper">
      <article class="article-content">
        <ArticleHeader 
          title={article?.titulo} 
          description={article?.descripcion} 
          progress={progress} 
          progressPercentage={progress}
        />

        <div class="article-body">
          {@html article?.contenido}

          <div class="questions-section">
            {#each questions as question, idx (question.id)}
              <QuestionCard
                question={question}
                index={idx}
                isLoading={isLoading}
                on:openComments={openComments}
                on:rate={handleRate}
              />
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
      <LoadingSpinner />
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

  .article-body {
    padding: 2rem;
  }

  .questions-section {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
    -ms-overflow-style: none; /* IE y Edge */
  }

  .toc-wrapper::-webkit-scrollbar {
    display: none; /* Chrome, Safari y Opera */
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
    .article-body {
      padding: 1.5rem;
    }
  }

  @media (max-width: 640px) {
    .content-wrapper {
      padding: 1rem;
    } 
    .article-body {
      padding: 1.25rem;
    }
    
  }
</style>