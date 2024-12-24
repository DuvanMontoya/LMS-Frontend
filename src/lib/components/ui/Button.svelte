<!-- src/lib/components/UI/Button.svelte -->
<script>
    export let type = "button";
    export let variant = "primary"; // primary, secondary, link
    export let disabled = false;
    export let onClick = () => {};
  
    const classes = () => {
      let base = "btn";
      if (variant === "primary") base += " btn-primary";
      if (variant === "secondary") base += " btn-secondary";
      if (variant === "link") base += " btn-link";
      if (disabled) base += " disabled";
      return base;
    };
  </script>
  
  <button
    {type}
    class={classes()}
    on:click={onClick}
    disabled={disabled}
    aria-disabled={disabled}
  >
    <slot></slot>
  </button>
  
  <style>
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--border-radius);
      font-size: 1rem;
      cursor: pointer;
      transition: all var(--transition-speed);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-decoration: none;
    }
  
    .btn-primary {
      background-color: var(--primary-color);
      color: #fff;
    }
  
    .btn-primary:hover {
      background-color: var(--secondary-color);
    }
  
    .btn-secondary {
      background-color: var(--secondary-color);
      color: #fff;
    }
  
    .btn-secondary:hover {
      background-color: var(--primary-color);
    }
  
    .btn-link {
      background: none;
      color: var(--secondary-color);
      text-decoration: underline;
    }
  
    .btn-link:hover {
      color: var(--accent-color);
    }
  
    .disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  </style>  