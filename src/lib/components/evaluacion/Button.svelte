<script>
    import { createEventDispatcher } from 'svelte';
  
    export let variant = 'primary';
    export let size = 'medium';
    export let disabled = false;
    export let type = 'button';
    export let fullWidth = false;
  
    const dispatch = createEventDispatcher();
  
    function handleClick(event) {
      if (!disabled) {
        dispatch('click', event);
      }
    }
  
    $: classes = `
      button
      ${variant}
      ${size}
      ${fullWidth ? 'full-width' : ''}
      ${disabled ? 'disabled' : ''}
    `;
  </script>
  
  <button
    {type}
    class={classes}
    on:click={handleClick}
    {disabled}
    {...$$restProps}
  >
    <slot></slot>
  </button>
  
  <style>
    .button {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  
    .button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
    }
  
    .button:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .button:active:not(.disabled) {
      transform: translateY(0);
    }
  
    .primary {
      background-color: #4299e1;
      color: white;
    }
  
    .primary:hover:not(.disabled) {
      background-color: #3182ce;
    }
  
    .secondary {
      background-color: #a0aec0;
      color: white;
    }
  
    .secondary:hover:not(.disabled) {
      background-color: #718096;
    }
  
    .outline {
      background-color: transparent;
      border: 2px solid #4299e1;
      color: #4299e1;
    }
  
    .outline:hover:not(.disabled) {
      background-color: #4299e1;
      color: white;
    }
  
    .destructive {
      background-color: #f56565;
      color: white;
    }
  
    .destructive:hover:not(.disabled) {
      background-color: #e53e3e;
    }
  
    .small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  
    .medium {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }
  
    .large {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }
  
    .full-width {
      width: 100%;
    }
  
    .disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  
    .disabled:hover {
      transform: none;
      box-shadow: none;
    }
  
    @media (max-width: 640px) {
      .button {
        width: 100%;
      }
    }
  </style>