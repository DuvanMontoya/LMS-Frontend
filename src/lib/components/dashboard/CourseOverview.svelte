<!-- src/components/dashboard/CourseOverview.svelte -->
<script>
    export let cursos = [];
  
    $: activeCourses = cursos.filter(c => !c.completado).slice(0, 3);
  </script>
  
  <section class="course-overview">
    <h2>Resumen de Cursos</h2>
    {#if activeCourses.length === 0}
      <p class="no-courses">No tienes cursos activos actualmente.</p>
    {:else}
      <div class="course-list">
        {#each activeCourses as curso}
          <div class="course-item">
            <img src={curso.imagen_principal_url} alt={curso.titulo} class="course-image">
            <div class="course-info">
              <h3>{curso.titulo}</h3>
              <div class="progress-bar">
                <div class="progress" style="width: {(curso.lecciones_completadas / curso.total_lecciones) * 100}%"></div>
              </div>
              <div class="course-stats">
                <span>{curso.lecciones_completadas}/{curso.total_lecciones} lecciones</span>
                <span>{((curso.lecciones_completadas / curso.total_lecciones) * 100).toFixed(1)}% completado</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    <a href="/cursos" class="view-all-courses">Ver todos los cursos</a>
  </section>
  
  <style>
    .course-overview {
      background-color: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }
  
    h2 {
      font-size: 1.5rem;
      color: #333;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
  
    .no-courses {
      color: #666;
      font-style: italic;
    }
  
    .course-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  
    .course-item {
      display: flex;
      align-items: center;
      background-color: #f8f9fa;
      border-radius: 10px;
      overflow: hidden;
    }
  
    .course-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
    }
  
    .course-info {
      flex-grow: 1;
      padding: 1rem;
    }
  
    h3 {
    font-size: 1.2rem;
    margin: 0 0 0.5rem;
    color: #333;
  }

  .progress-bar {
    height: 6px;
    background-color: #e0e0e0;
    border-radius: 3px;
    margin-bottom: 0.5rem;
  }

  .progress {
    height: 100%;
    background-color: #4CAF50;
    border-radius: 3px;
  }

  .course-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #666;
  }

  .view-all-courses {
    display: block;
    text-align: center;
    margin-top: 1.5rem;
    color: #2196F3;
    text-decoration: none;
    font-weight: 500;
  }

  .view-all-courses:hover {
    text-decoration: underline;
  }
</style>