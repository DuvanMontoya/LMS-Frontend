<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { getCursoDetalles } from '$lib/api/cursos/cursos';
    import { sessionStore } from '$lib/stores/sessionStore';
    import TemaPanel from '$lib/components/curso/TemaPanel.svelte';
    import LeccionViewer from '$lib/components/curso/LeccionViewer.svelte';
    import EvaluacionForm from '$lib/components/curso/EvaluacionForm.svelte';
    import ProgresoCurso from '$lib/components/curso/ProgresoCurso.svelte';
    import { get } from 'svelte/store';
  
    let access = '';
    let curso = {};
    let leccionSeleccionada = null;
    let evaluacionSeleccionada = null;
    let cargando = true;
    let error = null;
  
    const cursoId = $page.params.id;
  
  
    onMount(async () => {
      try {
        const token = get(sessionStore).access;
        if (!token) {
          throw new Error('Token de acceso no encontrado');
        }
        access = token;
  
        curso = await getCursoDetalles(cursoId, access);
  
        if (curso) {
          if (curso.temas && curso.temas.length > 0 && curso.temas[0].lecciones && curso.temas[0].lecciones.length > 0) {
            leccionSeleccionada = curso.temas[0].lecciones[0];
          } else {
            console.warn('El curso no tiene temas o lecciones.');
          }
        } else {
          error = 'No se encontraron detalles del curso';
          console.error(error);
        }
        cargando = false;
      } catch (e) {
        error = e.message;
        console.error('Error al obtener detalles del curso:', error);
        cargando = false;
      }
    });
  
    function seleccionarLeccion(event) {
      leccionSeleccionada = event.detail;
      evaluacionSeleccionada = null;
    }
  
    function seleccionarEvaluacion(evaluacion) {
      evaluacionSeleccionada = evaluacion;
      leccionSeleccionada = null;
    }
  
    function actualizarProgreso(event) {
      curso.progreso_curso = event.detail.progreso_curso;
      curso.temas.find(tema => tema.id === leccionSeleccionada.tema).progreso = event.detail.progreso_tema;
    }
  
    function siguienteLeccion() {
      const lecciones = curso.temas.flatMap(tema => tema.lecciones);
      const index = lecciones.findIndex(leccion => leccion.id === leccionSeleccionada.id);
      if (index < lecciones.length - 1) {
        leccionSeleccionada = lecciones[index + 1];
      } else {
        console.warn('No hay más lecciones.');
      }
    }
  
    function leccionAnterior() {
      const lecciones = curso.temas.flatMap(tema => tema.lecciones);
      const index = lecciones.findIndex(leccion => leccion.id === leccionSeleccionada.id);
      if (index > 0) {
        leccionSeleccionada = lecciones[index - 1];
      } else {
        console.warn('No hay lecciones anteriores.');
      }
    }
  </script>
  
  <div class="curso-estudiar">
    {#if cargando}
      <div class="loading">Cargando...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else}    
      <div class="contenido-principal">
        {#if leccionSeleccionada}
          <LeccionViewer
            leccion={leccionSeleccionada}
            {access}
            on:siguienteLeccion={siguienteLeccion}
            on:leccionAnterior={leccionAnterior}
            on:actualizarProgreso={actualizarProgreso}
          />
        {:else if evaluacionSeleccionada}
          <EvaluacionForm evaluacion={evaluacionSeleccionada} {access} />
        {:else}
          <div class="mensaje-bienvenida">
            <h2>¡Bienvenido al curso "{curso.titulo}"!</h2>
            <p>Selecciona una lección o evaluación para comenzar.</p>
          </div>
        {/if}
      </div>
      <div class="panel-lateral">
        <TemaPanel
          temas={curso.temas}
          on:seleccionarLeccion={seleccionarLeccion}
          on:seleccionarEvaluacion={seleccionarEvaluacion}
        />
      </div>
      <div class="panel-progreso">
        <ProgresoCurso curso={curso} />
      </div>
    {/if}
  </div>
  
  <style>
    .curso-estudiar {
      display: flex;
      height: 100vh;
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #f9f9f9 25%, #fff 25%, #fff 50%, #f9f9f9 50%, #f9f9f9 75%, #fff 75%, #fff 100%);
      background-size: 28.28px 28.28px;
      color: #333;
    }
  
    .panel-lateral {
      width: 300px;
      padding: 20px;
      background-color: #2c3e50;
      color: white;
      overflow-y: auto;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }
  
    .contenido-principal {
      flex: 1;
      padding: 40px;
      background: white;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  
    .spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid #ccc;
      border-top-color: #333;
      animation: spin 1s infinite linear;
    }
  
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  
    .error {
      color: red;
      text-align: center;
      margin-top: 20px;
    }
  
    .mensaje-bienvenida {
      text-align: center;
      margin-top: 50px;
    }
  
    .mensaje-bienvenida h2 {
      font-size: 2.5rem;
      color: #e74c3c;
      margin-bottom: 20px;
    }
  
    .mensaje-bienvenida p {
      font-size: 1.2rem;
      color: #34495e;
    }
  
    /* Estilos adicionales para botones y enlaces */
    button {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 1rem;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.3s;
    }
  
    button:hover {
      background-color: #c0392b;
      transform: scale(1.05);
    }
  
    a {
      color: #3498db;
      text-decoration: none;
      transition: color 0.3s;
    }
  
    a:hover {
      color: #2980b9;
    }
  
    /* Añadir animaciones de entrada */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  
    .curso-estudiar > div {
      animation: fadeIn 0.5s ease-in;
    }
  </style>
  