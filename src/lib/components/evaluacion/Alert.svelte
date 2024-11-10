<script>
    export let type = 'info';
    export let title = '';
    export let dismissible = false;
  
    let visible = true;
  
    function dismiss() {
      visible = false;
    }
  
    $: icon = {
      info: '❗',
      success: '✅',
      warning: '⚠️',
      error: '🚫'
    }[type];
  
    $: classes = `alert ${type} ${dismissible ? 'dismissible' : ''}`;
  </script>
  
  {#if visible}
    <div class={classes} role="alert">
      <div class="alert-content">
        <span class="icon">{icon}</span>
        <div class="message">
          {#if title}
            <h4 class="title">{title}</h4>
          {/if}
          <p><slot></slot></p>
        </div>
      </div>
      {#if dismissible}
        <button class="dismiss" on:click={dismiss} aria-label="Cerrar alerta">×</button>
      {/if}
    </div>
  {/if}
  
  <style>
    .alert {
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      animation: slideIn 0.3s ease-out;
    }
  
    .alert-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
  
    .icon {
      font-size: 1.5rem;
      line-height: 1;
    }
  
    .message {
      flex-grow: 1;
    }
  
    .title {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }
  
    .info {
      background-color: #e6f2ff;
      border: 1px solid #b3d7ff;
      color: #004085;
    }
  
    .success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }
  
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      color: #856404;
    }
  
    .error {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
  
    .dismiss {
      background: none;
      border: none;
      color: inherit;
      font: inherit;
      font-size: 1.5rem;
      line-height: 1;
      padding: 0;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }
  
    .dismiss:hover {
      opacity: 1;
    }
  
    @keyframes slideIn {
      from {
        transform: translateY(-10px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  
    @media (max-width: 640px) {
      .alert {
        flex-direction: column;
      }
  
      .dismiss {
        align-self: flex-end;
        margin-top: 0.5rem;
      }
    }
  </style>