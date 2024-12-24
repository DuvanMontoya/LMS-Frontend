<!-- src/routes/cursos/[id]/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { sessionStore } from "$lib/stores/sessionStore";
  import {
    getCourseDetails,
    requestEnrollment,
    getEnrollmentStatus,
    calificarCurso,
    getCursosRecomendados,
    getTemasDelCurso
  } from "$lib/api/cursos/cursos";
  import Rating from "$lib/components/curso/Rating.svelte";
  import { fade, slide } from "svelte/transition";
  import { goto } from "$app/navigation";

  // Componentes Reutilizables
  import CourseHeader from "$lib/components/curso/CourseHeader.svelte";
  import CourseOverview from "$lib/components/curso/CourseOverview.svelte";
  import CourseDescription from "$lib/components/curso/CourseDescription.svelte";
  import CourseCurriculum from "$lib/components/curso/CourseCurriculum.svelte";
  import InstructorInfo from "$lib/components/curso/InstructorInfo.svelte";
  import CourseReviews from "$lib/components/curso/CourseReviews.svelte";
  import CourseRecommendations from "$lib/components/curso/CourseRecommendations.svelte";
  import CourseSidebar from "$lib/components/curso/CourseSidebar.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import Loader from "$lib/components/ui/Loader.svelte";

  export let data;
  const { courseId } = data;

  let curso = null;
  let enrollmentStatus = "";
  let isLoading = true;
  let accessToken = "";
  let showNotification = false;
  let notificationMessage = "";
  let showRatingModal = false;
  let userRating = 0;
  let userComment = "";
  let cursosRecomendados = [];
  let temas = [];
  let error = null;
  let allTemasCollapsed = true;

  $: accessToken = $sessionStore.access;

  async function loadCourseData() {
    if (!accessToken) {
      error = "No se ha proporcionado un token de acceso. Por favor, inicia sesión.";
      isLoading = false;
      return;
    }
    try {
      const [courseResponse, enrollmentStatusResponse] = await Promise.all([
        getCourseDetails(courseId, accessToken),
        getEnrollmentStatus(courseId, accessToken)
      ]);

      curso = courseResponse || {};
      enrollmentStatus = enrollmentStatusResponse?.status || "";

      // Obtener temas del curso
      try {
        const temasResponse = await getTemasDelCurso(courseId, accessToken);
        temas = Array.isArray(temasResponse)
          ? temasResponse.map(tema => ({ ...tema, collapsed: true }))
          : [];
      } catch (err) {
        console.error("Error al obtener temas del curso:", err);
        temas = [];
      }

      // Obtener recomendaciones si no está inscrito
      if (!["aprobada", "inscrito"].includes(enrollmentStatus)) {
        try {
          const recomendaciones = await getCursosRecomendados(accessToken);
          cursosRecomendados = Array.isArray(recomendaciones) ? recomendaciones : [];
        } catch (err) {
          console.error("Error al obtener recomendaciones:", err);
          cursosRecomendados = [];
        }
      }

    } catch (err) {
      console.error("Error fetching course details:", err);
      error = "Hubo un problema al cargar los datos del curso. Por favor, intenta de nuevo más tarde.";
    } finally {
      isLoading = false;
    }
  }

  onMount(loadCourseData);

  async function handleEnroll() {
    try {
      const response = await requestEnrollment(courseId, accessToken);
      enrollmentStatus = response?.status || "";
      notificationMessage = response?.message || "Solicitud de inscripción procesada.";
      showNotification = true;
      await loadCourseData();
    } catch (err) {
      console.error("Error enrolling in course:", err);
      error = "Hubo un problema al solicitar la inscripción. Por favor, intenta de nuevo más tarde.";
    }
  }

  async function handleRating() {
    try {
      await calificarCurso(courseId, userRating, userComment, accessToken);
      showRatingModal = false;
      notificationMessage = "¡Gracias por tu calificación!";
      showNotification = true;
      await loadCourseData();
    } catch (error) {
      console.error("Error al calificar el curso:", error);
      notificationMessage = "No se pudo enviar la calificación. Por favor, intenta de nuevo más tarde.";
      showNotification = true;
    }
  }

  function handleStudy() {
    goto(`/cursos/${courseId}/estudio`);
  }

  function toggleAllTemas() {
    allTemasCollapsed = !allTemasCollapsed;
    temas = temas.map(tema => ({ ...tema, collapsed: allTemasCollapsed }));
  }

  function toggleTema(index) {
    if (index >= 0 && index < temas.length) {
      temas[index].collapsed = !temas[index].collapsed;
      temas = [...temas];
    }
  }

  $: enrollmentButtonText = (() => {
    switch(enrollmentStatus) {
      case "aprobada":
      case "inscrito":
        return "Ir a estudiar";
      case "pendiente":
        return "Solicitud enviada";
      case "rechazada":
        return "Solicitud rechazada";
      default:
        return "Solicitar acceso";
    }
  })();

  $: isEnrollmentButtonDisabled = ["pendiente", "rechazada"].includes(enrollmentStatus);

  $: enrollmentButtonAction = (["aprobada", "inscrito"].includes(enrollmentStatus)) ? handleStudy : handleEnroll;

  $: enrollmentButtonClass = (() => {
    switch(enrollmentStatus) {
      case "aprobada":
      case "inscrito":
        return "btn-success";
      case "pendiente":
        return "btn-warning";
      case "rechazada":
        return "btn-danger";
      default:
        return "btn-primary";
    }
  })();
