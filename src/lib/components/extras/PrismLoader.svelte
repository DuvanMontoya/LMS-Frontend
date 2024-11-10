<script>
    import { onMount, afterUpdate } from 'svelte';
    import { loadPrism } from '$lib/extras/prism';  
  
    function initializePrism() {
      return loadPrism().then(() => {
        if (window.Prism) {
          Prism.highlightAll();
        }
      }).catch(error => {
        console.error('Failed to load PrismJS', error);
      });
    }
  
    onMount(() => {
      initializePrism();
    });
  
    afterUpdate(() => {
      initializePrism();
    });
  </script>