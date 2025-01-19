<script>
    import { onMount, afterUpdate } from 'svelte';
  
    export let htmlContent = '';
  
    let headings = [];
  
    // Al montar, analizamos el HTML y extraemos encabezados
    onMount(() => {
      extractHeadings();
    });
  
    afterUpdate(() => {
      extractHeadings();
    });
  
    function extractHeadings() {
      // Creamos un contenedor temporal
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent || '', 'text/html');
  
      // Buscamos h2, h3, h4
      let allHeads = [...doc.querySelectorAll('h2, h3, h4')];
      headings = allHeads.map(h => ({
        level: h.tagName.toLowerCase(),
        text: h.textContent.trim()
      }));
    }
  </script>
  
  <div class="question-toc">
    <h4>Temas en la Explicación</h4>
    {#if headings.length === 0}
      <p class="empty-toc">No hay secciones definidas</p>
    {:else}
      <ul>
        {#each headings as heading}
          <li class="toc-item {heading.level}">
            <span>{heading.text}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  
  <style>
    .question-toc {
      margin-top: 1rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
    }
  
    h4 {
      margin-top: 0;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
  
    .empty-toc {
      font-size: 0.875rem;
      color: #6b7280;
    }
  
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  
    .toc-item {
      font-size: 0.875rem;
      color: #374151;
      padding-left: 1rem;
      position: relative;
    }
  
    .toc-item::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #9ca3af;
    }
  
    .toc-item.h3 {
      margin-left: 1rem;
    }
  
    .toc-item.h4 {
      margin-left: 2rem;
    }
  </style>  