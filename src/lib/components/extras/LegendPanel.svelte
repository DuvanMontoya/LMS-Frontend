<script>
    import { fade } from "svelte/transition";

    export let eventColors;
</script>

<div class="legend-panel" transition:fade>
    <h3>Leyenda</h3>
    {#each Object.entries(eventColors) as [type, color]}
        <div class="legend-item">
            <span class="color-box" style="background-color: {color};"></span>
            <span class="type-name"
                >{type.charAt(0).toUpperCase() + type.slice(1)}</span
            >
        </div>
    {/each}
</div>

<style>
    .legend-panel {
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

    .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .color-box {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        margin-right: 8px;
    }

    .type-name {
        font-size: 14px;
    }
</style>
