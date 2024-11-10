<script>
    import { createEventDispatcher } from 'svelte';
  
    export let categories = [];
    export let areas = [];
    export let subjects = [];
  
    let selectedCategory = '';
    let selectedArea = '';
    let selectedSubject = '';
  
    const dispatch = createEventDispatcher();
  
    function handleFilterChange() {
      dispatch('filterChange', {
        category: selectedCategory,
        area: selectedArea,
        subject: selectedSubject,
      });
    }
  
    function resetFilters() {
      selectedCategory = '';
      selectedArea = '';
      selectedSubject = '';
      handleFilterChange();
    }
  </script>
  
  <div class="sidebar-card">
    <h3 class="filter-title">Articulos</h3>
  
    <div class="filter-section">
      <label for="area-select" class="filter-label">Área:</label>
      <select id="area-select" bind:value={selectedArea} on:change={handleFilterChange} class="filter-select">
        <option value="">Todas las áreas</option>
        {#each areas as area}
          <option value={area.id}>{area.nombre}</option>
        {/each}
      </select>
    </div>
  
    <div class="filter-section">
      <label for="category-select" class="filter-label">Categoría:</label>
      <select id="category-select" bind:value={selectedCategory} on:change={handleFilterChange} class="filter-select">
        <option value="">Todas las categorías</option>
        {#each categories as category}
          <option value={category.id}>{category.nombre}</option>
        {/each}
      </select>
    </div>
  
    <div class="filter-section">
      <label for="subject-select" class="filter-label">Tema:</label>
      <select id="subject-select" bind:value={selectedSubject} on:change={handleFilterChange} class="filter-select">
        <option value="">Todos los temas</option>
        {#each subjects as subject}
          <option value={subject.id}>{subject.nombre}</option>
        {/each}
      </select>
    </div>
  
    <button class="reset-button" on:click={resetFilters}>
      <i class="fas fa-undo"></i> Restablecer filtros
    </button>
  </div>
  
  <style>
    .sidebar-card {
      background-color: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
  
    .sidebar-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
  
    .filter-title {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #333;
      text-align: center;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
  
    .filter-section {
      margin-bottom: 1rem;
    }
  
    .filter-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #555;
      font-size: 1rem;
    }
  
    .filter-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 1rem;
      color: #333;
      background-color: #f9f9f9;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
  
    .filter-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
    }
  
    .reset-button {
      display: block;
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      color: #fff;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.3s;
    }
  
    .reset-button:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
    }
  
    .reset-button i {
      margin-right: 0.5rem;
    }
  </style>
  