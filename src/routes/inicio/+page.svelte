<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { sessionStore } from "$lib/stores/sessionStore";
  import { toast } from "@zerodevx/svelte-toast";
  import { derived, get } from 'svelte/store';
  import { writable } from 'svelte/store';

  import Calendar from "$lib/components/extras/Calendar.svelte";
  import CursoCard from "$lib/components/curso/CursoCard.svelte";
  import { getPerfil } from "$lib/api/usuarios/usuarios";
  import {
    getCourses,
    getLeccionesCompletadas,
    getTemasCompletados,
    getLeccionesPendientes,
    getTareasUsuario,
  } from "$lib/api/cursos/cursos";
  import { getArticulosMatriculados } from "$lib/api/articulos/articulos";
  import { format } from 'date-fns';
  import { es } from 'date-fns/locale';

  let usuario = {
    nombre: "Aprendiz",
    apellido: "Matemático",
    rol: "Estudiante",
  };
  // let cursos = [];
  let articulosMatriculados = [];
  let leccionesCompletadas = 0;
  let totalLecciones = 0;
  let temasCompletados = 0;
  let totalTemas = 0;
  let proximasLecciones = [];
  let tareasPendientes = [];
  let calendarEvents = [];
  let loading = true;
  let error = null;
  let cursos = writable([]);

  

  const session = derived(sessionStore, $sessionStore => $sessionStore || {});

  $: progresoTotal = Array.isArray(cursos) ? derived(writable(cursos), $cursos => calcularProgresoTotal($cursos)) : writable(0);

  onMount(async () => {
    if (browser) {
      try {
        await loadData();
      } catch (err) {
        console.error("Error al cargar los datos:", err);
        error = "Error al cargar los datos. Por favor, intente nuevamente.";
        toast.push(error, {
          theme: {
            "--toastBackground": "#F56565",
            "--toastBarBackground": "#C53030",
          },
        });
      } finally {
        loading = false;
      }
    }
  });

  async function loadData() {
  const sessionData = get(session);
  const { access, user } = sessionData;
  
  if (!access) {
    error = "Sesión no válida. Por favor, inicie sesión nuevamente.";
    toast.push(error, {
      theme: {
        "--toastBackground": "#F56565",
        "--toastBarBackground": "#C53030",
      },
    });
    goto('/login');
    return;
  }

  try {
    const [
      userProfile,
      coursesData,
      enrolledArticles,
      completedLessons,
      completedTopics,
      pendingLessons,
      userTasks,
    ] = await Promise.all([
      getPerfil(access),
      getCourses(access),
      getArticulosMatriculados(user.id, access),
      getLeccionesCompletadas(user.id, access),
      getTemasCompletados(user.id, access),
      getLeccionesPendientes(user.id, access),
      getTareasUsuario(user.id, access),
    ]);

    usuario = userProfile || usuario;
    cursos = coursesData?.results || [];
    articulosMatriculados = enrolledArticles || [];
    leccionesCompletadas = completedLessons?.length || 0;
    temasCompletados = completedTopics?.results?.length || 0;
    proximasLecciones = Array.isArray(pendingLessons?.results) ? pendingLessons.results.slice(0, 5) : [];
    tareasPendientes = Array.isArray(userTasks) ? userTasks.slice(0, 5) : [];

    totalLecciones = cursos.reduce(
      (acc, curso) => acc + (curso.lecciones?.length || 0),
      0
    );
    totalTemas = cursos.reduce(
      (acc, curso) => acc + (curso.temas?.length || 0),
      0
    );

    calendarEvents = generateCalendarEvents();
  } catch (err) {
    console.error("Error en loadData:", err);
    if (err.message === "No access token provided") {
      error = "Error de autenticación. Por favor, inicie sesión nuevamente.";
      toast.push(error, {
        theme: {
          "--toastBackground": "#F56565",
          "--toastBarBackground": "#C53030",
        },
      });
      goto('/login');
    } else {
      throw err;
    }
  }
}

  function calcularProgreso(completado, total) {
    return total > 0 ? (completado / total) * 100 : 0;
  }

  function calcularProgresoTotal(cursos) {
    return cursos.length
      ? cursos.reduce((acc, curso) => acc + (curso.progreso_promedio || 0), 0) /
          cursos.length
      : 0;
  }

  function formatearFecha(fecha) {
    return format(new Date(fecha), 'dd MMMM yyyy, HH:mm', { locale: es });
  }

  function generateCalendarEvents() {
    return [
      ...cursos.flatMap((curso) => [
        {
          title: `Inicio: ${curso.titulo}`,
          start: curso.fecha_inicio,
          color: "#4CAF50",
        },
        {
          title: `Fin: ${curso.titulo}`,
          start: curso.fecha_fin,
          color: "#F44336",
        },
      ]),
    ];
  }

  function irAClasesSincronicas() {
    window.open("https://meet.google.com/bov-pksq-igp", "_blank");
  }

  function irAGrabacionesClases() {
    window.open(
      "https://drive.google.com/drive/folders/1FT7uiFt26p3xhZAioGrISb3szv0pgu2O?usp=sharing",
      "_blank"
    );
  }
