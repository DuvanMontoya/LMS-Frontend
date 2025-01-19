<!-- src/lib/components/study/Articulos/PDFViewer.svelte -->
<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    
    export let url;
    export let title;
    export let preventDownload = false;
    
    const dispatch = createEventDispatcher();
    let viewer;
    let isLoading = true;
    let error = null;
    
    onMount(async () => {
      try {
        // Aquí podrías implementar la lógica para cargar el PDF
        // Por ejemplo, usando pdf.js o similar
        isLoading = false;
      } catch (err) {
        error = 'Error al cargar el PDF';
        isLoading = false;
      }
    });
    
    function closeViewer() {
      dispatch('close');
    }
    </script>
    
    <div class="pdf-viewer-overlay">
      <div class="pdf-viewer-container">
        <div class="pdf-viewer-header">
          <h2>{title}</h2>
          <div class="pdf-viewer-actions">
            {#if !preventDownload}
              <button class="download-button" on:click={() => window.open(url, '_blank')}>
                <i class="fas fa-download"></i>
                Descargar
              </button>
            {/if}
            <button class="close-button" on:click={closeViewer}>
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
    
        <div class="pdf-viewer-content">
          {#if isLoading}
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Cargando PDF...</p>
            </div>
          {:else if error}
            <div class="error-state">
              <i class="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          {:else}
            <iframe
              title={title}
              src={`${url}#toolbar=0`}
              width="100%"
              height="100%"
              bind:this={viewer}
            ></iframe>
          {/if}
        </div>
      </div>
    </div>
    
    <style>
    .pdf-viewer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .pdf-viewer-container {
      background: white;
      width: 95%;
      height: 95%;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .pdf-viewer-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .pdf-viewer-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    
    .pdf-viewer-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .download-button,
    .close-button {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .download-button {
      background-color: #2563eb;
      color: white;
      border: none;
    }
    
    .download-button:hover {
      background-color: #1d4ed8;
    }
    
    .close-button {
      background-color: #f3f4f6;
      color: #4b5563;
      border: 1px solid #e5e7eb;
    }
    
    .close-button:hover {
      background-color: #e5e7eb;
    }
    
    .pdf-viewer-content {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    
    .loading-state,
    .error-state {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    
    .loading-state i,
    .error-state i {
      font-size: 2rem;
      color: #6b7280;
    }
    
    .loading-state p,
    .error-state p {
      color: #4b5563;
      font-size: 0.875rem;
    }
    
    iframe {
      border: none;
    }
    
    /* Responsive styles */
    @media (max-width: 640px) {
      .pdf-viewer-header {
        flex-direction: column;
        gap: 1rem;
      }
    
      .pdf-viewer-actions {
        width: 100%;
      }
    
      .download-button,
      .close-button {
        flex: 1;
        justify-content: center;
      }
    }
    </style>    