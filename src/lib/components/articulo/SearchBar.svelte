<script>
    import { createEventDispatcher } from 'svelte';
    import lodash from 'lodash';
  
    const { debounce } = lodash;
  
    let searchQuery = '';
    const dispatch = createEventDispatcher();
  
    const handleSearch = debounce(() => {
      dispatch('search', searchQuery);
    }, 300);
  
    $: if (searchQuery === '') {
      handleSearch();
    }
  </script>
  
  <div class="search-bar">
    <input 
      type="text" 
      placeholder="Buscar artículos..." 
      bind:value={searchQuery} 
      on:input={handleSearch} 
    />
    <button on:click={handleSearch}>
      <i class="fas fa-search"></i>
    </button>
  </div>
  
  <style>
    .search-bar {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
  
    .search-bar input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
  
    .search-bar input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
    }
  
    .search-bar button {
      margin-left: 0.5rem;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s;
    }
  
    .search-bar button:hover {
      background-color: #0056b3;
    }
  
    .search-bar button i {
      font-size: 1rem;
    }
  </style>
  