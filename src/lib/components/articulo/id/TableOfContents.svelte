<!-- src/lib/components/articulo/id/TableOfContents.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut, elasticOut } from 'svelte/easing';
  
  export let articleContent = '';
  export let isMobile = false;
  export let showTocMobile = false;
  export let toggleTocMobile = () => {};
  export const articleId = '';
  export const currentSection = '';

  const dispatch = createEventDispatcher();

  let toc = [];
  let activeSection = '';
  let tocElement;
  let observer;
  let expandedSections = new Set();
  let searchTerm = '';
  let filteredToc = [];
  let showSearchResults = false;
  let lastScrollPosition = 0;
  let progressPercentage = 0;

  // Función mejorada para generar TOC con jerarquía
  function generateTableOfContents() {
    if (!articleContent) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = articleContent;
    const headings = Array.from(tempDiv.querySelectorAll('h2, h3, h4, h5, h6'));

    let hierarchy = [];
    let lastLevel = 1;

    toc = headings.map((heading, index) => {
      const id = `section-${index}-${Date.now()}`;
      heading.id = id;
      const level = parseInt(heading.tagName.slice(1), 10);
      const item = {
        id,
        text: heading.textContent.trim(),
        level,
        children: [],
        parent: null,
        index,
        visible: true
      };

      if (level > lastLevel) {
        hierarchy.push(item);
      } else if (level < lastLevel) {
        while (hierarchy.length > 0 && hierarchy[hierarchy.length - 1].level >= level) {
          hierarchy.pop();
        }
        if (hierarchy.length > 0) {
          hierarchy[hierarchy.length - 1].children.push(item);
          item.parent = hierarchy[hierarchy.length - 1];
        }
      } else if (hierarchy.length > 0) {
        const parent = hierarchy[hierarchy.length - 2];
        if (parent) {
          parent.children.push(item);
          item.parent = parent;
        }
      }

      lastLevel = level;
      return item;
    });

    // Actualizar el contenido con los nuevos IDs
    articleContent = tempDiv.innerHTML;
    setupIntersectionObserver();
  }

  function setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            updateActiveSection(id);
          }
        });
      },
      {
        rootMargin: '-10% 0px -85% 0px'
      }
    );

    document.querySelectorAll('h2, h3, h4, h5, h6').forEach(heading => {
      observer.observe(heading);
    });
  }

  function updateActiveSection(id) {
    if (id !== activeSection) {
      activeSection = id;
      expandParentSections(id);
      dispatch('activeSectionChange', id);
      updateProgress();
    }
  }

  function expandParentSections(id) {
    const section = toc.find(item => item.id === id);
    if (!section) return;

    let current = section;
    while (current.parent) {
      expandedSections.add(current.parent.id);
      current = current.parent;
    }
    expandedSections = expandedSections; // Trigger reactivity
  }

  function toggleSection(id) {
    if (expandedSections.has(id)) {
      expandedSections.delete(id);
    } else {
      expandedSections.add(id);
    }
    expandedSections = expandedSections;
  }

  function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = isMobile ? 80 : 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // Añadir efecto de highlight
    element.classList.add('highlight-section');
    setTimeout(() => {
      element.classList.remove('highlight-section');
    }, 2000);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (isMobile && showTocMobile) {
      toggleTocMobile();
    }
  }

  function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase();
    if (searchTerm.length > 0) {
      filteredToc = toc.filter(item => 
        item.text.toLowerCase().includes(searchTerm)
      );
      showSearchResults = true;
    } else {
      showSearchResults = false;
    }
  }

  function updateProgress() {
    const winScroll = window.pageYOffset;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progressPercentage = (winScroll / height) * 100;
  }

  // Cleanup
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  // Reactive statements
  $: if (articleContent) {
    generateTableOfContents();
  }

  onMount(() => {
    generateTableOfContents();
    window.addEventListener('scroll', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
    };
  });
</script>

<nav 
  class="table-of-contents {isMobile ? 'mobile' : ''}"
  class:dark-mode={document.documentElement.classList.contains('dark')}
  bind:this={tocElement}
  transition:fly={{ y: isMobile ? 0 : 20, x: isMobile ? -100 : 0, duration: 400, easing: quintOut }}
