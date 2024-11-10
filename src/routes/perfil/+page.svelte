<!-- ProfilePage.svelte -->
<script>
    import { onMount } from 'svelte';
    import { sessionStore, updateLike, isArticleLiked } from '$lib/stores/sessionStore';
    import { getPerfil, updateProfile } from '$lib/api/usuarios/usuarios';
  
    let profile = null;
    let isEditing = false;
    let formData = {};
    let formErrors = {};
  
    onMount(async () => {
  try {
    const authToken = $sessionStore.access;
    const userId = $sessionStore.userId; // Obtener el userId del sessionStore
    profile = await getPerfil(userId, authToken); // Pasar el userId a getPerfil
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
  }
});
  
    function toggleEditing() {
      isEditing = !isEditing;
      if (isEditing) {
        formData = { ...profile };
      } else {
        formData = {};
      }
      formErrors = {};
    }
  
    async function handleSubmit() {
  try {
    const authToken = $sessionStore.access;
    const userId = $sessionStore.userId;
    const updatedProfile = await updateProfile(`perfil/${userId}/`, formData, authToken);
    profile = updatedProfile;
    toggleEditing();
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
  }
}
  
    function handleChange(event) {
      const { name, value } = event.target;
      formData[name] = value;
      formErrors[name] = validateField(name, value);
    }
  
    function validateField(fieldName, fieldValue) {
      // Agrega aquí la lógica de validación para cada campo
      switch (fieldName) {
        case 'nombre':
          return fieldValue.trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : '';
        case 'email':
          return /^\S+@\S+\.\S+$/.test(fieldValue) ? '' : 'El correo electrónico no es válido';
        // Agrega más casos para validar otros campos
        default:
          return '';
      }
    }
  </script>
  
  <div>
    {#if profile}
      <h2>Perfil de Usuario</h2>
      {#if isEditing}
        <form on:submit|preventDefault={handleSubmit}>
          <label>
            Nombre:
            <input type="text" name="nombre" bind:value={formData.nombre} on:input={handleChange} />
            {#if formErrors.nombre}
              <span class="error">{formErrors.nombre}</span>
            {/if}
          </label>
          <!-- Agrega más campos editables aquí -->
          <button type="submit" disabled={Object.values(formErrors).some(error => error.trim() !== '')}>Guardar Cambios</button>
        </form>
      {:else}
        <div>
          <p>Nombre: {profile.nombre}</p>
          <!-- Muestra los demás campos del perfil aquí -->
          <button on:click={toggleEditing}>Editar Perfil</button>
        </div>
      {/if}
    {:else}
      <p>Cargando perfil...</p>
    {/if}
  </div>