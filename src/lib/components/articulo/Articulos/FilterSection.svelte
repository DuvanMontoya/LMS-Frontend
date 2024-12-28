<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  const dispatch = createEventDispatcher();

  export let label = '';
  export let value = '';
  export let options = [];
  export let placeholder = 'Seleccionar...';
  export let loading = false;
  export let disabled = false;
  export let error = '';
  
  // Para manejar el estado del tooltip de info
  let showTooltip = false;
  let tooltipTimeout;
  
  // Para el estado hover del select
  let isHovered = false;
  
  // Para el estado focus del select
  let isFocused = false;

  // Contador de opciones seleccionadas si es múltiple
  $: selectedCount = Array.isArray(value) ? value.length : (value ? 1 : 0);

  function handleChange(event) {
    dispatch('change', event.target.value);
  }

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
  }

  function handleFocus() {
    isFocused = true;
  }

  function handleBlur() {
    isFocused = false;
  }

  function showInfo() {
    showTooltip = true;
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
  }

  function hideInfo() {
    tooltipTimeout = setTimeout(() => {
      showTooltip = false;
    }, 200);
  }
</script>

<div 
  class="filter-section"
  class:has-error={error}
  class:is-disabled={disabled}
  transition:fade
>
  <div class="filter-header">
    <label for={`filter-${label.toLowerCase()}`} class="filter-label">
      {label}
      {#if selectedCount > 0}
        <span class="selected-count" transition:fade>
          ({selectedCount})
        </span>
      {/if}
    </label>

    <button
      class="info-button"
      on:mouseenter={showInfo}
      on:mouseleave={hideInfo}
      on:focus={showInfo}
      on:blur={hideInfo}
      aria-label="Mostrar información"
    >
      <i class="fas fa-info-circle"></i>
      
      {#if showTooltip}
        <div 
          class="info-tooltip"
          transition:fade={{ duration: 150 }}
        >
          Filtra los resultados por {label.toLowerCase()}
        </div>
      {/if}
    </button>
  </div>

  <div 
    class="select-container"
    class:hovered={isHovered}
    class:focused={isFocused}
  >
    <select
      id={`filter-${label.toLowerCase()}`}
      {disabled}
      bind:value
      on:change={handleChange}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      on:focus={handleFocus}
      on:blur={handleBlur}
      class:has-value={value}
    >
      <option value="">{placeholder}</option>
      {#each options as option}
        {#if option}
          <option value={option.id}>
            {option.nombre || option.name}
          </option>
        {/if}
      {/each}
    </select>

    <div class="select-icon">
      {#if loading}
        <i class="fas fa-spinner fa-spin"></i>
      {:else}
        <i class="fas fa-chevron-down"></i>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="error-message" transition:fade>
      <i class="fas fa-exclamation-circle"></i>
      {error}
    </div>
  {/if}
</div>

<style>
  .filter-section {
    margin-bottom: 1.5rem;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .filter-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .selected-count {
    color: var(--primary-500);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .info-button {
    background: none;
    border: none;
    padding: 0.25rem;
    color: var(--text-muted);
    cursor: pointer;
    position: relative;
    transition: all var(--transition-speed) ease;
  }

  .info-button:hover {
    color: var(--primary-500);
  }

  .info-tooltip {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--gray-900);
    color: white;
    font-size: 0.85rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    white-space: nowrap;
    z-index: 50;
  }

  .info-tooltip::before {
    content: '';
    position: absolute;
    top: -4px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: var(--gray-900);
    transform: rotate(45deg);
  }

  .select-container {
    position: relative;
    background-color: var(--background-elevated);
    border: 2px solid var(--gray-200);
    border-radius: var(--border-radius);
    transition: all var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
  }

  .select-container:hover,
  .select-container.hovered {
    border-color: var(--primary-400);
  }

  .select-container.focused {
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px var(--primary-100);
  }

  select {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    appearance: none;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 0.95rem;
    line-height: 1.5;
    cursor: pointer;
  }

  select:focus {
    outline: none;
  }

  select:disabled {
    cursor: not-allowed;
    opacity: 0.7;
    background-color: var(--gray-100);
  }

  select option {
    padding: 0.75rem;
    background-color: var(--background-elevated);
    color: var(--text-primary);
  }

  .select-icon {
    position: absolute;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    transition: transform var(--transition-speed) ease;
  }

  .focused .select-icon {
    transform: translateY(-50%) rotate(180deg);
    color: var(--primary-500);
  }

  .error-message {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--danger-500);
    font-size: 0.85rem;
  }

  .has-error .select-container {
    border-color: var(--danger-500);
  }

  .has-error .select-container:focus-within {
    box-shadow: 0 0 0 3px var(--danger-100);
  }

  /* Estilos para cuando tiene valor seleccionado */
  select.has-value {
    color: var(--primary-600);
    font-weight: 500;
  }

  /* Animación del spinner */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .fa-spin {
    animation: spin 1s linear infinite;
  }

  /* Estilos específicos para móvil */
  @media (max-width: 640px) {
    select {
      font-size: 1rem; /* Texto más grande para mejor toque */
      padding: 0.875rem 2.5rem 0.875rem 1rem; /* Padding más grande */
    }

    .filter-section {
      margin-bottom: 1.25rem;
    }
  }

  /* Soporte para modo oscuro */
  :global(.dark) .select-container {
    background-color: var(--gray-800);
    border-color: var(--gray-700);
  }

  :global(.dark) .select-container:hover,
  :global(.dark) .select-container.hovered {
    border-color: var(--primary-500);
  }

  :global(.dark) .select-container.focused {
    border-color: var(--primary-400);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  :global(.dark) select option {
    background-color: var(--gray-800);
  }

  /* Soporte para reducción de movimiento */
  @media (prefers-reduced-motion: reduce) {
    .select-container,
    .select-icon,
    .info-button {
      transition: none;
    }
  }
</style>