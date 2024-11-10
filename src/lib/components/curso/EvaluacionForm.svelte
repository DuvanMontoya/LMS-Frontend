<script>
    import { onMount } from 'svelte';
    import { fetchFromAPI } from '$lib/api/cursos/cursos';
  
    export let evaluacion;
    export let access;
  
    let preguntas = [];
    let respuestas = {};
    let enviado = false;
    let calificacion = null;
    let cargando = true;
    let error = null;
  
    onMount(async () => {
      try {
        preguntas = await fetchFromAPI(`evaluaciones/${evaluacion.id}/preguntas`, access);
        cargando = false;
      } catch (e) {
        error = e.message;
        cargando = false;
      }
    });
  
    async function enviarRespuestas() {
      try {
        const data = await fetchFromAPI(`evaluaciones/${evaluacion.id}/respuestas`, access, {
          method: 'POST',
          body: respuestas,
        });
        calificacion = data.calificacion;
        enviado = true;
      } catch (e) {
        console.error('Error al enviar las respuestas:', e.message);
      }
    }
  </script>
  
  <div class="evaluacion-form">
    <h2>{evaluacion.titulo}</h2>
    {#if cargando}
      <div class="loading">Cargando preguntas...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else}
      {#if !enviado}
        <form on:submit|preventDefault={enviarRespuestas}>
          {#each preguntas as pregunta, i}
            <div class="pregunta">
              <p class="texto-pregunta">{i + 1}. {pregunta.texto_pregunta}</p>
              {#if pregunta.tipo_pregunta === 'Simple'}
                <ul class="opciones">
                  {#each pregunta.opciones as opcion}
                    <li>
                      <label>
                        <input type="radio" bind:group={respuestas[pregunta.id]} value={opcion.id} />
                        {opcion.texto_opcion}
                      </label>
                    </li>
                  {/each}
                </ul>
              {:else if pregunta.tipo_pregunta === 'Múltiple'}
                <ul class="opciones">
                  {#each pregunta.opciones as opcion}
                    <li>
                      <label>
                        <input type="checkbox" bind:group={respuestas[pregunta.id]} value={opcion.id} />
                        {opcion.texto_opcion}
                      </label>
                    </li>
                  {/each}
                </ul>
              {:else if pregunta.tipo_pregunta === 'Verdadero/Falso'}
                <div class="opciones-bool">
                  <label>
                    <input type="radio" bind:group={respuestas[pregunta.id]} value={true} />
                    Verdadero
                  </label>
                  <label>
                    <input type="radio" bind:group={respuestas[pregunta.id]} value={false} />
                    Falso
                  </label>
                </div>
              {:else if pregunta.tipo_pregunta === 'Abierta'}
                <textarea class="respuesta-abierta" bind:value={respuestas[pregunta.id]}></textarea>
              {/if}
            </div>
          {/each}
          <button type="submit" class="enviar-btn">Enviar respuestas</button>
        </form>
      {:else}
        <div class="resultado">
          <h3>Resultado de la evaluación</h3>
          <p>Tu calificación es: {calificacion}%</p>
        </div>
      {/if}
    {/if}
  </div>
  
  <style>
    .evaluacion-form {
      max-width: 600px;
      margin: 0 auto;
    }
  
    .evaluacion-form h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 20px;
    }
  
    .pregunta {
      margin-bottom: 20px;
    }
  
    .texto-pregunta {
      font-size: 18px;
      color: #333;
      margin-bottom: 10px;
    }
  
    .opciones {
      list-style: none;
      padding: 0;
    }
  
    .opciones li {
      margin-bottom: 5px;
    }
  
    .opciones-bool {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  
    .respuesta-abierta {
      width: 100%;
      height: 100px;
      resize: vertical;
      margin-top: 10px;
    }
  
    .enviar-btn {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
  
    .enviar-btn:hover {
      background-color: #45a049;
    }
  
    .resultado {
      text-align: center;
      margin-top: 20px;
    }
  
    .resultado h3 {
      font-size: 20px;
      color: #333;
      margin-bottom: 10px;
    }
  
    .resultado p {
      font-size: 18px;
      color: #666;
    }
  
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
    }
  
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  
    .error {
      color: red;
      text-align: center;
      margin-top: 20px;
    }
  </style>