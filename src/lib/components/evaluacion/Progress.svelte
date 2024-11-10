<script>
    export let value = 0;
    export let max = 100;
    export let showLabel = true;
    export let size = 'medium';
    export let color = 'primary';
  
    $: percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    $: classes = `progress ${size} ${color}`;
  </script>
  
  <div class={classes}>
    <div class="progress-bar" style="width: {percentage}%"></div>
    {#if showLabel}
      <span class="progress-label">{percentage.toFixed(1)}%</span>
    {/if}
  </div>
  
  <style>
    .progress {
      position: relative;
      height: 1rem;
      overflow: hidden;
      background-color: #e2e8f0;
      border-radius: 0.5rem;
      box-shadow: inset 0 0.1rem 0.1rem rgba(0,0,0,.1);
    }
  
    .progress-bar {
      height: 100%;
      transition: width 0.6s ease;
    }
  
    .progress-label {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      text-shadow: 0 0 2px rgba(0,0,0,.5);
    }
  
    .small {
      height: 0.5rem;
    }
  
    .medium {
      height: 1rem;
    }
  
    .large {
      height: 1.5rem;
    }
  
    .primary .progress-bar {
      background-color: #4299e1;
    }
  
    .success .progress-bar {
      background-color: #48bb78;
    }
  
    .warning .progress-bar {
      background-color: #ed8936;
    }
  
    .danger .progress-bar {
      background-color: #f56565;
    }
  
    @media (max-width: 640px) {
      .progress {
        height: 0.75rem;
      }
  
      .progress-label {
        font-size: 0.625rem;
      }
    }
  </style>