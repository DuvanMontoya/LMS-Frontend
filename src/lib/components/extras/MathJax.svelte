<script>
    import { onMount } from 'svelte';
    import { loadMathJax, renderMathJax } from '$lib/extras/mathjax.js';
  
    export let content = '';
  
    let mathJaxLoaded = false;
  
    onMount(async () => {
      try {
        await loadMathJax();
        mathJaxLoaded = true;
        renderMathJax();
      } catch (error) {
        // console.error('Error loading MathJax:', error);
      }
    });
  
    $: if (mathJaxLoaded) {
      renderMathJax();
    }
  </script>
  
  <div id="mathjax-container">
    {@html content}
  </div>
  
  <style>
    #mathjax-container {
      /* Quita la propiedad display: none; */
      display: block;
    }
  </style>