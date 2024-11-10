<script>
    import { onMount, onDestroy, tick } from "svelte";
    import * as pdfjs from "pdfjs-dist";
    import { fade } from "svelte/transition";

    export let url;
    export let watermark = "Laila.icu";

    let pdfContainer;
    let pdfDoc = null;
    let scale = 1.5;
    let rotation = 0;
    let totalPages = 0;
    let isPdfLoaded = false;
    let error = null;

    const pageGap = 20;
    const pageCache = new Map();
    let observer;
    let watermarkCanvas;

    // Montar y configurar PDF y Marca de Agua
    onMount(async () => {
        const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs`;

        try {
            const response = await fetch(workerSrc);
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);
            const workerBlob = await response.blob();
            pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);

            pdfDoc = await pdfjs.getDocument(url).promise;
            totalPages = pdfDoc.numPages;
            isPdfLoaded = true;
            await tick();
            setupIntersectionObserver();
            createWatermark();
            preloadAdjacentPages(1);  // Cargar la primera página
        } catch (err) {
            console.error("Error loading PDF:", err);
            error = "Failed to load PDF. Please try again later.";
        }
    });

    // Desmontar PDF y limpiar el trabajador
    onDestroy(() => {
        if (pdfDoc) {
            pdfDoc.destroy();
        }
        if (pdfjs.GlobalWorkerOptions.workerSrc.startsWith("blob:")) {
            URL.revokeObjectURL(pdfjs.GlobalWorkerOptions.workerSrc);
        }
        if (observer) {
            observer.disconnect();
        }
    });

    // Configurar el observador de intersección para cargar las páginas visibles
    function setupIntersectionObserver() {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const pageNum = parseInt(entry.target.dataset.pageNumber);
                        renderPage(pageNum);
                        preloadAdjacentPages(pageNum);
                    }
                });
            },
            { rootMargin: "200px 0px" }
        );

        document.querySelectorAll(".page").forEach((page) => observer.observe(page));
    }

    // Renderizar las páginas del PDF
    async function renderPage(pageNum) {
        if (pageCache.has(pageNum)) return pageCache.get(pageNum);

        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale, rotation });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = { canvasContext: context, viewport: viewport };
            await page.render(renderContext).promise;
            applyWatermark(canvas); // Aplicar marca de agua
            pageCache.set(pageNum, canvas);

            const pageElement = pdfContainer.querySelector(`[data-page-number="${pageNum}"]`);
            if (pageElement) {
                pageElement.innerHTML = "";
                pageElement.appendChild(canvas);
            }

            return canvas;
        } catch (err) {
            console.error(`Error rendering page ${pageNum}:`, err);
            return null;
        }
    }

    // Crear la marca de agua
    function createWatermark() {
        watermarkCanvas = document.createElement("canvas");
        watermarkCanvas.width = 400;
        watermarkCanvas.height = 200;
        const ctx = watermarkCanvas.getContext("2d");
        ctx.font = "24px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(watermarkCanvas.width / 2, watermarkCanvas.height / 2);
        ctx.rotate((-45 * Math.PI) / 180);
        ctx.fillText(watermark, 0, 0);
    }

    // Aplicar la marca de agua en cada página
    function applyWatermark(canvas) {
        const ctx = canvas.getContext("2d");
        const pattern = ctx.createPattern(watermarkCanvas, "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Pre-cargar páginas adyacentes
    async function preloadAdjacentPages(pageNum) {
        const pagesToPreload = [pageNum - 1, pageNum + 1];
        for (const num of pagesToPreload) {
            if (num > 0 && num <= totalPages && !pageCache.has(num)) {
                await renderPage(num);
            }
        }
    }
</script>

<div class="pdf-viewer">
    {#if error}
        <div class="error" transition:fade>{error}</div>
    {:else if !isPdfLoaded}
        <div class="loading" transition:fade>Loading PDF...</div>
    {:else}
        <div class="content" bind:this={pdfContainer}>
            {#each Array(totalPages) as _, i}
                <div class="page" data-page-number={i + 1} style="margin-bottom: {pageGap}px;">
                    <div class="loading">Loading page {i + 1}...</div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .pdf-viewer {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: #f0f2f5;
        overflow-y: auto;
        padding: 2rem;
        scroll-behavior: smooth;
    }

    .content {
        flex-grow: 1;
        overflow-y: auto;
        padding: 2rem;
    }

    .page {
        background-color: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .page:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .loading, .error {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        font-size: 16px;
        color: #666;
    }

    .error {
        color: #d32f2f;
    }

    /* Mejoras del scrollbar */
    .content::-webkit-scrollbar {
        width: 10px;
    }

    .content::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .content::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 5px;
    }

    .content::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
</style>
