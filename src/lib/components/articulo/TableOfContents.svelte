<!-- src/lib/components/Article/TableOfContents.svelte -->
<script>
    export let toc = [];
    export let activeSection = "";
    export let onNavigate = (id) => {};
  
    function handleClick(id) {
      onNavigate(id);
    }
  </script>
  
  <nav class="table-of-contents">
    <h2>Índice</h2>
    {#each toc as item}
      <a
        href={`#${item.id}`}
        class="toc-item level-{item.level} {activeSection === item.id ? 'active' : ''}"
        on:click|preventDefault={() => handleClick(item.id)}
      >
        {item.text}
      </a>
    {/each}
  </nav>
  
  <style>
    .table-of-contents {
      width: 250px;
      position: -webkit-sticky;
      position: sticky;
      top: 2rem;
      align-self: flex-start;
      background-color: var(--background-color2);
      padding: 1rem;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      max-height: calc(100vh - 4rem);
      overflow-y: auto;
      transition: all var(--transition-speed);
      z-index: 100;
    }
  
    .table-of-contents h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: var(--primary-color);
      border-bottom: 2px solid var(--accent-color);
      padding-bottom: 0.5rem;
    }
  
    .toc-item {
      display: block;
      padding: 0.5rem 0;
      color: var(--text-color);
      text-decoration: none;
      transition: all var(--transition-speed);
      font-size: 0.9rem;
      border-left: 3px solid transparent;
      padding-left: 10px;
    }
  
    .toc-item:hover {
      color: var(--accent-color);
      background-color: rgba(255, 215, 0, 0.1);
    }
  
    .toc-item.active {
      font-weight: bold;
      color: var(--accent-color);
      border-left-color: var(--accent-color);
    }
  
    .level-2 { padding-left: 1rem; }
    .level-3 { padding-left: 2rem; }
    .level-4 { padding-left: 3rem; }
    .level-5 { padding-left: 4rem; }
    .level-6 { padding-left: 5rem; }
  
    @media (max-width: 1200px) {
      .table-of-contents {
        width: 100%;
        position: relative;
        top: 0;
        margin-bottom: 2rem;
      }
    }
  </style>  