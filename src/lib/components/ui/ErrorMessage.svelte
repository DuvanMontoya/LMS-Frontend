<!-- src/lib/components/ui/ErrorMessage.svelte -->
<script>
  export let message = "Ocurrió un error.";
</script>

<div class="error-message">
  <i class="fas fa-exclamation-triangle"></i>
  <p>{message}</p>
</div>

<style>
  .error-message {
    display: flex;
    align-items: center;
    background-color: #ff6b6b;
    color: #fff;
    padding: 1.5rem;
    border-radius: var(--border-radius);
    text-align: center;
    margin: 2rem 0;
    box-shadow: var(--box-shadow);
  }

  .error-message i {
    font-size: 2.5rem;
    margin-right: 1rem;
  }

  .error-message p {
    margin: 0;
    font-size: 1rem;
  }
</style>