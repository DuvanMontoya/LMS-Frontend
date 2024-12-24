<!-- src/lib/components/curso/LeccionViewer.svelte -->

<script>
  import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
  import { fade } from 'svelte/transition';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faSpinner, faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';

  export let leccionActual;
  export let completada = false;

  const dispatch = createEventDispatcher();

  let videoError = false;
  let videoLoading = true;
  let player;
  let youtubeApiReady = false;
  let currentVideoId = null;

  // Reutilizar el reproductor de YouTube
  $: if (leccionActual && leccionActual.tipo_leccion === 'Video') {
    const newVideoId = extractYouTubeVideoId(leccionActual.contenido_multimedia);
    if (newVideoId !== currentVideoId) {
      currentVideoId = newVideoId;
      updateVideo();
    }
  }

  function extractYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  function completarLeccion() {
    if (!completada) {
      dispatch('completar');
    }
  }

  function handleVideoError() {
    videoError = true;
    videoLoading = false;
  }

  function handleVideoReady() {
    videoLoading = false;
  }

  function updateVideo() {
    videoError = false;
    videoLoading = true;

    if (youtubeApiReady && player) {
      player.loadVideoById(currentVideoId);
    } else if (youtubeApiReady) {
      createYouTubePlayer();
    }
  }

  onMount(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        youtubeApiReady = true;
        if (leccionActual.tipo_leccion === 'Video') {
          createYouTubePlayer();
        }
      };
    } else {
      youtubeApiReady = true;
      if (leccionActual.tipo_leccion === 'Video') {
        createYouTubePlayer();
      }
    }

    return () => {
      if (player && player.destroy) {
        player.destroy();
      }
    };
  });

  function createYouTubePlayer() {
    player = new YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: currentVideoId,
      playerVars: {
        'playsinline': 1,
        'modestbranding': 1,
        'rel': 0,
        'origin': window.location.origin
      },
      events: {
        'onReady': handleVideoReady,
        'onError': handleVideoError
      }
    });
  }
</script>

<div class="leccion-viewer" transition:fade={{ duration: 300 }}>
  <h2 class="leccion-titulo">{leccionActual.titulo}</h2>

  {#if leccionActual.tipo_leccion === 'Video'}
    <div class="video-wrapper">
      <div class="video-container">
        {#if videoLoading}
          <div class="loading-overlay" aria-live="polite">
            <FontAwesomeIcon icon={faSpinner} spin class="icono-spinner" />
            <span>Cargando video...</span>
          </div>
        {/if}
        {#if videoError}
          <div class="error-overlay" aria-live="assertive">
            <FontAwesomeIcon icon={faExclamationTriangle} class="icono-error" />
            <p>Se produjo un error al cargar el video. Por favor, inténtalo de nuevo más tarde.</p>
            <button class="btn-reintentar" on:click={updateVideo} aria-label="Reintentar cargar el video">
              <FontAwesomeIcon icon={faRedo} /> Reintentar
            </button>
          </div>
        {/if}
        <div id="youtube-player" aria-label="Reproductor de video"></div>
      </div>
    </div>
  {:else if leccionActual.tipo_leccion === 'Texto'}
    <div class="texto-container">
      {@html leccionActual.contenido_multimedia}
      <button 
        class="btn-completar-leccion" 
        on:click={completarLeccion} 
        disabled={completada}
        aria-label={completada ? "Lección completada" : "Marcar lección como completada"}
      >
        {completada ? 'Lección Completada' : 'Marcar como Completada'}
      </button>
    </div>
  {:else if leccionActual.tipo_leccion === 'Quiz'}
    <div class="quiz-container">
      <p>Contenido del quiz: {leccionActual.titulo}</p>
      <!-- Implementar lógica del quiz aquí -->
      <button 
        class="btn-completar-leccion" 
        on:click={completarLeccion} 
        disabled={completada}
        aria-label={completada ? "Quiz completado" : "Marcar quiz como completado"}
      >
        {completada ? 'Quiz Completado' : 'Marcar Quiz como Completado'}
      </button>
    </div>
  {:else}
    <p>Tipo de lección no soportado.</p>
  {/if}
</div>

<style>
  .leccion-viewer {
    font-family: "Poppins", sans-serif;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    background: transparent;
    border-radius: 10px;
    overflow: hidden;
  }

  .leccion-titulo {
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .video-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 70vh;
    margin: 0 auto;
  }

  .video-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  #youtube-player {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .loading-overlay, .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    font-size: 1.2rem;
    padding: 1rem;
    box-sizing: border-box;
  }

  .icono-spinner {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .icono-error {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #ffdd57;
  }

  .error-overlay p {
    margin-bottom: 1rem;
    text-align: center;
  }

  .btn-reintentar {
    padding: 0.5rem 1rem;
    background: #3498db;
    color: #ffffff;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.3s ease;
  }

  .btn-reintentar:hover:not(:disabled) {
    background: #2980b9;
  }

  .btn-completar-leccion {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    padding: 0.6rem 1.2rem;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: #ffffff;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-completar-leccion:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a7bd8, #9168c3);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(110, 142, 251, 0.4);
  }

  .btn-completar-leccion:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }

  .texto-container, .quiz-container {
    position: relative;
    font-size: 1.1rem;
    line-height: 1.6;
    text-align: justify;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin: 1rem 0;
  }

  .quiz-container {
    text-align: center;
  }

  @media (max-width: 768px) {
    .leccion-titulo {
      font-size: 1.5rem;
    }

    .video-container {
      height: 60vh;
    }

    .texto-container, .quiz-container {
      font-size: 1rem;
      padding: 1.5rem;
    }

    .btn-completar-leccion {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
  }
</style>