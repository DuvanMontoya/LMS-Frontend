<script>
   import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getCourseDetails, checkEnrollment, marcarLeccionCompletada, getLeccionesCompletadas } from '$lib/api/cursos/cursos';
  import { sessionStore } from '$lib/stores/sessionStore';
  import { fade, fly } from 'svelte/transition';
  import TemaPanel from '$lib/components/curso/TemaPanel.svelte';
  import LeccionViewer from '$lib/components/curso/LeccionViewer.svelte';
  // import CursoNav from '$lib/components/curso/CursoNav.svelte';
  import LeccionNavBar from '$lib/components/curso/LeccionNavBar.svelte';
  import LoadingSpinner from '$lib/components/extras/LoadingSpinner.svelte';
  
    let curso = {};
    let leccionActual = null;
    let cargando = true;
    let error = null;
    let progresoCurso = 0;
    let panelAbierto = true;
    let leccionesCompletadas = new Map();

    let notifications = [];

  
    $: temas = curso.temas || [];
    $: leccionesPlanas = temas.flatMap(tema => tema.lecciones);
    $: indiceActual = leccionesPlanas.findIndex(l => l.id === leccionActual?.id);
    $: leccionCompletada = leccionActual ? leccionesCompletadas.get(leccionActual.id.toString())?.completada : false;
  
    const cursoId = $page.params.id;
  
    onMount(async () => {
      document.body.style.overflow = 'hidden';
      await inicializarCurso();
    });
  
    onDestroy(() => {
      document.body.style.overflow = '';
    });
  
    async function inicializarCurso() {
      try {
        const token = $sessionStore.access;
        if (!token) {
          goto('/login');
          return;
        }
  
        const isEnrolled = await checkEnrollment(cursoId, token);
        if (!isEnrolled) {
          mostrarNotificacion('No estás inscrito en este curso. Por favor, inscríbete primero.', 'error');
          setTimeout(() => goto(`/cursos/${cursoId}`), 3000);
          return;
        }
  
        await cargarCurso();
        await cargarLeccionesCompletadas();
      } catch (e) {
        error = e.message;
        console.error('Error al inicializar el curso:', error);
      } finally {
        cargando = false;
      }
    }
  
    async function cargarCurso() {
      curso = await getCourseDetails(cursoId, $sessionStore.access);
      temas = curso.temas || [];
      if (temas.length > 0 && temas[0].lecciones.length > 0) {
        leccionActual = temas[0].lecciones[0];
      }
    }
  
    async function cargarLeccionesCompletadas() {
      const completadas = await getLeccionesCompletadas(cursoId, $sessionStore.access);
      leccionesCompletadas = new Map(
        Object.entries(completadas).map(([id, data]) => [id, { ...data, completada: !!data.completada }])
      );
      actualizarProgreso();
    }
  
    function seleccionarLeccion(event) {
      leccionActual = event.detail;
    }
  
    function irLeccionAnterior() {
      if (indiceActual > 0) {
        leccionActual = leccionesPlanas[indiceActual - 1];
      }
    }
  
    function irLeccionSiguiente() {
      if (indiceActual < leccionesPlanas.length - 1) {
        leccionActual = leccionesPlanas[indiceActual + 1];
      }
    }
  
    async function completarLeccion() {
      if (!leccionActual || leccionCompletada) return;
  
      try {
        const response = await marcarLeccionCompletada(leccionActual.id, $sessionStore.access);
        if (response.status === 'Lección marcada como completada') {
          leccionesCompletadas.set(leccionActual.id.toString(), { completada: true });
          leccionesCompletadas = new Map(leccionesCompletadas);
          actualizarProgreso();
          mostrarNotificacion('Lección completada con éxito', 'success');
        }
      } catch (error) {
        console.error('Error al marcar la lección como completada:', error);
        mostrarNotificacion('Error al completar la lección', 'error');
      }
    }
  
    function actualizarProgreso() {
      const totalLecciones = leccionesPlanas.length;
      const completadas = Array.from(leccionesCompletadas.values()).filter(l => l.completada).length;
      progresoCurso = Math.round((completadas / totalLecciones) * 100);
    }
  
    function goBack() {
      goto('/cursos');
    }
  
    function togglePlan() {
      panelAbierto = !panelAbierto;
    }
  
    function openDiscussions() {
      // Implementar lógica para abrir discusiones
    }
  
    function mostrarNotificacion(mensaje, tipo) {
    const id = Date.now();
    notifications = [...notifications, { id, mensaje, tipo }];
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id);
    }, 5000);
  }
  </script>
  
  <svelte:head>
  <title>{curso.titulo ? `Estudiando: ${curso.titulo}` : 'Cargando curso...'}</title>
