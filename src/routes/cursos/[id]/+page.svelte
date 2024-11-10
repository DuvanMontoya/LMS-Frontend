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

  $: {
    accessToken = $sessionStore.access;
  }

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

      if (enrollmentStatus !== "aprobada" && enrollmentStatus !== "inscrito") {
        try {
          const recomendaciones = await getCursosRecomendados(accessToken);
          cursosRecomendados = Array.isArray(recomendaciones) ? recomendaciones : [];
        } catch (err) {
          console.error("Error al obtener recomendaciones:", err);
          cursosRecomendados = [];
        }
      }

      try {
        const temasResponse = await getTemasDelCurso(courseId, accessToken);
        temas = Array.isArray(temasResponse) ? temasResponse.map(tema => ({ ...tema, collapsed: true })) : [];
      } catch (err) {
        console.error("Error al obtener temas del curso:", err);
        temas = [];
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

  $: isEnrollmentButtonDisabled = enrollmentStatus === "pendiente" || enrollmentStatus === "rechazada";

  $: enrollmentButtonAction = (enrollmentStatus === "aprobada" || enrollmentStatus === "inscrito") ? handleStudy : handleEnroll;

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
</svelte:head>

<main class="course-page">
  {#if isLoading}
    <div class="loading-screen" in:fade>
      <div class="loader"></div>
      <p>Cargando curso...</p>
    </div>
  {:else if error}
    <div class="error-message" in:fade>
      <p>{error}</p>
      <button on:click={loadCourseData}>Intentar de nuevo</button>
    </div>
  {:else if curso}
    {#if showNotification}
      <div class="notification" transition:fade>
        <p>{notificationMessage}</p>
      </div>
    {/if}
    <header class="course-header" in:fade>
      <h1 class="course-title">{curso.titulo}</h1>
      <p class="course-subtitle">{@html curso.descripcion_corta}</p>
      <div class="course-meta">
        <span class="meta-item"><i class="fas fa-user"></i> {curso.profesor?.usuario || 'Instructor no especificado'}</span>
        <span class="meta-item"><i class="fas fa-calendar"></i> Última actualización: {new Date(curso.fecha_actualizacion).toLocaleDateString()}</span>
        <span class="meta-item"><i class="fas fa-globe"></i> {curso.idiomas_disponibles?.join(', ') || 'No especificado'}</span>
        <span class="meta-item"><i class="fas fa-signal"></i> Nivel: {curso.dificultad}</span>
      </div>
    </header>

    <div class="course-content">
      <div class="main-content">
        <section class="course-overview" in:slide>
          <div class="overview-stats">
            <div class="stat-item">
              <i class="fas fa-star"></i>
              <span>{curso.calificacion_promedio?.toFixed(1) || 'N/A'}</span>
              <p>Calificación</p>
            </div>
            <div class="stat-item">
              <i class="fas fa-users"></i>
              <span>{curso.inscritos?.length || 0}</span>
              <p>Estudiantes</p>
            </div>
            <div class="stat-item">
              <i class="far fa-clock"></i>
              <span>{curso.duracion_total} días</span>
              <p>Duración</p>
            </div>
            <div class="stat-item">
              <i class="fas fa-certificate"></i>
              <span>{curso.certificado_disponible ? 'Sí' : 'No'}</span>
              <p>Certificado</p>
            </div>
          </div>
        </section>

        <section class="course-description">
          <h2 class="section-title">Descripción del curso</h2>
          <p>{@html curso.descripcion}</p>
        </section>

        <section class="course-curriculum">
          <h2 class="section-title">Contenido del curso</h2>
          <button class="btn btn-toggle-all" on:click={toggleAllTemas}>
            {allTemasCollapsed ? 'Expandir todos los temas' : 'Colapsar todos los temas'}
          </button>
          {#if curso.temas && curso.temas.length > 0}
            <div class="curriculum-list">
              {#each curso.temas as tema, temaIndex}
                <div class="curriculum-section">
                  <h3 class="section-header" on:click={() => toggleTema(temaIndex)}>
                    <span class="section-title">{tema.titulo}</span>
                    <span class="section-meta">
                      <i class="far fa-clock"></i> {tema.tiempo_estimado} min
                      <i class={tema.collapsed ? "fas fa-chevron-down" : "fas fa-chevron-up"}></i>
                    </span>
                  </h3>
                  {#if !tema.collapsed}
                    <ul class="lesson-list" transition:slide|local>
                      {#each tema.lecciones as leccion, leccionIndex}
                        <li class="lesson-item">
                          <span class="lesson-number">{temaIndex + 1}.{leccionIndex + 1}</span>
                          <span class="lesson-title">{leccion.titulo}</span>
                          <span class="lesson-duration">{leccion.tiempo_estimado} min</span>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <p class="no-content">No se encontró contenido para este curso.</p>
          {/if}
        </section>

        <section class="course-requirements">
          <h2 class="section-title">Requisitos técnicos</h2>
          {#if curso.requisitos_tecnicos}
            <ul>
              {#each curso.requisitos_tecnicos.split("\n") as requisito}
                <li>{requisito}</li>
              {/each}
            </ul>
          {:else}
            <p>No se especificaron requisitos técnicos para este curso.</p>
          {/if}
        </section>

        <section class="instructor-info">
          <h2 class="section-title">Acerca del instructor</h2>
          {#if curso.profesor}
            <div class="instructor-profile">
              <img src={curso.profesor.foto_url || '/default-avatar.jpg'} alt={curso.profesor.usuario} class="instructor-avatar">
              <div class="instructor-details">
                <h3>{curso.profesor.usuario}</h3>
                <p class="instructor-title">{curso.profesor.titulo}</p>
                <p class="instructor-bio">{curso.profesor.bio}</p>
                <div class="instructor-stats">
                  <span><i class="fas fa-star"></i> {curso.profesor.promedio_calificacion || 'N/A'} Calificación promedio</span>
                  <span><i class="fas fa-comment"></i> {curso.profesor.num_reseñas} Reseñas</span>
                  <span><i class="fas fa-users"></i> {curso.profesor.num_estudiantes} Estudiantes</span>
                  <span><i class="fas fa-book"></i> {curso.profesor.cursos_creados?.length || 0} Cursos</span>
                </div>
              </div>
            </div>
          {:else}
            <p>Información del instructor no disponible.</p>
          {/if}
        </section>

        <section class="course-reviews">
          <h2 class="section-title">Reseñas de estudiantes</h2>
          <div class="reviews-summary">
            <div class="average-rating">
              <span class="big-rating">{curso.calificacion_promedio?.toFixed(1) || 'N/A'}</span>
              <div class="stars">
                {#each Array(5) as _, i}
                  <i class="fas fa-star" class:filled={i < Math.round(curso.calificacion_promedio || 0)}></i>
                {/each}
              </div>
              <span class="total-reviews">{curso.reseñas?.length || 0} reseñas</span>
            </div>
          </div>
          {#if curso.reseñas && curso.reseñas.length > 0}
            <div class="reviews-list">
              {#each curso.reseñas as reseña}
                <div class="review-item">
                  <div class="review-header">
                    <span class="reviewer-name">{reseña.usuario}</span>
                    <span class="review-date">{new Date(reseña.fecha).toLocaleDateString()}</span>
                  </div>
                  <div class="review-rating">
                    {#each Array(5) as _, i}
                      <i class="fas fa-star" class:filled={i < reseña.calificacion}></i>
                    {/each}
                  </div>
                  <p class="review-comment">{reseña.comentario}</p>
                </div>
              {/each}
            </div>
          {:else}
            <p class="no-reviews">Este curso aún no tiene reseñas.</p>
          {/if}
        </section>
        
        {#if cursosRecomendados.length > 0}
          <section class="course-recommendations">
            <h2 class="section-title">Cursos relacionados</h2>
            <div class="recommendations-grid">
              {#each cursosRecomendados as cursoRecomendado}
                <div class="recommendation-card">
                  <img src={cursoRecomendado.imagen_principal_url || "/default-course-image.jpg"} alt={cursoRecomendado.titulo} class="card-image" />
                  <div class="card-content">
                    <h3>{cursoRecomendado.titulo}</h3>
                    <p>{cursoRecomendado.descripcion_corta}</p>
                    <div class="card-footer">
                      <span class="card-rating">
                        <i class="fas fa-star"></i> {cursoRecomendado.calificacion_promedio.toFixed(1)}
                      </span>
                      <a href="/cursos/{cursoRecomendado.id}" class="btn-secondary">Ver curso</a>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </section>
        {/if}
      </div>

      <aside class="course-sidebar">
        <div class="sidebar-card">
          <div class="course-preview">
            <img
              src={curso.imagen_principal_url || "/default-course-image.jpg"}
              alt={curso.titulo}
              class="preview-image"
            />
          </div>
          <div class="course-price">
            <span class="price">${Math.round(curso.precio || 0)}</span>
            {#if curso.precio_original}
              <span class="original-price">${Math.round(curso.precio_original)}</span>
              <span class="discount">
                {Math.round((1 - (curso.precio || 0) / curso.precio_original) * 100)}% de descuento
              </span>
            {/if}
          </div>
          <div class="course-actions">
            <button 
              class={`btn ${enrollmentButtonClass}`}
              on:click={enrollmentButtonAction}
              disabled={isEnrollmentButtonDisabled}
            >
              <i class={enrollmentStatus === "aprobada" || enrollmentStatus === "inscrito" ? "fas fa-graduation-cap" : "fas fa-sign-in-alt"}></i>
              {enrollmentButtonText}
            </button>
          </div>
          <ul class="course-highlights">
            <li><i class="fas fa-infinity"></i> Acceso de por vida</li>
            <li><i class="fas fa-mobile-alt"></i> Acceso en dispositivos móviles y TV</li>
            <li><i class="fas fa-certificate"></i> Certificado de finalización</li>
            <li><i class="fas fa-file-download"></i> Recursos descargables</li>
            <li><i class="fas fa-comments"></i> Foro de discusión</li>
            <li><i class="fas fa-language"></i> Subtítulos en varios idiomas</li>
          </ul>
        </div>
      </aside>
    </div>
    {:else}
<p class="no-course-info">No se pudo cargar la información del curso.</p>
{/if}
</main>
{#if showRatingModal}
  <div class="modal" transition:fade>
    <div class="modal-content" transition:slide>
      <h2>Califica este curso</h2>
      <Rating bind:rating={userRating} />
      <textarea
        bind:value={userComment}
        placeholder="Deja tu comentario (opcional)"
      ></textarea>
      <div class="modal-actions">
        <button class="btn btn-primary" on:click={handleRating}>Enviar calificación</button>
        <button class="btn btn-secondary" on:click={() => (showRatingModal = false)}>Cancelar</button>
      </div>
    </div>
  </div>
{/if}
<style>
  :global(body) {
    font-family: 'Roboto', sans-serif;
    background-color: #f8f9fa;
    color: #333;
    line-height: 1.6;
  }

  .course-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
  }

  .loader {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .course-header {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem 0;
    border-bottom: 1px solid #e0e0e0;
  }

  .course-title {
    font-family: 'Merriweather', serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .course-subtitle {
    font-size: 1.2rem;
    color: #7f8c8d;
    margin-bottom: 1rem;
  }

  .course-meta {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .meta-item {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    color: #34495e;
  }

  .meta-item i {
    margin-right: 0.5rem;
    color: #3498db;
  }

  .course-content {
    display: flex;
    gap: 2rem;
  }

  .main-content {
    flex: 1;
  }

  .section-title {
    font-family: 'Merriweather', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #3498db;
  }

  .course-overview, .course-description, .course-curriculum, .course-requirements, .instructor-info, .course-reviews, .course-recommendations {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    margin-bottom: 1.5rem;
  }

  .overview-stats {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .stat-item {
    text-align: center;
    flex: 1;
    min-width: 100px;
    padding: 0.8rem;
  }

  .stat-item i {
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
    color: #3498db;
  }

  .stat-item span {
    font-size: 1.2rem;
    font-weight: 600;
    display: block;
    margin-bottom: 0.2rem;
    color: #2c3e50;
  }

  .stat-item p {
    font-size: 0.8rem;
    margin: 0;
    color: #7f8c8d;
  }

  .curriculum-list {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }

  .curriculum-section {
    border-bottom: 1px solid #e0e0e0;
  }

  .curriculum-section:last-child {
    border-bottom: none;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f8f9fa;
    font-weight: 500;
    cursor: pointer;
  }

  .section-meta {
    font-size: 0.9rem;
    color: #7f8c8d;
  }

  .lesson-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .lesson-item {
    display: flex;
    align-items: center;
    padding: 0.8rem 1rem;
    border-top: 1px solid #f0f0f0;
  }

  .lesson-number {
    font-weight: 600;
    margin-right: 1rem;
    color: #3498db;
    min-width: 25px;
  }

  .lesson-title {
    flex: 1;
    font-size: 0.9rem;
  }

  .lesson-duration {
    font-size: 0.8rem;
    color: #7f8c8d;
  }

  .course-requirements ul {
    list-style-type: none;
    padding-left: 0;
  }

  .course-requirements li {
    margin-bottom: 0.5rem;
    padding-left: 1.2rem;
    position: relative;
    font-size: 0.9rem;
  }

  .course-requirements li::before {
    content: "\f00c";
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    position: absolute;
    left: 0;
    color: #3498db;
  }

  .instructor-profile {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .instructor-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #3498db;
  }

  .instructor-details h3 {
    font-family: 'Merriweather', serif;
    font-size: 1.3rem;
    margin-bottom: 0.3rem;
    color: #2c3e50;
  }

  .instructor-title {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin-bottom: 0.5rem;
  }

  .instructor-bio {
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
  }

  .instructor-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .instructor-stats span {
    font-size: 0.8rem;
    color: #34495e;
    display: flex;
    align-items: center;
  }

  .instructor-stats i {
    margin-right: 0.3rem;
    color: #3498db;
  }

  .reviews-summary {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .average-rating {
    text-align: center;
  }

  .big-rating {
    font-size: 3rem;
    font-weight: 700;
    color: #f39c12;
    line-height: 1;
  }

  .stars {
    display: flex;
    justify-content: center;
    margin: 0.5rem 0;
  }

  .stars i {
    font-size: 1.2rem;
    color: #e0e0e0;
    margin: 0 0.1rem;
  }

  .stars i.filled {
    color: #f39c12;
  }

  .total-reviews {
    font-size: 0.9rem;
    color: #7f8c8d;
  }

  .reviews-list {
    margin-top: 1.5rem;
  }

  .review-item {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .reviewer-name {
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9rem;
  }

  .review-date {
    font-size: 0.8rem;
    color: #7f8c8d;
  }

  .review-rating {
    margin-bottom: 0.5rem;
  }

  .review-rating i {
    font-size: 0.9rem;
    color: #e0e0e0;
  }

  .review-rating i.filled {
    color: #f39c12;
  }

  .review-comment {
    font-style: italic;
    color: #34495e;
    font-size: 0.9rem;
  }

  .course-recommendations {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .recommendation-card {
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .card-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  .card-content {
    padding: 1rem;
  }

  .card-content h3 {
    font-size: 1rem;
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
  }

  .card-content p {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin-bottom: 0.8rem;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-rating {
    font-size: 0.9rem;
    font-weight: 600;
    color: #f39c12;
  }

  .course-sidebar {
    width: 300px;
    position: sticky;
    top: 2rem;
    align-self: flex-start;
  }

  .sidebar-card {
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .preview-image {
    width: 100%;
    height: auto;
    display: block;
  }

  .course-price {
    padding: 1rem;
    text-align: center;
    border-bottom: 1px solid #e0e0e0;
  }

  .price {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
  }

  .original-price {
    font-size: 1rem;
    color: #7f8c8d;
    text-decoration: line-through;
    margin-left: 0.5rem;
  }

  .discount {
    display: block;
    font-size: 0.9rem;
    color: #27ae60;
    margin-top: 0.3rem;
  }

  .course-actions {
    padding: 1rem;
  }

  .btn {
    display: inline-block;
    width: 100%;
    padding: 0.8rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
  }

  .btn-primary {
    background-color: #3498db;
    color: white;
  }

  .btn-primary:hover {
    background-color: #2980b9;
  }

  .btn-secondary {
    background-color: #95a5a6;
    color: white;
  } 

.btn-secondary:hover {
background-color: #7f8c8d;
}

.btn-success {
background-color: #2ecc71;
color: white;
}

.btn-success:hover {
background-color: #27ae60;
}

.btn-warning {
background-color: #f39c12;
color: white;
}

.btn-warning:hover {
background-color: #d35400;
}

.btn-danger {
background-color: #e74c3c;
color: white;
}

.btn-danger:hover {
background-color: #c0392b;
}

.course-highlights {
list-style-type: none;
padding: 1rem;
margin: 0;
border-top: 1px solid #e0e0e0;
}

.course-highlights li {
display: flex;
align-items: center;
margin-bottom: 0.8rem;
font-size: 0.9rem;
}

.course-highlights li:last-child {
margin-bottom: 0;
}

.course-highlights i {
margin-right: 0.8rem;
color: #3498db;
font-size: 1rem;
}

.notification {
position: fixed;
bottom: 2rem;
right: 2rem;
background-color: #2ecc71;
color: white;
padding: 0.8rem 1.2rem;
border-radius: 4px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
z-index: 1000;
}

.modal {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0,0,0,0.5);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

.modal-content {
background-color: #ffffff;
padding: 1.5rem;
border-radius: 8px;
width: 90%;
max-width: 400px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.modal-content h2 {
margin-bottom: 1rem;
color: #2c3e50;
font-size: 1.3rem;
}

.modal-content textarea {
width: 100%;
height: 100px;
margin-bottom: 1rem;
padding: 0.5rem;
border: 1px solid #bdc3c7;
border-radius: 4px;
font-family: inherit;
font-size: 0.9rem;
resize: vertical;
}

.modal-actions {
display: flex;
justify-content: flex-end;
gap: 0.8rem;
}

.modal-actions button {
padding: 0.6rem 1rem;
}

.btn-toggle-all {
margin-bottom: 1rem;
font-size: 0.9rem;
padding: 0.5rem 1rem;
background-color: #f8f9fa;
border: 1px solid #e0e0e0;
color: #2c3e50;
border-radius: 4px;
cursor: pointer;
transition: background-color 0.3s ease;
}

.btn-toggle-all:hover {
background-color: #e9ecef;
}

@media (max-width: 1200px) {
.course-page {
padding: 1.5rem;
}

.course-content {
  flex-direction: column;
}

.course-sidebar {
  width: 100%;
  margin-top: 1.5rem;
  position: static;
}

}
@media (max-width: 768px) {
.course-title {
font-size: 2rem;
}

.course-subtitle {
  font-size: 1rem;
}

.course-meta {
  flex-direction: column;
  align-items: center;
}

.meta-item {
  margin: 0.3rem 0;
}

.overview-stats {
  flex-wrap: wrap;
}

.stat-item {
  flex-basis: 50%;
  margin: 0.5rem 0;
}

.instructor-profile {
  flex-direction: column;
  align-items: center;
}

.instructor-avatar {
  margin-bottom: 1rem;
}

.reviews-summary {
  flex-direction: column;
  align-items: center;
}
}
@media (max-width: 480px) {
.course-title {
font-size: 1.8rem;
}

.section-title {
  font-size: 1.3rem;
}

.price {
  font-size: 1.8rem;
}

.original-price {
  font-size: 0.9rem;
}

.modal-content {
  padding: 1rem;
}

}
/* Estilos para mejorar la accesibilidad */
.btn:focus, .section-header:focus, .lesson-item:focus {
outline: 2px solid #3498db;
outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
*, ::before, ::after {
animation-duration: 0.01ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important;
scroll-behavior: auto !important;
}
}
</style>



  