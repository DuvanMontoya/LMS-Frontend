<!-- src/lib/components/study/RatingBar.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { cubicOut } from 'svelte/easing';

  export let value = 5;
  export let questionId;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  let sliderContainer;
  let isDragging = false;
  let hoveredValue = null;
  let showTooltip = false;
  let tooltipX = 0;

  const levels = [
    { value: 1, color: '#ef4444', emoji: '😕', text: 'No entendí', description: 'Necesito repasar desde el inicio' },
    { value: 3, color: '#f97316', emoji: '🤔', text: 'Confuso', description: 'Tengo dudas importantes' },
    { value: 5, color: '#eab308', emoji: '😊', text: 'Regular', description: 'Entiendo lo básico' },
    { value: 7, color: '#22c55e', emoji: '😄', text: 'Bien', description: 'Comprendo la mayoría' },
    { value: 9, color: '#15803d', emoji: '🌟', text: 'Excelente', description: 'Domino el tema completamente' }
  ];

  function getFeedback(val) {
    // Retorna el level más cercano
    return levels.reduce((prev, curr) => {
      return Math.abs(curr.value - val) < Math.abs(prev.value - val) ? curr : prev;
    });
  }

  function handleMouseMove(event) {
    if (disabled) return;
    const rect = sliderContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newValue = Math.max(1, Math.min(10, Math.round(percentage * 10)));

    if (isDragging) {
      value = newValue;
      dispatch('rate', { questionId, rating: newValue });
    }

    hoveredValue = newValue;
    tooltipX = Math.max(0, Math.min(x, rect.width - 20));
    showTooltip = true;
  }

  function handleMouseDown(event) {
    if (disabled) return;
    isDragging = true;
    handleMouseMove(event);
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleMouseLeave() {
    if (!isDragging) {
      hoveredValue = null;
      showTooltip = false;
    }
  }

  function getGradient(val) {
    const feedback = getFeedback(val);
    const baseColor = feedback.color;
    return `linear-gradient(90deg, 
      ${baseColor}ff 0%, 
      ${baseColor}dd 50%, 
      ${baseColor}bb 100%
    )`;
  }

  $: currentValue = hoveredValue ?? value;
  $: feedback = getFeedback(currentValue);
  $: levelWidth = (currentValue * 10) + '%';
</script>

<svelte:window on:mouseup={handleMouseUp} />

<div class="rating-container" class:disabled={disabled}>
  <div
    bind:this={sliderContainer}
    class="rating-slider"
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseleave={handleMouseLeave}
  >
    <div
      class="progress-track"
      style="--level-width: {levelWidth}; --gradient: {getGradient(currentValue)}"
    >
      <div class="progress-fill"></div>
    </div>

    {#each levels as level}
      <div 
        class="level-marker"
        class:active={currentValue >= level.value}
        style="--marker-left: {level.value * 10}%; --marker-color: {level.color}"
      >
        <div class="marker-dot"></div>
        <div class="marker-label">{level.text}</div>
      </div>
    {/each}

    <div 
      class="slider-thumb"
      style="
        left: {levelWidth}; 
        --thumb-color: {feedback.color};
        --thumb-scale: {isDragging ? 1.2 : 1}
      "
    >
      <span class="thumb-emoji">{feedback.emoji}</span>
    </div>

    {#if showTooltip}
      <div 
        class="feedback-tooltip"
        style="
          --tooltip-x: {tooltipX}px;
          --tooltip-color: {feedback.color}
        "
        transition:fly={{ y: 10, duration: 200, easing: cubicOut }}
      >
        <div class="tooltip-header">
          <span class="tooltip-emoji">{feedback.emoji}</span>
          <span class="tooltip-value">{currentValue}/10</span>
        </div>
        <div class="tooltip-content">
          <strong>{feedback.text}</strong>
          <span>{feedback.description}</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="current-value" style="--value-color: {getFeedback(value).color}">
    <span class="value-emoji">{getFeedback(value).emoji}</span>
    <span class="value-text">{value}/10</span>
  </div>
</div>

<style>
  .rating-container {
    position: relative;
    width: 100%;
    padding: 2rem 1rem;
    user-select: none;
  }

  .rating-container.disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .rating-slider {
    position: relative;
    height: 3rem;
    cursor: pointer;
    padding: 1rem 0;
  }

  .progress-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 0.5rem;
    background: #e2e8f0;
    border-radius: 9999px;
    transform: translateY(-50%);
    overflow: hidden;
  }

  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--level-width);
    background: var(--gradient);
    border-radius: 9999px;
    transition: width 0.3s ease, background 0.3s ease;
  }

  .level-marker {
    position: absolute;
    top: 50%;
    left: var(--marker-left);
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .marker-dot {
    width: 0.75rem;
    height: 0.75rem;
    background: #e2e8f0;
    border: 2px solid white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .level-marker.active .marker-dot {
    background: var(--marker-color);
    transform: scale(1.2);
  }

  .marker-label {
    font-size: 0.75rem;
    color: #64748b;
    opacity: 0;
    transform: translateY(0.5rem);
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .level-marker:hover .marker-label {
    opacity: 1;
    transform: translateY(0);
  }

  .slider-thumb {
    position: absolute;
    top: 50%;
    left: var(--level-width);
    width: 2.5rem;
    height: 2.5rem;
    background: white;
    border: 3px solid var(--thumb-color);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(var(--thumb-scale));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    z-index: 10;
  }

  .slider-thumb:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }

  .thumb-emoji {
    font-size: 1.25rem;
    line-height: 1;
  }

  .feedback-tooltip {
    position: absolute;
    bottom: calc(100% + 1rem);
    left: var(--tooltip-x);
    transform: translateX(-50%);
    background: white;
    border: 2px solid var(--tooltip-color);
    border-radius: 1rem;
    padding: 0.75rem 1rem;
    min-width: 200px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }

  .feedback-tooltip::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid var(--tooltip-color);
  }

  .tooltip-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .tooltip-emoji {
    font-size: 1.5rem;
  }

  .tooltip-value {
    font-weight: 600;
    color: var(--tooltip-color);
  }

  .tooltip-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tooltip-content strong {
    color: var(--tooltip-color);
    font-size: 0.875rem;
  }

  .tooltip-content span {
    color: #64748b;
    font-size: 0.75rem;
  }

  .current-value {
    position: absolute;
    top: 0;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 2px solid var(--value-color);
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--value-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .value-emoji {
    font-size: 1.25rem;
  }

  /* Efectos de hover */
  .rating-slider:hover .progress-track {
    height: 0.625rem;
  }

  .rating-slider:hover .marker-dot {
    transform: scale(1.1);
  }

  /* Animaciones */
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .slider-thumb:active {
    animation: pulse 0.5s ease infinite;
  }

  /* Modo oscuro */
  @media (prefers-color-scheme: dark) {
    .progress-track {
      background: #334155;
    }

    .marker-dot {
      background: #475569;
      border-color: #1e293b;
    }

    .slider-thumb {
      background: #1e293b;
    }

    .feedback-tooltip {
      background: #1e293b;
      border-color: var(--tooltip-color);
    }

    .tooltip-content span {
      color: #94a3b8;
    }

    .current-value {
      background: #1e293b;
    }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .rating-container {
      padding: 1.5rem 0.5rem;
    }

    .marker-label {
      display: none;
    }

    .current-value {
      top: -0.5rem;
      right: 0.5rem;
    }
  }

  /* Accesibilidad */
  @media (prefers-reduced-motion: reduce) {
    .progress-fill,
    .level-marker,
    .slider-thumb,
    .marker-label {
      transition: none;
    }
  }
</style>

<script context="module">
  // Función auxiliar para generar gradientes suaves
  function interpolateColor(color1, color2, factor) {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
  }
</script>