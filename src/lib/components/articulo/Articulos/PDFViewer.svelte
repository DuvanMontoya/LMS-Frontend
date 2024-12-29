<!-- src/lib/components/PDFViewer/PDFViewer.svelte -->
<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
  
    export let url = ""; // URL del PDF a mostrar
    export let width = "100%"; // Ancho del visor
    export let height = "600px"; // Alto del visor
    export let allowDownload = true; // Permitir descarga del PDF
    export let title = "Visor de PDF"; // Título para accesibilidad
  
    const dispatch = createEventDispatcher();
  
    // Verificar si la URL es válida
    let isValidURL = false;
  
    onMount(() => {
      try {
        new URL(url);
        isValidURL = true;
      } catch (e) {
        console.error("URL inválida para el PDF:", url);
        isValidURL = false;
      }
    });
  
    // Función para manejar la descarga
    function handleDownload() {
      if (isValidURL && allowDownload) {
        dispatch("download", { url });
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop() || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  </script>
  
  {#if isValidURL}
    <div class="pdf-viewer-container">
      {#if allowDownload}
        <button class="download-button" on:click={handleDownload} aria-label="Descargar PDF">
          &#x2193; Descargar PDF
        </button>
      {/if}
      <iframe
        src={url}
        width={width}
        height={height}
        frameborder="0"
        allowfullscreen
        title={title}
      ></iframe>
    </div>
  {:else}
    <div class="error-message">
      <p>No se pudo cargar el PDF. Verifica la URL proporcionada.</p>
    </div>
  {/if}
  
  <style>
    .pdf-viewer-container {
      position: relative;
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
  
    .download-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: var(--primary-500);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: background-color 0.3s ease;
      z-index: 10;
      font-size: 0.875rem;
    }
  
    .download-button:hover {
      background-color: var(--primary-600);
    }
  
    iframe {
      border: 1px solid #ccc;
      border-radius: var(--border-radius);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  
    .error-message {
      padding: 2rem;
      background-color: #ffe6e6;
      color: #cc0000;
      border: 1px solid #cc0000;
      border-radius: var(--border-radius);
      text-align: center;
      font-size: 1rem;
    }
  
    /* Variables de CSS para personalización */
    :root {
      --primary-500: #3b82f6;
      --primary-600: #2563eb;
      --border-radius: 8px;
    }
  
    /* Responsive */
    @media (max-width: 768px) {
      iframe {
        height: 400px;
      }
  
      .download-button {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
      }
    }
  </style>  