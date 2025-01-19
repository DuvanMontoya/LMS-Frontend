<!-- /lib/components/illustrations/MathIllustration.svelte -->
<script>
    export let width = "100%";
    export let height = "100%";
  </script>
  
  <svg {width} {height} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Fondo con gradiente -->
    <defs>
      <linearGradient id="mathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2D3192;stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:#00B0EC;stop-opacity:0.1" />
      </linearGradient>
      
      <!-- Patrones para elementos decorativos -->
      <pattern id="gridPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(45,49,146,0.1)" stroke-width="0.5"/>
      </pattern>
    </defs>
  
    <!-- Fondo con patrón -->
    <rect width="100%" height="100%" fill="url(#gridPattern)" />
  
    <!-- Círculo central con gradiente -->
    <circle cx="200" cy="200" r="150" fill="url(#mathGradient)" />
  
    <!-- Elementos matemáticos decorativos -->
    <g class="math-elements" style="transform-origin: center; animation: rotate 30s linear infinite;">
      <!-- Símbolos matemáticos -->
      <text x="100" y="100" fill="#2D3192" font-size="24" style="animation: float 5s ease-in-out infinite;">∫</text>
      <text x="300" y="100" fill="#2D3192" font-size="24" style="animation: float 5s ease-in-out infinite 1s;">∑</text>
      <text x="100" y="300" fill="#2D3192" font-size="24" style="animation: float 5s ease-in-out infinite 2s;">π</text>
      <text x="300" y="300" fill="#2D3192" font-size="24" style="animation: float 5s ease-in-out infinite 3s;">√</text>
      
      <!-- Fórmulas y ecuaciones -->
      <g transform="translate(150,180)">
        <text fill="#2D3192" font-size="16">
          <tspan x="0" y="0">x² + y² = r²</tspan>
          <tspan x="0" y="20">E = mc²</tspan>
          <tspan x="0" y="40">∮ E·dl = -dΦ/dt</tspan>
        </text>
      </g>
  
      <!-- Elementos geométricos -->
      <g transform="translate(200,200)" style="animation: pulse 3s ease-in-out infinite;">
        <path d="M0,-50 L43.3,25 L-43.3,25 Z" fill="none" stroke="#00B0EC" stroke-width="2"/>
        <rect x="-25" y="-25" width="50" height="50" fill="none" stroke="#2D3192" stroke-width="2"/>
        <circle cx="0" cy="0" r="35" fill="none" stroke="#2D3192" stroke-width="2"/>
      </g>
    </g>
  
    <!-- Elementos interactivos -->
    <g class="interactive-elements">
      <!-- Puntos conectados -->
      <g style="animation: connect 5s ease-in-out infinite;">
        <circle cx="150" cy="150" r="3" fill="#2D3192"/>
      <circle cx="250" cy="150" r="3" fill="#2D3192"/>
      <circle cx="200" cy="250" r="3" fill="#2D3192"/>
      <path d="M150,150 L250,150 L200,250 Z" stroke="#2D3192" stroke-width="1" fill="none"/>
    </g>

    <!-- Gráficas de funciones -->
    <path d="M100,200 Q150,100 200,200 Q250,300 300,200" stroke="#00B0EC" stroke-width="2" fill="none" style="animation: draw 3s ease-in-out infinite"/>
    
    <!-- Ejes coordenados -->
    <g transform="translate(200,200)">
      <line x1="-150" y1="0" x2="150" y2="0" stroke="#2D3192" stroke-width="1"/>
      <line x1="0" y1="-150" x2="0" y2="150" stroke="#2D3192" stroke-width="1"/>
      
      <!-- Marcas en los ejes -->
      {#each Array(6) as _, i}
        <line x1="{i*50-150}" y1="-5" x2="{i*50-150}" y2="5" stroke="#2D3192" stroke-width="1"/>
        <line x1="-5" y1="{i*50-150}" x2="5" y2="{i*50-150}" stroke="#2D3192" stroke-width="1"/>
      {/each}
    </g>
  </g>
</svg>

<style>
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes connect {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  @keyframes draw {
    0% { stroke-dashoffset: 1000; }
    100% { stroke-dashoffset: 0; }
  }

  svg {
    width: 100%;
    height: 100%;
  }
</style>