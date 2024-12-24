<!-- src/lib/components/UI/Spinner.svelte -->
<script>
    export let size = "50px";
    export let color = "var(--accent-color)";
  </script>
  
  <div class="spinner" style="width: {size}; height: {size};"></div>
  
  <style>
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-top: 4px solid var(--accent-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>  