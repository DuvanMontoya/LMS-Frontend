<!-- src/lib/components/shared/ErrorBanner.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    export let errorMessage = "";
  
    const dispatch = createEventDispatcher();
  
    function close() {
      dispatch('dismiss');
    }
  </script>
  
  {#if errorMessage}
    <div class="error-banner">
      <p>{errorMessage}</p>
      <button on:click={close}>Cerrar</button>
    </div>
  {/if}
  
  <style>
    .error-banner {
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      background: #fee2e2;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 50;
    }
  
    .error-banner p {
      color: #991b1b;
      margin: 0;
    }
  
    .error-banner button {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
  
    .error-banner button:hover {
      background: #b91c1c;
    }
  </style>  