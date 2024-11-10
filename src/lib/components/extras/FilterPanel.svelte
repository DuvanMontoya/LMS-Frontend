<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    export let eventTypes = [];

    const dispatch = createEventDispatcher();

    let selectedTypes = [...eventTypes];

    function handleChange() {
        dispatch("updateFilters", selectedTypes);
    }
</script>

<div class="filter-panel" transition:fade>
    <h3>Filtrar por tipo de evento</h3>
    {#each eventTypes as type}
        <label>
            <input
                type="checkbox"
                bind:group={selectedTypes}
                value={type}
                on:change={handleChange}
            />
            {type.charAt(0).toUpperCase() + type.slice(1)}
        </label>
    {/each}
</div>

<style>
    .filter-panel {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #333;
    }

    label {
        display: block;
        margin-bottom: 8px;
        cursor: pointer;
    }

    input[type="checkbox"] {
        margin-right: 8px;
    }
</style>
