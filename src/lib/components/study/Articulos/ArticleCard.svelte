<!-- src/lib/components/study/Articulos/ArticleCard.svelte -->
<script>
import { onMount } from 'svelte';
import { sessionStore } from '$lib/stores/sessionStore';
import studyService from '$lib/api/study/studyService';
import { createEventDispatcher } from 'svelte';
import PDFViewer from './PDFViewer.svelte';
import { CheckCircle, BookOpen, Clock } from 'lucide-svelte';

const dispatch = createEventDispatcher();

export let article;

let showPDFViewer = false;
let isLoading = false;
let errorMessage = '';
let buttonStates = {
  isEnrolled: false,
  hasPendingRequest: false,
  hasRejectedRequest: false,
  hasAccess: false,
  isAuthor: false
};

// Estado local para la solicitud de matrícula
let showEnrollmentModal = false;
let enrollmentReason = '';

$: accessToken = $sessionStore.access;
$: isAuthenticated = $sessionStore.isAuthenticated;
$: userId = $sessionStore?.user?.id;


function formatRating(rating) {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return 'N/A';
  }
  return Number(rating).toFixed(1);
}

onMount(async () => {
  if (isAuthenticated) {
    await checkArticleStatus();
  }
});

async function checkArticleStatus() {
  try {
    const [enrollmentResponse, accessResponse] = await Promise.all([
      studyService.checkEnrollmentStatus(article.id, accessToken),
      studyService.checkAccessStatus(article.id, accessToken)
    ]);

    buttonStates = {
      isEnrolled: enrollmentResponse.isEnrolled,
      hasPendingRequest: enrollmentResponse.hasPendingRequest,
      hasRejectedRequest: enrollmentResponse.hasRejectedRequest,
      hasAccess: accessResponse.hasAccess,
      isAuthor: article.autor?.usuario?.id === userId
    };
  } catch (error) {
    console.error('Error checking article status:', error);
    errorMessage = 'Error al verificar el estado del artículo';
  }
}







const showLoginModal = () => {
  dispatch('showLoginModal');
};

const showSubscriptionModal = () => {
  dispatch('showSubscriptionModal');
};

const viewPDF = () => {
  if (!article.archivo_adjunto) {
    dispatch('notification', {
      type: 'error',
      message: 'No hay archivo PDF disponible'
    });
    return;
  }
  showPDFViewer = true;
};














// Funciones de acción
const viewArticle = () => {
  if (!isAuthenticated) {
    if (article.es_publico || article.acceso === 'gratis') {
      window.location.href = `/study/${article.id}`;
    } else {
      dispatch('showLoginModal');
    }
    return;
  }

  if (buttonStates.hasAccess || buttonStates.isAuthor || 
      article.es_publico || article.acceso === 'gratis') {
    window.location.href = `/study/${article.id}`;
  } else if (article.acceso === 'suscripcion') {
    dispatch('showSubscriptionModal');
  } else {
    showEnrollmentModal = true;
  }
};



function getButtonConfig() {
  if (!isAuthenticated) {
    return {
      text: article.es_publico || article.acceso === 'gratis' ? 
        'Ver Solución' : 'Iniciar sesión',
      action: article.es_publico || article.acceso === 'gratis' ? 
        viewArticle : showLoginModal,
      icon: article.es_publico || article.acceso === 'gratis' ? 
        BookOpen : Clock
    };
  }

  if (buttonStates.hasAccess || buttonStates.isAuthor || 
      article.es_publico || article.acceso === 'gratis') {
    return {
      text: 'Ver Solución',
      action: viewArticle,
      icon: BookOpen
    };
  }

  if (buttonStates.hasPendingRequest) {
    return {
      text: 'Solicitud Pendiente',
      action: null,
      icon: Clock
    };
  }

  if (article.acceso === 'suscripcion') {
    return {
      text: 'Suscribirse',
      action: showSubscriptionModal,
      icon: CheckCircle
    };
  }

  return {
    text: 'Solicitar Solución',
    action: () => showEnrollmentModal = true,
    icon: CheckCircle
  };
}


function getAccessLabel() {
  if (article.es_publico) return 'Gratuito';
  switch (article.acceso) {
    case 'gratis': return 'Gratuito';
    case 'pago': return 'De pago';
    case 'suscripcion': return 'Requiere Suscripción';
    default: return '';
  }
}

async function handleEnrollmentSubmit() {
  if (!enrollmentReason.trim()) {
    errorMessage = 'Por favor, ingresa un motivo para la solicitud';
    return;
  }

  isLoading = true;
  try {
    await studyService.requestEnrollment(article.id, enrollmentReason, accessToken);
    buttonStates.hasPendingRequest = true;
    showEnrollmentModal = false;
    dispatch('notification', {
      type: 'success',
      message: 'Solicitud enviada correctamente'
    });
  } catch (error) {
    errorMessage = error.message;
    dispatch('notification', {
      type: 'error',
      message: error.message
    });
  } finally {
    isLoading = false;
  }
}

