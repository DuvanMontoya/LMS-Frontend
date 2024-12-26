<script>
    import { onMount } from 'svelte';
    import { getLeccionDetalles, registrarProgresoLeccion, agregarFeedbackLeccion } from '$lib/api/cursos/cursos';
  
    export let leccionId;
  
    let leccion = {};
    let progreso = 0;
    let feedback = {
      comentario: '',
      calificacion: 0
    };
  
    onMount(async () => {
      leccion = await getLeccionDetalles(leccionId);
      progreso = leccion.progreso || 0;
    });
  
    async function registrarProgreso() {
      try {
        await registrarProgresoLeccion(leccionId, progreso);
      } catch (error) {
        console.error('Error al registrar progreso:', error);
      }
    }
  
    async function agregarFeedback() {
      try {
        await agregarFeedbackLeccion(leccionId, feedback.comentario, feedback.calificacion);
        feedback = { comentario: '', calificacion: 0 };
      } catch (error) {
        console.error('Error al enviar feedback:', error);
      }
    }
  </script>
  
  <div class="leccion-detalles">
    <header class="leccion-header">
      <h2>{leccion.titulo}</h2>
      <p class="tipo-leccion">Tipo: {leccion.tipo_leccion}</p>
    </header>
    {#if leccion.tipo_leccion === 'Video'}
      <div class="video-container">
        <video src="{leccion.contenido_multimedia}" controls aria-label="Video de la lección">
          <track kind="captions" src={leccion.subtitulos || ''} label="Spanish captions" />
        </video>
      </div>
    {:else if leccion.tipo_leccion === 'Texto'}
      <div class="contenido-texto" innerHTML={leccion.contenido_texto}></div>
    {:else if leccion.tipo_leccion === 'Seminario'}
      <div class="contenido-seminario">
        <!-- Mostrar detalles del seminario -->
      </div>
    {/if}
    <div class="progreso">
      <label for="progreso">
        Progreso:
        <input id="progreso" type="range" min="0" max="100" bind:value={progreso} on:change={registrarProgreso}>
        <span>{progreso}%</span>
      </label>
    </div>
    <div class="feedback">
      <textarea placeholder="Agregar comentario" bind:value={feedback.comentario}></textarea>
      <select bind:value={feedback.calificacion}>
        <option value="0" disabled>Calificar</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button class="btn-feedback" on:click={agregarFeedback}>Enviar Feedback</button>
    </div>
    <div class="eventos">
      <!-- Mostrar registro de eventos de la lección -->
    </div>
    <div class="evaluacion">
      <!-- Mostrar detalles de la evaluación asociada, si existe -->
    </div>
  </div>
  
  <style>
    .leccion-detalles {
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background: #fff;
      color: #333;
      animation: fadeIn 0.5s ease-in-out;
    }
  
    .leccion-header {
      text-align: center;
      margin-bottom: 20px;
    }
  
    .leccion-header h2 {
      font-size: 2.5rem;
      color: #e74c3c;
      margin-bottom: 10px;
    }
  
    .leccion-header .tipo-leccion {
      font-size: 1.2rem;
      color: #34495e;
    }
  
    .video-container {
      margin-bottom: 20px;
      border-radius: 10px;
      overflow: hidden;
    }
  
    video {
      width: 100%;
      height: auto;
      border-radius: 10px;
    }
  
    .contenido-texto {
      margin-bottom: 20px;
      line-height: 1.6;
      font-size: 1.1rem;
      color: #555;
    }
  
    .progreso {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
  
    .progreso label {
      font-size: 1.1rem;
      color: #34495e;
    }
  
    .progreso input[type="range"] {
      margin: 0 10px;
      flex: 1;
    }
  
    .progreso span {
      font-size: 1.1rem;
      color: #e74c3c;
    }
  
    .feedback {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }
  
    .feedback textarea {
      width: 100%;
      height: 100px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 10px;
      font-size: 1rem;
    }
  
    .feedback select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 10px;
      font-size: 1rem;
    }
  
    .btn-feedback {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 1rem;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.3s;
    }
  
    .btn-feedback:hover {
      background-color: #c0392b;
      transform: scale(1.05);
    }
  
    .eventos,
    .evaluacion {
      margin-top: 20px;
      padding: 20px;
      border-radius: 10px;
      background: #f9f9f9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  </style>
  