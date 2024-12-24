<!-- src/lib/components/ui/Loader.svelte -->
<script>
  export let message = "Cargando...";
</script>

<div class="loading-screen" in:fade>
  <div class="loader"></div>
  <p>{message}</p>
</div>

<style>
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
  }

  .loader {
    border: 6px solid #f3f3f3;
    border-top: 6px solid #3498db;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-screen p {
    font-size: 1.2rem;
    color: #7f8c8d;
  }
</style>