<script>
    import { createEventDispatcher } from 'svelte';

    export let userRol = '';

    const dispatch = createEventDispatcher();

    let nombre = '';
    let tipo = 'privado';
    let color = '#3498db';

    function handleSubmit() {
        const calendarioData = {
            nombre,
            tipo,
            color
        };
        dispatch('guardar', calendarioData);
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <h2>Crear Calendario</h2>
    
    <label>
        Nombre:
        <input type="text" bind:value={nombre} required>
    </label>
    
    <label>
        Tipo:
        <select bind:value={tipo}>
            <option value="privado">Privado</option>
            {#if userRol === 'admin' || userRol === 'advanced_user'}
                <option value="compartido">Compartido</option>
                <option value="publico">Público</option>
            {/if}
        </select>
    </label>
    
    <label>
        Color:
        <input type="color" bind:value={color}>
    </label>
    
    <button type="submit">Crear Calendario</button>
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