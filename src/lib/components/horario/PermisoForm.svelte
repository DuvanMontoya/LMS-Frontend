<script>
    import { createEventDispatcher } from 'svelte';

    export let calendario = null;
    export let evento = null;

    const dispatch = createEventDispatcher();

    let usuarioId = '';
    let tipoPermiso = 'visualizacion';

    function handleSubmit() {
        const permisoData = {
            usuario_id: usuarioId,
            tipo_permiso: tipoPermiso
        };
        dispatch('guardar', permisoData);
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <h2>Asignar Permiso</h2>
    
    <p>
        {#if calendario}
            Asignando permiso para el calendario: {calendario.nombre}
        {:else if evento}
            Asignando permiso para el evento: {evento.titulo}
        {/if}
    </p>
    
    <label>
        ID de Usuario:
        <input type="number" bind:value={usuarioId} required>
    </label>
    
    <label>
        Tipo de Permiso:
        <select bind:value={tipoPermiso}>
            <option value="visualizacion">Visualización</option>
            <option value="creacion">Creación</option>
            <option value="modificacion">Modificación</option>
            <option value="administracion">Administración</option>
        </select>
    </label>
    
    <button type="submit">Asignar Permiso</button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    label {
        display: flex;
        flex-direction: column;
    }

    input, select {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.25rem;
    }

    button {
        padding: 0.5rem 1rem;
        background-color: #4299e1;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    button:hover {
        background-color: #3182ce;
    }
</style>