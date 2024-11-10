<!-- src/lib/components/Notification.svelte -->
<script>
    export let message = '';
    export let type = 'info'; // 'info', 'success', 'error'
    export let visible = false;
  
    function close() {
      visible = false;
    }
  </script>
  
  {#if visible}
    <div class="notification {type}">
      <p>{message}</p>
      <button on:click={close}>×</button>
    </div>
  {/if}
  
  <style>
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  
    .info { background-color: #2196F3; color: white; }
    .success { background-color: #4CAF50; color: white; }
    .error { background-color: #F44336; color: white; }
  
    button {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
  </style>