</script>

<svelte:head>
  <title>{curso?.titulo || "Curso"} | Sistema de Evaluaciones</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">
  <!-- Font Awesome CDN -->
  <link 
    rel="stylesheet" 
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" 
    integrity="sha512-dyR1gPqPHyl6cYGnEosCeUwVHjQ5w16tYvKQFv8HZ6kbUbLqHjCwZ8bkCi2dtA0fX5FXn8Lh/Q5hg8uZQ3o4Hw==" 
    crossorigin="anonymous" 
    referrerpolicy="no-referrer" 
  />
</svelte:head>

<main class="course-page">
  {#if isLoading}
    <Loader message="Cargando curso..." />
  {:else if error}
    <div class="error-message" in:fade>
      <p>{error}</p>
      <button class="btn btn-secondary" on:click={loadCourseData}>Intentar de nuevo</button>
    </div>
  {:else if curso}
    {#if showNotification}
      <Notification message={notificationMessage} type={["error"].includes(error) ? "error" : "success"} on:close={() => showNotification = false} />
    {/if}
    <CourseHeader curso={curso} />

    <div class="course-content">
      <div class="main-content">
        <CourseOverview curso={curso} />
        <CourseDescription descripcion={curso.descripcion} />
        <CourseCurriculum
          temas={temas}
          toggleTema={toggleTema}
          toggleAllTemas={toggleAllTemas}
          allTemasCollapsed={allTemasCollapsed}
        />
        <InstructorInfo profesor={curso.profesor} />
        <CourseReviews 
          reseñas={curso.reseñas} 
          calificacionPromedio={curso.calificacion_promedio} 
        />
        
        {#if cursosRecomendados.length > 0}
          <CourseRecommendations cursosRecomendados={cursosRecomendados} />
        {/if}
      </div>

      <CourseSidebar
        curso={curso}
        enrollmentButtonText={enrollmentButtonText}
        enrollmentButtonClass={enrollmentButtonClass}
        enrollmentButtonAction={enrollmentButtonAction}
        isEnrollmentButtonDisabled={isEnrollmentButtonDisabled}
        onShowRating={() => showRatingModal = true}
        enrollmentStatus={enrollmentStatus}
      />
    </div>
  {:else}
    <p class="no-course-info">No se pudo cargar la información del curso.</p>
  {/if}

  {#if showRatingModal}
    <Modal on:close={() => showRatingModal = false}>
      <h2>Califica este curso</h2>
      <Rating bind:rating={userRating} />
      <textarea
        bind:value={userComment}
        placeholder="Deja tu comentario (opcional)"
        aria-label="Comentario de calificación"
        class="rating-textarea"
      ></textarea>
      <div class="modal-actions">
        <button class="btn btn-primary" on:click={handleRating} disabled={userRating === 0}>Enviar calificación</button>
        <button class="btn btn-secondary" on:click={() => showRatingModal = false}>Cancelar</button>
      </div>
    </Modal>
  {/if}
</main>

<style>
  :global(body) {
    font-family: 'Roboto', sans-serif;
    background-color: #ecf0f1;
    color: #2c3e50;
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }

  .course-page {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    background-color: #fdecea;
    color: #e74c3c;
    border: 1px solid #f5c6cb;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.1);
    animation: fadeIn 0.5s ease-in-out;
  }

  .error-message p {
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    text-align: center;
  }

  .error-message button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background-color: #95a5a6;
    color: white;
    transition: background-color 0.3s ease;
  }

  .error-message button:hover {
    background-color: #7f8c8d;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Responsive Layout */
  .course-content {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* Media Queries */
  @media (max-width: 1200px) {
    .course-page {
      padding: 1.5rem;
    }

    .course-content {
      flex-direction: column;
    }

    .course-sidebar {
      width: 100%;
      margin-top: 2rem;
      position: static;
    }
  }

  /* Accesibilidad */
  .btn:focus, .section-header:focus, .lesson-item:focus, textarea:focus {
    outline: 3px solid #3498db;
    outline-offset: 2px;
  }

  /* Estilos adicionales para textarea en el modal */
  .rating-textarea {
    width: 100%;
    height: 100px;
    padding: 0.8rem;
    border: 2px solid #bdc3c7;
    border-radius: 8px;
    font-size: 1rem;
    resize: vertical;
    margin-bottom: 1rem;
    transition: border-color 0.3s ease;
  }

  .rating-textarea:focus {
    border-color: #3498db;
    outline: none;
  }

  /* Modal actions */
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  /* No course info */
  .no-course-info {
    text-align: center;
    color: #7f8c8d;
    font-size: 1.2rem;
  }
</style>