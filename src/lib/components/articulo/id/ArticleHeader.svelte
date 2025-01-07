<!-- Este componente es el encargado de mostrar la cabecera de un artículo -->
<!-- src/lib/components/articulo/ArticleHeader.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    export let title = 'Sin título';
    export let autor = '';
    export let date = 'Fecha no disponible';
    export let category = 'Sin categoría';
    export let readingTime = 'No estimado';
    export let tags = [];

    export let accessLevel = 'gratis'; // 'gratis', 'premium', 'en_revision'

    const dispatch = createEventDispatcher();
</script>

<header class="article-header">
    <h1 class="article-title">{title}</h1>
    <div class="article-meta">
        <span class="author">Por {autor}</span>
        <span class="date">{date}</span>
        <span class="category">{category}</span>
        <span class="reading-time">{readingTime} min de lectura</span>
    </div>
    <div class="article-tags">
        {#each tags as tag}
            <span class="tag">{tag}</span>
        {/each}
    </div>
    <div class="access-level">
        {#if accessLevel === 'premium'}
            <span class="badge premium">Artículo Premium</span>
        {:else if accessLevel === 'gratis'}
            <span class="badge free">Gratis</span>
        {:else if accessLevel === 'en_revision'}
            <span class="badge review">En Revisión</span>
        {/if}
    </div>
</header>

<style>
    .article-header {
        padding: 1.5rem 2rem;
        background-color: var(--background-color2);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--box-shadow);
        margin-bottom: 2rem;
    }

    .article-title {
        font-size: 2rem;
        margin: 0 0 1rem;
        color: var(--text-color);
        font-family: var(--font-family-serif);
    }

    .article-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.9rem;
        color: var(--text-color-lighter);
        margin-bottom: 1rem;
    }

    .article-meta span::before {
        content: '•';
        margin-right: 0.5rem;
    }

    .article-meta span:first-child::before {
        content: '';
        margin: 0;
    }

    .article-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .tag {
        background-color: var(--accent-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: var(--border-radius);
        font-size: 0.8rem;
    }

    .access-level .badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius);
        font-size: 0.8rem;
        font-weight: 600;
    }

    .access-level .premium {
        background-color: #f97316; /* color secundario */
    }

    .access-level .free {
        background-color: #22c55e; /* color de acento */
    }

    .access-level .review {
        background-color: #818cf8; /* color secundario claro */
    }

    @media (max-width: 768px) {
        .article-header {
            padding: 1rem 1.5rem;
        }

        .article-title {
            font-size: 1.5rem;
        }

        .article-meta {
            flex-direction: column;
            gap: 0.5rem;
        }

        .article-tags {
            flex-wrap: wrap;
        }
    }
</style>