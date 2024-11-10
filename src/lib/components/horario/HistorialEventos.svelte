<script>
    import { createEventDispatcher } from 'svelte';
    import { format } from 'date-fns';
    
    export let historialEventos;
    
    const dispatch = createEventDispatcher();
    
    function handleClose() {
        dispatch('cerrar');
    }
    
    function formatDate(dateString) {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    }
    
    function compareData(anterior, actual) {
        const changes = [];
        for (const key in actual) {
            if (anterior[key] !== actual[key]) {
                changes.push({
                    campo: key,
                    anterior: anterior[key],
                    actual: actual[key]
                });
            }
        }
        return changes;
    }
    </script>
    
    <div class="historial-eventos">
        <h2>Historial de Cambios del Evento</h2>
        
        {#if historialEventos.length === 0}
            <p>No hay cambios registrados para este evento.</p>
        {:else}
            <ul>
                {#each historialEventos as historial}
                    <li>
                        <strong>{formatDate(historial.fecha_modificacion)}</strong> - 
                        Modificado por: {historial.usuario.username}
                        <ul class="cambios">
                            {#each compareData(historial.datos_anteriores, historial.evento) as cambio}
                                <li>
                                    <strong>{cambio.campo}:</strong> 
                                    {cambio.anterior} → {cambio.actual}
                                </li>
                            {/each}
                        </ul>
                    </li>
                {/each}
            </ul>
        {/if}
        
        <button on:click={handleClose}>Cerrar</button>
    </div>
    
    <style>
        .historial-eventos {
            max-width: 600px;
            margin: 0 auto;
            padding: 1rem;
        }
    
        h2 {
            text-align: center;
            margin-bottom: 1rem;
        }
    
        ul {
            list-style-type: none;
            padding: 0;
        }
    
        li {
            margin-bottom: 1rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 1rem;
        }
    
        .cambios {
            margin-top: 0.5rem;
            padding-left: 1rem;
        }
    
        .cambios li {
            border: none;
            margin-bottom: 0.25rem;
            padding-bottom: 0;
        }
    
        button {
            display: block;
            margin: 1rem auto 0;
            padding: 0.5rem 1rem;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>