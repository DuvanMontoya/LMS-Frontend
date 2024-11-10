<script>
    import { getContext } from 'svelte';
  
    const form = getContext('form'); 
   
    // Usa $errors para acceder a los errores reactivamente
  </script>
  
  <!-- Contenido del componente -->
  {#if $form?.errors}
    <div class="error-message">
      {#each Object.entries($form.errors) as [field, fieldErrors]}
        <p>{field}: {fieldErrors.join(', ')}</p>
      {/each}
    </div>
  {/if}
  
  <style>
    .error-message {
      color: red;
      margin-top: 10px;
    }
  </style>