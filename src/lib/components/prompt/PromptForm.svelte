<script>
  import { createEventDispatcher } from "svelte";

  export let prompt = {
    titulo: "",
    descripcion: "",
    contenido: "",
    modelo_ia: "ChatGPT-4",
    categoria_id: null,
    etiquetas_ids: [],
  };
  export let categorias = [];
  export let etiquetas = [];
  export let onSubmit;
  export let onCancel;
  export let isEditing = false;

  const dispatch = createEventDispatcher();

  const OPCIONES_IA = [
    "ChatGPT-4",
    "Gemini",
    "Copilot",
    "Claude",
    "Llama",
    "DALL-E",
    "Curie",
    "Ada",
    "Davinci",
    "Babbage",
  ];

  function handleSubmit() {
    dispatch("submit", prompt);
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="prompt-form">
  <h2>{isEditing ? "Editar Prompt" : "Crear Nuevo Prompt"}</h2>

  <div class="form-group">
    <label for="titulo">Título</label>
    <input
      id="titulo"
      type="text"
      bind:value={prompt.titulo}
      required
      placeholder="Ingrese el título del prompt"
    />
  </div>

  <div class="form-group">
    <label for="descripcion">Descripción</label>
    <textarea
      id="descripcion"
      bind:value={prompt.descripcion}
      required
      placeholder="Ingrese la descripción del prompt"
    ></textarea>
  </div>

  <div class="form-group">
    <label for="contenido">Contenido</label>
    <textarea
      id="contenido"
      bind:value={prompt.contenido}
      required
      placeholder="Ingrese el contenido del prompt"
      rows="5"
    ></textarea>
  </div>

  <div class="form-group">
    <label for="modelo_ia">Modelo de IA</label>
    <select id="modelo_ia" bind:value={prompt.modelo_ia} required>
      {#each OPCIONES_IA as modelo}
        <option value={modelo}>{modelo}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="categoria">Categoría</label>
    <select id="categoria" bind:value={prompt.categoria_id} required>
      <option value="">Seleccione una categoría</option>
      {#each categorias as categoria}
        <option value={categoria.id}>{categoria.nombre}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label>Etiquetas</label>
    <div class="etiquetas-container">
      {#each etiquetas as etiqueta}
        <label class="etiqueta-checkbox">
          <input
            type="checkbox"
            value={etiqueta.id}
            checked={prompt.etiquetas_ids.includes(etiqueta.id)}
            on:change={(e) => {
              if (e.target.checked) {
                prompt.etiquetas_ids = [...prompt.etiquetas_ids, etiqueta.id];
              } else {
                prompt.etiquetas_ids = prompt.etiquetas_ids.filter(
                  (id) => id !== etiqueta.id,
                );
              }
            }}
          />
          {etiqueta.nombre}
        </label>
      {/each}
    </div>
  </div>

  <div class="form-actions">
    <button type="button" class="cancel-btn" on:click={onCancel}
      >Cancelar</button
    >
    <button type="submit" class="submit-btn">
      {isEditing ? "Actualizar" : "Crear"}
    </button>
  </div>
</form>

<style>
  .prompt-form {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 1.75rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    font-size: 1rem;
    color: #34495e;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    font-size: 1rem;
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    background-color: #f8f9fa;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .etiquetas-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .etiqueta-checkbox {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #34495e;
    padding: 0.25rem 0.5rem;
    background-color: #ecf0f1;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .etiqueta-checkbox:hover {
    background-color: #e0e6e8;
  }

  .etiqueta-checkbox input {
    margin-right: 0.5rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-btn {
    background-color: #95a5a6;
    color: white;
  }

  .cancel-btn:hover {
    background-color: #7f8c8d;
  }

  .submit-btn {
    background-color: #3498db;
    color: white;
  }

  .submit-btn:hover {
    background-color: #2980b9;
  }
</style>
