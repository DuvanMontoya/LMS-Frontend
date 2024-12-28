<script>
    import { fade } from 'svelte/transition';
    export let error = '';
    export let onRetry = () => {};
  </script>
  
  <div 
    class="error-state"
    in:fade={{ duration: 300 }}
  >
    <div class="error-icon">
      <i class="fas fa-exclamation-triangle"></i>
    </div>
    
    <h3>¡Ups! Algo salió mal</h3>
    <p>{error}</p>
    
    <button class="retry-button" on:click={onRetry}>
      <i class="fas fa-redo"></i>
      Intentar nuevamente
    </button>
  </div>
  
  <style>
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 2rem;
      text-align: center;
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
    }
  
    .error-icon {
      width: 80px;
      height: 80px;
      background: var(--danger-100);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
  
    .error-icon i {
      font-size: 2rem;
      color: var(--danger-500);
    }
  
    h3 {
      font-size: 1.5rem;
      color: var(--danger-700);
      margin: 0 0 0.5rem;
    }
  
    p {
      color: var(--text-muted);
      margin: 0 0 2rem;
      max-width: 400px;
    }
  
    .retry-button {
      padding: 0.75rem 1.5rem;
      background: var(--primary-500);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all var(--transition-speed) ease;
    }
  
    .retry-button:hover {
      background: var(--primary-600);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  </style>