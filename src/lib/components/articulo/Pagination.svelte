<!-- src/lib/components/Pagination.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
  
    export let currentPage;
    export let totalPages;
  
    const dispatch = createEventDispatcher();
  
    function handlePageChange(page) {
      dispatch('pageChange', page);
    }
  </script>
  
  <div class="pagination">
    {#if currentPage > 1}
        <button class="page-btn prev" on:click={() => handlePageChange(currentPage - 1)}>
            <i class="fas fa-chevron-left"></i>
        </button>
    {/if}
  
    {#each Array(totalPages) as _, index}
        <button
            class="page-btn {currentPage === index + 1 ? 'active' : ''}"
            on:click={() => handlePageChange(index + 1)}
        >
            {index + 1}
        </button>
    {/each}
  
    {#if currentPage < totalPages}
        <button class="page-btn next" on:click={() => handlePageChange(currentPage + 1)}>
            <i class="fas fa-chevron-right"></i>
        </button>
    {/if}
  </div>
  
  <style>
    .pagination {
        display: flex;
        justify-content: center;
        margin-top: 2rem;
        gap: 0.5rem;
        font-family: 'Arial', sans-serif;
    }
  
    .page-btn {
        padding: 0.5rem 1rem;
        background-color: #f8f9fa;
        color: #343a40;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
  
    .page-btn:hover {
        background-color: #e2e6ea;
    }
  
    .page-btn.active {
        background-color: #007bff;
        color: #fff;
        border-color: #007bff;
    }
  
    .page-btn.prev, .page-btn.next {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 1.2rem;
    }
  
    .page-btn.prev:hover, .page-btn.next:hover {
        background-color: #007bff;
        color: #fff;
    }
  
    .page-btn i {
        margin: 0;
    }
  </style>
  