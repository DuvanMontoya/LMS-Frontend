<script>
  import { createEventDispatcher, onMount, afterUpdate } from "svelte";
  import { fade, slide, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import {
    faChevronDown,
    faChevronRight,
    faPlayCircle,
    faCheckCircle,
    faLock,
    faArrowLeft,
    faLayerGroup,
    faTimes
  } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  export let temas = [];
  export let leccionActual = null;
  export let progresoCurso = 0;
  export let curso = {};
  export let leccionesCompletadas = new Map();
  export let panelAbierto = true;

  let panelElement;
  let scrollPosition = 0;
  let isDragging = false;
  let startY;
  let scrollTop;
  let todosTemasExpandidos = true;

  const dispatch = createEventDispatcher();

  $: temaCounts = temas.map((tema) => ({
    total: tema.lecciones.length,
    completadas: tema.lecciones.filter(
      (l) => leccionesCompletadas.get(l.id.toString())?.completada
    ).length,
  }));

  function seleccionarLeccion(leccion) {
    if (!leccion.bloqueada) {
      dispatch("seleccionarLeccion", leccion);
    }
  }

  function toggleTema(tema) {
    tema.expandido = !tema.expandido;
    temas = temas; // Forzar actualización reactiva
  }

  function toggleTodosTemas() {
    todosTemasExpandidos = !todosTemasExpandidos;
    temas = temas.map(tema => ({ ...tema, expandido: todosTemasExpandidos }));
  }

  function manejarEventoTeclado(event, leccion) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      seleccionarLeccion(leccion);
    }
  }

  function handleMouseDown(e) {
    isDragging = true;
    startY = e.pageY - panelElement.offsetTop;
    scrollTop = panelElement.scrollTop;
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const y = e.pageY - panelElement.offsetTop;
    const walk = (y - startY) * 2;
    panelElement.scrollTop = scrollTop - walk;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function volverAtras() {
    dispatch("volverAtras");
  }

  onMount(() => {
    panelElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      panelElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  afterUpdate(() => {
    if (leccionActual) {
      const leccionElement = panelElement.querySelector(`[data-leccion-id="${leccionActual.id}"]`);
      if (leccionElement) {
        leccionElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  });
</script>

<aside 
  class="panel-lateral" 
  class:panel-abierto={panelAbierto}
  bind:this={panelElement}
  on:scroll={() => scrollPosition = panelElement.scrollTop}
>
  <div class="panel-header" class:scrolled={scrollPosition > 10}>
    <button class="btn-volver" on:click={volverAtras} aria-label="Volver atrás">
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
    <h2 class="curso-titulo">{curso.titulo}</h2>
    <button class="btn-toggle-temas" on:click={toggleTodosTemas} aria-label={todosTemasExpandidos ? "Colapsar todos los temas" : "Expandir todos los temas"}>
      <FontAwesomeIcon icon={todosTemasExpandidos ? faTimes : faLayerGroup} />
    </button>
  </div>

  <div class="progreso-curso">
    <div class="progreso-barra">
      <div class="progreso" style="width: {progresoCurso}%"></div>
    </div>
    <span class="progreso-texto">Progreso del Curso: {progresoCurso}%</span>
  </div>

  <div class="panel-content">
    {#each temas as tema, temaIndex (tema.id)}
      <div class="tema-item">
        <button class="tema-header" on:click={() => toggleTema(tema)}>
          <span class="tema-titulo">{tema.titulo}</span>
          <span class="tema-contador"
            >{temaCounts[temaIndex].completadas}/{temaCounts[temaIndex].total}</span
          >
          <span class="icono-chevron" class:rotated={tema.expandido}>
            <FontAwesomeIcon icon={faChevronRight} />
          </span>
        </button>
        <div class="tema-progreso">
          <div
            class="tema-progreso-barra"
            style="width: {(temaCounts[temaIndex].completadas / temaCounts[temaIndex].total) * 100}%"
          ></div>
        </div>
        {#if tema.expandido}
          <ul class="leccion-lista" transition:slide={{ duration: 300, easing: quintOut }}>
            {#each tema.lecciones as leccion (leccion.id)}
              <li 
                class="leccion-item-container" 
                data-leccion-id={leccion.id}
                in:fade={{ duration: 200, delay: 100 * tema.lecciones.indexOf(leccion) }}
              >
                <div
                  class="leccion-item"
                  class:completada={leccionesCompletadas.get(leccion.id.toString())?.completada}
                  class:activa={leccionActual && leccionActual.id === leccion.id}
                  class:bloqueada={leccion.bloqueada}
                  on:click={() => seleccionarLeccion(leccion)}
                  tabindex="0"
                  role="button"
                  on:keydown={(event) => manejarEventoTeclado(event, leccion)}
                >
                  <span class="leccion-indicador"></span>
                  <span class="icono-leccion">
                    <FontAwesomeIcon icon={leccion.bloqueada ? faLock : faPlayCircle} />
                  </span>
                  <span class="leccion-titulo">{leccion.titulo}</span>
                  <span class="leccion-duracion">{leccion.tiempo_estimado} min</span>
                  {#if leccionesCompletadas.get(leccion.id.toString())?.completada}
                    <span class="icono-completado">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </span>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </div>
</aside>

<style>
  .panel-lateral {
    position: fixed;
    left: -380px;
    top: 0;
    width: 380px;
    height: 100vh;
    background-color: #ffffff;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    font-family: 'Poppins', sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-lateral.panel-abierto {
    left: 0;
  }

  .panel-header {
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: #ffffff;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: box-shadow 0.3s ease;
  }

  .panel-header.scrolled {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .btn-volver, .btn-toggle-temas {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .btn-volver:hover, .btn-toggle-temas:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .curso-titulo {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    text-align: center;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .progreso-curso {
    padding: 1rem;
    background-color: #f8f9fa;
  }

  .progreso-barra {
    height: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .progreso {
    height: 100%;
    background: linear-gradient(90deg, #00c9ff, #92fe9d);
    transition: width 0.3s ease;
  }

  .progreso-texto {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6c757d;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .tema-item {
    margin-bottom: 1rem;
    background-color: #f8f9fa;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }

  .tema-item:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .tema-header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .tema-header:hover {
    background-color: #e9ecef;
  }

  .tema-titulo {
    flex: 1;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    text-align: left;
  }

  .tema-contador {
    font-size: 0.75rem;
    color: #ffffff;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    margin-right: 0.5rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .icono-chevron {
    color: #6e8efb;
    transition: transform 0.3s ease;
  }

  .icono-chevron.rotated {
    transform: rotate(90deg);
  }

  .tema-progreso {
    width: 100%;
    height: 4px;
    background-color: #e9ecef;
    overflow: hidden;
  }

  .tema-progreso-barra {
    height: 100%;
    background: linear-gradient(90deg, #00c9ff, #92fe9d);
    transition: width 0.3s ease;
  }

  .leccion-lista {
    list-style-type: none;
    padding: 0.5rem 0;
    margin: 0;
  }

  .leccion-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .leccion-item:hover {
    background-color: #e9ecef;
  }

  .leccion-item.activa {
    background-color: #e8eaf6;
  }

  .leccion-item.completada {
    color: #6e8efb;
  }

  .leccion-item.bloqueada {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .leccion-indicador {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: transparent;
    transition: background-color 0.2s;
  }

  .leccion-item.activa .leccion-indicador {
    background-color: #6e8efb;
  }

  .icono-leccion {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.75rem;
    color: #6e8efb;
  }

  .leccion-titulo {
    flex: 1;
    font-size: 0.9375rem;
    color: #333;
  }

  .leccion-duracion {
    font-size: 0.75rem;
    color: #6c757d;
    margin-left: 0.5rem;
  }

  .icono-completado {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4caf50;
    margin-left: 0.5rem;
  }

  @media (max-width: 768px) {
    .panel-lateral {
      width: 100%;
      left: -100%;
    }

    .panel-lateral.panel-abierto {
      left: 0;
    }

    .panel-header {
      padding: 0.75rem;
    }

    .curso-titulo {
      font-size: 1rem;
    }

    .btn-volver, .btn-toggle-temas {
      font-size: 1rem;
    }

    .tema-header {
      padding: 0.75rem;
    }

    .tema-titulo {
      font-size: 0.9375rem;
    }

    .leccion-item {
      padding: 0.6rem 0.75rem;
    }

    .leccion-titulo {
      font-size: 0.875rem;
    }
  }

  @media (max-width: 480px) {
    .panel-header {
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .btn-volver, .btn-toggle-temas {
      order: 1;
    }

    .curso-titulo {
      order: 3;
      width: 100%;
      margin-top: 0.5rem;
      text-align: left;
    }

    .progreso-curso {
      padding: 0.75rem;
    }

    .panel-content {
      padding: 0.75rem;
    }
  }

  /* Animaciones y transiciones adicionales */
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  .leccion-item.activa {
    animation: pulse 2s infinite;
  }

  .tema-item, .leccion-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .tema-item:hover, .leccion-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .icono-completado {
    transition: transform 0.3s ease;
  }

  .icono-completado:hover {
    transform: scale(1.2) rotate(15deg);
  }

  /* Estilos para mejorar la accesibilidad */
  .leccion-item:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(110, 142, 251, 0.5);
  }

  /* Estilos para el modo oscuro */
  @media (prefers-color-scheme: dark) {
    .panel-lateral {
      background-color: #1a1a1a;
      color: #ffffff;
    }

    .panel-header {
      background: linear-gradient(135deg, #4a5d8f, #7e5494);
    }

    .progreso-curso {
      background-color: #2a2a2a;
    }

    .progreso-barra {
      background-color: #3a3a3a;
    }

    .tema-item {
      background-color: #2a2a2a;
    }

    .tema-header:hover {
      background-color: #3a3a3a;
    }

    .tema-titulo, .leccion-titulo {
      color: #ffffff;
    }

    .leccion-item:hover {
      background-color: #3a3a3a;
    }

    .leccion-item.activa {
      background-color: #4a4a4a;
    }

    .progreso-texto, .leccion-duracion {
      color: #b0b0b0;
    }
  }
</style>