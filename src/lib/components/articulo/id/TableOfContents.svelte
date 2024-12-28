<!-- src/lib/components/articulo/TableOfContents.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { tick } from 'svelte';

  export let articleContent = '';
  export let isMobile = false;
  export let showTocMobile = false;
  export let toggleTocMobile = () => {};
  export const articleId = '';

  const dispatch = createEventDispatcher();

  let toc = [];
  let activeSection = '';
  let tocElement;

  // Funciones para generar TOC
  function generateTableOfContents() {
    if (!articleContent) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = articleContent;
    const headings = Array.from(tempDiv.querySelectorAll('h2, h3, h4, h5, h6'));

    toc = headings.map((heading, index) => {
      const id = `section-${index}`;
      heading.id = id;
      return {
        id,
        text: heading.textContent.trim(),
        level: parseInt(heading.tagName.slice(1), 10)
      };
    });

    // Reemplazar el HTML con IDs
    articleContent = tempDiv.innerHTML;
  }

  // Función para actualizar la sección activa
  function updateActiveSection() {
    if (!toc.length) return;

    const sections = document.querySelectorAll('h2, h3, h4, h5, h6');
    let current = '';
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) {
        current = section.id;
      }
    }
    if (current !== activeSection) {
      activeSection = current;
      dispatch('activeSectionChange', activeSection);
    }
  }

  // Scroll to sección
  function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = isMobile || (window.matchMedia('(max-height: 900px) and (min-width: 1200px)').matches) ? 60 : 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    element.classList.add('highlight-section');
    setTimeout(() => element.classList.remove('highlight-section'), 2000);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (isMobile && showTocMobile) {
      toggleTocMobile();
    }
  }

  // Listener para scroll
  let scrollListener;

  onMount(() => {
    generateTableOfContents();

    scrollListener = () => {
      updateActiveSection();
    };

    window.addEventListener('scroll', scrollListener, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  });

  // Actualizar TOC cuando cambia el contenido
  $: if (articleContent) {
    generateTableOfContents();
  }

  // Scroll automático al cambiar sección activa
  $: if (activeSection && tocElement) {
    const activeItem = tocElement.querySelector(`.toc-item.active`);
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
</script>

<nav 
  class="table-of-contents {isMobile ? 'mobile' : ''}"
  bind:this={tocElement}
>
  <div class="toc-header">
    <h2>Contenido del Artículo</h2>
    {#if isMobile}
      <button class="close-button" on:click={toggleTocMobile} aria-label="Cerrar tabla de contenido">
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  <div class="toc-content">
    {#each toc as item}
      <button
        class="toc-item level-{item.level} {activeSection === item.id ? 'active' : ''}"
        on:click={() => scrollToSection(item.id)}
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
    z-index: 900; /* Asegurar que esté por encima de otros contenidos pero por debajo de modales */
    transition: all var(--transition-speed);
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
  }

  .toc-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: var(--border-radius);
    transition: transform var(--transition-speed);
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
    z-index: 900; /* Superior a la TOC en desktop */
    border-radius: 0;
    box-shadow: var(--box-shadow-elevated);
    animation: slideIn 0.3s ease;
    background-color: var(--background-color2);
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