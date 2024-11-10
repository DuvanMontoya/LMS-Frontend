<script>
    import { onMount } from 'svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import Icon  from '@iconify/svelte';

    export let evaluaciones = [];
    let selectedEvaluacion = null;
    let selectedIndex = null;

    $: if (evaluaciones.length > 0 && selectedIndex === null) {
        selectEvaluacion(0);
    }

    function selectEvaluacion(index) {
        selectedIndex = index;
        selectedEvaluacion = evaluaciones[index];
    }

    function getEstadoEvaluacion(evaluacion) {
        const ahora = new Date();
        if (evaluacion.fecha_inicio && new Date(evaluacion.fecha_inicio) > ahora) {
            return 'Próxima';
        } else if (evaluacion.fecha_fin && new Date(evaluacion.fecha_fin) < ahora) {
            return 'Finalizada';
        } else {
            return 'En curso';
        }
    }

    function getPorcentajeCompletado(evaluacion) {
        // Simulación para el ejemplo
        return Math.floor(Math.random() * 101);
    }

    let showRubrica = false;
    let showPreguntas = false;

    function toggleRubrica() {
        showRubrica = !showRubrica;
    }

    function togglePreguntas() {
        showPreguntas = !showPreguntas;
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    function getRemainingTime(evaluacion) {
        const now = new Date();
        const end = new Date(evaluacion.fecha_fin);
        const diff = end - now;
        
        if (diff <= 0) return 'Finalizada';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${days}d ${hours}h ${minutes}m`;
    }
</script>

<div class="evaluacion-viewer">
    <div class="evaluacion-selector">
        <h2>Seleccione una evaluación</h2>
        <div class="evaluacion-grid">
            {#each evaluaciones as evaluacion, i}
                <button 
                    class="evaluacion-card {i === selectedIndex ? 'active' : ''}"
                    on:click={() => selectEvaluacion(i)}
                    in:scale={{duration: 300, delay: i * 50}}
                >
                    <div class="evaluacion-icon">
                        <Icon icon="mdi:file-document-outline" width="32" height="32" />
                    </div>
                    <h3>{evaluacion.titulo}</h3>
                    <span class="evaluacion-tipo">{evaluacion.tipo}</span>
                </button>
            {/each}
        </div>
    </div>

    {#if selectedEvaluacion}
        <div class="evaluacion-content" in:fade={{duration: 300}}>
            <header class="evaluacion-header">
                <h2>{selectedEvaluacion.titulo}</h2>
                <span class="evaluacion-tipo">{selectedEvaluacion.tipo}</span>
            </header>

            <div class="timeline">
                <div class="timeline-item">
                    <Icon icon="mdi:flag-outline" />
                    <div>
                        <strong>Inicio</strong>
                        <p>{formatDate(selectedEvaluacion.fecha_inicio)}</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <Icon icon="mdi:flag-checkered" />
                    <div>
                        <strong>Fin</strong>
                        <p>{formatDate(selectedEvaluacion.fecha_fin)}</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <Icon icon="mdi:timer-outline" />
                    <div>
                        <strong>Tiempo Restante</strong>
                        <p>{getRemainingTime(selectedEvaluacion)}</p>
                    </div>
                </div>
            </div>

            <div class="description-card">
                <h3>Descripción</h3>
                <p>{selectedEvaluacion.descripcion}</p>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-icon">
                        <Icon icon="mdi:calendar-range" color="#4CAF50" width="32" height="32" />
                    </div>
                    <div class="info-content">
                        <h3>Período</h3>
                        <p>{formatDate(selectedEvaluacion.fecha_inicio)} - {formatDate(selectedEvaluacion.fecha_fin)}</p>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-icon">
                        <Icon icon="mdi:clock-outline" color="#2196F3" width="32" height="32" />
                    </div>
                    <div class="info-content">
                        <h3>Tiempo límite</h3>
                        <p>{selectedEvaluacion.tiempo_limite} minutos</p>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-icon">
                        <Icon icon="mdi:refresh" color="#FF9800" width="32" height="32" />
                    </div>
                    <div class="info-content">
                        <h3>Intentos</h3>
                        <p>{selectedEvaluacion.intentos_permitidos}</p>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-icon">
                        <Icon icon="mdi:star-outline" color="#E91E63" width="32" height="32" />
                    </div>
                    <div class="info-content">
                        <h3>Puntaje máximo</h3>
                        <p>{selectedEvaluacion.puntaje_maximo} puntos</p>
                    </div>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stats-card progress">
                    <h3>Progreso</h3>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: {getPorcentajeCompletado(selectedEvaluacion)}%"></div>
                    </div>
                    <p>{getPorcentajeCompletado(selectedEvaluacion)}%</p>
                </div>
                <div class="stats-card">
                    <h3>Estado</h3>
                    <div class="estado-badge {getEstadoEvaluacion(selectedEvaluacion).toLowerCase()}">
                        {getEstadoEvaluacion(selectedEvaluacion)}
                    </div>
                </div>
                <div class="stats-card">
                    <h3>Ponderación</h3>
                    <p class="stats-number">{selectedEvaluacion.ponderacion}%</p>
                </div>
                <div class="stats-card">
                    <h3>Criterio de aprobación</h3>
                    <p class="stats-number">{selectedEvaluacion.criterios_aprobacion}%</p>
                </div>
            </div>

            <div class="additional-info">
                <button class="btn-outline" on:click={toggleRubrica}>
                    <Icon icon="mdi:clipboard-text-outline" />
                    {showRubrica ? 'Ocultar Rúbrica' : 'Mostrar Rúbrica'}
                </button>
                {#if showRubrica}
                    <div class="rubrica-content" in:slide>
                        <h4>Rúbrica de Evaluación</h4>
                        <p>{selectedEvaluacion.rubrica || 'No hay rúbrica disponible para esta evaluación.'}</p>
                    </div>
                {/if}                
            </div>

            <div class="action-buttons">
                <button class="btn-primary">
                    <Icon icon="mdi:play" />
                    Iniciar Evaluación
                </button>
                {#if selectedEvaluacion.resultados_visibles}
                    <button class="btn-secondary">
                        <Icon icon="mdi:chart-bar" />
                        Ver Resultados
                    </button>
                {/if}
                {#if selectedEvaluacion.mostrar_opciones_correctas}
                    <button class="btn-outline" data-tooltip="Ver respuestas correctas">
                        <Icon icon="mdi:check-circle-outline" />
                    </button>
                {/if}
            </div>
        </div>
    {:else}
        <div class="placeholder-message" in:fade>
            <Icon icon="mdi:information-outline" width="48" height="48" />
            <h3>Seleccione una evaluación para ver sus detalles</h3>
            <p>Haga clic en una de las tarjetas de evaluación de arriba para comenzar.</p>
        </div>
    {/if}
</div>

<style>
    .evaluacion-viewer {
        font-family: 'Inter', sans-serif;
        background-color: #f8fafc;
        border-radius: 20px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .evaluacion-selector {
        margin-bottom: 2rem;
    }

    .evaluacion-selector h2 {
        font-size: 1.5rem;
        color: #1a202c;
        margin-bottom: 1rem;
        text-align: center;
    }

    .evaluacion-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .evaluacion-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 15px;
        padding: 1.5rem;
        color: white;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .evaluacion-card:hover, .evaluacion-card.active {
        transform: translateY(-5px);
        box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    }

    .evaluacion-card h3 {
        font-size: 1.1rem;
        margin: 0.5rem 0;
    }

    .evaluacion-tipo {
        font-size: 0.8rem;
        opacity: 0.8;
    }

    .evaluacion-icon {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .evaluacion-content {
        background-color: white;
        border-radius: 15px;
        padding: 2rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .evaluacion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .evaluacion-header h2 {
        font-size: 1.8rem;
        color: #2d3748;
        margin: 0;
        font-weight: 600;
    }

    .info-grid, .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .info-card, .stats-card {
        background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
        border-radius: 15px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .info-card:hover, .stats-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    }

    .info-icon {
        background-color: white;
        border-radius: 12px;
        padding: 0.75rem;
        margin-right: 1rem;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .info-content h3, .stats-card h3 {
        font-size: 1rem;
        color: #4a5568;
        margin: 0 0 0.25rem 0;
    }

    .info-content p, .stats-number {
        font-size: 1.1rem;
        color: #2d3748;
        font-weight: 600;
        margin: 0;
    }

    .stats-card.progress {
        flex-direction: column;
        align-items: flex-start;
    }

    .progress-bar {
        width: 100%;
        height: 10px;
        background-color: #e2e8f0;
        border-radius: 5px;
        overflow: hidden;
        margin: 0.5rem 0;
    }

    .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
        transition: width 0.3s ease;
    }

    .estado-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
    }

    .estado-badge.próxima { background-color: #FEF3C7; color: #D97706; }
    .estado-badge.en.curso { background-color: #DCFCE7; color: #16A34A; }
    .estado-badge.finalizada { background-color: #FEE2E2; color: #DC2626; }

    .description-card {
        background-color: white;
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .description-card h3 {
        font-size: 1.2rem;
        color: #2d3748;
        margin-bottom: 0.75rem;
    }

    .description-card p {
        font-size: 1rem;
        color: #4a5568;
        line-height: 1.6;
    }

    .additional-info {
        margin-bottom: 2rem;
    }

    .btn-outline {
        background-color: transparent;
        border: 2px solid #4a90e2;
        color: #4a90e2;
        padding: 0.75rem 1.5rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
        margin-bottom: 1rem;
    }

    .btn-outline:hover {
        background-color: #4a90e2;
        color: white;
    }

    .rubrica-content, .preguntas-content {
        background-color: #f8fafc;
        border-radius: 15px;
        padding: 1.5rem;
        margin-top: 1rem;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .timeline {
        display: flex;
        justify-content: space-between;
        background-color: white;
        border-radius: 15px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .timeline-item {
        display: flex;
        align-items: center;
    }

    .timeline-item :global(svg) {
        font-size: 1.5rem;
        margin-right: 0.75rem;
        color: #4a90e2;
    }

    .timeline-item strong {
        font-size: 0.875rem;
        color: #4a5568;
        display: block;
    }

    .timeline-item p {
        font-size: 1rem;
        color: #2d3748;
        margin: 0;
        font-weight: 600;
    }

    .action-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    .btn-primary, .btn-secondary {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 9999px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
    }

    .btn-primary {
        background: linear-gradient(135deg, #4a90e2 0%, #3182ce 100%);
        color: white;
    }

    .btn-secondary {
        background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
        color: #4a5568;
    }

    .btn-primary:hover, .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    }

    .placeholder-message {
        text-align: center;
        padding: 3rem 1rem;
        background-color: white;
        border-radius: 15px;
        color: #718096;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .placeholder-message :global(svg) {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #4a90e2;
    }

    @media (max-width: 768px) {
        .evaluacion-viewer {
            padding: 1.5rem;
        }

        .info-grid, .stats-grid {
            grid-template-columns: 1fr;
        }

        .timeline {
            flex-direction: column;
            align-items: flex-start;
        }

        .timeline-item {
            margin-bottom: 1rem;
        }

        .action-buttons {
            flex-direction: column;
        }

        .btn-primary, .btn-secondary {
            width: 100%;
        }
    }

    /* Animações suaves */
    .evaluacion-content, .info-card, .stats-card, .description-card, .rubrica-content, .preguntas-content {
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    /* Melhorias de acessibilidade */
    .btn-primary:focus, .btn-secondary:focus, .btn-outline:focus, .evaluacion-card:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.5);
    }

    /* Tooltip personalizado */
    [data-tooltip] {
        position: relative;
        cursor: help;
    }

    [data-tooltip]::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        background-color: #2d3748;
        color: #fff;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.875rem;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 10;
    }

    [data-tooltip]:hover::after {
        opacity: 1;
        visibility: visible;
    }
</style>