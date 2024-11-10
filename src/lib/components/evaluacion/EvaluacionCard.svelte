<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  import { format, differenceInSeconds, parseISO } from 'date-fns';
  import { es } from 'date-fns/locale';
  import { writable, derived } from 'svelte/store';
  import { spring } from 'svelte/motion';

  export let evaluacion;

  const evaluacionStore = writable(evaluacion);
  let cardElement;
  let error = null;
  let hovered = false;

  const state = derived(evaluacionStore, ($evaluacion) => {
    if (!$evaluacion || !$evaluacion.fecha_inicio || !$evaluacion.fecha_fin) {
      return { error: "Datos de evaluación incompletos o inválidos" };
    }

    const now = new Date();
    const start = parseISO($evaluacion.fecha_inicio);
    const end = parseISO($evaluacion.fecha_fin);

    if (now < start) {
      const timeUntilStart = differenceInSeconds(start, now);
      return {
        countdown: formatCountdown(timeUntilStart, `Comienza en `),
        progressPercentage: 0,
        isAvailable: false,
        isExpired: false
      };
    } else if (now > end) {
      return {
        countdown: { text: "Tiempo expirado" },
        progressPercentage: 100,
        isAvailable: false,
        isExpired: true
      };
    } else {
      const timeRemaining = differenceInSeconds(end, now);
      const totalDuration = differenceInSeconds(end, start);
      return {
        countdown: formatCountdown(timeRemaining, `Termina en `),
        progressPercentage: ((totalDuration - timeRemaining) / totalDuration) * 100,
        isAvailable: true,
        isExpired: false
      };
    }
  });

  $: ({ countdown, progressPercentage, isAvailable, isExpired } = $state);
  $: formattedStartDate = formatDate(evaluacion?.fecha_inicio);
  $: formattedEndDate = formatDate(evaluacion?.fecha_fin);
  $: buttonText = isExpired ? "Ver Resultados" : "Detalles";
  $: buttonIcon = isExpired ? "mdi:clipboard-text" : "mdi:arrow-right";
  $: buttonTooltip = !isAvailable ? (isExpired ? "Ver resultados de la evaluación" : "La evaluación aún no ha comenzado") : "Ir a la evaluación";

  const progress = spring(0, {
    stiffness: 0.1,
    damping: 0.25
  });

  $: progress.set(progressPercentage);

  function formatCountdown(totalSeconds, prefix = '') {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { text: `${prefix}${hours}h ${minutes}m ${seconds}s` };
  }

  function formatDate(dateString) {
    if (!dateString) return "Fecha no disponible";
    try {
      return format(parseISO(dateString), "d 'de' MMMM 'a las' HH:mm", { locale: es });
    } catch (e) {
      console.error("Error al formatear la fecha:", e);
      return "Fecha inválida";
    }
  }

  function goToEvaluacion(id) {
    if (isAvailable || isExpired) {
      goto(`/evaluaciones/${id}`);
    }
  }

  function formatNumber(value) {
    if (typeof value === 'number') {
      return value.toFixed(2);
    } else if (typeof value === 'string') {
      const number = parseFloat(value);
      return isNaN(number) ? "N/A" : number.toFixed(2);
    }
    return "N/A";
  }

  onMount(() => {
    let intervalId;
    const updateState = () => {
      evaluacionStore.update(e => ({ ...e }));
    };
    intervalId = setInterval(updateState, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  function handleError(e, context) {
    console.error(`Error en ${context}:`, e);
    error = `Error en ${context}: ${e.message}. Por favor, recargue la página.`;
  }
</script>

{#if error}
  <div class="error-message">
    {error}
  </div>
{:else}
  <div 
    bind:this={cardElement} 
    class="evaluacion-card" 
    class:available={isAvailable} 
    class:expired={isExpired} 
    class:not-available={!isAvailable && !isExpired}
    class:hovered
    on:mouseenter={() => hovered = true}
    on:mouseleave={() => hovered = false}
  >
    <div class="card-content">
      <div class="card-header">
        <h3 class="card-title" title={evaluacion?.titulo || "Título no disponible"}>{evaluacion?.titulo || "Título no disponible"}</h3>
        <span class="card-type">{evaluacion?.tipo || "Tipo no especificado"}</span>
      </div>
      <div class="card-body">
        <div class="countdown-section">
          <div class="countdown-bar">
            <div class="countdown-fill" style="width: {$progress}%"></div>
            <div class="countdown-milestone" style="left: 50%"></div>
            <div class="countdown-milestone" style="left: 75%"></div>
          </div>
          <div class="countdown-text">
            <Icon icon="mdi:timer-outline" width="20" />
            <span>{countdown.text}</span>
          </div>
        </div>
        <div class="date-info">
          <div class="date-item">
            <Icon icon="mdi:calendar-start" width="20" />
            <span>Inicio: {formattedStartDate}</span>
          </div>
          <div class="date-item">
            <Icon icon="mdi:calendar-end" width="20" />
            <span>Fin: {formattedEndDate}</span>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <Icon icon="mdi:refresh" width="20" />
            <span class="info-label">Intentos:</span>
            <span class="info-value">{evaluacion?.intentos_permitidos || "N/A"}</span>
          </div>
          <div class="info-item">
            <Icon icon="mdi:weight" width="20" />
            <span class="info-label">Peso:</span>
            <span class="info-value">{formatNumber(evaluacion?.ponderacion)}%</span>
          </div>
          <div class="info-item">
            <Icon icon="mdi:check-circle-outline" width="20" />
            <span class="info-label">Aprobación:</span>
            <span class="info-value">{formatNumber(evaluacion?.criterios_aprobacion)}%</span>
          </div>
          <div class="info-item">
            <Icon icon="mdi:clock-outline" width="20" />
            <span class="info-label">Duración:</span>
            <span class="info-value">{evaluacion?.tiempo_limite || "N/A"} min</span>
          </div>
        </div>
        <div class="results-section">
          <span class="results-label">Resultados:</span>
          {#if evaluacion?.resultados_visibles !== undefined}
            {#if evaluacion.resultados_visibles}
              <span class="results-value visible">
                <Icon icon="mdi:eye-outline" width="20" />
                Visibles
              </span>
            {:else}
              <span class="results-value hidden">
                <Icon icon="mdi:eye-off-outline" width="20" />
                Ocultos
              </span>
            {/if}
          {:else}
            <span class="results-value">No especificado</span>
          {/if}
        </div>
      </div>
      <div class="card-footer">
        <button 
          class="btn-start" 
          on:click|stopPropagation={() => goToEvaluacion(evaluacion?.id)}
          disabled={!isAvailable && !isExpired}
          title={buttonTooltip}
        >
          {buttonText}
          <Icon icon={buttonIcon} width="20" />
        </button>  
      </div>
    </div>
  </div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  .evaluacion-card {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    width: 100%;
    max-width: 320px;
    margin: 20px auto;
    cursor: default;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .evaluacion-card.hovered {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.12);
  }

  .evaluacion-card.available .card-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
  }

  .evaluacion-card.not-available .card-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #FFC107, #FF9800);
  }

  .evaluacion-card.expired .card-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #FF5722, #F44336);
  }

  .card-header {
    padding: 16px;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    color: white;
    text-align: center;
    position: relative;
  }

  .card-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .card-type {
    margin-top: 5px;
    font-size: 0.9rem;
    font-weight: 400;
    color: #bdc3c7;
  }

  .card-body {
    padding: 20px;
  }

  .countdown-section {
    margin-bottom: 20px;
  }

  .countdown-bar {
    height: 8px;
    background-color: #ecf0f1;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
    position: relative;
  }

  .countdown-fill {
    height: 100%;
    background: linear-gradient(90deg, #3498db, #2980b9);
    transition: width 0.5s ease-out;
  }

  .countdown-milestone {
    position: absolute;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
  }

  .countdown-text {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 500;
    color: #34495e;
    gap: 8px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .info-item:hover {
    background-color: #e8eaf6;
    transform: translateY(-2px);
  }

  .info-label {
    font-size: 0.85rem;
    color: #7f8c8d;
    margin-top: 6px;
    font-weight: 500;
  }

  .info-value {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-top: 4px;
  }

  .results-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-top: 1px solid #ecf0f1;
  }

  .results-label {
    font-size: 0.95rem;
    color: #7f8c8d;
    font-weight: 500;
  }

  .results-value {
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .results-value.visible {
    color: #27ae60;
  }

  .results-value.hidden {
    color: #e74c3c;
  }

  .card-footer {
    padding: 16px;
    background-color: #f8f9fa;
    text-align: center;
  }

  .btn-start {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn-start:hover:not(:disabled) {
    background: linear-gradient(135deg, #2980b9, #3498db);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .btn-start:disabled {
    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .evaluacion-card.expired {
    opacity: 0.9;
    background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  }

  .date-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .date-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
    color: #34495e;
  }

  .error-message {
    background-color: #fdeaea;
    color: #c0392b;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    text-align: center;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Microinteracciones y animaciones */
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  .info-item:hover :global(svg) {
    animation: pulse 0.5s ease-in-out;
  }

  .countdown-fill {
    background-size: 200% 200%;
    animation: gradientAnimation 5s ease infinite;
  }

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Mejoras para accesibilidad */
  .btn-start:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
  }

  /* Optimizaciones para móviles */
  @media (max-width: 480px) {
    .evaluacion-card {
      max-width: 100%;
      margin: 10px auto;
    }

    .card-header {
      padding: 12px;
    }

    .card-title {
      font-size: 1.1rem;
    }

    .card-body {
      padding: 15px;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .btn-start {
      padding: 10px 20px;
      font-size: 0.95rem;
    }
  }

  /* Estilos para diferentes estados */
  .evaluacion-card.available {
    border-color: rgba(76, 175, 80, 0.3);
  }

  .evaluacion-card.not-available {
    border-color: rgba(255, 193, 7, 0.3);
  }

  .evaluacion-card.expired {
    border-color: rgba(244, 67, 54, 0.3);
  }

  /* Efecto de textura sutil */
  .card-content {
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  }

  /* Transiciones suaves para cambios de estado */
  .evaluacion-card, .btn-start, .info-item, .countdown-fill {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
</style>
