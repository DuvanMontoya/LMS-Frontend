<!-- src/lib/components/study/ProgressBar.svelte -->
<script>
  import { fade } from 'svelte/transition';
  
  export let progress = 0;
  export let showLabel = true;
  export let size = 'default';  // small | default | medium | large
  export let variant = 'default'; // default | gradient | segments
  export let animated = true;
  
  $: progressColor = getProgressColor(progress);
  $: progressHeight = getProgressHeight(size);
  $: progressStyle = getProgressStyle();
  
  function getProgressColor(value) {
    if (value >= 80) return { base: '#16a34a', light: '#dcfce7' };  // Verde
    if (value >= 60) return { base: '#84cc16', light: '#ecfdf5' };  // Verde lima
    if (value >= 40) return { base: '#eab308', light: '#fef9c3' };  // Amarillo
    if (value >= 20) return { base: '#f97316', light: '#ffedd5' };  // Naranja
    return { base: '#ef4444', light: '#fee2e2' };                   // Rojo
  }

  function getProgressHeight(size) {
    switch (size) {
      case 'small': return 'h-1';
      case 'medium': return 'h-3';
      case 'large': return 'h-4';
      default: return 'h-2';
    }
  }

  function getProgressStyle() {
    if (variant === 'gradient') {
      return `
        background: linear-gradient(90deg, ${progressColor.base} 0%, ${progressColor.light} 100%);
        width: ${progress}%;
      `;
    }
    return `
      background: ${progressColor.base};
      width: ${progress}%;
    `;
  }
</script>

<div class="progress-wrapper">
  <div 
    class="progress-container {progressHeight}"
    class:animated
    class:segmented={variant === 'segments'}
  >
    <div
      class="progress-bar"
      style={progressStyle}
      transition:fade={{ duration: 300 }}
    >
      {#if variant === 'segments'}
        {#each Array(10) as _, i}
          <div 
            class="segment"
            class:active={progress >= (i + 1) * 10}
          ></div>
        {/each}
      {/if}
    </div>
  </div>

  {#if showLabel}
    <div 
      class="progress-label"
      style="color: {progressColor.base}"
    >
      {Math.round(progress)}%
      
      {#if progress === 100}
        <span class="completion-icon" transition:fade>
          <i class="fas fa-check-circle"></i>
        </span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .progress-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .progress-container {
    flex: 1;
    background: #e5e7eb;
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
  }

  .progress-container.segmented {
    background: transparent;
    display: flex;
    gap: 2px;
  }

  .progress-bar {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.5s ease, background-color 0.3s ease;
  }

  .animated .progress-bar {
    position: relative;
    overflow: hidden;
  }

  .animated .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateX(-100%);
    animation: shimmer 2s infinite;
  }

  .segmented .segment {
    flex: 1;
    height: 100%;
    background: #e5e7eb;
    border-radius: 9999px;
    transition: all 0.3s ease;
  }

  .segmented .segment.active {
    background: currentColor;
  }

  .progress-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 3rem;
    justify-content: flex-end;
    transition: color 0.3s ease;
  }

  .completion-icon {
    color: #16a34a;
    animation: bounce 0.5s ease;
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-25%);
    }
  }

  /* Tamaños específicos para altura en modo segmentado */
  .segmented.h-1 .segment {
    height: 0.25rem;
  }

  .segmented.h-2 .segment {
    height: 0.5rem;
  }

  .segmented.h-3 .segment {
    height: 0.75rem;
  }

  .segmented.h-4 .segment {
    height: 1rem;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .progress-wrapper {
      gap: 0.75rem;
    }

    .progress-label {
      font-size: 0.75rem;
    }

    .segmented {
      gap: 1px;
    }
  }
</style>