// Duplicate function removed

// Duplicate functions removed
</script>

<div class="article-card">
  <!-- Etiquetas -->
  <div class="card-tags">
    {#if article.es_destacado}
      <span class="tag featured">
        <i class="fas fa-star"></i>
        Destacado
      </span>
    {/if}
    {#if getAccessLabel()}
      <span class="tag access">
        <i class="fas fa-key"></i>
        {getAccessLabel()}
      </span>
    {/if}
  </div>

  <div class="card-content">
    <!-- Información institucional -->
    {#if article.universidad?.nombre}
      <div class="institution">
        <i class="fas fa-university"></i>
        {article.universidad.nombre}
      </div>
    {/if}

    <h3 class="title">{article.titulo}</h3>
    <p class="description">{article.descripcion || 'Sin descripción'}</p>

    <!-- Detalles académicos -->
    <div class="academic-details">
      {#if article.pregrado?.nombre}
        <span class="detail">
          <i class="fas fa-graduation-cap"></i>
          {article.pregrado.nombre}
        </span>
      {/if}
      {#if article.curso?.nombre}
        <span class="detail">
          <i class="fas fa-book"></i>
          {article.curso.nombre}
        </span>
      {/if}
      {#if article.profesor}
        <span class="detail">
          <i class="fas fa-chalkboard-teacher"></i>
          {article.profesor}
        </span>
      {/if}
    </div>

    <!-- Estadísticas -->
    <div class="stats">
      <span class="stat">
        <i class="fas fa-eye"></i>
        {article.num_vistas || 0} vistas
      </span>
      <span class="stat">
        <i class="fas fa-heart"></i>
        {article.num_favoritos || 0} favoritos
      </span>
      {#if article.calificacion_promedio !== null && article.calificacion_promedio !== undefined}
        <span class="stat">
          <i class="fas fa-star"></i>
          {formatRating(article.calificacion_promedio)}
        </span>
      {/if}
    </div>

    <!-- Acciones -->
    <div class="actions">
      {#if true}
        {@const buttonConfig = getButtonConfig()}
        <button 
          class="primary-button"
          class:disabled={buttonConfig.action === null}
          on:click={() => buttonConfig.action && buttonConfig.action()}
          disabled={buttonConfig.action === null || isLoading}
        >
          <svelte:component this={buttonConfig.icon} size={20} />
          {buttonConfig.text}
        </button>
      {/if}
  
      {#if article.archivo_adjunto}
        <button class="secondary-button" on:click={() => viewPDF()}>
          <i class="fas fa-file-pdf"></i>
          Ver PDF
        </button>
      {/if}
  </div>
  </div>
</div>


<!-- Modal de solicitud de matrícula -->
{#if showEnrollmentModal}
  <div class="modal">
    <div class="modal-content">
      <h2>Solicitar acceso al artículo</h2>
      <p>Por favor, explica por qué deseas acceder a este artículo:</p>
      <textarea
        bind:value={enrollmentReason}
        placeholder="Escribe tu motivo aquí..."
        rows="4"
      ></textarea>
      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}
      <div class="modal-actions">
        <button 
          class="cancel-button"
          on:click={() => showEnrollmentModal = false}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button 
          class="submit-button"
          on:click={handleEnrollmentSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Visor de PDF -->
{#if showPDFViewer}
  <PDFViewer
    url={article.archivo_adjunto}
    title={article.titulo}
    on:close={() => showPDFViewer = false}
  />
{/if}

<style>
/* Estilos base */
.article-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e5e7eb;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

/* Tags */
.card-tags {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag.featured {
  background-color: #fef3c7;
  color: #d97706;
}

.tag.access {
  background-color: #d1fae5;
  color: #059669;
}

/* Content */
.card-content {
  padding: 1.5rem;
}

.institution {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.description {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Academic details */
.academic-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Stats */
.stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Actions */
.actions {
  display: flex;
  gap: 0.75rem;
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.primary-button {
  background-color: #2563eb;
  color: white;
  border: none;
  flex: 1;
}

.primary-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.primary-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.secondary-button:hover {
  background-color: #e5e7eb;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Continuación de los estilos del ArticleCard.svelte */

.modal-content {
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.modal-content textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  resize: vertical;
}

.modal-content textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button,
.submit-button {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.cancel-button {
  background-color: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.cancel-button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.submit-button {
  background-color: #2563eb;
  color: white;
  border: none;
}

.submit-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.submit-button:disabled,
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive styles */
@media (max-width: 640px) {
  .card-content {
    padding: 1rem;
  }

  .actions {
    flex-direction: column;
  }

  .modal-content {
    padding: 1rem;
  }

  .stats {
    flex-wrap: wrap;
  }
}
</style>