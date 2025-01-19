<script>
    import { onMount } from 'svelte';
  
    export let expression = '';
  
    function renderMath() {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
      }
    }
  
    onMount(() => {
      renderMath();
    });
  
    $: expression, renderMath();
  </script>
  
  <div class="math-renderer">
    <!-- Inyectamos la expresión como HTML para que MathJax la procese -->
    {@html expression}
  </div>
  
  <style>
  .math-renderer {
    display: block;
    font-size: 1rem;
    color: #333;
  }
  </style>  