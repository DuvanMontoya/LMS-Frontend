<script>
    import { onMount } from 'svelte';
    import { submitEvaluacion } from '$lib/api/evaluaciones/evaluaciones';
    import { sessionStore } from '$lib/stores/sessionStore';
    import { goto } from '$app/navigation';
  
    export let evaluacion;
  
    let respuestas = {};
    let loading = false;
    let error = null;
  
    onMount(() => {
      evaluacion.preguntas.forEach(pregunta => {
        respuestas[pregunta.id] = null;
      });
    });
  
    async function handleSubmit() {
      try {
        loading = true;
        const authToken = $sessionStore.access;
        const respuestasArray = Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
          pregunta: preguntaId,
          respuesta
        }));
        await submitEvaluacion(evaluacion.id, respuestasArray, authToken);
        goto(`/evaluaciones/${evaluacion.id}/resultados`);
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  </script>
  
  <div class="evaluacion-form">
    <div class="evaluacion-header">
      <h1>{evaluacion.titulo}</h1>
      <p>{evaluacion.descripcion}</p>
    </div>
  
    {#if error}
      <div class="error-message">
        <p>Error: {error}</p>
      </div>
    {:else}
      <form on:submit|preventDefault={handleSubmit}>
        {#each evaluacion.preguntas as pregunta, index}
          <div class="pregunta">
            <div class="pregunta-header">
              <h3>Pregunta {index + 1}</h3>
              <p>{pregunta.texto_pregunta}</p>
            </div>
            <div class="opciones">
              {#if pregunta.tipo_pregunta === 'Simple'}
                {#each pregunta.opciones as opcion}
                  <label class="opcion">
                    <input type="radio" bind:group={respuestas[pregunta.id]} value={opcion.id}>
                    <span class="opcion-texto">{opcion.texto_opcion}</span>
                  </label>
                {/each}
              {:else if pregunta.tipo_pregunta === 'Múltiple'}
                {#each pregunta.opciones as opcion}
                  <label class="opcion">
                    <input type="checkbox" bind:group={respuestas[pregunta.id]} value={opcion.id}>
                    <span class="opcion-texto">{opcion.texto_opcion}</span>
                  </label>
                {/each}
              {:else if pregunta.tipo_pregunta === 'Verdadero/Falso'}
                <label class="opcion">
                  <input type="radio" bind:group={respuestas[pregunta.id]} value={true}>
                  <span class="opcion-texto">Verdadero</span>
                </label>
                <label class="opcion">
                  <input type="radio" bind:group={respuestas[pregunta.id]} value={false}>
                  <span class="opcion-texto">Falso</span>
                </label>
              {:else if pregunta.tipo_pregunta === 'Abierta'}
                <textarea class="opcion-abierta" bind:value={respuestas[pregunta.id]}></textarea>
              {/if}
            </div>
          </div>
        {/each}
  
        <button type="submit" class="btn-submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Respuestas'}
        </button>
      </form>
    {/if}
  </div>
  
  <style>
    .evaluacion-form {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background-color: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .evaluacion-header {
      text-align: center;
      margin-bottom: 40px;
    }
  
    h1 {
      font-size: 36px;
      color: #2c3e50;
      margin-bottom: 10px;
    }
  
    .evaluacion-header p {
      font-size: 18px;
      color: #34495e;
    }
  
    .error-message {
      text-align: center;
      color: #e74c3c;
      margin-bottom: 20px;
    }
  
    .pregunta {
      margin-bottom: 40px;
      padding: 20px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .pregunta-header {
      margin-bottom: 20px;
    }
  
    h3 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 10px;
    }
  
    .pregunta-header p {
      font-size: 18px;
      color: #34495e;
    }
  
    .opciones {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-gap: 20px;
    }
  
    .opcion {
      display: flex;
      align-items: center;
      padding: 15px;
      background-color: #f1f1f1;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .opcion:hover {
      background-color: #e1e1e1;
    }
  
    .opcion input {
      margin-right: 10px;
    }
  
    .opcion-texto {
      font-size: 18px;
      color: #34495e;
    }
  
    .opcion-abierta {
      width: 100%;
      height: 150px;
      padding: 10px;
      font-size: 18px;
      border: none;
      border-radius: 4px;
      background-color: #f1f1f1;
      resize: none;
    }
  
    .btn-submit {
      display: block;
      width: 100%;
      padding: 15px;
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      background-color: #3498db;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .btn-submit:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  
    .btn-submit:hover:not(:disabled) {
      background-color: #2980b9;
    }
  </style>