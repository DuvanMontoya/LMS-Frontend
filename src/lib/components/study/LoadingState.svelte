<!-- src/lib/components/shared/LoadingState.svelte -->
<script>
    import LoadingSpinner from '$lib/components/study/LoadingSpinner.svelte';
    export let message = "Cargando...";
  </script>
  
  <div class="loading-state">
    <LoadingSpinner size="2.5rem" />
    <p>{message}</p>
  </div>
  
  <style>
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      gap: 1rem;
    }
  
    .loading-state p {
      color: #64748b;
      font-size: 0.875rem;
    }
  </style>  