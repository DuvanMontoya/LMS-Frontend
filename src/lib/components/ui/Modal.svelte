<!-- src/lib/components/ui/Modal.svelte -->
<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }
</script>

<div class="modal-backdrop" role="button" tabindex="0" on:click={close} on:keydown={close} aria-label="Close modal">
  <dialog class="modal-content" open>
    <div class="modal-inner" role="dialog" on:click|stopPropagation on:keydown|stopPropagation aria-label="Contenido del modal">
      <button class="close-btn" on:click={close} aria-label="Cerrar modal">&times;</button>
      <slot></slot>
    </div>
  </dialog>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-in-out;
  }

  .modal-content {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    position: relative;
    animation: slideIn 0.3s ease-in-out;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #7f8c8d;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #e74c3c;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>