<script>
    import { onMount } from 'svelte';
    import { getLecciones } from './api';
  
    let lecciones = [];
    let filtros = {
      tipo: '',
      estado: '',
      prerrequisitos: ''
    };
  
    onMount(async () => {
      lecciones = await getLecciones();
    });
  
    function filtrarLecciones() {
      // Lógica para filtrar las lecciones según los filtros seleccionados
    }
  </script>
  
  <div class="lecciones-lista">
    <div class="filtros">
      <!-- Controles para seleccionar los filtros -->
    </div>
    <ul>
      {#each lecciones as leccion}
        <li>
          <a href="/lecciones/{leccion.id}">
            <h3>{leccion.titulo}</h3>
            <p>Estado: {leccion.estado}</p>
          </a>
        </li>
      {/each}
    </ul>
  </div>