<!-- src/lib/components/articulo/id/MobileNav.svelte -->
<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { fade, fly, scale } from 'svelte/transition';
    import { quintOut, elasticOut } from 'svelte/easing';
    
    export let isLiked = false;
    export let likesCount = 0;
    export let isDarkMode = false;
    
    const dispatch = createEventDispatcher();
    let mounted = false;
    let activeButton = null;
    let showHeartBurst = false;
  
    onMount(() => {
      mounted = true;
      // Añadir detector de scroll para la barra de progreso
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    });
  
    function handleScroll() {
      const scrollProgress = document.querySelector('.scroll-progress-bar');
      if (scrollProgress) {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = `${scrolled}%`;
      }
    }
  
    async function like() {
      showHeartBurst = true;
      activeButton = 'like';
      dispatch('like');
      await new Promise(resolve => setTimeout(resolve, 1000));
      showHeartBurst = false;
    }
  
    function createRipple(event) {
      const button = event.currentTarget;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = 'ripple';
      
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  
    function handleButtonClick(action, event) {
      createRipple(event);
      activeButton = action;
      dispatch(action);
      setTimeout(() => activeButton = null, 300);
    }
</script>
  
{#if mounted}
<div class="mobile-nav-container" transition:fly={{ y: 100, duration: 800, easing: quintOut }}>
  <!-- Barra de progreso de scroll -->
  <div class="scroll-progress">
    <div class="scroll-progress-bar"></div>
  </div>

  <nav class="mobile-nav">
    <!-- Fondo con efecto de gradiente animado -->
    <div class="nav-background">
      <div class="gradient-overlay"></div>
    </div>

    <!-- Botones de navegación -->
    <button 
      on:click={like}
      class="nav-button like-button"
      class:active={activeButton === 'like'}
      aria-label="Me gusta">
      <div class="button-content">
        <i class={isLiked ? 'fas fa-heart liked' : 'far fa-heart'}></i>
        {#if showHeartBurst}
          <div class="heart-burst">
            {#each Array(8) as _, i}
              <div 
                class="heart-particle" 
                style="--angle: {i * 45}deg; --delay: {i * 50}ms"
              ></div>
            {/each}
          </div>
        {/if}
        {#if likesCount > 0}
          <span 
            class="count"
            in:scale={{
              duration: 400,
              easing: elasticOut,
              start: 0.5
            }}
          >{likesCount}</span>
        {/if}
      </div>
      <div class="button-background"></div>
    </button>

    <button 
      on:click={(e) => handleButtonClick('comments', e)}
      class="nav-button comment-button"
      class:active={activeButton === 'comments'}
      aria-label="Comentarios">
      <div class="button-content">
        <i class="fas fa-comments"></i>
        <div class="button-effect comment-effect">
          {#each Array(3) as _, i}
            <div class="comment-bubble" style="--delay: {i * 100}ms"></div>
          {/each}
        </div>
      </div>
      <div class="button-background"></div>
    </button>

    <button 
      on:click={(e) => handleButtonClick('rate', e)}
      class="nav-button rate-button"
      class:active={activeButton === 'rate'}
      aria-label="Calificar">
      <div class="button-content">
        <i class="fas fa-star"></i>
        <div class="star-effect">
          {#each Array(5) as _, i}
            <div class="star-spark" style="--rotation: {i * 72}deg"></div>
          {/each}
        </div>
      </div>
      <div class="button-background"></div>
    </button>

    <button 
      on:click={(e) => handleButtonClick('toggleDarkMode', e)}
      class="nav-button darkmode-button"
      class:active={activeButton === 'toggleDarkMode'}
      aria-label="Toggle Dark Mode">
      <div class="button-content mode-switch">
        <div class="mode-icon-container" class:dark={isDarkMode}>
          <i class="fas fa-sun sun-icon"></i>
          <i class="fas fa-moon moon-icon"></i>
        </div>
      </div>
      <div class="button-background"></div>
    </button>

    <button 
      on:click={(e) => handleButtonClick('scrollToTop', e)}
      class="nav-button scroll-top-button"
      class:active={activeButton === 'scrollToTop'}
      aria-label="Scroll to Top">
      <div class="button-content">
        <i class="fas fa-arrow-up"></i>
        <div class="scroll-effect">
          <div class="scroll-line"></div>
        </div>
      </div>
      <div class="button-background"></div>
    </button>

    <button 
      on:click={(e) => handleButtonClick('toggleToc', e)}
      class="nav-button toc-button"
      class:active={activeButton === 'toggleToc'}
      aria-label="Tabla de contenido">
      <div class="button-content">
        <i class="fas fa-list"></i>
        <div class="toc-effect">
          {#each Array(3) as _, i}
            <div class="toc-line" style="--delay: {i * 100}ms"></div>
          {/each}
        </div>
      </div>
      <div class="button-background"></div>
    </button>
  </nav>
</div>
{/if}
  
<style>
.mobile-nav-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
}

.scroll-progress {
  position: absolute;
  top: -3px;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.scroll-progress-bar {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, 
    var(--primary-color),
    var(--secondary-color),
    var(--primary-color));
  background-size: 200% 100%;
  animation: gradient-shift 3s linear infinite;
  transition: width 0.2s ease;
}

.mobile-nav {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.8rem 0;
  background: transparent;
  overflow: hidden;
}

.nav-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(var(--primary-rgb), 0.05) 0%,
    rgba(var(--secondary-rgb), 0.05) 50%,
    rgba(var(--primary-rgb), 0.05) 100%
  );
  background-size: 200% 200%;
  animation: gradient-shift 10s ease infinite;
}

.nav-button {
  position: relative;
  background: none;
  border: none;
  padding: 0.8rem;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.button-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.nav-button i {
  font-size: 1.4rem;
  color: var(--text-color);
  transition: all 0.3s ease;
  z-index: 2;
}

.button-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.3s ease;
  background: radial-gradient(
    circle at center,
    rgba(var(--primary-rgb), 0.2),
    transparent 70%
  );
}

.nav-button:active .button-background {
  transform: scale(3);
}

/* Ripple effect */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

/* Like button effects */
.like-button .liked {
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.heart-burst {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.heart-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ff6b6b;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: heart-burst 1s ease-out forwards;
  animation-delay: var(--delay);
}

/* Comment button effects */
.comment-effect {
  position: absolute;
  width: 100%;
  height: 100%;
}

.comment-bubble {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--primary-color);
  border-radius: 50%;
  opacity: 0;
  animation: float-up 1.5s ease-out infinite;
  animation-delay: var(--delay);
}

/* Star button effects */
.star-effect {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star-spark {
  position: absolute;
  width: 2px;
  height: 10px;
  background: #ffd700;
  transform-origin: center 20px;
  animation: spark-rotate 2s ease-in-out infinite;
}

/* Dark mode switch effects */
.mode-icon-container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-icon-container.dark {
  transform: rotateY(180deg);
}

.sun-icon, .moon-icon {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.moon-icon {
  transform: rotateY(180deg);
}

/* Scroll to top effects */
.scroll-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.scroll-line {
  position: absolute;
  width: 2px;
  height: 15px;
  background: var(--text-color);
  left: 50%;
  transform: translateX(-50%);
  animation: scroll-up 1.5s ease-in-out infinite;
}

/* TOC button effects */
.toc-effect {
  position: absolute;
  width: 60%;
  height: 60%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.toc-line {
  width: 100%;
  height: 2px;
  background: var(--text-color);
  transform-origin: left;
  animation: toc-line 1.5s ease-in-out infinite;
  animation-delay: var(--delay);
}

/* Animations */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes heart-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(20px);
    opacity: 0;
  }
}

@keyframes float-up {
  0% {
    transform: translate(-50%, 0) scale(1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -20px) scale(0);
    opacity: 0;
  }
}

@keyframes spark-rotate {
  0% {
    transform: rotate(var(--rotation)) scale(1);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  50% {
    transform: rotate(calc(var(--rotation) + 180deg)) scale(1.2);
  }
  100% {
    transform: rotate(calc(var(--rotation) + 360deg)) scale(1);
    opacity: 0;
  }
}

@keyframes scroll-up {
  0% {
    transform: translateX(-50%) translateY(15px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(-15px);
    opacity: 0;
  }
}

@keyframes toc-line {
  0% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(0.6);
  }
  100% {
    transform: scaleX(1);
  }
}

/* Hover y estados activos */
.nav-button:hover {
  transform: translateY(-2px);
}

.nav-button:hover i {
  transform: scale(1.1);
}

.nav-button.active i {
  transform: scale(0.9);
}

/* Badge de conteo */
.count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(45deg, #ff6b6b, #ff8787);
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(255, 107, 107, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.8);
  min-width: 20px;
  text-align: center;
}

/* Efectos específicos por botón */
.like-button:hover .heart-particle {
  animation-duration: 0.8s;
}

.comment-button:hover .comment-bubble {
  animation-duration: 1.2s;
}

.rate-button:hover .star-spark {
  animation-duration: 1.5s;
}

.darkmode-button:hover .mode-icon-container {
  transform: scale(1.1) rotateY(180deg);
}

.scroll-top-button:hover .scroll-line {
  animation-duration: 1.2s;
}

.toc-button:hover .toc-line {
  animation-duration: 1.2s;
}

/* Efectos de presión */
.nav-button:active {
  transform: scale(0.95) translateY(0);
}

.nav-button:active i {
  transform: scale(0.9);
}

/* Adaptaciones para dispositivos más pequeños */
@media (max-width: 360px) {
  .nav-button {
    padding: 0.6rem;
  }

  .nav-button i {
    font-size: 1.2rem;
  }

  .count {
    font-size: 0.7rem;
    padding: 1px 4px;
    min-width: 16px;
  }
}

/* Efectos de resplandor */
.nav-button::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transform: scale(0);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.nav-button:hover::after {
  opacity: 1;
  transform: scale(1);
}

/* Efectos de pulso */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0);
  }
}

.nav-button.active {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Efectos de transición suave */
.mobile-nav {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.mobile-nav:hover {
  transform: translateY(-2px);
}

/* Efectos de profundidad */
.mobile-nav {
  box-shadow: 
    0 -10px 20px rgba(0, 0, 0, 0.1),
    0 -5px 10px rgba(0, 0, 0, 0.05);
}

/* Efectos de reflejo */
.nav-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
}

/* Efectos de partículas flotantes */
@keyframes float-particle {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
}

.mobile-nav::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.1) 1px,
    transparent 1px
  );
  background-size: 15px 15px;
  animation: float-particle 3s ease-in-out infinite;
  pointer-events: none;
  opacity: 0.5;
}

/* Efectos de ondas */
@keyframes wave {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.nav-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--primary-rgb), 0.2),
    transparent
  );
  animation: wave 3s ease-in-out infinite;
}

/* Efectos de interacción avanzados */
.nav-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary-color);
}

.nav-button:focus-visible::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: inherit;
  border: 2px solid var(--primary-color);
  animation: focus-ring 1.5s ease-in-out infinite;
}

@keyframes focus-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>