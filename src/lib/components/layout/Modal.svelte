<script>
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  
    const close = () => {
      dispatch('close');
    };
  </script>
  
  <div class="modal-backdrop" on:click={close}></div>
  <div class="modal">
    <div class="modal-content">
      <slot></slot>
    </div>
  </div>
  
  <style>
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10;
    }
  
    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      z-index: 20;
      border-radius: 5px;
    }
  
    .modal-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  </style>
  