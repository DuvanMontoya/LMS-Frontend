<!-- /var/www/laila.icu/my-app/src/routes/evaluaciones/[id]/analisis/+page.svelte -->
<script>
    import Analisis from '$lib/components/evaluacion/Analisis.svelte';
    // export let evaluacionId;
    import { page } from '$app/stores';
    const evaluacionId = $page.params.id;
  </script>
  
  <div class="contenedor-principal">
    <Analisis {evaluacionId} />
  </div>
  
  <style>
    .contenedor-principal {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  </style>
  