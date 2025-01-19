<!-- /lib/components/SectionTransition.svelte -->
<script>
    export let type = 'wave'; // 'wave', 'angle', 'curve'
    export let position = 'bottom'; // 'top', 'bottom'
    export let color = 'white';
    export let backgroundColor = '#1a1a2e';
    
    let path;
    
    $: {
      switch (type) {
        case 'wave':
          path = position === 'bottom' 
            ? 'M0,32 C200,100 400,-50 500,32 L500,100 L0,100 Z' 
            : 'M0,0 L500,0 L500,68 C300,0 100,150 0,68 Z';
          break;
        case 'angle':
          path = position === 'bottom'
            ? 'M0,0 L500,100 L500,100 L0,100 Z'
            : 'M0,0 L500,0 L500,100 L0,0 Z';
          break;
        case 'curve':
          path = position === 'bottom'
            ? 'M0,50 Q250,100 500,50 L500,100 L0,100 Z'
            : 'M0,0 L500,0 L500,50 Q250,0 0,50 Z';
          break;
        default:
          path = position === 'bottom'
            ? 'M0,0 L500,0 L500,100 L0,100 Z'
            : 'M0,0 L500,0 L500,100 L0,100 Z';
      }
    }
  </script>
  
  <style>
    .section-transition {
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      height: 100px;
      overflow: hidden;
      line-height: 0;
    }
  
    .section-transition.top {
      top: -1px;
      transform: rotate(180deg);
    }
  
    .section-transition.bottom {
      bottom: -1px;
    }
  
    svg {
      position: relative;
      display: block;
      width: calc(100% + 1.3px);
      height: 100px;
    }
  
    .shape-fill {
      fill: var(--shape-fill);
    }
  
    /* Decorative elements */
    .decoration {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  
    .decoration-item {
      position: absolute;
      background: var(--decoration-color);
      border-radius: 50%;
      opacity: 0.1;
      animation: float 20s infinite;
    }
  
    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
    }
  </style>
  
  <div 
    class="section-transition {position}"
    style="
      --shape-fill: {color};
      --decoration-color: {backgroundColor};
    "
  >
    <!-- Elementos decorativos -->
    <div class="decoration">
      {#each Array(5) as _, i}
        <div 
          class="decoration-item"
          style="
            left: {Math.random() * 100}%;
            top: {Math.random() * 100}%;
            width: {Math.random() * 30 + 10}px;
            height: {Math.random() * 30 + 10}px;
            animation-delay: -{Math.random() * 20}s;
          "
        ></div>
      {/each}
    </div>
  
    <svg 
      viewBox="0 0 500 100" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path 
        class="shape-fill" 
        d={path}
      />
    </svg>
  </div>