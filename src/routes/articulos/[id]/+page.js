// src/routes/articulos/[id]/+page.js
export async function load({ params }) {
    const { id } = params;
    if (!id) {
        return {
            status: 400,
            error: new Error('No article ID provided'),
        };
    }
    return {
        articleId: parseInt(id, 10),
    };
}