<script>
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { sessionStore } from '$lib/stores/sessionStore';
  import {
    getEvaluacionById,
    obtenerIntento,
    finalizarIntento,
    iniciarNuevoIntento
  } from '$lib/api/evaluaciones/evaluaciones';
  import { format, isAfter, isBefore, parseISO, differenceInSeconds } from 'date-fns';
  import { es } from 'date-fns/locale';
  import Icon from '@iconify/svelte';
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { backOut, elasticOut } from 'svelte/easing';
  import { spring } from 'svelte/motion';
  import { Linear } from 'svelte/easing';

  let evaluacion = null;
  let intentosRealizados = 0;
  let mejorIntento = null;
  let intentoActivo = null;
  let loading = true;
  let error = null;
  let tiempoRestante = 0;
  let tiempoTranscurrido = 0;
  let estadoEvaluacion = 'no_iniciada';
  let showConfirmacion = false;
  let tiempoInicio = null;
  let expandedSection = null;

  let authToken;
  let evaluacionId;

  const progressSpring = spring(0, {
    stiffness: 0.1,
    damping: 0.25
  });

  onMount(async () => {
    authToken = $sessionStore.access;
    evaluacionId = $page.params.id;

    try {
      await cargarDatosEvaluacion();
      iniciarContadorTiempo();
    } catch (err) {
      mostrarError('Error al cargar los datos de la evaluación', err);
    } finally {
      loading = false;
    }
  });

  function getEstadoText(estado) {
    switch (estado) {
      case 'no_iniciada':
        return 'No iniciada';
      case 'disponible':
        return 'Disponible';
      case 'en_curso':
        return 'En curso';
      case 'finalizada':
        return 'Finalizada';
      case 'expirada':
        return 'Expirada';
      default:
        return 'Estado desconocido';
    }
  }

  function getEstadoIcon(estado) {
    switch (estado) {
      case 'no_iniciada':
        return 'mdi:information';
      case 'disponible':
        return 'mdi:play';
      case 'en_curso':
        return 'mdi:clock';
      case 'finalizada':
        return 'mdi:check-circle';
      case 'expirada':
        return 'mdi:timer-off';
      default:
        return 'mdi:help-circle';
    }
  }

  async function cargarDatosEvaluacion() {
    try {
      const [evaluacionResult, intentoData] = await Promise.all([
        getEvaluacionById(evaluacionId, authToken),
        obtenerIntento(evaluacionId, authToken)
      ]);

      if (evaluacionResult) {
        evaluacion = evaluacionResult;
        intentosRealizados = evaluacionResult.intentos_realizados || 0;
        intentoActivo = intentoData.id ? intentoData : null;
        mejorIntento = intentoData.mejor_intento || null;

        if (intentoActivo && intentoActivo.estado === 'en_curso') {
          tiempoInicio = new Date(intentoActivo.fecha_inicio);
          const ahora = new Date();
          tiempoTranscurrido = Math.floor((ahora - tiempoInicio) / 1000);
        }

        actualizarEstadoEvaluacion();
      } else {
        throw new Error('No se pudo cargar la evaluación.');
      }
    } catch (err) {
      throw new Error('Error al cargar los datos de la evaluación: ' + err.message);
    }
  }

  function actualizarEstadoEvaluacion() {
    const ahora = new Date();
    const fechaInicio = parseISO(evaluacion.fecha_inicio);
    const fechaFin = parseISO(evaluacion.fecha_fin);

    if (intentoActivo && intentoActivo.estado === 'en_curso') {
      estadoEvaluacion = 'en_curso';
      tiempoRestante = Math.max(0, evaluacion.tiempo_limite * 60 - tiempoTranscurrido);
    } else if (isAfter(ahora, fechaFin)) {
      estadoEvaluacion = 'expirada';
    } else if (isBefore(ahora, fechaInicio)) {
      estadoEvaluacion = 'no_iniciada';
    } else if (intentosRealizados >= evaluacion.intentos_permitidos) {
      estadoEvaluacion = 'finalizada';
    } else {
      estadoEvaluacion = 'disponible';
      tiempoRestante = Math.max(0, differenceInSeconds(fechaFin, ahora));
    }

    progressSpring.set(calcularProgreso());
  }

  function calcularProgreso() {
    if (estadoEvaluacion === 'no_iniciada') return 0;
    if (estadoEvaluacion === 'expirada' || estadoEvaluacion === 'finalizada') return 100;
    
    const ahora = new Date();
    const inicio = parseISO(evaluacion.fecha_inicio);
    const fin = parseISO(evaluacion.fecha_fin);
    const totalDuracion = differenceInSeconds(fin, inicio);
    const transcurrido = differenceInSeconds(ahora, inicio);
    
    return Math.min((transcurrido / totalDuracion) * 100, 100);
  }

  async function iniciarOContinuarEvaluacion() {
    if (estadoEvaluacion === 'no_iniciada') {
      mostrarError('La evaluación aún no está disponible', 'Por favor, espera hasta la fecha de inicio.');
      return;
    }

    if (estadoEvaluacion === 'disponible' || estadoEvaluacion === 'en_curso') {
      showConfirmacion = true;
    } else if (estadoEvaluacion === 'finalizada') {
      mostrarInfo('Evaluación finalizada', 'Has completado todos los intentos permitidos para esta evaluación.');
      if (evaluacion.resultados_visibles) {
        ofrecerVerResultados();
      }
    } else if (estadoEvaluacion === 'expirada') {
      mostrarInfo('Evaluación expirada', 'Esta evaluación ha expirado y ya no está disponible.');
      if (evaluacion.mostrar_resultados) {
        ofrecerVerResultados();
      }
    }
  }

  async function confirmarInicioEvaluacion() {
    try {
      if (intentosRealizados >= evaluacion.intentos_permitidos) {
        mostrarError('Límite de intentos alcanzado', 'Has alcanzado el límite de intentos permitidos para esta evaluación.');
        return;
      }

      if (estadoEvaluacion === 'disponible') {
        intentoActivo = await iniciarNuevoIntento(evaluacionId, authToken);
        tiempoInicio = new Date();
      }

      estadoEvaluacion = 'en_curso';
      tiempoTranscurrido = 0;
      tiempoRestante = evaluacion.tiempo_limite * 60;
      mostrarExito('Evaluación iniciada', 'La evaluación ha sido iniciada correctamente');
      goto(`/evaluaciones/${evaluacion.id}/presentar`);
    } catch (err) {
      mostrarError('Error al iniciar la evaluación', err.message);
    } finally {
      showConfirmacion = false;
    }
  }

  async function finalizarEvaluacion() {
    if (estadoEvaluacion === 'en_curso') {
      try {
        await finalizarIntento(intentoActivo.id, authToken);
        mostrarExito('Evaluación finalizada', 'La evaluación ha sido finalizada correctamente');
        await cargarDatosEvaluacion();
      } catch (err) {
        mostrarError('Error al finalizar la evaluación', err.message);
      }
    } else {
      mostrarError('No hay evaluación en curso', 'No hay una evaluación en curso para finalizar.');
    }
  }

  function formatDate(date) {
    return format(parseISO(date), "EEEE d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function iniciarContadorTiempo() {
    const actualizarTiempo = () => {
      if (estadoEvaluacion === 'en_curso') {
        const ahora = Date.now();
        tiempoTranscurrido = Math.floor((ahora - tiempoInicio) / 1000);
        tiempoRestante = Math.max(0, evaluacion.tiempo_limite * 60 - tiempoTranscurrido);

        if (tiempoRestante <= 0) {
          finalizarEvaluacion();
        }
      } else if (estadoEvaluacion === 'disponible') {
        const ahora = new Date();
        const fechaFin = parseISO(evaluacion.fecha_fin);
        tiempoRestante = Math.max(0, differenceInSeconds(fechaFin, ahora));

        if (tiempoRestante <= 0) {
          actualizarEstadoEvaluacion();
        }
      }
      progressSpring.set(calcularProgreso());
    };

    const intervalId = setInterval(actualizarTiempo, 1000);

    onDestroy(() => {
      clearInterval(intervalId);
    });
  }

  function toggleSection(section) {
    expandedSection = expandedSection === section ? null : section;
  }

  function goBack() {
    goto('/evaluaciones');
  }

  function goToResultados() {
    goto(`/evaluaciones/${evaluacion.id}/resultados`);
  }

  function ofrecerVerResultados() {
    // Implementa esta función según tus necesidades
  }

  function mostrarExito(titulo, mensaje) {
    // Implementa esta función según tus necesidades
  }

  function mostrarError(titulo, mensaje) {
    // Implementa esta función según tus necesidades
  }

  function mostrarInfo(titulo, mensaje) {
    // Implementa esta función según tus necesidades
  }

  $: puedeVerResultados = evaluacion && (
    (evaluacion.resultados_visibles && intentosRealizados > 0) ||
    (evaluacion.mostrar_resultados && new Date() > parseISO(evaluacion.fecha_fin))
  );

  $: porcentajeAprobacion = mejorIntento && evaluacion
    ? (mejorIntento.puntaje_obtenido / evaluacion.puntaje_maximo) * 100
    : 0;

  $: aprobado = evaluacion && porcentajeAprobacion >= evaluacion.criterios_aprobacion;
</script>

<svelte:head>
  <title>{evaluacion?.titulo || 'Detalles de la Evaluación'} | Sistema de Evaluaciones</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="evaluacion-detalle">
  {#if loading}
    <div class="loading" in:fade={{ duration: 300 }} role="status" aria-live="polite">
      <div class="spinner"></div>
      <p>Cargando detalles de la evaluación...</p>
    </div>
  {:else if error}
    <div class="error" in:fade={{ duration: 300 }} role="alert">
      <Icon icon="mdi:alert-circle" width="24" height="24" />
      <p>{error}</p>
      <button class="btn btn-secondary" on:click={goBack}>
        <Icon icon="mdi:arrow-left" width="20" height="20" />
        Volver
      </button>
    </div>
  {:else}
    <div class="content" in:fly={{ y: 50, duration: 500, easing: backOut }}>
      <header class="header">
        <div class="header-content">
          <h1>{evaluacion.titulo}</h1>
          <p class="subtitle">{evaluacion.tipo}</p>
        </div>
        <div class="estado-badge" class:expirada={estadoEvaluacion === 'expirada'} class:en-curso={estadoEvaluacion === 'en_curso'} class:finalizada={estadoEvaluacion === 'finalizada'} role="status" aria-live="polite">
          <Icon icon={getEstadoIcon(estadoEvaluacion)} width="24" height="24" />
          <span>{getEstadoText(estadoEvaluacion)}</span>
        </div>
      </header>

      <div class="progress-container">
        <div class="progress-bar" role="progressbar" aria-valuenow={$progressSpring} aria-valuemin="0" aria-valuemax="100">
          <div class="progress" style="width: {$progressSpring}%"></div>
        </div>
        <div class="progress-milestones">
          <div class="milestone" style="left: 50%"></div>
          <div class="milestone" style="left: 75%"></div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card fechas-importantes" in:fly={{ y: 20, duration: 300, delay: 100 }}>
          <h2>
            <Icon icon="mdi:calendar" width="24" height="24" />
            Fechas Importantes
          </h2>
          <div class="timeline">
            <div class="timeline-item start">
              <Icon icon="mdi:calendar-start" width="20" height="20" />
              <div>
                <strong>Inicio:</strong>
                <span>{formatDate(evaluacion.fecha_inicio)}</span>
              </div>
            </div>
            <div class="timeline-item end">
              <Icon icon="mdi:calendar-end" width="20" height="20" />
              <div>
                <strong>Fin:</strong>
                <span>{formatDate(evaluacion.fecha_fin)}</span>
              </div>
            </div>
          </div>
          <div class="countdown">
            <Icon icon="mdi:clock-outline" width="24" height="24" />
            <span>{formatTime(tiempoRestante)}</span>
          </div>
        </div>

        <div class="info-card detalles-evaluacion" in:fly={{ y: 20, duration: 300, delay: 200 }}>
          <h2>
            <Icon icon="mdi:information" width="24" height="24" />
            Detalles de la Evaluación
          </h2>
          <div class="detail-grid">
            <div class="detail-item">
              <Icon icon="mdi:clock-outline" width="20" height="20" />
              <div>
                <strong>Duración:</strong>
                <span>{evaluacion.tiempo_limite} minutos</span>
              </div>
            </div>
            <div class="detail-item">
              <Icon icon="mdi:refresh" width="20" height="20" />
              <div>
                <strong>Intentos permitidos:</strong>
                <span>{evaluacion.intentos_permitidos}</span>
              </div>
            </div>
            <div class="detail-item">
              <Icon icon="mdi:percent" width="20" height="20" />
              <div>
                <strong>Ponderación:</strong>
                <span>{evaluacion.ponderacion}%</span>
              </div>
            </div>
            <div class="detail-item">
              <Icon icon="mdi:check-circle" width="20" height="20" />
              <div>
                <strong>Aprobación:</strong>
                <span>{evaluacion.criterios_aprobacion}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-card progreso" in:fly={{ y: 20, duration: 300, delay: 300 }}>
          <h2>
            <Icon icon="mdi:trophy" width="24" height="24" />
            Progreso
          </h2>
          <div class="progress-info">
            <div class="progress-item">
              <strong>Intentos realizados:</strong>
              <span>{intentosRealizados} / {evaluacion.intentos_permitidos}</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: {(intentosRealizados / evaluacion.intentos_permitidos) * 100}%"></div>
            </div>
          </div>
        </div>

        {#if mejorIntento}
          <div class="info-card mejor-intento" in:fly={{ y: 20, duration: 300, delay: 400 }}>
            <h2>
              <Icon icon="mdi:star" width="24" height="24" />
              Mejor Resultado
            </h2>
            <div class="result-info">
              <div class="result-item">
                <strong>Puntaje obtenido:</strong>
                <span>{mejorIntento.puntaje_obtenido} / {evaluacion.puntaje_maximo}</span>
              </div>
              <div class="result-item">
                <strong>Porcentaje:</strong>
                <span>{porcentajeAprobacion.toFixed(2)}%</span>
              </div>
              <div class="result-item">
                <strong>Estado:</strong>
                <span class={aprobado ? 'aprobado' : 'reprobado'}>
                  {aprobado ? 'Aprobado' : 'Reprobado'}
                </span>
              </div>
            </div>
            <div class="result-progress-bar" role="progressbar" aria-valuenow={porcentajeAprobacion} aria-valuemin="0" aria-valuemax="100">
              <div class="result-progress" style="width: {porcentajeAprobacion}%"></div>
            </div>
          </div>
        {/if}
      </div>

      <div class="expandable-sections">
        <div class="expandable-section">
          <button class="expandable-header" on:click={() => toggleSection('descripcion')}>
            <h2>
              <Icon icon="mdi:text" width="24" height="24" />
              Descripción
            </h2>
            <Icon icon={expandedSection === 'descripcion' ? 'mdi:chevron-up' : 'mdi:chevron-down'} width="24" height="24" />
          </button>
          {#if expandedSection === 'descripcion'}
            <div class="expandable-content" transition:slide|local>
              {@html evaluacion.descripcion}
            </div>
          {/if}
        </div>

        <div class="expandable-section">
          <button class="expandable-header" on:click={() => toggleSection('rubrica')}>
            <h2>
              <Icon icon="mdi:table" width="24" height="24" />
              Rúbrica
            </h2>
            <Icon icon={expandedSection === 'rubrica' ? 'mdi:chevron-up' : 'mdi:chevron-down'} width="24" height="24" />
          </button>
          {#if expandedSection === 'rubrica'}
            <div class="expandable-content" transition:slide|local>
              {@html evaluacion.rubrica}
            </div>
          {/if}
        </div>
      </div>

      <div class="actions" in:fly={{ y: 20, duration: 300, delay: 500 }}>
        {#if estadoEvaluacion === 'no_iniciada'}
          <button class="btn btn-disabled" disabled aria-disabled="true">
            <Icon icon="mdi:information" width="20" height="20" />
            Evaluación no disponible
          </button>
        {:else if estadoEvaluacion === 'disponible'}
          <button class="btn btn-primary" on:click={iniciarOContinuarEvaluacion}>
            <Icon icon="mdi:play" width="20" height="20" />
            Iniciar Evaluación
          </button>
        {:else if estadoEvaluacion === 'en_curso'}
          <button class="btn btn-primary" on:click={iniciarOContinuarEvaluacion}>
            <Icon icon="mdi:play" width="20" height="20" />
            Continuar Evaluación
          </button>
          <button class="btn btn-danger" on:click={finalizarEvaluacion}>
            <Icon icon="mdi:check-circle" width="20" height="20" />
            Finalizar Evaluación
          </button>
        {:else if estadoEvaluacion === 'expirada'}
          <p class="mensaje-warning">
            <Icon icon="mdi:alert" width="20" height="20" />
            Esta evaluación ha expirado y ya no está disponible.
          </p>
        {:else if estadoEvaluacion === 'finalizada'}
          <p class="mensaje-info">
            <Icon icon="mdi:information" width="20" height="20" />
            Has completado todos los intentos permitidos para esta evaluación.
          </p>
        {/if}

        {#if puedeVerResultados}
          <button class="btn btn-secondary" on:click={goToResultados}>
            <Icon icon="mdi:chart-bar" width="20" height="20" />
            Ver Resultados
          </button>
        {/if}

        <button class="btn btn-outline" on:click={goBack}>
          <Icon icon="mdi:arrow-left" width="20" height="20" />
          Volver a la lista de evaluaciones
        </button>
      </div>
    </div>
  {/if}
</div>

{#if showConfirmacion}
  <div class="modal" in:fade={{ duration: 300 }} out:fade={{ duration: 200 }} role="dialog" aria-labelledby="confirmacion-titulo">
    <div class="modal-content" in:fly={{ y: 50, duration: 500, easing: elasticOut }}>
      <h2 id="confirmacion-titulo">
        <Icon icon="mdi:alert" width="24" height="24" />
        Confirmar inicio de evaluación
      </h2>
      <p>¿Estás seguro de que deseas iniciar la evaluación? Una vez iniciada, el tiempo comenzará a contar.</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={() => showConfirmacion = false}>Cancelar</button>
        <button class="btn btn-primary" on:click={confirmarInicioEvaluacion}>Confirmar</button>
      </div>
    </div>
  </div>
{/if}

<style>
  :root {
    --primary-color: #1E3A5F;
    --secondary-color: #E0A15D;
    --background-color: #FAF9F6;
    --text-color: #333333;
    --card-background: #FFFFFF;
    --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --transition-duration: 0.3s;
  }

  .evaluacion-detalle {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Inter', sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  .header {
    background: linear-gradient(135deg, var(--primary-color), #2C5282);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    box-shadow: var(--card-shadow);
  }

  .header-content h1 {
    font-family: 'Merriweather', serif;
    font-size: 2.5rem;
    margin: 0;
    font-weight: 700;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .header-content .subtitle {
    font-size: 1.2rem;
    opacity: 0.8;
    margin-top: 0.5rem;
  }

  .estado-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    margin-top: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .estado-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .estado-badge.expirada { background-color: #FED7D7; color: #9B2C2C; }
  .estado-badge.en-curso { background-color: #BEE3F8; color: #2B6CB0; }
  .estado-badge.finalizada { background-color: #C6F6D5; color: #2F855A; }

  .progress-container {
    position: relative;
    height: 8px;
    background-color: #E2E8F0;
    border-radius: 4px;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transition: width var(--transition-duration) ease;
  }

  .progress-milestones {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .milestone {
    position: absolute;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .info-card {
    background-color: var(--card-background);
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: var(--card-shadow);
    transition: transform var(--transition-duration) ease, box-shadow var(--transition-duration) ease;
  }

  .info-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .info-card h2 {
    font-family: 'Merriweather', serif;
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }

  .info-card h2 :global(svg) {
    margin-right: 0.5rem;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .timeline-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
  }

  .timeline-item:hover {
    transform: translateX(5px);
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .detail-item:hover {
    transform: translateY(-2px);
  }

  .progress-info, .result-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .progress-item, .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .countdown {
    font-weight: 600;
    color: var(--secondary-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
    margin-top: 1rem;
  }

  .result-progress-bar {
    height: 8px;
    background-color: #E2E8F0;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 1rem;
  }

  .result-progress {
    height: 100%;
    background-color: var(--secondary-color);
    transition: width var(--transition-duration) ease;
  }

  .expandable-sections {
    margin-bottom: 2rem;
  }

  .expandable-section {
    background-color: var(--card-background);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 1rem;
    box-shadow: var(--card-shadow);
  }

  .expandable-header {
    width: 100%;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.3s ease;
  }

  .expandable-header:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .expandable-header h2 {
    font-family: 'Merriweather', serif;
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    margin: 0;
    color: var(--primary-color);
  }

  .expandable-content {
    padding: 1rem;
    background-color: #F7FAFC;
    border-top: 1px solid #E2E8F0;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    text-align: center;
    transition: all var(--transition-duration) ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    border: none;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--primary-color), #2C5282);
    color: white;
  }

  .btn-secondary {
    background: linear-gradient(135deg, var(--secondary-color), #D69E2E);
    color: white;
  }

  .btn-danger {
    background: linear-gradient(135deg, #F56565, #C53030);
    color: white;
  }

  .btn-outline {
    background-color: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  .btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    padding: 2rem;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
    box-shadow: var(--card-shadow);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  .aprobado { color: #38A169; }
  .reprobado { color: #E53E3E; }

  .mensaje-warning,
  .mensaje-info {
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .mensaje-warning {
    background-color: #FEFCBF;
    color: #975A16;
  }

  .mensaje-info {
    background-color: #BEE3F8;
    color: #2B6CB0;
  }

  /* Animaciones */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInFromLeft {
    from { transform: translateX(-50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInFromRight {
    from { transform: translateX(50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .content {
    animation: fadeIn 0.5s ease-out;
  }

  .info-card {
    animation: slideInFromLeft 0.5s ease-out;
  }

  .actions {
    animation: slideInFromRight 0.5s ease-out;
  }

  /* Mejoras para dispositivos móviles */
  @media (max-width: 768px) {
    .evaluacion-detalle {
      padding: 1rem;
    }

    .header {
      padding: 1.5rem;
    }

    .header-content h1 {
      font-size: 2rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }

    .actions {
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }
  }

  /* Estilos para la tabla de rúbrica */
  :global(.rubrica-table) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 1rem;
    box-shadow: var(--card-shadow);
    border-radius: 8px;
    overflow: hidden;
  }

  :global(.rubrica-table th),
  :global(.rubrica-table td) {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
  }

  :global(.rubrica-table th) {
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
  }

  :global(.rubrica-table tr:last-child td) {
    border-bottom: none;
  }

  :global(.rubrica-table tr:nth-child(even)) {
    background-color: #F7FAFC;
  }

  :global(.rubrica-table tr:hover) {
    background-color: #EDF2F7;
  }

  /* Efectos de hover y focus para mejorar la accesibilidad */
  .btn:focus,
  .expandable-header:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }

  .info-card:focus-within {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5), var(--card-shadow);
  }

  /* Mejoras en la tipografía */
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Merriweather', Georgia, 'Times New Roman', Times, serif;
  }

  /* Efectos sutiles para mejorar la experiencia del usuario */
  .info-card,
  .btn,
  .expandable-header {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .info-card:hover,
  .btn:hover,
  .expandable-header:hover {
    transform: translateY(-2px);
  }

  /* Optimizaciones para carga diferida */
  .info-card,
  .expandable-section {
    contain: content;
  }

  /* Mejoras en los iconos */
  :global(svg) {
    vertical-align: middle;
  }

  /* Estilos para tooltips */
  [title] {
    position: relative;
    cursor: help;
  }

  [title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem;
    background-color: var(--primary-color);
    color: white;
    border-radius: 4px;
    font-size: 0.875rem;
    white-space: nowrap;
    z-index: 10;
  }

  /* Mejoras en la accesibilidad */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Estilos para el modo oscuro */
  @media (prefers-color-scheme: dark) {
    :root {
      --background-color: #1A202C;
      --text-color: #E2E8F0;
      --card-background: #2D3748;
      --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    .estado-badge.expirada { background-color: #63171B; color: #FED7D7; }
    .estado-badge.en-curso { background-color: #2A4365; color: #BEE3F8; }
    .estado-badge.finalizada { background-color: #1C4532; color: #C6F6D5; }

    .mensaje-warning {
      background-color: #744210;
      color: #FEFCBF;
    }

    .mensaje-info {
      background-color: #2A4365;
      color: #BEE3F8;
    }

    :global(.rubrica-table th) {
      background-color: var(--secondary-color);
    }

    :global(.rubrica-table tr:nth-child(even)) {
      background-color: #2D3748;
    }

    :global(.rubrica-table tr:hover) {
      background-color: #4A5568;
    }
  }
</style>