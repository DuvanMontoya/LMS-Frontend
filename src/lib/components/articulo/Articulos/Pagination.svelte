<script>
    import { fade } from 'svelte/transition';
    export let currentPage = 1;
    export let totalPages = 1;
    export let onPageChange = () => {};
  
    $: pages = getPaginationRange(currentPage, totalPages);
  
    function getPaginationRange(current, total) {
      const delta = 2;
      const range = [];
      
      for (let i = 1; i <= total; i++) {
        if (
          i === 1 || // First page
          i === total || // Last page
          (i >= current - delta && i <= current + delta) // Pages around current
        ) {
          range.push(i);
        } else if (range[range.length - 1] !== null) {
          range.push(null);
        }
      }
      
      return range;
    }
  </script>
  
  <nav 
    class="pagination"
    aria-label="Navegación de páginas"
    in:fade={{ duration: 300 }}
  >
    <button
      class="pagination-button"
      disabled={currentPage === 1}
      on:click={() => onPageChange(1)}
      aria-label="Primera página"
    >
      <i class="fas fa-angle-double-left"></i>
    </button>
  
    <button
      class="pagination-button"
      disabled={currentPage === 1}
      on:click={() => onPageChange(currentPage - 1)}
      aria-label="Página anterior"
    >
      <i class="fas fa-angle-left"></i>
    </button>
  
    <div class="pagination-numbers">
      {#each pages as page}
        {#if page === null}
          <span class="pagination-ellipsis">...</span>
        {:else}
          <button
            class="pagination-button number {currentPage === page ? 'active' : ''}"
            on:click={() => onPageChange(page)}
          >
            {page}
          </button>
        {/if}
      {/each}
    </div>
  
    <button
      class="pagination-button"
      disabled={currentPage === totalPages}
      on:click={() => onPageChange(currentPage + 1)}
      aria-label="Página siguiente"
    >
      <i class="fas fa-angle-right"></i>
    </button>
  
    <button
      class="pagination-button"
      disabled={currentPage === totalPages}
      on:click={() => onPageChange(totalPages)}
      aria-label="Última página"
    >
      <i class="fas fa-angle-double-right"></i>
    </button>
  </nav>
  
  <style>
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin: 2rem 0;
      padding: 1rem;
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
    }
  
    .pagination-numbers {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  
    .pagination-button {
      min-width: 40px;
      height: 40px;
      padding: 0 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-weight: 500;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all var(--transition-speed) ease;
    }
  
    .pagination-button:hover:not(:disabled) {
      background: var(--primary-50);
      color: var(--primary-600);
    }
  
    .pagination-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  
    .pagination-button.number {
      font-size: 0.95rem;
    }
  
    .pagination-button.active {
      background: var(--primary-500);
      color: white;
    }
  
    .pagination-ellipsis {
      color: var(--text-muted);
      padding: 0 0.5rem;
    }
  
    @media (max-width: 640px) {
      .pagination {
        gap: 0.25rem;
      }
  
      .pagination-button {
        min-width: 36px;
        height: 36px;
        padding: 0 0.5rem;
      }
    }
  </style>