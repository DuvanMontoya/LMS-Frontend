<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    export let event;

    const dispatch = createEventDispatcher();

    let title = event.title;
    let start = event.start;
    let end = event.end;
    let description = event.extendedProps.description || "";
    let type = event.extendedProps.type;

    function handleSubmit() {
        const updatedEvent = {
            ...event,
            title,
            start,
            end,
            extendedProps: {
                ...event.extendedProps,
                description,
                type,
            },
        };
        dispatch("update", updatedEvent);
    }

    function handleClose() {
        dispatch("close");
    }
</script>

<dialog
    class="modal-backdrop"
    on:click={handleClose}
    on:keydown={(e) => e.key === 'Escape' && handleClose()}
    open
    transition:fade
>
    <article
        class="modal-content"
        on:click|stopPropagation
    >
        <h2>{event.id ? "Editar Evento" : "Nuevo Evento"}</h2>
        <form on:submit|preventDefault={handleSubmit}>
            <label>
                Título:
                <input type="text" bind:value={title} required />
            </label>
            <label>
                Inicio:
                <input type="datetime-local" bind:value={start} required />
            </label>
            <label>
                Fin:
                <input type="datetime-local" bind:value={end} />
            </label>
            <label>
                Descripción:
                <textarea bind:value={description}></textarea>
            </label>
            <label>
                Tipo:
                <select bind:value={type}>
                    <option value="curso">Curso</option>
                    <option value="tema">Tema</option>
                    <option value="leccion">Lección</option>
                    <option value="articulo">Artículo</option>
                    <option value="evaluacion">Evaluación</option>
                </select>
            </label>
            <div class="button-group">
                <button type="submit">Guardar</button>
                <button type="button" on:click={handleClose}>Cancelar</button>
            <div class="button-group">
                <button type="submit">Guardar</button>
                <button type="button" on:click={handleClose}>Cancelar</button>
            </div>
        </form>
    </article>
</dialog>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    h2 {
        margin-top: 0;
        color: #333;
    }

    form {
        display: flex;
        flex-direction: column;
    }

    label {
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
    }

    input,
    textarea,
    select {
        margin-top: 5px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }

    textarea {
        height: 100px;
        resize: vertical;
    }

    .button-group {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }

    button {
        padding: 10px 15px;
        margin-left: 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    button[type="submit"] {
        background-color: #4caf50;
        color: white;
    }

    button[type="submit"]:hover {
        background-color: #45a049;
    }

    button[type="button"] {
        background-color: #f44336;
        color: white;
    }

    button[type="button"]:hover {
        background-color: #d32f2f;
    }
</style>
