<script>
    import { fade } from 'svelte/transition';
  </script>
  
  <div 
    class="loading-state"
    in:fade={{ duration: 300, delay: 200 }}
  >
    <div class="loader">
      <div class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
    </div>
    <h3>Cargando soluciones académicas</h3>
    <p>Por favor espera mientras preparamos el contenido...</p>
  </div>
  
  <style>
    .loading-state {
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
  
    .loader {
      margin-bottom: 2rem;
    }
  
    .spinner {
      width: 60px;
      height: 60px;
      position: relative;
      margin: 0 auto;
    }
  
    .double-bounce1, .double-bounce2 {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: var(--primary-500);
      opacity: 0.6;
      position: absolute;
      top: 0;
      left: 0;
      animation: sk-bounce 2.0s infinite ease-in-out;
    }
  
    .double-bounce2 {
      animation-delay: -1.0s;
    }
  
    h3 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin: 0 0 0.5rem;
    }
  
    p {
      color: var(--text-muted);
      margin: 0;
    }
  
    @keyframes sk-bounce {
      0%, 100% { 
        transform: scale(0.0);
      } 50% { 
        transform: scale(1.0);
      }
    }
  </style>