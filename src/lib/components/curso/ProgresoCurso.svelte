<script>
    import { onMount } from 'svelte';
    import { getCursoDetalles, calcularProgresoCurso } from '$lib/api/cursos/cursos';
  
    export let cursoId;
    export let access;
  
    let progreso = 0;
    let curso = {};
    let error = null;
  
    onMount(async () => {
      try {
        curso = await getCursoDetalles(cursoId, access);
        progreso = await calcularProgresoCurso(cursoId, access);
      } catch (err) {
        error = 'Error al calcular el progreso del curso: ' + err.message;
      }
    });
  </script>
  


  <div class="progreso-curso">
    <h2 class="seccion-titulo">Progreso del Curso</h2>
  
    {#if error}
      <div class="error-mensaje">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{error}</span>
      </div>
    {:else if !curso}
      <div class="cargando-spinner">
        <div class="spinner"></div>
        <span>Cargando progreso del curso...</span>
      </div>
    {:else}
      <div class="progreso-info">
        <div class="progreso-porcentaje">
          <div class="circulo-progreso">
            <div class="progreso-valor" style="--progreso:{progreso};">
              {progreso}%
            </div>
          </div>
          <span class="progreso-texto">Completado</span>
        </div>
  
        <div class="progreso-detalles">
          <div class="detalle">
            <i class="fas fa-book"></i>
            <span class="detalle-valor">{curso.lecciones_completadas}</span>
            <span class="detalle-texto">Lecciones Completadas</span>
          </div>
          <div class="detalle">
            <i class="fas fa-book"></i>
            <span class="detalle-valor">{curso.total_lecciones}</span>
            <span class="detalle-texto">Total de Lecciones</span>
          </div>
          <div class="detalle">
            <i class="fas fa-clock"></i>
            <span class="detalle-valor">{curso.tiempo_restante}</span>
            <span class="detalle-texto">Tiempo Restante (horas)</span>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .progreso-curso {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      font-family: 'Roboto', sans-serif;
      text-align: center;
    }
  
    .seccion-titulo {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 30px;
    }
  
    .error-mensaje {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e74c3c;
      font-size: 1.2rem;
    }
  
    .error-mensaje i {
      margin-right: 10px;
    }
  
    .cargando-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #7f8c8d;
      font-size: 1.2rem;
    }
  
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 2s linear infinite;
      margin-bottom: 10px;
    }
  
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  
    .progreso-info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    .progreso-porcentaje {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 30px;
    }
  
    .circulo-progreso {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: conic-gradient(#4caf50 var(--progreso), #e0e0e0 0);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    .progreso-valor {
      font-size: 3rem;
      font-weight: bold;
      color: #2c3e50;
    }
  
    .progreso-texto {
      font-size: 1.2rem;
      color: #7f8c8d;
      margin-top: 10px;
    }
  
    .progreso-detalles {
      display: flex;
      justify-content: center;
    }
  
    .detalle {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 20px;
    }
  
    .detalle i {
      font-size: 2rem;
      color: #4caf50;
      margin-bottom: 10px;
    }
  
    .detalle-valor {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
    }
  
    .detalle-texto {
      font-size: 1.2rem;
      color: #7f8c8d;
    }
  </style>