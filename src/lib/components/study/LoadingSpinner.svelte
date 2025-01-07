<!-- src/lib/components/shared/LoadingSpinner.svelte -->
<script>
    export let size = "2.5rem";
    export let color = "#3b82f6";
  </script>
  
  <div class="spinner" style="width: {size}; height: {size}; border-top-color: {color};"></div>
  
  <style>
    .spinner {
      border: 3px solid #e2e8f0;
      border-top-color: var(--spinner-color, #3b82f6);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>  