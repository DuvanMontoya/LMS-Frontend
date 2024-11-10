// src/routes/cursos/[id]/+page.js
export async function load({ params }) {
    const { id } = params;
    if (!id) {
        return {
            status: 400,
            error: new Error('No course ID provided'),
        };
    }
    return {
        courseId: parseInt(id, 10),
    };
}