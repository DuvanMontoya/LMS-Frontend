<script>
  export let prompt;
  export let onEdit;
  export let onDelete;
  export let onClick;

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }
</script>

<div class="prompt-card" on:click={onClick}>
  <div class="prompt-content">
    <h2>{prompt.titulo}</h2>
    <p class="description">{prompt.descripcion}</p>
    <div class="metadata">
      <span class="ai-model">Modelo IA: {prompt.modelo_ia_display}</span>
      <span class="category"
        >Categoría: {prompt.categoria
          ? prompt.categoria.nombre
          : "Sin categoría"}</span
      >
      <span class="date">Creado: {formatDate(prompt.fecha_creacion)}</span>
    </div>
    <div class="tags">
      {#each prompt.etiquetas as etiqueta}
        <span class="tag">{etiqueta.nombre}</span>
      {/each}
    </div>
  </div>
  <div class="actions">
    <button
      on:click|stopPropagation={() => onEdit(prompt)}
      class="edit-btn"
      title="Editar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        ></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        ></path>
      </svg>
    </button>
    <button
      on:click|stopPropagation={() => onDelete(prompt.id)}
      class="delete-btn"
      title="Eliminar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path
          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        ></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    </button>
  </div>
</div>

<style>
  .prompt-card {
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    padding: 1.5rem;
    cursor: pointer;
    border-left: 5px solid #3498db;
  }

  .prompt-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .prompt-content {
    flex-grow: 1;
  }

  .prompt-content h2 {
    font-size: 1.25rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .description {
    font-size: 0.9rem;
    color: #34495e;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .metadata span {
    font-size: 0.8rem;
    color: #7f8c8d;
    background-color: #ecf0f1;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    font-size: 0.8rem;
    color: #3498db;
    background-color: #e8f4fd;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .actions button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .actions button svg {
    width: 20px;
    height: 20px;
  }

  .edit-btn {
    color: #2ecc71;
  }

  .edit-btn:hover {
    background-color: rgba(46, 204, 113, 0.1);
    transform: rotate(15deg);
  }

  .delete-btn {
    color: #e74c3c;
  }

  .delete-btn:hover {
    background-color: rgba(231, 76, 60, 0.1);
    transform: rotate(-15deg);
  }
</style>
