<!-- src/lib/components/articulo/TableOfContents.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  export let toc = [];
  export let activeSection = "";
  export let onNavigate = () => {};
  export let isMobile = false;
  export let toggleTOC = () => {};

  let tocElement;
  let isSticky = false;

  let observer;

  onMount(() => {
    if (!isMobile) {
      observer = new IntersectionObserver(
        ([e]) => isSticky = e.intersectionRatio < 1,
        { threshold: [1] }
      );
      if (tocElement) {
        observer.observe(tocElement);
      }
    }

    return () => {
      if (observer && tocElement) {
        observer.unobserve(tocElement);
      }
    };
  });
</script>

<nav 
  class="table-of-contents {isMobile ? 'mobile' : ''} {isSticky ? 'sticky' : ''}"
  bind:this={tocElement}
>
  <div class="toc-header">
    <h2>Contenido del Artículo</h2>
    {#if isMobile}
      <button class="close-button" on:click={toggleTOC} aria-label="Cerrar tabla de contenido">
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  <div class="toc-content">
    {#each toc as item}
      <button
        class="toc-item level-{item.level} {activeSection === item.id ? 'active' : ''}"
        on:click={() => onNavigate(item.id)}
      >
        <div class="toc-marker">
          <div class="marker-dot"></div>
          {#if item.level > 1}
            <div class="marker-line"></div>
          {/if}
        </div>
        <span class="toc-text">{item.text}</span>
      </button>
    {/each}
  </div>
</nav>

<style>
  .table-of-contents {
    width: 300px;
    background-color: var(--background-color2);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    margin-right: 2rem;
    border: 1px solid rgba(var(--primary-rgb), 0.1);
    position: relative;
    z-index: 1500; /* Asegurar que esté por encima de otros contenidos pero por debajo de modales */
    transition: all var(--transition-speed);
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
  }

  .table-of-contents.sticky {
    position: fixed;
    top: 80px; /* Ajustado para coincidir con el header fijo */
  }

  .toc-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    position: relative;
    overflow: hidden;
  }

  .toc-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0L19.515 8.485 17.343 10.657 28 0h-2.83zM32.656 0L41.142 8.485 39.728 9.9l-7.9-7.9h.828zm5.656 0l8.485 8.485-1.414 1.414-7.9-7.9h.83zm5.657 0l8.485 8.485-1.414 1.414-7.9-7.9h.83zM2.828 0L0 2.828v2.83L5.657 0H2.828zM54.627 60l.83-.828-1.415-1.415L51.8 60h2.827zM5.373 60l-.83-.828L5.96 57.757 8.2 60H5.374zM48.97 60l3.657-3.657-1.414-1.414L46.143 60h2.828zM11.03 60L7.372 56.343 8.787 54.93 13.857 60H11.03zm32.284 60L49.8 53.515l-1.414-1.414-7.9 7.9h2.83zM16.686 60L10.2 53.515l1.414-1.414 7.9 7.9h-2.83zM22.344 60L13.858 51.515l1.414-1.414 7.9 7.9h-.828zm5.656 60l-8.485-8.485-2.172-2.172L28 60h-2.83zM32.656 60l8.486-8.485-1.414-1.414-7.9 7.9h.828zm5.656 60l8.485-8.485-1.414-1.414-7.9 7.9h.83zm5.657 60l8.485-8.485-1.414-1.414-7.9 7.9h.83zM2.828 60L0 57.172v-2.83L5.657 60H2.828z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E") center/60px;
  }

  .toc-header h2 {
    color: white;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    position: relative;
    z-index: 1;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: white;
    padding: 0.5rem;
    cursor: pointer;
    transition: transform var(--transition-speed);
    z-index: 1;
  }

  .close-button:hover {
    transform: rotate(90deg);
  }

  .toc-content {
    padding: 1rem 0;
    overflow-y: auto;
    flex: 1;
  }

  .toc-item {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 0.95rem;
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-speed);
    position: relative;
  }

  .toc-marker {
    position: relative;
    display: flex;
    align-items: center;
    padding-top: 0.25rem;
    flex-shrink: 0;
  }

  .marker-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--text-color-lighter);
    transition: all var(--transition-speed);
  }

  .marker-line {
    position: absolute;
    left: 4px;
    top: 100%;
    width: 2px;
    height: calc(100% + 0.75rem);
    background-color: var(--text-color-lighter);
    opacity: 0.2;
    transform-origin: top;
    transition: all var(--transition-speed);
  }

  .toc-text {
    flex: 1;
    transition: all var(--transition-speed);
    padding: 0.25rem 0;
  }

  .toc-item:hover {
    color: var(--primary-color);
  }

  .toc-item:hover .marker-dot {
    background-color: var(--primary-color);
    transform: scale(1.2);
  }

  .toc-item.active {
    color: var(--primary-color);
    font-weight: 500;
  }

  .toc-item.active .marker-dot {
    background-color: var(--primary-color);
    transform: scale(1.4);
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.2);
  }

  .toc-item.active .marker-line {
    background-color: var(--primary-color);
    opacity: 0.5;
  }

  .level-2 { padding-left: 2.5rem; }
  .level-3 { padding-left: 3.5rem; }
  .level-4 { padding-left: 4.5rem; }
  .level-5 { padding-left: 5.5rem; }
  .level-6 { padding-left: 6.5rem; }

  .mobile {
    position: fixed;
    top: 0;
    left: 0;
    width: 85%;
    max-width: 350px;
    height: 100vh;
    margin: 0;
    z-index: 2000; /* Superior a la TOC en desktop */
    border-radius: 0;
    box-shadow: var(--box-shadow-elevated);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media (max-width: 1200px) {
    .table-of-contents:not(.mobile) {
      width: 280px;
      margin-right: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .table-of-contents:not(.mobile) {
      display: none;
    }
  }
</style>