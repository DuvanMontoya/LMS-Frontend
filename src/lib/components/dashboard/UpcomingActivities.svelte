<!-- src/components/dashboard/UpcomingActivities.svelte -->
<script>
    export let evaluaciones = [];
    export let tareas = [];
  
    $: upcomingEvaluations = evaluaciones
      .filter(e => !e.completada)
      .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite))
      .slice(0, 3);
  
    $: upcomingTasks = tareas
      .filter(t => !t.completada)
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
      .slice(0, 3);
  
    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  </script>
  
  <section class="upcoming-activities">
    <h2>Actividades Próximas</h2>
    
    <div class="activities-list">
      <h3>Evaluaciones</h3>
      {#if upcomingEvaluations.length === 0}
        <p class="no-activities">No tienes evaluaciones próximas.</p>
      {:else}
        {#each upcomingEvaluations as evaluacion}
          <div class="activity-item">
            <i class="fas fa-clipboard-check"></i>
            <div class="activity-info">
              <h4>{evaluacion.titulo}</h4>
              <p>Fecha límite: {formatDate(evaluacion.fecha_limite)}</p>
            </div>
          </div>
        {/each}
      {/if}
      
      <h3>Tareas</h3>
      {#if upcomingTasks.length === 0}
        <p class="no-activities">No tienes tareas pendientes.</p>
      {:else}
        {#each upcomingTasks as tarea}
          <div class="activity-item">
            <i class="fas fa-tasks"></i>
            <div class="activity-info">
              <h4>{tarea.titulo}</h4>
              <p>Fecha de vencimiento: {formatDate(tarea.fecha_vencimiento)}</p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
    
    <a href="/calendario" class="view-calendar">Ver calendario completo</a>
  </section>
  
  <style>
    .upcoming-activities {
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
  
    h3 {
      font-size: 1.2rem;
      color: #555;
      margin: 1rem 0;
    }
  
    .no-activities {
      color: #666;
      font-style: italic;
    }
  
    .activity-item {
      display: flex;
      align-items: center;
      background-color: #f8f9fa;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
  
    .activity-item i {
      font-size: 1.5rem;
      color: #2196F3;
      margin-right: 1rem;
    }
  
    .activity-info h4 {
      font-size: 1rem;
      margin: 0 0 0.25rem;
      color: #333;
    }
  
    .activity-info p {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }
  
    .view-calendar {
      display: block;
      text-align: center;
      margin-top: 1.5rem;
      color: #2196F3;
      text-decoration: none;
      font-weight: 500;
    }
  
    .view-calendar:hover {
      text-decoration: underline;
    }
  </style>