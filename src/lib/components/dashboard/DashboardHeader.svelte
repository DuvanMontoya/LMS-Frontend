<!-- src/components/dashboard/DashboardHeader.svelte -->
<script>
    export let userData;
    export let cursos;
    export let evaluaciones;
    export let articulos;
  
    $: completedCourses = cursos.filter(c => c.completado).length;
    $: completedEvaluations = evaluaciones.filter(e => e.completada).length;
    $: readArticles = articulos.filter(a => a.leido).length;
    $: totalLessons = cursos.reduce((total, curso) => total + curso.total_lecciones, 0);
    $: completedLessons = cursos.reduce((total, curso) => total + curso.lecciones_completadas, 0);
  </script>
  
  <header class="dashboard-header">
    <div class="user-info">
      <img src={userData?.avatar || '/default-avatar.png'} alt="User Avatar" class="user-avatar">
      <div class="user-details">
        <h1>Bienvenido, {userData?.nombre || 'Estudiante'}</h1>
        <p>{userData?.rol || 'Aprendiz de Matemáticas'}</p>
      </div>
    </div>
    
    <div class="quick-stats">
      <div class="stat">
        <i class="fas fa-graduation-cap"></i>
        <span class="stat-value">{completedCourses}/{cursos.length}</span>
        <span class="stat-label">Cursos Completados</span>
      </div>
      <div class="stat">
        <i class="fas fa-tasks"></i>
        <span class="stat-value">{completedEvaluations}/{evaluaciones.length}</span>
        <span class="stat-label">Evaluaciones Realizadas</span>
      </div>
      <div class="stat">
        <i class="fas fa-book-reader"></i>
        <span class="stat-value">{readArticles}/{articulos.length}</span>
        <span class="stat-label">Artículos Leídos</span>
      </div>
      <div class="stat">
        <i class="fas fa-chalkboard-teacher"></i>
        <span class="stat-value">{completedLessons}/{totalLessons}</span>
        <span class="stat-label">Lecciones Completadas</span>
      </div>
    </div>
  </header>
  
  <style>
    .dashboard-header {
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      border-radius: 15px;
      padding: 2rem;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
  
    .user-info {
      display: flex;
      align-items: center;
    }
  
    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid white;
      margin-right: 1.5rem;
    }
  
    .user-details h1 {
      font-size: 2rem;
      margin: 0;
    }
  
    .user-details p {
      font-size: 1rem;
      opacity: 0.8;
      margin: 0.5rem 0 0;
    }
  
    .quick-stats {
      display: flex;
      gap: 2rem;
    }
  
    .stat {
      text-align: center;
    }
  
    .stat i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
  
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
    }
  
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  
    @media (max-width: 1024px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }
  
      .quick-stats {
        margin-top: 1.5rem;
        width: 100%;
        justify-content: space-between;
      }
    }
  
    @media (max-width: 768px) {
      .quick-stats {
        flex-wrap: wrap;
      }
  
      .stat {
        flex-basis: 50%;
        margin-bottom: 1rem;
      }
    }
  </style>