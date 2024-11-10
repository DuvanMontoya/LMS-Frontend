<script>
    import { createEventDispatcher } from "svelte";

    export let value = 0;
    export let max = 5;
    export let disabled = false;

    const dispatch = createEventDispatcher();

    function handleClick(rating) {
        if (!disabled) {
            value = rating;
            dispatch("rate", { value: rating });
        }
    }
</script>

<div class="rating" class:disabled>
    {#each Array(max) as _, i}
        <span
            class="star"
            class:filled={i < value}
            on:click={() => handleClick(i + 1)}
            on:keydown={(e) => e.key === "Enter" && handleClick(i + 1)}
            role="button"
            tabindex="0"
        >
            ★
        </span>
    {/each}
</div>

<style>
    .rating {
        display: inline-flex;
        flex-direction: row-reverse;
        font-size: 1.5rem;
    }

    .star {
        cursor: pointer;
        color: #ddd;
        transition: color 0.2s ease-in-out;
    }

    .star:hover,
    .star:hover ~ .star,
    .filled {
        color: #ffd700;
    }

    .disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .disabled .star {
        cursor: default;
    }
</style>
