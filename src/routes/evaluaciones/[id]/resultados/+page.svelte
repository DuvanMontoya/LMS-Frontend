<!-- src/lib/routes/evaluaciones/[id]/resultados/+page.svelte -->

<script>
    import { page } from '$app/stores';
    import ResultadosEvaluacion from '$lib/components/evaluacion/ResultadosEvaluacion.svelte';
  
    // Obtenemos el ID de la evaluación desde la página actual
    const evaluacionId = $page.params.id;
  </script>
  
  <!-- Renderizamos el componente ResultadosEvaluacion pasando evaluacionId como propiedad -->
  <ResultadosEvaluacion {evaluacionId} />
  