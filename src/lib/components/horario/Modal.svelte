<script>
    import { fade } from 'svelte/transition';
    export let show = false;
</script>

{#if show}
<div class="modal-backdrop" on:click|self={() => show = false} transition:fade={{duration: 200}}>
    <div class="modal-content" on:click|stopPropagation>
        <slot></slot>
    </div>
</div>
{/if}

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
        padding: 2rem;
        border-radius: 0.5rem;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
    }
</style>