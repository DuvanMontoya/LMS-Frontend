<script>
  import { onMount } from "svelte";
  import { writable, derived } from "svelte/store";
  import { sessionStore } from "$lib/stores/sessionStore";
  import PromptCard from "$lib/components/prompt/PromptCard.svelte";
  import PromptForm from "$lib/components/prompt/PromptForm.svelte";
  import PromptModal from "$lib/components/prompt/PromptModal.svelte";
  import {
    fetchPrompts,
    fetchPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
    fetchCategorias,
    fetchEtiquetas,
  } from "$lib/api/prompt/prompt.js";

  let prompts = writable([]);
  let currentPrompt = writable(null);
  let isEditing = writable(false);
  let showForm = writable(false);
  let showModal = writable(false);
  let authToken = $sessionStore.access;
  let loading = writable(true);
  let error = writable(null);
  let categorias = writable([]);
  let etiquetas = writable([]);
  let filtroCategoria = writable("");
  let filtroEtiquetas = writable([]);
  let ordenacion = writable("fecha_creacion");
  let searchTerm = writable("");

  async function loadPrompts() {
    loading.set(true);
    error.set(null);
    try {
      const data = await fetchPrompts(authToken);
      console.log('Respuesta de la API de prompts:', data);
      if (data && Array.isArray(data.results)) {
        prompts.set(data.results);
      } else {
        throw new Error('El formato de datos recibido no es válido');
      }
    } catch (err) {
      console.error("Error al cargar prompts:", err);
      error.set("No se pudieron cargar los prompts. Por favor, intente de nuevo.");
    } finally {
      loading.set(false);
    }
  }

  async function loadCategorias() {
    try {
      const data = await fetchCategorias(authToken);
      categorias.set(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  }

  async function loadEtiquetas() {
    try {
      const data = await fetchEtiquetas(authToken);
      etiquetas.set(data);
    } catch (err) {
      console.error("Error al cargar etiquetas:", err);
    }
  }

  async function handleSubmit(event) {
    const promptData = event.detail;
    loading.set(true);
    error.set(null);
    try {
      let updatedPrompt;
      if ($isEditing) {
        updatedPrompt = await updatePrompt($currentPrompt.id, promptData, authToken);
        prompts.update((items) => items.map((item) => item.id === updatedPrompt.id ? updatedPrompt : item));
      } else {
        updatedPrompt = await createPrompt(promptData, authToken);
        prompts.update((items) => [...items, updatedPrompt]);
      }
      closeForm();
    } catch (err) {
      console.error("Error al guardar el prompt:", err);
      error.set("No se pudo guardar el prompt. Por favor, intente de nuevo.");
    } finally {
      loading.set(false);
    }
  }

  async function handleDelete(id) {
    if (confirm("¿Está seguro de que desea eliminar este prompt?")) {
      loading.set(true);
      error.set(null);
      try {
        await deletePrompt(id, authToken);
        prompts.update((items) => items.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Error al eliminar el prompt:", err);
        error.set("No se pudo eliminar el prompt. Por favor, intente de nuevo.");
      } finally {
        loading.set(false);
      }
    }
  }

  function handleCreate() {
    currentPrompt.set({
      titulo: "",
      descripcion: "",
      contenido: "",
      modelo_ia: "ChatGPT-4",
      categoria_id: null,
      etiquetas_ids: [],
    });
    isEditing.set(false);
    showForm.set(true);
  }

  function handleEdit(prompt) {
    currentPrompt.set({
      ...prompt,
      categoria_id: prompt.categoria ? prompt.categoria.id : null,
      etiquetas_ids: prompt.etiquetas.map((e) => e.id),
    });
    isEditing.set(true);
    showForm.set(true);
  }

  function closeForm() {
    showForm.set(false);
    isEditing.set(false);
    currentPrompt.set(null);
  }

  function openModal(prompt) {
    currentPrompt.set(prompt);
    showModal.set(true);
  }

  function closeModal() {
    showModal.set(false);
    currentPrompt.set(null);
  }

  function filtrarPrompts(prompts, filtroCategoria, filtroEtiquetas, searchTerm, ordenacion) {
    return prompts
      .filter((p) => !filtroCategoria || p.categoria?.id === filtroCategoria)
      .filter((p) => filtroEtiquetas.length === 0 || filtroEtiquetas.every((tag) => p.etiquetas.some((e) => e.id === tag)))
      .filter((p) => searchTerm === "" || p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (ordenacion === "titulo") {
          return a.titulo.localeCompare(b.titulo);
        } else if (ordenacion === "fecha_creacion") {
          return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
        }
        return 0;
      });
  }

  const promptsFiltrados = derived(
    [prompts, filtroCategoria, filtroEtiquetas, searchTerm, ordenacion],
    ([$prompts, $filtroCategoria, $filtroEtiquetas, $searchTerm, $ordenacion]) =>
      filtrarPrompts($prompts, $filtroCategoria, $filtroEtiquetas, $searchTerm, $ordenacion)
  );

  onMount(() => {
    loadPrompts();
    loadCategorias();
    loadEtiquetas();
  });
</script>

<main>
  <div class="container">
    <header>
      <h1>Gestión de Prompts de IA</h1>
      <button on:click={handleCreate} class="create-btn">
        <span class="icon">+</span>
        Crear Nuevo Prompt
      </button>
    </header>

    <div class="filtros">
      <input
        type="text"
        placeholder="Buscar prompts..."
        bind:value={$searchTerm}
        class="search-input"
      />
      <select bind:value={$filtroCategoria} class="filter-select">
        <option value="">Todas las categorías</option>
        {#each $categorias as categoria}
          <option value={categoria.id}>{categoria.nombre}</option>
        {/each}
      </select>
      <div class="etiquetas-filter">
        <span>Etiquetas:</span>
        {#each $etiquetas as etiqueta}
          <label class="etiqueta-checkbox">
            <input
              type="checkbox"
              bind:group={$filtroEtiquetas}
              value={etiqueta.id}
            />
            {etiqueta.nombre}
          </label>
        {/each}
      </div>
      <select bind:value={$ordenacion} class="filter-select">
        <option value="fecha_creacion">Más recientes primero</option>
        <option value="titulo">Ordenar por título</option>
      </select>
    </div>

    {#if $loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando prompts...</p>
      </div>
    {:else if $error}
      <div class="error">{$error}</div>
    {:else if $promptsFiltrados.length === 0}
      <div class="no-results">
        {#if $prompts.length === 0}
          No hay prompts disponibles.
        {:else}
          No se encontraron prompts que coincidan con los filtros aplicados.
        {/if}
      </div>
    {:else}
      <div class="prompt-list">
        {#each $promptsFiltrados as prompt (prompt.id)}
          <PromptCard
            {prompt}
            onEdit={() => handleEdit(prompt)}
            onDelete={() => handleDelete(prompt.id)}
            onClick={() => openModal(prompt)}
          />
        {/each}
      </div>
    {/if}

    {#if $showForm}
      <div class="modal-overlay" on:click={closeForm}>
        <div class="modal-content" on:click|stopPropagation>
          <PromptForm
            prompt={$currentPrompt}
            categorias={$categorias}
            etiquetas={$etiquetas}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isEditing={$isEditing}
          />
        </div>
      </div>
    {/if}

    {#if $showModal}
      <PromptModal prompt={$currentPrompt} onClose={closeModal} />
    {/if}
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    background-color: #f0f4f8;
    padding: 2rem;
    font-family: "Roboto", sans-serif;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin: 0;
  }

  .create-btn {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .create-btn:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .create-btn .icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }

  .filtros {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .filtros select {
    padding: 0.5rem;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    font-size: 1rem;
  }

  .prompt-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .loading {
    text-align: center;
    color: #34495e;
    font-size: 1.2rem;
    margin-top: 2rem;
  }

  .spinner {
    border: 4px solid rgba(52, 73, 94, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .error {
    text-align: center;
    color: #e74c3c;
    font-size: 1.2rem;
    margin-top: 2rem;
    padding: 1rem;
    background-color: #fadbd8;
    border-radius: 8px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
</style>
