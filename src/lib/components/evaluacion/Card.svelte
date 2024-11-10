<script>
    export let variant = 'default';
    export let hoverable = false;
    export let padding = 'normal';
  
    $: classes = `
      card
      ${variant}
      ${hoverable ? 'hoverable' : ''}
      ${padding}
    `;
  </script>
  
  <div class={classes}>
    <slot></slot>
  </div>
  
  <style>
    .card {
      background-color: white;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .default {
      border: 1px solid #e2e8f0;
    }
  
    .primary {
      border-top: 4px solid #4299e1;
    }
  
    .secondary {
      border-top: 4px solid #a0aec0;
    }
  
    .success {
      border-top: 4px solid #48bb78;
    }
  
    .warning {
      border-top: 4px solid #ed8936;
    }
  
    .danger {
      border-top: 4px solid #f56565;
    }
  
    .hoverable:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }
  
    .normal {
      padding: 1.5rem;
    }
  
    .compact {
      padding: 1rem;
    }
  
    .loose {
      padding: 2rem;
    }
  
    @media (max-width: 640px) {
      .card {
        border-radius: 8px;
      }
  
      .normal, .compact, .loose {
        padding: 1rem;
      }
    }
  </style>