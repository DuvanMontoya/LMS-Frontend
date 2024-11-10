<script>
    import { getPerfil, updateProfile } from '$lib/api/usuarios/usuarios';
    import { token } from '$lib/stores/sessionStore';
    import { user, isAuthenticated } from '$lib/stores/sessionStore';


    import { onMount } from 'svelte';

    export let userId;

    let profileData = {};
    let loading = false;
    let error = '';

    onMount(async () => {
      try {
        loading = true;
        const data = await getPerfil(userId, $token);
        if (data) {
          profileData = data;
        }
      } catch (e) {
        error = e.message;
      } finally {
        loading = false;
      }
    });

    async function handleSubmit() {
      try {
        loading = true;
        await updateProfile(`perfil/${userId}/update/`, profileData, $token);
      } catch (e) {
        error = e.message;
      } finally {
        loading = false;
      }
    }
    $: if ($user && $isAuthenticated) {
    // Carga adicional de datos o acciones aquí si es necesario
  } else {
  }
</script>

{#if error}
    <p class="error">{error}</p>
{/if}

<form on:submit|preventDefault={handleSubmit}>
    <!-- Se pueden agregar más campos según sean necesarios -->
    <label for="nombre">Nombre:</label>
    <input type="text" id="nombre" bind:value={profileData.nombre} />

    <label for="apellido">Apellido:</label>
    <input type="text" id="apellido" bind:value={profileData.apellido} />

    <button type="submit" disabled={loading}>Guardar Cambios</button>
</form>
