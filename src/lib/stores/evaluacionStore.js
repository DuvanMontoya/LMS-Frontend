import { writable, derived } from 'svelte/store';
import {
    getEvaluacionById,
    obtenerIntento,
    iniciarIntento,
    sincronizarTiempo,
    guardarRespuestas,
    finalizarIntento
} from '$lib/api/evaluaciones/evaluaciones';

function createEvaluacionStore() {
    const evaluacion = writable(null);
    const intentoActual = writable(null);
    const respuestas = writable({});
    const loading = writable(false);
    const error = writable(null);
    const tiempoRestante = writable(null);

    // Store derivado para el progreso
    const progreso = derived(
        [evaluacion, respuestas],
        ([$evaluacion, $respuestas]) => {
            if (!$evaluacion?.preguntas?.length) return 0;
            return (Object.keys($respuestas).length / $evaluacion.preguntas.length) * 100;
        }
    );

    // Estado de sincronización
    let syncInterval;
    let saveTimeout;

    async function iniciarSincronizacion(intentoId, token) {
        if (syncInterval) clearInterval(syncInterval);

        syncInterval = setInterval(async () => {
            const $tiempoRestante = get(tiempoRestante);
            try {
                const response = await sincronizarTiempo(
                    intentoId,
                    $tiempoRestante,
                    token
                );

                if (response.tiempo_restante !== undefined) {
                    tiempoRestante.set(response.tiempo_restante);
                }
                
                if (response.estado !== 'en_curso') {
                    detenerSincronizacion();
                }
            } catch (err) {
                console.error('Error en sincronización:', err);
            }
        }, 30000);
    }

    function detenerSincronizacion() {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
    }

    async function cargarEvaluacion(evaluacionId, token) {
        loading.set(true);
        error.set(null);

        try {
            const [evalData, intentoData] = await Promise.all([
                getEvaluacionById(evaluacionId, token),
                obtenerIntento(evaluacionId, token)
            ]);

            evaluacion.set(evalData);
            
            if (intentoData?.id && intentoData.estado === 'en_curso') {
                intentoActual.set(intentoData);
                respuestas.set(intentoData.respuestas || {});
                tiempoRestante.set(intentoData.tiempo_restante);
                iniciarSincronizacion(intentoData.id, token);
            }
        } catch (err) {
            error.set(err.message);
            throw err;
        } finally {
            loading.set(false);
        }
    }

    async function iniciarEvaluacion(evaluacionId, token) {
        loading.set(true);
        error.set(null);

        try {
            const intento = await iniciarIntento(evaluacionId, token);
            intentoActual.set(intento);
            tiempoRestante.set(intento.tiempo_restante);
            respuestas.set({});
            iniciarSincronizacion(intento.id, token);
        } catch (err) {
            error.set(err.message);
            throw err;
        } finally {
            loading.set(false);
        }
    }

    async function actualizarRespuesta(preguntaId, valor, token) {
        const $intentoActual = get(intentoActual);
        if (!$intentoActual?.id) return;

        respuestas.update($respuestas => ({
            ...$respuestas,
            [preguntaId]: valor
        }));

        // Debounce guardado en servidor
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
            try {
                await guardarRespuestas(
                    $intentoActual.id,
                    get(respuestas),
                    token
                );
            } catch (err) {
                console.error('Error guardando respuestas:', err);
            }
        }, 1000);
    }

    async function finalizarEvaluacion(token) {
        const $intentoActual = get(intentoActual);
        if (!$intentoActual?.id) return;

        loading.set(true);
        error.set(null);

        try {
            const resultado = await finalizarIntento(
                $intentoActual.id,
                get(respuestas),
                token
            );

            detenerSincronizacion();
            return resultado;
        } catch (err) {
            error.set(err.message);
            throw err;
        } finally {
            loading.set(false);
        }
    }

    function limpiar() {
        evaluacion.set(null);
        intentoActual.set(null);
        respuestas.set({});
        error.set(null);
        tiempoRestante.set(null);
        detenerSincronizacion();
    }

    return {
        evaluacion,
        intentoActual,
        respuestas,
        loading,
        error,
        tiempoRestante,
        progreso,
        cargarEvaluacion,
        iniciarEvaluacion,
        actualizarRespuesta,
        finalizarEvaluacion,
        limpiar
    };
}

export const evaluacionStore = createEvaluacionStore();