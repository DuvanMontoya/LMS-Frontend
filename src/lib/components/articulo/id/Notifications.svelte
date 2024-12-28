<script>
    import { fade, slide } from 'svelte/transition';
  
    export let notifications = [];
  </script>
  
  <div class="notifications-container">
    {#each notifications as notification (notification.id)}
      <div
        class="notification {notification.type}"
        transition:slide
      >
        <i class="fas fa-{notification.type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>{notification.message}</span>
      </div>
    {/each}
  </div>
  
  <style>
    .notifications-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 100000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
  
    .notification {
      background: var(--panel-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: var(--shadow-lg);
      pointer-events: auto;
      animation: slideIn 0.3s forwards;
    }
  
    .notification.success {
      border-left: 4px solid var(--success-main);
    }
  
    .notification.error {
      border-left: 4px solid var(--error-main);
    }
  
    .notification i {
      font-size: 1.25rem;
    }
  
    .notification.success i {
      color: var(--success-main);
    }
  
    .notification.error i {
      color: var(--error-main);
    }
  
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>  