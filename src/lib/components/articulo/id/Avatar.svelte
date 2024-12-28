<!-- src/lib/components/articulo/Avatar.svelte -->
<script>
    export let username = '';
    export let size = 48; // Tamaño en px

    // Generar iniciales a partir del nombre
    function getInitials(name) {
        const names = name.split(' ');
        const initials = names.map(n => n[0]?.toUpperCase()).join('');
        return initials || 'A';
    }

    let initials = getInitials(username);
</script>

<div class="avatar" aria-label={`Avatar de ${username}`} title={username} style="width: {size}px; height: {size}px;">
    {#if username}
        <span class="initials">{initials}</span>
    {:else}
        <span class="initials">A</span>
    {/if}
</div>

<style>
    .avatar {
        background-color: var(--accent-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1rem;
        text-transform: uppercase;
        user-select: none;
    }

    .initials {
        font-size: 0.9rem;
    }
</style>