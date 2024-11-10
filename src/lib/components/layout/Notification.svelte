<script>
    export let message = '';
    export let type = 'success'; // 'success', 'error', 'info'

    let notification = '';

    let show = true;

    setTimeout(() => show = false, 3000); // Ocultar notificación después de 3 segundos
  </script>
  
  <style>
    .notification {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      padding: 1rem;
      border-radius: 5px;
      color: white;
      font-size: 1rem;
      z-index: 1000;
      opacity: 1;
      transition: opacity 0.3s ease-in-out;
    }
  
    .notification.hidden {
      opacity: 0;
    }
  
    .notification.success {
      background-color: #4caf50;
    }
  
    .notification.error {
      background-color: #f44336;
    }
  
    .notification.info {
      background-color: #2196f3;
    }
  </style>
  
  <div class:notification class:hidden={!show} class={type}>
    {message}
  </div>
  