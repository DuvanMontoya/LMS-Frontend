<!-- src/lib/components/extras/Notification.svelte -->
<script>
  import { notificationStore } from '$lib/stores/notificationStore';
  import { fade } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  let notifications = [];

  const unsubscribe = notificationStore.subscribe((nots) => {
    notifications = nots;
  });

  onDestroy(() => {
    unsubscribe();
  });

  function removeNotification(id) {
    notificationStore.remove(id);
  }
</script>

<div class="notification-container">
  {#each notifications as notification (notification.id)}
    <div
      class="notification {notification.type}"
      in:fade={{ duration: 300 }}
      out:fade={{ duration: 300 }}
      role="alert"
      aria-live="assertive"
    >
      <p>{notification.message}</p>
      <button on:click={() => removeNotification(notification.id)} aria-label="Close Notification">
        &times;
      </button>
    </div>
  {/each}
</div>

<style>
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 3001;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .notification {
    background-color: white;
    color: #333;
    padding: 1rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-elevated);
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 250px;
    animation: slideIn 0.5s forwards;
  }

  .notification.success {
    border-left: 5px solid var(--accent-color);
  }

  .notification.error {
    border-left: 5px solid #ef4444;
  }

  .notification.info {
    border-left: 5px solid var(--primary-color);
  }

  .notification button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #999;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>