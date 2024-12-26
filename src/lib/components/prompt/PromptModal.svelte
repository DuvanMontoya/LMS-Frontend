<script>
    import { createEventDispatcher } from "svelte";

    export let prompt;
    export let onClose;

    const dispatch = createEventDispatcher();

    let copied = false;
    let showHistory = false;

    function copyToClipboard() {
        navigator.clipboard
            .writeText(prompt.contenido)
            .then(() => {
                copied = true;
                setTimeout(() => {
                    copied = false;
                }, 2000);
            })
            .catch((err) => {
                console.error("Error al copiar el texto: ", err);
            });
    }

    function formatDate(dateString) {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    }
</script>

<!-- Botón de cierre del modal -->
<div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
>
    <button
        type="button"
        class="modal-overlay-button"
        on:click={onClose}
        on:keydown={(e) => e.key === 'Enter' && onClose()}
    >
        <span class="sr-only">Close modal</span>
    </button>
    <div
        class="modal-content"
        role="document"
    >
        <h2 id="modal-title">{prompt.titulo}</h2>
        <p id="modal-description" class="description">{prompt.descripcion}</p>

        <div class="metadata">
            <p class="ai-model">Modelo de IA: {prompt.modelo_ia_display}</p>
            <p class="category">
                Categoría: {prompt.categoria
                    ? prompt.categoria.nombre
                    : "Sin categoría"}
            </p>
            <p class="date">Creado: {formatDate(prompt.fecha_creacion)}</p>
            <p class="date">Última actualización: {formatDate(prompt.fecha_actualizacion)}</p>
        </div>

        <div class="tags">
            {#each prompt.etiquetas as etiqueta}
                <span class="tag">{etiqueta.nombre}</span>
            {/each}
        </div>

        <div class="content-container">
            <h3>Contenido del Prompt:</h3>
            <pre>{prompt.contenido}</pre>
            <button
                class="copy-btn {copied ? 'copied' : ''}"
                on:click={copyToClipboard}
                aria-label="Copiar contenido"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? "¡Copiado!" : "Copiar Contenido"}
            </button>
        </div>

        <button
            class="history-btn"
            on:click={() => (showHistory = !showHistory)}
            aria-label="Mostrar u ocultar historial"
        >
            {showHistory ? "Ocultar Historial" : "Mostrar Historial"}
        </button>

        {#if showHistory}
            <div class="history-container">
                <h3>Historial de Versiones:</h3>
                {#each prompt.historial as version}
                    <div class="version">
                        <p>
                            Versión {version.version} - {formatDate(version.fecha_modificacion)}
                        </p>
                        <p>Modificado por: {version.modificado_por}</p>
                    </div>
                {/each}
            </div>
        {/if}

        <button class="close-btn" on:click={onClose} aria-label="Cerrar modal">
            Cerrar
        </button>
    </div>
</div>


<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    h2 {
        font-size: 1.75rem;
        color: #2c3e50;
        margin-bottom: 1rem;
    }

    .description {
        font-size: 1rem;
        color: #34495e;
        margin-bottom: 1rem;
    }

    .metadata {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .metadata p {
        font-size: 0.9rem;
        color: #7f8c8d;
        background-color: #ecf0f1;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        margin: 0;
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .tag {
        font-size: 0.8rem;
        color: #3498db;
        background-color: #e8f4fd;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
    }

    .content-container {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        position: relative;
    }

    h3 {
        font-size: 1.2rem;
        color: #2c3e50;
        margin-bottom: 1rem;
    }

    pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: "Fira Code", monospace;
        font-size: 0.9rem;
        color: #34495e;
        background-color: #ecf0f1;
        padding: 1rem;
        border-radius: 4px;
        max-height: 300px;
        overflow-y: auto;
    }

    .copy-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        align-items: center;
        background-color: #3498db;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }

    .copy-btn:hover {
        background-color: #2980b9;
    }

    .copy-btn.copied {
        background-color: #2ecc71;
    }

    .copy-btn svg {
        width: 16px;
        height: 16px;
        margin-right: 0.5rem;
    }

    .history-btn {
        background-color: #95a5a6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s ease;
        margin-bottom: 1rem;
    }

    .history-btn:hover {
        background-color: #7f8c8d;
    }

    .history-container {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .version {
        border-bottom: 1px solid #ecf0f1;
        padding: 0.5rem 0;
    }

    .version:last-child {
        border-bottom: none;
    }

    .version p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        color: #34495e;
    }

    .close-btn {
        background-color: #34495e;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s ease;
        display: block;
        margin-left: auto;
    }

    .close-btn:hover {
        background-color: #2c3e50;
    }
</style>