</script>

<svelte:head>
  <title>Dashboard de Aprendizaje</title>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta
    name="apple-mobile-web-app-status-bar-style"
    content="black-translucent"
  />
  <link rel="apple-touch-icon" href="/path/to/icon.png" />
  <link rel="manifest" href="/manifest.json" />
</svelte:head>

<main class="dashboard">
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando tu experiencia de aprendizaje...</p>
    </div>
  {:else if error}
    <div class="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{error}</p>
    </div>
  {:else}
    <header class="dashboard-header">
      <div class="user-greeting">
        <h1>{usuario.nombre} {usuario.apellido}</h1>
        <p>{usuario.profesion}</p>
      </div>
      <div class="quick-stats">
        <div class="stat">
          <i class="fas fa-book-open"></i>
          <span>{cursos.length} Cursos</span>
        </div>
        <div class="stat">
          <i class="fas fa-tasks"></i>
          <span>{temasCompletados}/{totalTemas} Temas</span>
        </div>
        <div class="stat">
          <i class="fas fa-clipboard-check"></i>
          <span>{leccionesCompletadas}/{totalLecciones} Lecciones</span>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <section id="resumen" class="dashboard-section progress-overview">
        <h2>Resumen de Progreso</h2>
        <div class="progress-cards">
          <div class="progress-card">
            <div class="progress-circle" style="--progress: {$progresoTotal}%">
              <span class="progress-percentage">{Math.round($progresoTotal)}%</span>
            </div>
            <h3>Progreso Total</h3>
          </div>
          <div class="progress-card">
            <div class="progress-circle" style="--progress: {calcularProgreso(temasCompletados, totalTemas)}%">
              <span class="progress-percentage">{Math.round(calcularProgreso(temasCompletados, totalTemas))}%</span>
            </div>
            <h3>Temas Completados</h3>
          </div>
          <div class="progress-card">
            <div class="progress-circle" style="--progress: {calcularProgreso(leccionesCompletadas, totalLecciones)}%">
              <span class="progress-percentage">{Math.round(calcularProgreso(leccionesCompletadas, totalLecciones))}%</span>
            </div>
            <h3>Lecciones Completadas</h3>
          </div>
        </div>
      </section>

      <section id="acciones-rapidas" class="dashboard-section quick-actions">
        <h2>Acciones Rápidas</h2>
        <div class="action-buttons">
          <button class="btn-action" on:click={irAClasesSincronicas}>
            <i class="fas fa-video"></i>
            Ir a Clases en Vivo
          </button>
          <button class="btn-action" on:click={irAGrabacionesClases}>
            <i class="fas fa-play-circle"></i>
            Ver Grabaciones de Clases
          </button>
          <button class="btn-action" on:click={() => goto("/cursos")}>
            <i class="fas fa-book"></i>
            Mis Cursos
          </button>
        </div>
      </section>

      <section id="cursos" class="dashboard-section my-courses">
        <h2>Mis Cursos</h2>
        {#if cursos.length > 0}
          <div class="courses-grid">
            {#each cursos as curso (curso.id)}
              <CursoCard {curso} />
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <i class="fas fa-graduation-cap"></i>
            <p>
              Aún no te has matriculado en ningún curso. ¡Explora nuestro catálogo
              y comienza tu viaje de aprendizaje!
            </p>
            <a href="/cursos" class="btn-primary">Explorar Cursos</a>
          </div>
        {/if}
      </section>

      <section id="proximas-actividades" class="dashboard-section upcoming-activities">
        <h2>Próximas Actividades</h2>
        <div class="activities-grid">
          <div class="activity-card">
            <h3><i class="fas fa-clock"></i> Lecciones Pendientes</h3>
            {#if proximasLecciones.length > 0}
              <ul>
                {#each proximasLecciones as leccion (leccion.id)}
                  <li>
                    <span class="activity-title">{leccion.titulo}</span>
                    <span class="activity-date">{formatearFecha(leccion.fecha)}</span>
                  </li>
                {/each}
              </ul>
            {:else}
              <p class="empty-message">
                <i class="fas fa-check-circle"></i> No tienes lecciones pendientes en este momento.
              </p>
            {/if}
          </div>
          <div class="activity-card">
            <h3><i class="fas fa-tasks"></i> Tareas Pendientes</h3>
            {#if tareasPendientes.length > 0}
              <ul>
                {#each tareasPendientes as tarea (tarea.id)}
                  <li>
                    <span class="activity-title">{tarea.titulo}</span>
                    <span class="activity-date">Fecha límite: {formatearFecha(tarea.fecha_limite)}</span>
                  </li>
                {/each}
              </ul>
            {:else}
              <p class="empty-message">
                <i class="fas fa-check-circle"></i> No tienes tareas pendientes en este momento.
              </p>
            {/if}
          </div>
        </div>
      </section>

      <section id="calendario" class="dashboard-section calendar-section">
        <h2>Calendario de Aprendizaje</h2>
        <Calendar events={calendarEvents} />
      </section>
    </div>
  {/if}
</main>

<style>
  /* :root { */
    /* --primary-color: #2c3e50; */
    /* --secondary-color: #3498db; */
    /* --accent-color: #e74c3c; */
    /* --background-color: #ecf0f1; */
    /* --text-color: #34495e; */
    /* --card-background: #ffffff; */
    /* --border-color: #bdc3c7; */
    /* --success-color: #2ecc71;
    --warning-color: #f39c12;
    --info-color: #3498db; */
  /* } */

  /* :global(body) {
    font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    margin: 0;
    padding: 0;
    line-height: 1.6;
  } */

  .dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
    color: var(--primary-color);
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: var(--secondary-color);
    animation: spin 1s ease infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .dashboard-header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .user-greeting h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 300;
  }

  .user-greeting p {
    margin: 0.5rem 0 0;
    font-size: 1rem;
    opacity: 0.8;
  }

  .quick-stats {
    display: flex;
    gap: 2rem;
  }

  .stat {
    display: flex;
    align-items: center;
    font-size: 1rem;
  }

  .stat i {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }

  .dashboard-section {
    background: var(--card-background);
    border-radius: 10px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .dashboard-section:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: var(--primary-color);
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    font-weight: 300;
    border-bottom: 2px solid var(--accent-color);
    padding-bottom: 0.5rem;
  }

  .progress-overview .progress-cards {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
  }

  .progress-card {
    flex: 1;
    text-align: center;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .progress-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: conic-gradient(var(--secondary-color) var(--progress), #e0e0e0 0deg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    position: relative;
  }

  .progress-circle::before {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    background: white;
    border-radius: 50%;
  }

  .progress-percentage {
    position: relative;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
  }

  .progress-card h3 {
    font-size: 1.2rem;
    color: var(--text-color);
    margin: 0;
  }

  .quick-actions .action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn-action {
    flex: 1;
    min-width: 200px;
    background-color: var(--secondary-color);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn-action:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  .btn-action i {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }

  .my-courses .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    background: #f9fafc;
    border-radius: 10px;
    border: 2px dashed #d1d9e6;
  }

  .empty-state i {
    font-size: 3rem;
    color: var(--secondary-color);
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: var(--text-color);
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .btn-primary {
    background-color: var(--secondary-color);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.3s ease, transform 0.3s ease;
    display: inline-block;
  }

  .btn-primary:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
  }

  .upcoming-activities .activities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .activity-card {
    background: var(--card-background);
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .activity-card h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
  }

  .activity-card h3 i {
    margin-right: 0.5rem;
    color: var(--secondary-color);
  }

  .activity-card ul {
    list-style-type: none;
    padding: 0;
  }

  .activity-card li {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    font-size: 0.95rem;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
  }

  .activity-title {
    font-weight: 500;
    color: var(--primary-color);
  }

  .activity-date {
    font-size: 0.85rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }

  .empty-message {
    color: #6c757d;
    font-style: italic;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .empty-message i {
    margin-right: 0.5rem;
    color: var(--success-color);
  }

  .calendar-section {
    padding: 0;
    overflow: hidden;
    border-radius: 10px;
  }

  @media (max-width: 1024px) {
    .dashboard-header {
      flex-direction: column;
      text-align: center;
    }

    .quick-stats {
      margin-top: 1rem;
    }

    .progress-overview .progress-cards {
      flex-direction: column;
    }
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 1rem;
    }

    .dashboard-header {
      padding: 1.5rem;
    }

    .user-greeting h1 {
      font-size: 1.5rem;
    }

    .stat {
      font-size: 0.9rem;
    }

    .dashboard-section {
      padding: 1.5rem;
    }

    .progress-circle {
      width: 100px;
      height: 100px;
    }

    .progress-circle::before {
      width: 80px;
      height: 80px;
    }

    .progress-percentage {
      font-size: 1.2rem;
    }

    .btn-action {
      min-width: 100%;
    }
  }

  @media (max-width: 480px) {
    .dashboard-header {
      padding: 1rem;
    }

    .user-greeting h1 {
      font-size: 1.2rem;
    }

    .quick-stats {
      flex-direction: column;
      gap: 1rem;
    }

    .stat {
      justify-content: center;
    }

    .progress-card {
      padding: 1rem;
    }

    .progress-circle {
      width: 80px;
      height: 80px;
    }

    .progress-circle::before {
      width: 60px;
      height: 60px;
    }

    .progress-percentage {
      font-size: 1rem;
    }

    .activity-card li {
      padding: 0.75rem;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dashboard-section {
    animation: fadeIn 0.5s ease-out;
  }
</style>