<!-- src/lib/components/curso/CourseCurriculum.svelte -->
<script>
    import { slide } from "svelte/transition"; // Importar transiciones
    export let temas = [];
    export let toggleTema;
    export let toggleAllTemas;
    export let allTemasCollapsed;
  
    // Para manejar el teclado accesible
    function handleKeyPress(event, index) {
      if (event.key === 'Enter' || event.key === ' ') {
        toggleTema(index);
      }
    }
  </script>
  
  <section class="course-curriculum">
    <h2 class="section-title">Contenido del curso</h2>
    <button class="btn btn-toggle-all" on:click={toggleAllTemas}>
      {allTemasCollapsed ? 'Expandir todos los temas' : 'Colapsar todos los temas'}
    </button>
    {#if temas && temas.length > 0}
      <div class="curriculum-list">
        {#each temas as tema, temaIndex}
          <div class="curriculum-section">
            <h3 class="section-header">
              <button 
                on:click={() => toggleTema(temaIndex)} 
                aria-expanded={!tema.collapsed}
                on:keydown={(e) => handleKeyPress(e, temaIndex)}
                class="header-button"
              >
                <span class="section-title">{tema.titulo}</span>
                <span class="section-meta">
                  <i class="fas fa-clock"></i> {tema.tiempo_estimado} min
                  <i class={tema.collapsed ? "fas fa-chevron-down" : "fas fa-chevron-up"}></i>
                </span>
              </button>
            </h3>
            {#if !tema.collapsed}
              <ul class="lesson-list" transition:slide>
                {#each tema.lecciones as leccion, leccionIndex}
                  <li class="lesson-item">
                                    <span class="lesson-number">{temaIndex + 1}.{leccionIndex + 1}</span>
                                    <span class="lesson-title">{leccion.titulo}</span>
                                    <span class="lesson-duration">{leccion.tiempo_estimado} min</span>
                                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <p class="no-content">No se encontró contenido para este curso.</p>
    {/if}
  </section>  
  
  
  <style>
    .course-curriculum {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .course-curriculum:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
  
    .section-title {
      font-family: 'Merriweather', serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 1rem;
      border-bottom: 3px solid #3498db;
      display: inline-block;
      padding-bottom: 0.3rem;
    }
  
    .btn-toggle-all {
      background-color: #3498db;
      color: white;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      transition: background-color 0.3s ease;
    }
  
    .btn-toggle-all:hover {
      background-color: #2980b9;
    }
  
    .curriculum-list {
      border-top: 2px solid #ecf0f1;
    }
  
    .curriculum-section {
      border-bottom: 1px solid #ecf0f1;
    }
  
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: #f1f2f6;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: background-color 0.3s ease;
    }
  
    .section-header:hover, .section-header:focus {
      background-color: #dfe4ea;
    }
  
    .section-title {
      font-size: 1.2rem;
      color: #2c3e50;
    }
  
    .section-meta {
      font-size: 0.95rem;
      color: #7f8c8d;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  
    .section-meta i {
      color: #3498db;
    }
  
    .lesson-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
      background-color: #fafafa;
      border-left: 4px solid #3498db;
    }
  
    .lesson-item {
      display: flex;
      align-items: center;
      padding: 0.8rem 1.2rem;
      border-bottom: 1px solid #ecf0f1;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
  
    .lesson-item:hover, .lesson-item:focus {
      background-color: #f1f2f6;
    }
  
    .lesson-number {
      font-weight: 700;
      color: #3498db;
      margin-right: 1rem;
      min-width: 30px;
    }
  
    .lesson-title {
      flex: 1;
      font-size: 1rem;
      color: #2c3e50;
    }
  
    .lesson-duration {
      font-size: 0.9rem;
      color: #7f8c8d;
    }
  
    .no-content {
      text-align: center;
      color: #7f8c8d;
      font-size: 1rem;
      padding: 1rem 0;
    }
  
    @media (max-width: 768px) {
      .lesson-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
  
      .lesson-number, .lesson-duration {
        font-size: 0.85rem;
      }
    }
  </style>  