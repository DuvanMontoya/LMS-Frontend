<script>
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import { writable, derived, get } from "svelte/store";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { sessionStore } from "$lib/stores/sessionStore";
  import {
    getEvaluacionById,
    enviarEvaluacion,
    obtenerIntento,
    guardarProgreso,
    iniciarNuevoIntento
  } from "$lib/api/evaluaciones/evaluaciones";
  import { createToast } from "$lib/utils/toast";
  import { browser } from "$app/environment";

  // Stores reactivos
  const evaluacion = writable(null);
  const intento = writable(null);
  const respuestas = writable({});
  const marcadas = writable({});
  const loading = writable(true);
  const submitting = writable(false);
  const error = writable(null);
  const showConfirmation = writable(false);
  const tiempoRestante = writable(0);
  const progreso = writable(0);
  const hayIntentoEnCurso = writable(false);

  // Stores derivados
  const tiempoRestanteFormatted = derived(tiempoRestante, ($tiempoRestante) =>
    formatTime($tiempoRestante)
  );
  const tiempoRestantePorcentaje = derived(
    [tiempoRestante, evaluacion],
    ([$tiempoRestante, $evaluacion]) => {
      return ($tiempoRestante / ($evaluacion?.tiempo_limite * 60 || 1)) * 100;
    }
  );

  let intervaloCronometro;
  let authToken;
  let mathJaxReady = false;
  let id;

  $: id = $page.params.id;
  $: authToken = $sessionStore.access ? `Bearer ${$sessionStore.access}` : "";

  async function loadMathJax() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
      script.async = true;
      script.onload = () => {
        window.MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [
              ["$", "$"],
              ["\\(", "\\)"],
            ],
            displayMath: [
              ["$$", "$$"],
              ["\\[", "\\]"],
            ],
            processEscapes: true,
          },
        });
        mathJaxReady = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function renderMathJax() {
    if (!mathJaxReady || !browser) return;

    if (typeof MathJax.Hub.Queue === "function") {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    } else {
      console.warn(
        "MathJax.Hub.Queue is not available. Equations may not render properly."
      );
    }
  }

  onMount(async () => {
    try {
      await loadMathJax();
    } catch (error) {
      console.error("Error loading MathJax:", error);
    }

    if (!id) {
      error.set("ID de evaluación no proporcionado");
      loading.set(false);
      return;
    }
    if (!authToken) {
      error.set("No se pudo autenticar. Por favor, inicia sesión nuevamente.");
      loading.set(false);
      return;
    }
    try {
      const [evaluacionData, intentoData] = await Promise.all([
        getEvaluacionById(id, authToken),
        obtenerIntento(id, authToken),
      ]);

      if (!evaluacionData) {
        throw new Error("No se pudo cargar la evaluación");
      }

      evaluacion.set(evaluacionData);
      intento.set(intentoData);
      if(intentoData.id){
        hayIntentoEnCurso.set(true);
      }
      tiempoRestante.set(intentoData.tiempo_restante_guardado || evaluacionData.tiempo_limite * 60);
      respuestas.set(intentoData?.respuestas || {});
      iniciarCronometro();
      calcularProgreso();

      await renderMathJax();
    } catch (err) {
      console.error("Error al cargar la evaluación:", err);
      error.set(err.message || "Error desconocido al cargar la evaluación");
    } finally {
      loading.set(false);
    }
  });

  afterUpdate(async () => {
    await renderMathJax();
  });

  onDestroy(() => {
    if (intervaloCronometro) {
      clearInterval(intervaloCronometro);
    }
  });

  function iniciarCronometro() {
    if (intervaloCronometro) clearInterval(intervaloCronometro);

    intervaloCronometro = setInterval(() => {
      tiempoRestante.update((tr) => {
        if (tr > 0) {
          return tr - 1;
        } else {
          clearInterval(intervaloCronometro);
          handleSubmit(true);
          return 0;
        }
      });
    }, 1000);
  }

  async function iniciarNuevoIntentoWrapper() {
    try {
      const nuevoIntento = await iniciarNuevoIntento(id, authToken);
      intento.set(nuevoIntento);
      hayIntentoEnCurso.set(true); // Actualiza el estado para indicar que hay un intento en curso
      tiempoRestante.set(get(evaluacion).tiempo_limite * 60); // Restablece el tiempo al límite de la evaluación
      respuestas.set({}); // Limpia las respuestas anteriores
      iniciarCronometro();
      calcularProgreso();
      createToast("Nuevo intento iniciado correctamente", "success");
    } catch (error) {
      console.error("Error al iniciar nuevo intento:", error);
      createToast(error.message, "error");
    }
  }

  async function continuarIntento() {
    try {
        // Aquí, simplemente actualizamos el estado local con el intento actual,
        // ya que los datos del intento ya se cargaron en onMount
        hayIntentoEnCurso.set(true);
        tiempoRestante.set(get(intento).tiempo_restante_guardado);
        respuestas.set(get(intento).respuestas);

        iniciarCronometro();
        calcularProgreso();
        createToast("Continuando con el intento actual", "success");
    } catch (error) {
        console.error("Error al continuar el intento:", error);
        createToast(error.message, "error");
    }
}

  async function handleSubmit(esAutomatico = false) {
    if (!esAutomatico && !$showConfirmation) {
      showConfirmation.set(true);
      return;
    }

    submitting.set(true);
    showConfirmation.set(false);

    try {
      const intentoActual = get(intento);
      const respuestasActuales = get(respuestas);
      const evaluacionActual = get(evaluacion);

      if (!intentoActual.id) {
        throw new Error("ID de intento no disponible");
      }

      const preguntasSinResponder = evaluacionActual.preguntas.filter(
        (pregunta) => !respuestasActuales[pregunta.id]
      );

      if (preguntasSinResponder.length > 0 && !esAutomatico) {
        const confirmar = await new Promise((resolve) => {
          createToast(
            `Tienes ${preguntasSinResponder.length} pregunta(s) sin responder. ¿Deseas enviar de todos modos?`,
            "warning",
            null,
            true,
            () => resolve(true),
            () => resolve(false)
          );
        });

        if (!confirmar) {
          submitting.set(false);
          return;
        }
      }

      const resultado = await enviarEvaluacion(
        id,
        intentoActual.id,
        respuestasActuales,
        authToken
      );
      createToast("Evaluación enviada con éxito", "success");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      goto(`/evaluaciones/${id}/resultados`, { replaceState: true });
    } catch (err) {
      console.error("Error al enviar la evaluación:", err);
      createToast(`Error al enviar la evaluación: ${err.message}`, "error");
    } finally {
      submitting.set(false);
    }
  }

  function cancelSubmit() {
    showConfirmation.set(false);
  }

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function toggleMarca(index) {
    marcadas.update((m) => ({ ...m, [index]: !m[index] }));
  }

  function getImageUrl(path) {
    return path.startsWith("http") ? path : `/api/media/${path}`;
  }

  function calcularProgreso() {
    const evaluacionActual = get(evaluacion);
    const respuestasActuales = get(respuestas);
    const totalPreguntas = evaluacionActual?.preguntas.length || 0;
    const preguntasRespondidas = Object.keys(respuestasActuales).filter(
      (key) =>
        respuestasActuales[key] !== null &&
        respuestasActuales[key] !== undefined &&
        respuestasActuales[key] !== ""
    ).length;
    progreso.set((preguntasRespondidas / totalPreguntas) * 100);
  }

  function handleRespuesta(event, preguntaId) {
    respuestas.update((r) => ({ ...r, [preguntaId]: event.target.value }));
    calcularProgreso();
  }

  function handleRespuestaMultiple(event, preguntaId) {
    respuestas.update((r) => {
      const respuestasActuales = r[preguntaId] || [];
      if (event.target.checked) {
        return {
          ...r,
          [preguntaId]: [...respuestasActuales, event.target.value],
        };
      } else {
        return {
          ...r,
          [preguntaId]: respuestasActuales.filter(
            (v) => v !== event.target.value
          ),
        };
      }
    });
    calcularProgreso();
  }

  async function reportarPregunta(preguntaId) {
  try {
    await fetch(`http://localhost:8000/api/preguntas/${preguntaId}/reportar/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({ intento_id: get(intento).id }),
    });
    createToast("Problema reportado. Gracias por tu feedback.", "success");
  } catch (error) {
    console.error("Error al reportar la pregunta:", error);
    createToast("Error al reportar el problema", "error");
  }
}

function confirmarInicioEvaluacion() {
  if (get(hayIntentoEnCurso)) {
    continuarIntento();
  } else {
    iniciarNuevoIntentoWrapper();
  }
}

</script>

<svelte:head>
  <title>
    {$evaluacion?.titulo || "Presentar Evaluación"} | Sistema de Evaluaciones
  </title>
</svelte:head>

<div class="evaluacion-presentar">
  {#if $loading}
    <div class="loading" in:fade={{ duration: 300 }}>
      <div class="spinner"></div>
      <p>Cargando evaluación...</p>
    </div>
  {:else if $error}
    <div class="error" in:fade={{ duration: 300 }}>
      <span class="icon" aria-hidden="true">⚠️</span>
      <p>{$error}</p>
    </div>
  {:else if $evaluacion}
  <div class="accion-evaluacion">
    <button class="btn" on:click={confirmarInicioEvaluacion} disabled={$submitting}>
      <span class="icon" aria-hidden="true">{get(hayIntentoEnCurso) ? '🔄' : '▶️'}</span>
      {get(hayIntentoEnCurso) ? 'Continuar Evaluación' : 'Iniciar Evaluación'}
    </button>
  </div>
    <div
      class="evaluacion-content"
      in:fly={{ y: 20, duration: 300, easing: backOut }}
    >
      <header class="evaluacion-header">
        <h1 class="evaluacion-titulo">{$evaluacion.titulo}</h1>
        <div
          class="cronometro"
          class:warning={$tiempoRestante < 300}
          aria-label="Tiempo restante: {$tiempoRestanteFormatted}"
        >
          <div
            class="tiempo-barra"
            style="width: {$tiempoRestantePorcentaje}%"
          ></div>
          <span class="tiempo-texto">
            <span class="icon" aria-hidden="true">⏱️</span>
            {$tiempoRestanteFormatted}
          </span>
        </div>
      </header>

      <div class="main-container">
        <aside class="sidebar" in:fly={{ x: -20, duration: 300, delay: 150 }}>
          <nav class="pregunta-nav">
            {#each $evaluacion.preguntas as _, index}
              <button
                class="pregunta-btn {$respuestas[
                  $evaluacion.preguntas[index].id
                ]
                  ? 'answered'
                  : ''} {$marcadas[index] ? 'marked' : ''}"
                on:click={() =>
                  document
                    .getElementById(`pregunta-${index}`)
                    ?.scrollIntoView({ behavior: "smooth" })}
                aria-label="Ir a la pregunta {index + 1}"
              >
                {index + 1}
              </button>
            {/each}
          </nav>
          <div
            class="progreso-container"
            aria-label="Progreso de la evaluación: {Math.round($progreso)}%"
          >
            <div class="progreso-barra" style="width: {$progreso}%"></div>
            <span class="progreso-texto"
              >{Math.round($progreso)}% completado</span
            >
          </div>
        </aside>

        <main
          class="main-content"
          in:fly={{ x: 20, duration: 300, delay: 150 }}
        >
          {#each $evaluacion.preguntas as pregunta, index}
            <div
              id="pregunta-{index}"
              class="pregunta-container"
              in:fade={{ duration: 200 }}
            >
              <div class="pregunta-header">
                <h2>Pregunta {index + 1} de {$evaluacion.preguntas.length}</h2>
                <div class="pregunta-actions">
                  <button
                    class="btn btn-mark"
                    on:click={() => toggleMarca(index)}
                    aria-label="{$marcadas[index]
                      ? 'Desmarcar'
                      : 'Marcar'} pregunta {index + 1}"
                    aria-pressed={$marcadas[index]}
                  >
                    <span class="icon" aria-hidden="true">🚩</span>
                    {$marcadas[index] ? "Desmarcar" : "Marcar"}
                  </button>
                  <button
                    class="btn btn-report"
                    on:click={() => reportarPregunta(pregunta.id)}
                  >
                    Reportar problema
                  </button>
                </div>
              </div>

              <div class="pregunta-body">
                <div class="pregunta-texto math-content">
                  {@html pregunta.texto_pregunta}
                </div>
                {#if pregunta.imagen_svg}
                  <div class="imagen-pregunta">
                    <img
                      loading="lazy"
                      src={getImageUrl(pregunta.imagen_svg)}
                      alt="Imagen ilustrativa de la pregunta {index + 1}"
                    />
                  </div>
                {/if}

                <div class="opciones">
                  {#if pregunta.tipo_pregunta === "Simple"}
                    {#each pregunta.opciones as opcion (opcion.id)}
                      <label class="opcion">
                        <input
                          type="radio"
                          name={`pregunta_${pregunta.id}`}
                          value={opcion.id}
                          checked={$respuestas[pregunta.id] === opcion.id}
                          on:change={(event) =>
                            handleRespuesta(event, pregunta.id)}
                        />
                        <div class="opcion-content math-content">
                          {@html opcion.texto_opcion}
                        </div>
                      </label>
                    {/each}
                  {:else if pregunta.tipo_pregunta === "Múltiple"}
                    {#each pregunta.opciones as opcion (opcion.id)}
                      <label class="opcion">
                        <input
                          type="checkbox"
                          value={opcion.id}
                          checked={$respuestas[pregunta.id]?.includes(
                            opcion.id
                          )}
                          on:change={(event) =>
                            handleRespuestaMultiple(event, pregunta.id)}
                        />
                        <div class="opcion-content math-content">
                          {@html opcion.texto_opcion}
                        </div>
                      </label>
                    {/each}
                  {:else if pregunta.tipo_pregunta === "Verdadero/Falso"}
                    <label class="opcion">
                      <input
                        type="radio"
                        name={`pregunta_${pregunta.id}`}
                        value="true"
                        checked={$respuestas[pregunta.id] === "true"}
                        on:change={(event) =>
                          handleRespuesta(event, pregunta.id)}
                      />
                      <div class="opcion-content">Verdadero</div>
                    </label>
                    <label class="opcion">
                      <input
                        type="radio"
                        name={`pregunta_${pregunta.id}`}
                        value="false"
                        checked={$respuestas[pregunta.id] === "false"}
                        on:change={(event) =>
                          handleRespuesta(event, pregunta.id)}
                      />
                      <div class="opcion-content">Falso</div>
                    </label>
                  {:else if pregunta.tipo_pregunta === "Abierta"}
                    <textarea
                      class="respuesta-abierta"
                      value={$respuestas[pregunta.id] || ""}
                      on:input={(event) => handleRespuesta(event, pregunta.id)}
                      aria-label="Respuesta para la pregunta {index + 1}"
                    ></textarea>
                  {/if}
                </div>

                <div class="puntaje-pregunta">
                  {pregunta.puntos} puntos
                </div>
              </div>
            </div>
          {/each}

          <div class="submit-container">
            <button
              type="button"
              class="btn btn-submit"
              on:click={() => handleSubmit()}
              disabled={$submitting}
              aria-label="Terminar y enviar evaluación"
            >
              <span class="icon" aria-hidden="true">✅</span>
              {$submitting ? "Enviando..." : "Terminar evaluación"}
            </button>
          </div>
        </main>
      </div>
    </div>
  {/if}
</div>
{#if $showConfirmation}
  <div
    class="modal"
    in:fade={{ duration: 300 }}
    role="dialog"
    aria-labelledby="confirmation-title"
  >
    <div
      class="modal-content"
      in:fly={{ y: 20, duration: 300, easing: backOut }}
    >
      <h2 id="confirmation-title">
        ¿Estás seguro de que deseas enviar la evaluación?
      </h2>
      <p>Una vez enviada, no podrás realizar cambios.</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={cancelSubmit}
          >Cancelar</button
        >
        <button class="btn btn-primary" on:click={() => handleSubmit(true)}
          >Confirmar</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
 

  .evaluacion-presentar {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: var(--background-color);
    color: var(--text-color);
    font-family: 'Inter', sans-serif;
  }

  .loading,
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    text-align: center;
  }

  .spinner {
    border: 3px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: var(--primary-color);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .evaluacion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background-color: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .evaluacion-titulo {
    font-size: 1.5rem;
    color: var(--text-color);
    margin: 0;
    font-weight: 600;
  }

  .cronometro {
    background-color: var(--background-color);
    border-radius: 16px;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    min-width: 120px;
    font-weight: 500;
  }

  .cronometro.warning {
    background-color: var(--warning-color);
    color: var(--card-background);
  }

  .tiempo-barra {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: var(--primary-color);
    opacity: 0.2;
    transition: width 1s linear;
  }

  .tiempo-texto {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .main-container {
    display: flex;
    gap: 1.5rem;
  }

  .sidebar {
    flex: 0 0 180px;
    position: sticky;
    top: 80px;
    height: calc(100vh - 80px);
    overflow-y: auto;
  }

  .pregunta-nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .pregunta-btn {
    width: 100%;
    aspect-ratio: 1;
    border: none;
    background-color: var(--background-color);
    color: var(--text-color);
    font-weight: 500;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    font-size: 0.875rem;
  }

  .pregunta-btn.answered {
    background-color: var(--success-color);
    color: var(--card-background);
  }

  .pregunta-btn.marked {
    border: 2px solid var(--accent-color);
  }

  .progreso-container {
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    padding: 0.75rem;
  }

  .progreso-barra {
    height: 6px;
    background-color: var(--success-color);
    transition: width 0.3s ease;
    border-radius: var(--border-radius);
  }

  .progreso-texto {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-color);
    margin-top: 0.5rem;
    font-weight: 500;
  }

  .main-content {
    flex: 1;
  }

  .pregunta-container {
    background-color: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    transition: var(--transition);
  }

  .pregunta-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .pregunta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--background-color);
    padding-bottom: 0.75rem;
  }

  .pregunta-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border: none;
    font-size: 0.875rem;
  }

  .btn-mark {
    background-color: transparent;
    border: 1px solid var(--accent-color);
    color: var(--accent-color);
  }

  .btn-mark:hover {
    background-color: var(--accent-color);
    color: var(--card-background);
  }

  .btn-report {
    background-color: var(--secondary-color);
    color: var(--card-background);
  }

  .btn-report:hover {
    opacity: 0.9;
  }

  .pregunta-body {
    margin-bottom: 1.5rem;
  }

  .pregunta-texto {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .imagen-pregunta {
    max-width: 100%;
    margin-bottom: 1rem;
    text-align: center;
  }

  .imagen-pregunta img {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .opciones {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .opcion {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
  }

  .opcion:hover {
    background-color: var(--primary-color);
    color: var(--card-background);
  }

  .opcion input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .opcion-content {
    flex: 1;
  }

  .respuesta-abierta {
    width: 100%;
    min-height: 120px;
    padding: 0.75rem;
    border: 1px solid var(--background-color);
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    line-height: 1.5;
    resize: vertical;
    transition: var(--transition);
  }

  .respuesta-abierta:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(26, 54, 93, 0.2);
  }

  .puntaje-pregunta {
    margin-top: 0.75rem;
    font-weight: 500;
    color: var(--success-color);
    text-align: right;
  }

  .submit-container {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .btn-submit {
    background-color: var(--success-color);
    color: var(--card-background);
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }

  .btn-submit:hover {
    background-color: #226f4b;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .btn-submit:disabled {
    background-color: #718096;
    cursor: not-allowed;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--card-background);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    max-width: 400px;
    width: 100%;
    box-shadow: var(--box-shadow);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .btn-secondary {
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .btn-primary {
    background-color: var(--primary-color);
    color: var(--card-background);
  }

  @media (max-width: 768px) {
    .evaluacion-presentar {
      padding: 1rem;
    }
    .main-container {
      flex-direction: column;
    }

    .sidebar {
      position: static;
      width: 100%;
      height: auto;
      margin-bottom: 1.5rem;
    }

    .btn {
      padding: 0.5rem 0.75rem;
    }

    .modal-content {
      padding: 1rem;
      margin: 0 1rem;
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

  @media (prefers-color-scheme: dark) {
    :global(:root) {
      --background-color: #1a202c;
      --text-color: #e2e8f0;
      --card-background: #2d3748;
      --primary-color: #4299e1;
      --secondary-color: #63b3ed;
    }

    .opcion {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .opcion:hover {
      background-color: rgba(66, 153, 225, 0.2);
    }

    .btn-mark {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .btn-mark:hover {
      background-color: var(--accent-color);
      color: var(--text-color);
    }

    .btn-report {
      background-color: var(--secondary-color);
    }

    .btn-submit {
      background-color: var(--success-color);
    }

    .btn-submit:hover {
      background-color: #38a169;
    }

    .btn-submit:disabled {
      background-color: #4a5568;
    }
  }

  /* Mejoras de accesibilidad */
  *:focus {
    outline: 3px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Mejoras de rendimiento */
  .pregunta-container {
    contain: content;
  }

  /* Animaciones optimizadas */
  @media (prefers-reduced-motion: no-preference) {
    .pregunta-container {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      will-change: transform, box-shadow;
    }
    .btn {
      transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
      will-change: background-color, transform, box-shadow;
    }
  }

  /* Estilos específicos para MathJax */
  :global(.math-content) {
    overflow-x: auto;
    max-width: 100%;
    margin: 0.75em 0;
  }
  :global(.MathJax) {
    font-size: 1em !important;
  }

  /* Mejoras de accesibilidad adicionales */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Estilos para mejorar la legibilidad en pantallas grandes */
  @media (min-width: 1200px) {
    .evaluacion-presentar {
      font-size: 16px;
    }

    .evaluacion-titulo {
      font-size: 1.75rem;
    }

    .pregunta-texto {
      font-size: 1.125rem;
    }
  }

  /* Animaciones suaves para elementos interactivos */
  .btn,
  .opcion,
  .pregunta-btn {
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .btn:active,
  .opcion:active,
  .pregunta-btn:active {
    transform: scale(0.98);
  }

  /* Estilos para mejorar la apariencia de los inputs */
  input[type="radio"],
  input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid var(--primary-color);
    border-radius: 50%;
    outline: none;
    transition: all 0.2s ease;
  }
  input[type="checkbox"] {
    border-radius: 3px;
  }
  input[type="radio"]:checked,
  input[type="checkbox"]:checked {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }
  input[type="radio"]:checked::before,
  input[type="checkbox"]:checked::before {
    content: '\2713';
    display: block;
    text-align: center;
    color: var(--card-background);
    font-size: 12px;
    line-height: 16px;
  }

  /* Efecto de hover para los botones de navegación */
  .btn-nav:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Estilo para resaltar la pregunta actual */
  .pregunta-container {
    position: relative;
  }
  .pregunta-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background-color: var(--primary-color);
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .pregunta-container:focus-within::before {
    opacity: 1;
  }

  /* Mejora en la visualización del cronómetro */
  .cronometro {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* Efecto de hover para las opciones de respuesta */
  .opcion:hover {
    transform: translateX(3px);
  }

  /* Estilo para el botón de enviar cuando está listo */
  .btn-submit:not(:disabled) {
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(47, 133, 90, 0.4);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(47, 133, 90, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(47, 133, 90, 0);
    }
  }
  .accion-evaluacion {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
</style>
      