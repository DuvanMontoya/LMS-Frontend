<script>
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { goto } from "$app/navigation";
  import { sessionStore } from "$lib/stores/sessionStore";
  import {
    getEvaluacionById,
    getResultadosEvaluacion,
    refreshToken,
  } from "$lib/api/evaluaciones/evaluaciones";
  import { format, parseISO } from "date-fns";
  import { es } from "date-fns/locale";
  import { browser } from "$app/environment";
  import { fade, fly, slide } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let evaluacionId;

  let evaluacion = null;
  let resultados = null;
  let loading = true;
  let error = null;
  let intentoSeleccionado = null;
  let intentos = [];
  let mejorIntento = null;
  let authToken;
  let porcentajeAprobacion = 0;
  let intentosAprobados = 0;
  let promedioTiempo = "N/A";
  let explicacionesVisibles = {};

  $: if (browser) {
    const unsubscribe = sessionStore.subscribe((session) => {
      authToken = session.access;
    });
    onDestroy(unsubscribe);
  }

  const safeNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return !isNaN(num) ? num.toFixed(decimals) : "N/A";
  };

  const safePercentage = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) ? `${num.toFixed(2)}%` : "N/A";
  };

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }

  async function loadMathJax() {
    return new Promise((resolve, reject) => {
      if (window.MathJax) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
      script.async = true;
      script.onload = () => {
        window.MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
          },
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function renderMathJax() {
    if (!window.MathJax || !window.MathJax.Hub) return;
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

  async function cargarDatosEvaluacion() {
    const [evaluacionData, resultadosData] = await Promise.all([
      getEvaluacionById(evaluacionId, authToken),
      getResultadosEvaluacion(evaluacionId, authToken),
    ]);

    evaluacion = evaluacionData;

    if (resultadosData.detail) {
      throw new Error(resultadosData.detail);
    } else {
      resultados = resultadosData;

      if (resultados && resultados.mejor_intento) {
        mejorIntento = resultados.mejor_intento;
        intentos = [mejorIntento];
      } else if (evaluacion && evaluacion.resultados && evaluacion.resultados.length > 0) {
        intentos = evaluacion.resultados;
        mejorIntento = intentos.reduce(
          (mejor, intento) =>
            parseFloat(intento.puntaje_obtenido) >
            parseFloat(mejor.puntaje_obtenido)
              ? intento
              : mejor,
          intentos[0]
        );
      }

      calcularEstadisticas();
    }
  }

  function calcularEstadisticas() {
    if (evaluacion && mejorIntento) {
      porcentajeAprobacion =
        (parseFloat(mejorIntento.puntaje_obtenido) /
          parseFloat(evaluacion.puntaje_maximo)) *
        100;
    }

    if (intentos.length > 0) {
      intentosAprobados = intentos.filter(
        (intento) =>
          (parseFloat(intento.puntaje_obtenido) /
            parseFloat(evaluacion?.puntaje_maximo || 1)) *
            100 >=
          parseFloat(evaluacion?.criterios_aprobacion || 0)
      ).length;

      const totalTiempo = intentos.reduce(
        (sum, intento) => sum + (intento.tiempo_tomado || 0),
        0
      );
      const avgSeconds = totalTiempo / intentos.length;
      promedioTiempo = formatTime(avgSeconds);
    }
  }

  onMount(async () => {
    if (!authToken) {
      error = "Por favor, inicia sesión para ver los resultados.";
      loading = false;
      return;
    }

    try {
      await loadMathJax();
      await cargarDatosEvaluacion();
      loading = false;
      await renderMathJax();
    } catch (err) {
      console.error("Error al obtener los resultados:", err);
      if (err.message === "Token expirado") {
        try {
          await refreshToken();
          await cargarDatosEvaluacion();
          await renderMathJax();
        } catch (refreshError) {
          error = "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.";
        }
      } else {
        error = "Ocurrió un error al cargar los resultados. Por favor, intenta nuevamente más tarde.";
      }
    } finally {
      loading = false;
    }
  });

  function goToAnalisis() {
    goto(`/evaluaciones/${evaluacion.id}/analisis`);
  }

  async function mostrarResultadosIntento(intento) {
    intentoSeleccionado = intento === intentoSeleccionado ? null : intento;
    if (intentoSeleccionado) {
      await renderMathJax();
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "Fecha no disponible";
    const date = parseISO(dateString);
    return format(date, "PPPPpppp", { locale: es });
  }

  async function toggleExplicacion(preguntaId) {
    explicacionesVisibles = {
      ...explicacionesVisibles,
      [preguntaId]: !explicacionesVisibles[preguntaId],
    };
    await renderMathJax();
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  afterUpdate(() => {
    renderMathJax();
  });
</script>

<svelte:head>
  <title>{evaluacion?.titulo || "Resultados de la Evaluación"} | Sistema de Evaluaciones</title>
</svelte:head>

<div class="resultados-evaluacion">
  {#if loading}
    <div class="loading" in:fade={{ duration: 300 }}>
      <div class="spinner"></div>
      <p>Cargando resultados...</p>
    </div>
  {:else if error}
    <div class="error" in:fade={{ duration: 300 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-circle">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{error}</p>
    </div>
  {:else if evaluacion && (resultados || intentos.length > 0)}
    <header class="header" in:fly={{ y: -50, duration: 500, easing: backOut }}>
      <h1>{evaluacion.titulo}</h1>
      <div class="evaluacion-info">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Duración: {evaluacion.tiempo_limite} minutos
        </span>
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Inicio: {formatDate(evaluacion.fecha_inicio)}
        </span>
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-square">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          Fin: {formatDate(evaluacion.fecha_fin)}
        </span>
      </div>
    </header>

    <section class="resumen" in:fly={{ y: 50, duration: 500, delay: 200, easing: backOut }}>
      <div class="stats-grid">
        <!-- Card for Mejor Puntaje -->
        <div class="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-award">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          <h3>Mejor Puntaje</h3>
          <p>{resultados?.puntaje_total || "N/A"} de {evaluacion.puntaje_maximo}</p>
        </div>
        <!-- Card for Tiempo Promedio -->
        <div class="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3>Tiempo Promedio</h3>
          <p>{promedioTiempo}</p>
        </div>
        <!-- Card for Intentos Aprobados -->
        <div class="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3>Intentos Aprobados</h3>
          <p>{intentosAprobados}/{intentos.length}</p>
        </div>
        <!-- Card for Porcentaje Obtenido -->
        <div class="stat-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-percent">
            <line x1="19" y1="5" x2="5" y2="19"></line>
            <circle cx="6.5" cy="6.5" r="2.5"></circle>
            <circle cx="17.5" cy="17.5" r="2.5"></circle>
          </svg>
          <h3>Porcentaje Obtenido</h3>
          <p>{safePercentage(porcentajeAprobacion)}</p>
        </div>
      </div>
    </section>

    <!-- Botón para Análisis Detallado -->
    <button class="btn-analisis" on:click={goToAnalisis} in:fly={{ y: 50, duration: 500, delay: 400, easing: backOut }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bar-chart-2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      Ver Análisis Detallado
    </button>

    <!-- Sección para Resumen de Intentos -->
    <section class="intentos" in:fly={{ y: 50, duration: 500, delay: 600, easing: backOut }}>
      <h2>Resumen de Intentos</h2>
      <div class="tabla-container">
        <table class="intentos-table">
          <thead>
            <tr>
              <th>Intento</th>
              <th>Fecha</th>
              <th>Puntaje</th>
              <th>Tiempo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each intentos as intento, index}
              <tr class:selected={intentoSeleccionado === intento}>
                <td data-label="Intento">{index + 1}</td>
                <td data-label="Fecha">{formatDate(intento.fecha_inicio)}</td>
                <td data-label="Puntaje">{intento.puntaje_obtenido}</td>
                <td data-label="Tiempo">{formatTime(intento.tiempo_tomado)}</td>
                <td data-label="Estado">
                  <span class="estado {(parseFloat(intento.puntaje_obtenido) / parseFloat(evaluacion.puntaje_maximo)) * 100 >= parseFloat(evaluacion.criterios_aprobacion) ? 'aprobado' : 'reprobado'}">
                    {(parseFloat(intento.puntaje_obtenido) / parseFloat(evaluacion.puntaje_maximo)) * 100 >= parseFloat(evaluacion.criterios_aprobacion) ? "Aprobado" : "Reprobado"}
                  </span>
                </td>
                <td data-label="Acciones">
                  <button class="btn-ver-resultados" on:click={() => mostrarResultadosIntento(intento)} aria-expanded={intentoSeleccionado === intento} aria-controls="resultados-intento-{index}">
                    {intentoSeleccionado === intento ? "Ocultar" : "Ver Detalles"}
                  </button>
                </td>
              </tr>
              {#if intentoSeleccionado === intento}
                <tr class="resultados-detalle" id={`resultados-intento-${index}`}>
                  <td colspan="6">
                    <!-- Detalle del intento seleccionado -->
                    <div class="resultados-intento" in:slide={{ duration: 300 }}>
                      <div class="resumen-intento">
                        <div class="resumen-item">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-award">
                            <circle cx="12" cy="8" r="7"></circle>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                          </svg>
                          <span>Calificación: {safeNumber((parseFloat(intento.puntaje_obtenido) / parseFloat(evaluacion.puntaje_maximo)) * 5, 2)}/5.0</span>
                        </div>
                        <div class="resumen-item">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-percent">
                            <line x1="19" y1="5" x2="5" y2="19"></line>
                            <circle cx="6.5" cy="6.5" r="2.5"></circle>
                            <circle cx="17.5" cy="17.5" r="2.5"></circle>
                          </svg>
                          <span>Porcentaje: {safePercentage((parseFloat(intento.puntaje_obtenido) / parseFloat(evaluacion.puntaje_maximo)) * 100)}</span>
                        </div>
                        <div class="resumen-item">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>Tiempo: {formatTime(intento.tiempo_tomado)}</span>
                        </div>
                      </div>
                      <!-- Sección de preguntas y respuestas -->
                      <div class="preguntas">
                        {#each intento.respuestas as respuesta, i}
                          <div class="pregunta" class:correcta={respuesta.es_correcta} class:incorrecta={!respuesta.es_correcta}>
                            <div class="pregunta-header">
                              <h3>Pregunta {i + 1}</h3>
                            </div>
                            <div class="pregunta-contenido">
                              <div class="pregunta-texto">
                                {@html respuesta.pregunta.texto_pregunta}
                              </div>
                              {#if respuesta.pregunta.imagen_svg}
                                <div class="imagen-pregunta">
                                  <img loading="lazy" src={respuesta.pregunta.imagen_svg} alt="Imagen de la pregunta {i + 1}" />
                                </div>
                              {/if}
                              <div class="opciones">
                                {#each respuesta.pregunta.opciones as opcion}
                                  <div class="opcion" class:correcta={opcion.id == respuesta.opcion_correcta} class:seleccionada={opcion.id == respuesta.opcion_seleccionada} class:incorrecta={opcion.id == respuesta.opcion_seleccionada && opcion.id != respuesta.opcion_correcta}>
                                    <div class="opcion-texto">
                                      {@html opcion.texto_opcion}
                                    </div>
                                    {#if opcion.id == respuesta.opcion_correcta}
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check icono-correcto">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    {/if}
                                    {#if opcion.id == respuesta.opcion_seleccionada && opcion.id != respuesta.opcion_correcta}
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x icono-incorrecto">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    {/if}
                                  </div>
                                {/each}
                              </div>
                              <div class="puntos-obtenidos">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <p>Puntos obtenidos: {respuesta.puntos_obtenidos}/{respuesta.pregunta.puntos}</p>
                              </div>
                              <button class="btn-explicacion" on:click={() => toggleExplicacion(respuesta.pregunta.id)}>
                                {explicacionesVisibles[respuesta.pregunta.id] ? "Ocultar Explicación" : "Ver Explicación"}
                              </button>
                              {#if respuesta.pregunta.explicacion_respuesta && evaluacion.mostrar_opciones_correctas && explicacionesVisibles[respuesta.pregunta.id]}
                                <div class="explicacion-respuesta" in:slide={{ duration: 300 }}>
                                  <h4>Explicación:</h4>
                                  {@html respuesta.pregunta.explicacion_respuesta}
                                </div>
                              {/if}
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {:else}
    <div class="no-resultados" in:fade={{ duration: 300 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <p>No se encontraron resultados para esta evaluación o los resultados no están disponibles.</p>
    </div>
  {/if}
</div>

<button class="scroll-top" on:click={scrollToTop} aria-label="Volver arriba">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-up"><polyline points="18 15 12 9 6 15"></polyline></svg>
</button>

<style>
  :root {
    --primary-color: #171f39;
    --secondary-color: #457b9d;
    --accent-color: #e63946;
    --background-color: #F1F2F3;
    --text-color: #1d3557;
    --card-background: #ffffff;
    --success-color: #2a9d8f;
    --error-color: #e63946;
    --border-radius: 8px;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
  }

  .resultados-evaluacion {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    font-family: "Roboto", "Helvetica Neue", sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .header {
    background: var(--primary-color);
    color: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    margin-bottom: 2rem;
    box-shadow: var(--box-shadow);
    text-align: center;
    transition: var(--transition);
  }

  .header h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    font-family: "Playfair Display", serif;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .evaluacion-info {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1rem;
    font-size: 1rem;
  }

  .evaluacion-info span {
    display: flex;
    align-items: center;
    margin: 0.5rem 1rem;
  }

  .evaluacion-info :global(svg) {
    margin-right: 0.5rem;
    width: 18px;
    height: 18px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background-color: var(--card-background);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    text-align: center;
    transition: var(--transition);
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  .stat-card :global(svg) {
    width: 36px;
    height: 36px;
    color: var(--primary-color);
    margin-bottom: 1rem;
    transition: var(--transition);
  }

  .stat-card:hover :global(svg) {
    transform: scale(1.1);
  }

  .stat-card h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
    font-family: "Playfair Display", serif;
  }

  .stat-card p {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-color);
  }

  .intentos-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background-color: var(--card-background);
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--box-shadow);
  }

  .intentos-table th,
  .intentos-table td {
    padding: 1rem;
    text-align: left;
  }

  .intentos-table th {
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }

  .intentos-table tr {
    transition: var(--transition);
  }

  .intentos-table tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .intentos-table tr:hover {
    background-color: rgba(69, 123, 157, 0.05);
  }

  .estado {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
  }

  .estado.aprobado {
    background-color: var(--success-color);
    color: white;
  }

  .estado.reprobado {
    background-color: var(--error-color);
    color: white;
  }

  .btn-ver-resultados {
    padding: 0.5rem 1rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.8rem;
  }

  .btn-ver-resultados:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  .resultados-intento {
    background-color: var(--card-background);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    margin-top: 1rem;
    box-shadow: var(--box-shadow);
  }

  .resumen-intento {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--background-color);
  }

  .resumen-item {
    display: flex;
    align-items: center;
    font-size: 1rem;
    margin: 0.5rem 1rem 0.5rem 0;
    padding: 1rem;
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    transition: var(--transition);
  }

  .resumen-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .resumen-item :global(svg) {
    margin-right: 0.5rem;
    color: var(--primary-color);
    width: 20px;
    height: 20px;
  }

  .pregunta {
    background-color: var(--card-background);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    margin-bottom: 1.5rem;
    box-shadow: var(--box-shadow);
    transition: var(--transition);
  }

  .pregunta:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }

  .pregunta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--background-color);
  }

  .pregunta-header h3 {
    font-size: 1.2rem;
    color: var(--secondary-color);
    font-family: "Playfair Display", serif;
  }

  .pregunta-contenido {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .pregunta-texto {
    font-size: 1rem;
    line-height: 1.6;
  }

  .imagen-pregunta {
    text-align: center;
  }

  .imagen-pregunta img {
    max-width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  .opciones {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .opcion {
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: var(--border-radius);
    transition: var(--transition);
  }

  .opcion-texto {
    flex: 1;
    font-size: 1rem;
  }

  .opcion.correcta {
    background-color: rgba(42, 157, 143, 0.1);
    border-left: 3px solid var(--success-color);
  }

  .opcion.incorrecta {
    background-color: rgba(230, 57, 70, 0.1);
    border-left: 3px solid var(--error-color);
  }

  .opcion .icono-correcto,
  .opcion .icono-incorrecto {
    width: 20px;
    height: 20px;
    margin-left: 0.75rem;
  }

  .opcion .icono-correcto {
    color: var(--success-color);
  }

  .opcion .icono-incorrecto {
    color: var(--error-color);
  }

  .puntos-obtenidos {
    display: flex;
    align-items: center;
    margin-top: 0.75rem;
    font-weight: 600;
    color: var(--primary-color);
  }

  .puntos-obtenidos svg {
    width: 18px;
    height: 18px;
    margin-right: 0.5rem;
    color: #f1c40f;
  }

  .btn-explicacion {
    padding: 0.5rem 1rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    font-size: 0.8rem;
    margin-top: 1rem;
  }

  .btn-explicacion:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
  }

  .explicacion-respuesta {
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-top: 1rem;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }

  .explicacion-respuesta h4 {
    font-size: 1.1rem;
    color: var(--secondary-color);
    margin-bottom: 0.75rem;
    font-family: "Playfair Display", serif;
  }

  .btn-analisis {
    display: block;
    margin: 2rem auto;
    padding: 0.75rem 2rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: var(--box-shadow);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-analisis:hover {
    background-color: var(--secondary-color);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .btn-analisis :global(svg) {
    margin-right: 0.5rem;
    width: 18px;
    height: 18px;
  }

  .scroll-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background-color: var(--primary-color);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    border: none;
    z-index: 1000;
  }

  .scroll-top:hover {
    background-color: var(--secondary-color);
    transform: translateY(-3px);
  }

  .scroll-top :global(svg) {
    width: 20px;
    height: 20px;
  }

  .loading,
  .error,
  .no-resultados {
    text-align: center;
    padding: 3rem;
    background-color: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    margin-top: 2rem;
  }

  .loading :global(.spinner) {
    margin: 0 auto 1.5rem;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error :global(svg),
  .no-resultados :global(svg) {
    width: 48px;
    height: 48px;
    color: var(--error-color);
    margin-bottom: 1rem;
  }

  /* Estilos para el contenido HTML del backend */
  :global(.pregunta-texto table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    font-family: "Roboto", sans-serif;
  }

  :global(.pregunta-texto th),
  :global(.pregunta-texto td) {
    border: 1px solid var(--secondary-color);
    padding: 0.75rem;
    text-align: left;
  }

  :global(.pregunta-texto th) {
    background-color: var(--secondary-color);
    color: white;
    font-weight: bold;
  }

  :global(.pregunta-texto tr:nth-child(even)) {
    background-color: rgba(0, 0, 0, 0.05);
  }

  :global(.pregunta-texto img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  :global(.pregunta-texto p) {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  :global(.pregunta-texto ul),
  :global(.pregunta-texto ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  :global(.pregunta-texto li) {
    margin-bottom: 0.5rem;
  }

  :global(.pregunta-texto blockquote) {
    border-left: 4px solid var(--primary-color);
    padding-left: 1rem;
    margin-left: 0;
    font-style: italic;
    color: var(--secondary-color);
  }

  :global(.pregunta-texto pre) {
    background-color: #f4f4f4;
    padding: 1rem;
    border-radius: var(--border-radius);
    overflow-x: auto;
    font-family: "Courier New", Courier, monospace;
  }

  :global(.pregunta-texto code) {
    background-color: #f4f4f4;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: "Courier New", Courier, monospace;
  }

  :global(.pregunta-texto a) {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  :global(.pregunta-texto a:hover) {
    color: var(--secondary-color);
    text-decoration: underline;
  }

  /* Estilos responsivos */
  @media (max-width: 768px) {
    .resultados-evaluacion {
      padding: 1rem;
    }

    .header {
      padding: 1.5rem;
    }

    .header h1 {
      font-size: 1.8rem;
    }

    .evaluacion-info {
      flex-direction: column;
      align-items: flex-start;
    }

    .evaluacion-info span {
      margin-bottom: 0.5rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .intentos-table {
      font-size: 0.9rem;
    }

    .intentos-table th,
    .intentos-table td {
      padding: 0.75rem;
    }

    .scroll-top {
      bottom: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .resumen-intento {
      flex-direction: column;
    }

    .resumen-item {
      margin-bottom: 0.75rem;
    }

    .pregunta-contenido {
      gap: 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  .tabla-container {
    overflow-x: auto;
    margin-bottom: 1.5rem;
  }

  /* Mejoras de accesibilidad */
  .btn-analisis:focus,
  .btn-ver-resultados:focus,
  .scroll-top:focus,
  .btn-explicacion:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(26, 95, 122, 0.5);
  }

  @media (hover: hover) {
    .btn-analisis:hover,
    .btn-ver-resultados:hover,
    .scroll-top:hover,
    .btn-explicacion:hover {
      transform: translateY(-2px);
    }
  }

  /* Mejoras para dispositivos móviles */
  @media (max-width: 768px) {
    .intentos-table {
      display: block;
    }

    .intentos-table thead {
      display: none;
    }

    .intentos-table tbody,
    .intentos-table tr,
    .intentos-table td {
      display: block;
    }

    .intentos-table tr {
      margin-bottom: 1rem;
      border: 1px solid var(--background-color);
      border-radius: var(--border-radius);
      padding: 0.5rem;
    }

    .intentos-table td {
      text-align: right;
      padding-left: 50%;
      position: relative;
    }

    .intentos-table td::before {
      content: attr(data-label);
      position: absolute;
      left: 0.5rem;
      width: 45%;
      text-align: left;
      font-weight: bold;
    }
  }

  /* Modo oscuro */
  @media (prefers-color-scheme: dark) {
    :root {
      --primary-color: #4a9de9;
      --secondary-color: #2c3e50;
      --accent-color: #f39c12;
      --background-color: #1a1a1a;
      --text-color: #e0e0e0;
      --card-background: #2a2a2a;
      --success-color: #2ecc71;
      --error-color: #e74c3c;
    }

    /* .pregunta-texto code,
    .pregunta-texto pre {
      background-color: #333;
      color: #f4f4f4;
    } */

    .opcion {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .opcion.correcta {
      background-color: rgba(46, 204, 113, 0.2);
    }

    .opcion.incorrecta {
      background-color: rgba(231, 76, 60, 0.2);
    }

    .explicacion-respuesta {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  /* Animaciones */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .pregunta {
    animation: fadeIn 0.5s ease-out;
  }

  /* Estilos para mejorar la legibilidad del contenido matemático */
  :global(.MathJax) {
    font-size: 1.1em !important;
  }

  :global(.MathJax_Display) {
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* Mejoras adicionales para la accesibilidad */
  /* .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  } */

  /* Estilos para mejorar la interactividad */
  .opcion {
    cursor: pointer;
  }

  .opcion:hover {
    filter: brightness(0.95);
  }

  /* Estilos para mejorar la legibilidad de las tablas en dispositivos móviles */
  @media (max-width: 600px) {
    :global(.pregunta-texto table) {
      font-size: 0.8rem;
    }

    :global(.pregunta-texto th),
    :global(.pregunta-texto td) {
      padding: 0.5rem;
    }
  }

  /* Estilos para imprimir */
  @media print {
    .btn-analisis,
    .scroll-top,
    .btn-explicacion {
      display: none;
    }

    .resultados-evaluacion {
      max-width: 100%;
      padding: 0;
    }

    .pregunta {
      break-inside: avoid;
    }
  }
</style>