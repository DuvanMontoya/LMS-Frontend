<!-- /lib/components/illustrations/PhysicsIllustration.svelte -->
<script>
    export let width = "100%";
    export let height = "100%";
  </script>
  
  <svg {width} {height} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="physicsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2D3192;stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:#00B0EC;stop-opacity:0.1" />
      </linearGradient>
      
      <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1" fill="rgba(45,49,146,0.1)"/>
      </pattern>
    </defs>
  
    <!-- Fondo con patrón -->
    <rect width="100%" height="100%" fill="url(#dotPattern)" />
  
    <!-- Círculo central con gradiente -->
    <circle cx="200" cy="200" r="150" fill="url(#physicsGradient)" />
  
    <!-- Elementos de física -->
    <g class="physics-elements">
      <!-- Órbitas y partículas -->
      <g class="orbital-system" style="transform-origin: center; animation: rotate 20s linear infinite;">
        <circle cx="200" cy="200" r="100" stroke="#2D3192" stroke-width="1" fill="none" stroke-dasharray="5 5"/>
        <circle cx="200" cy="200" r="70" stroke="#00B0EC" stroke-width="1" fill="none" stroke-dasharray="5 5"/>
        
        <!-- Partículas en órbita -->
        <circle cx="300" cy="200" r="10" fill="#2D3192" style="animation: pulse 3s ease-in-out infinite;"/>
        <circle cx="200" cy="270" r="8" fill="#00B0EC" style="animation: pulse 3s ease-in-out infinite 1s;"/>
      </g>
  
      <!-- Vectores de fuerza -->
      <g class="force-vectors">
        <g transform="translate(200,200)" style="animation: float 5s ease-in-out infinite;">
          <!-- Vector F -->
          <line x1="0" y1="0" x2="50" y2="-50" stroke="#2D3192" stroke-width="2" marker-end="url(#arrowhead)"/>
          <text x="55" y="-55" fill="#2D3192" font-size="16">F</text>
          
          <!-- Vector v -->
          <line x1="0" y1="0" x2="50" y2="0" stroke="#00B0EC" stroke-width="2" marker-end="url(#arrowhead)"/>
          <text x="55" y="5" fill="#00B0EC" font-size="16">v</text>
        </g>
      </g>
  
      <!-- Fórmulas físicas -->
      <g transform="translate(150,180)">
        <text fill="#2D3192" font-size="16">
          <tspan x="0" y="0">F = ma</tspan>
          <tspan x="0" y="20">E = hf</tspan>
          <tspan x="0" y="40">p = mv</tspan>
        </text>
      </g>
  
      <!-- Ondas -->
      <g class="waves" transform="translate(100,300)">
        <path d="M0,0 Q50,-20 100,0 Q150,20 200,0" stroke="#00B0EC" stroke-width="2" fill="none" style="animation: wave 3s ease-in-out infinite;"/>
      </g>
    </g>
  
    <!-- Elementos interactivos -->
    <g class="interactive-elements">
      <!-- Sistema de péndulo -->
      <g transform="translate(200,150)" style="animation: swing 3s ease-in-out infinite;">
        <line x1="0" y1="0" x2="0" y2="80" stroke="#2D3192" stroke-width="2"/>
        <circle cx="0" cy="80" r="15" fill="#2D3192"/>
      </g>
    </g>
  
    <!-- Marcadores -->
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#2D3192"/>
      </marker>
    </defs>
  </svg>
  
  <style>
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
    }
  
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(5deg); }
    }
  
    @keyframes wave {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-20px); }
    }
  
    @keyframes swing {
      0%, 100% { transform: rotate(-15deg); }
      50% { transform: rotate(15deg); }
    }
  
    svg {
      width: 100%;
      height: 100%;
    }
  </style>