</svelte:head>

<div class="curso-container">
  {#if cargando}
    <div class="loading-overlay" transition:fade>
      <LoadingSpinner />
    </div>
  {:else if error}
    <div class="error-message" in:fly="{{ y: 20, duration: 500 }}">
      <p>{error}</p>
      <button on:click={inicializarCurso}>Reintentar</button>
    </div>
  {:else}
    <!-- <CursoNav 
      {curso}
      {progresoCurso}
      on:goBack={goBack}
      on:togglePlan={togglePlan}
      on:openDiscussions={openDiscussions}
    /> -->
    
    <div class="curso-contenido" class:panel-abierto={panelAbierto}>
      <TemaPanel 
        {temas} 
        {leccionActual} 
        {progresoCurso} 
        {panelAbierto} 
        {leccionesCompletadas}
        {curso}
        on:seleccionarLeccion={seleccionarLeccion} 
      />
      
      <main class="contenido-principal">
        {#if leccionActual}
          <div class="leccion-container" in:fade="{{ duration: 300 }}">
            <LeccionViewer
              {leccionActual}
              completada={leccionCompletada}
              on:completar={completarLeccion}
            />
          </div>
        {:else}
          <div class="mensaje-bienvenida" in:fly="{{ y: 20, duration: 500 }}">
            <h2>¡Bienvenido al curso "{curso.titulo}"!</h2>
            <p>Selecciona una lección para comenzar.</p>
          </div>
        {/if}
      </main>
    </div>

    <LeccionNavBar
      {indiceActual}
      totalLecciones={leccionesPlanas.length}
      completada={leccionCompletada}
      {panelAbierto}
      on:irLeccionAnterior={irLeccionAnterior}
      on:irLeccionSiguiente={irLeccionSiguiente}
      on:completarLeccion={completarLeccion}
    />
  {/if}
</div>

<div class="notifications-container">
  {#each notifications as notification (notification.id)}
    <div 
      class="notification" 
      class:success={notification.tipo === 'success'}
      class:error={notification.tipo === 'error'}
      class:info={notification.tipo === 'info'}
      in:fly="{{ y: 50, duration: 300 }}"
      out:fade="{{ duration: 300 }}"
    >
      {notification.mensaje}
    </div>
  {/each}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background-color: #f0f4f8;
    color: #333;
    line-height: 1.6;
  }

  .curso-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .curso-contenido {
    display: flex;
    flex: 1;
    overflow: hidden;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .curso-contenido.panel-abierto {
    margin-left: 380px;
  }

  .contenido-principal {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-color: #f8fafc;
  }

  .leccion-container {
    width: 100%;
    max-width: 1000px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .leccion-container:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
  }

  .mensaje-bienvenida {
    text-align: center;
    margin-top: 50px;
    padding: 40px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
  }

  .mensaje-bienvenida h2 {
    color: #3f51b5;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .mensaje-bienvenida p {
    color: #666;
    font-size: 1.2rem;
  }

  .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 40px;
    background-color: #fff1f0;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(239, 68, 68, 0.1);
    max-width: 500px;
    margin: 50px auto;
  }

  .error-message p {
    color: #ef4444;
    font-size: 1.2rem;
    margin-bottom: 20px;
  }

  .error-message button {
    padding: 12px 24px;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    font-weight: 600;
  }

  .error-message button:hover {
    background-color: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }

  .notifications-container {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .notification {
    padding: 15px 25px;
    border-radius: 30px;
    color: white;
    font-size: 1rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 350px;
    transition: all 0.3s ease;
  }

  .notification:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  .notification.success {
    background-color: #10b981;
  }

  .notification.error {
    background-color: #ef4444;
  }

  .notification.info {
    background-color: #3b82f6;
  }

  @media (max-width: 1024px) {
    .curso-contenido.panel-abierto {
      margin-left: 0;
    }

    .contenido-principal {
      padding: 20px;
    }
  }

  @media (max-width: 768px) {
    .contenido-principal {
      padding: 15px;
    }

    .mensaje-bienvenida {
      padding: 30px;
    }

    .mensaje-bienvenida h2 {
      font-size: 2rem;
    }

    .notifications-container {
      left: 20px;
      right: 20px;
    }

    .notification {
      max-width: none;
    }
  }
</style>