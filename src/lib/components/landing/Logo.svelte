<!-- /lib/components/Logo.svelte -->
<script>
    export let size = 50;
    export let variant = 'default'; // 'default', 'white', 'gradient'
  </script>
  
  <style>
    .logo-container {
      display: inline-flex;
      align-items: center;
    }
  
    .logo-text {
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      margin-left: 0.5rem;
      font-size: calc(var(--size) * 0.4px);
    }
  
    .white {
      fill: white;
      color: white;
    }
  
    .gradient {
      fill: url(#logoGradient);
    }
  
    .gradient-text {
      background: linear-gradient(135deg, #2D3192, #00B0EC);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  </style>
  
  <div class="logo-container" style="--size: {size}">
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      class={variant}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2D3192" />
          <stop offset="100%" style="stop-color:#00B0EC" />
        </linearGradient>
      </defs>
      <!-- Círculo exterior -->
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      />
      
      <!-- Símbolo de suma estilizado -->
      <path 
        d="M50 25 L50 75 M25 50 L75 50" 
        stroke="currentColor" 
        stroke-width="8" 
        stroke-linecap="round"
      />
      
      <!-- Elementos decorativos -->
      <circle 
        cx="50" 
        cy="50" 
        r="35" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="1"
        opacity="0.5"
      />
      
      <!-- Puntos decorativos -->
      <circle cx="50" cy="25" r="3" fill="currentColor" />
      <circle cx="50" cy="75" r="3" fill="currentColor" />
      <circle cx="25" cy="50" r="3" fill="currentColor" />
      <circle cx="75" cy="50" r="3" fill="currentColor" />
    </svg>
    
    <span class="logo-text" class:gradient-text={variant === 'gradient'}>
      PreUNAL
    </span>
  </div>