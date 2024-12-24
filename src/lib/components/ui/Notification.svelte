<!-- src/lib/components/ui/Notification.svelte -->
<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { fade } from "svelte/transition";

  const dispatch = createEventDispatcher();
  export let message = "";
  export let type = "success"; // tipos: success, error, info
  export let duration = 5000; // Duración en ms

  let visible = true;

  onMount(() => {
    const timer = setTimeout(() => {
      visible = false;
      dispatch("close");
    }, duration);
    return () => clearTimeout(timer);
  });

  function close() {
    visible = false;
    dispatch("close");
  }
</script>

{#if visible}
  <div class={`notification ${type}`} transition:fade>
    <p>{message}</p>
    <button class="close-btn" on:click={close} aria-label="Cerrar notificación">&times;</button>
  </div>
{/if}

<style>
  .notification {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background-color: #2ecc71;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 1000;
    min-width: 250px;
    animation: slideIn 0.5s ease-out;
  }

  .notification.error {
    background-color: #e74c3c;
  }

  .notification.info {
    background-color: #3498db;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #bdc3c7;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
</style>