>
  <div class="toc-header" style="--progress: {progressPercentage}%">
    <div class="header-content">
      <h2>Contenido del Artículo</h2>
      {#if isMobile}
        <button 
          class="close-button" 
          on:click={toggleTocMobile}
          aria-label="Cerrar tabla de contenido"
        >
          <span aria-hidden="true"><i class="fas fa-times"></i></span>
        </button>
      {/if}
    </div>
    <div class="progress-bar"></div>
  </div>

  <div class="search-container" transition:slide={{duration: 300}}>
    <div class="search-input-wrapper">
      <i class="fas fa-search search-icon"></i>
      <input 
        type="text" 
        placeholder="Buscar en el contenido..." 
        bind:value={searchTerm}
        on:input={handleSearch}
        class="search-input"
      />
      {#if searchTerm}
        <button 
          class="clear-search" 
          on:click={() => {searchTerm = ''; showSearchResults = false;}}
          aria-label="Clear search"
        >
          <i class="fas fa-times"></i>
        </button>
      {/if}
    </div>
  </div>

  <div class="toc-content" class:searching={showSearchResults}>
    {#if showSearchResults}
      <div class="search-results" transition:fade={{duration: 200}}>
        {#if filteredToc.length > 0}
          {#each filteredToc as item}
            <button
              class="search-result-item"
              class:active={activeSection === item.id}
              on:click={() => scrollToSection(item.id)}
            >
              <i class="fas fa-chevron-right"></i>
              <span>{item.text}</span>
            </button>
          {/each}
        {:else}
          <div class="no-results">
            <i class="fas fa-search"></i>
            <p>No se encontraron resultados</p>
          </div>
        {/if}
      </div>
    {:else}
      {#each toc as item}
        {#if !item.parent}
          <div class="section-container">
            <button
              class="toc-item level-{item.level}"
              class:active={activeSection === item.id}
              on:click={() => scrollToSection(item.id)}
            >
              <div class="item-content">
                <div class="marker-container">
                  {#if item.children.length > 0}
                    <span 
                      role="button"
                      class="expand-button"
                      class:expanded={expandedSections.has(item.id)}
                      tabindex="0"
                      on:click|stopPropagation={() => toggleSection(item.id)}
                      on:keydown|stopPropagation={(e) => e.key === 'Enter' && toggleSection(item.id)}
                      aria-label="Expandir sección"
                    >
                      <i class="fas fa-chevron-right"></i>
                    </span>
                  {/if}
                  <div class="marker-dot"></div>
                  <div class="marker-line"></div>
                </div>
                <span class="toc-text">{item.text}</span>
              </div>
            </button>

            {#if item.children.length > 0 && expandedSections.has(item.id)}
              <div class="children-container" transition:slide={{duration: 300}}>
                {#each item.children as child}
                  <button
                    class="toc-item level-{child.level}"
                    class:active={activeSection === child.id}
                    on:click={() => scrollToSection(child.id)}
                  >
                    <div class="item-content">
                      <div class="marker-container">
                        <div class="marker-dot"></div>
                        <div class="marker-line"></div>
                      </div>
                      <span class="toc-text">{child.text}</span>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    {/if}
  </div>
</nav>

<style>


.table-of-contents {
  width: 300px;
  /* height: calc(100vh - 2rem); */
  height: 100 vh; 
  background-color: var(--background-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 1rem;
  overflow: hidden;
  transition: all var(--transition-speed);
}

.table-of-contents:hover {
  box-shadow: var(--box-shadow-elevated);
  transform: translateY(-2px);
}

.toc-header {
  padding: 1.5rem;
  background: var(--header-gradient);
  position: relative;
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.toc-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.table-of-contents:hover .toc-header::before {
  opacity: 1;
}

.toc-header h2 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: var(--progress);
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0.9)
  );
  transition: width 0.3s ease;
}

.search-container {
  padding: 1rem;
  border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-color-lighter);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  color: var(--text-color);
  font-size: 0.9rem;
  transition: all var(--transition-speed);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.clear-search {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-color-lighter);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all var(--transition-speed);
}

.clear-search:hover {
  background-color: rgba(var(--text-rgb), 0.1);
}

.toc-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.toc-content::-webkit-scrollbar {
  width: 6px;
}

.toc-content::-webkit-scrollbar-track {
  background: transparent;
}

.toc-content::-webkit-scrollbar-thumb {
  background: rgba(var(--text-rgb), 0.2);
  border-radius: 3px;
}

.section-container {
  margin-bottom: 0.5rem;
}

.toc-item {
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-speed);
  position: relative;
  overflow: hidden;
  text-align: left;
}

.item-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.marker-container {
  position: relative;
  display: flex;
  align-items: center;
  padding-top: 0.25rem;
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
  height: calc(100% + 1rem);
  background-color: var(--text-color-lighter);
  opacity: 0.2;
  transform-origin: top;
  transition: all var(--transition-speed);
}

.toc-text {
  flex: 1;
  font-size: 0.95rem;
  transition: all var(--transition-speed);
  line-height: 1.4;
}

.expand-button {
  background: none;
  border: none;
  padding: 0.25rem;
  color: var(--text-color-lighter);
  cursor: pointer;
  transition: all var(--transition-speed);
  margin-right: 0.5rem;
}

.expand-button i {
  transition: transform var(--transition-speed);
}

.expand-button.expanded i {
  transform: rotate(90deg);
}

.children-container {
  margin-left: 1.5rem;
}

/* Niveles de indentación */
.level-2 { padding-left: 2.5rem; }
.level-3 { padding-left: 3.5rem; }
.level-4 { padding-left: 4.5rem; }
.level-5 { padding-left: 5.5rem; }
.level-6 { padding-left: 6.5rem; }

/* Estados y animaciones */
.toc-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color)
  );
  opacity: 0;
  transition: opacity var(--transition-speed);
  z-index: 1;
}

.toc-item:hover::before {
  opacity: 0.05;
}

.toc-item:hover .marker-dot {
  background-color: var(--primary-color);
  transform: scale(1.2);
}

.toc-item:hover .toc-text {
  color: var(--primary-color);
  transform: translateX(5px);
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

.toc-item.active .toc-text {
  transform: translateX(5px);
}

/* Resultados de búsqueda */
.search-results {
  padding: 0.5rem;
}

.search-result-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-radius: var(--border-radius);
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.search-result-item i {
  color: var(--text-color-lighter);
  transition: all var(--transition-speed);
}

.search-result-item:hover {
  background-color: rgba(var(--primary-rgb), 0.1);
}

.search-result-item:hover i {
  color: var(--primary-color);
  transform: translateX(3px);
}

.search-result-item.active {
  background-color: rgba(var(--primary-rgb), 0.15);
  color: var(--primary-color);
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: var(--text-color-lighter);
}

.no-results i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Versión móvil */
.mobile {
  position: fixed;
  top: 0;
  left: 0;
  width: 85%;
  max-width: 350px;
  height: 100vh;
  margin: 0;
  border-radius: 0;
  z-index: 2000;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-speed);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

/* Dark mode */
.dark-mode {
  background-color: var(--background-color2);
}

.dark-mode .search-input {
  background-color: var(--background-elevated);
}

.dark-mode .toc-item:hover::before {
  opacity: 0.1;
}

/* Animaciones adicionales */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.toc-item.active .marker-dot {
  animation: pulse 2s infinite;
}

/* Efectos de hover */
.table-of-contents:hover .toc-header {
  background-position: right center;
}

.table-of-contents:hover .progress-bar {
  height: 4px;
}

/* Scrollbar personalizado para dark mode */
.dark-mode .toc-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

/* Efectos de focus */
.toc-item:focus {
  outline: none;
}

.toc-item:focus-visible::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius);
  animation: focus-pulse 1.5s infinite;
}

@keyframes focus-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Efectos de highlight para secciones activas */
:global(.highlight-section) {
  position: relative;
}

:global(.highlight-section::before) {
  content: '';
  position: absolute;
  left: -1rem;
  right: -1rem;
  top: -0.5rem;
  bottom: -0.5rem;
  background: linear-gradient(
    to right,
    rgba(var(--primary-rgb), 0.1),
    rgba(var(--primary-rgb), 0.05)
  );
  border-radius: var(--border-radius);
  z-index: -1;
  animation: highlight-fade 2s ease-out forwards;
}

@keyframes highlight-fade {
  0% { opacity: 0; transform: scale(0.95); }
  20% { opacity: 1; transform: scale(1); }
  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.05); }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .table-of-contents:not(.mobile) {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .table-of-contents:not(.mobile) {
    display: none;
  }

  .toc-item {
    padding: 0.6rem 1.2rem;
  }

  .toc-text {
    font-size: 0.9rem;
  }
}
</style>