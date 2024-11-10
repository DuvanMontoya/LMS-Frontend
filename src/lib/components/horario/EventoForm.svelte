<script>
  import { createEventDispatcher } from 'svelte';
  import { format } from 'date-fns';

  export let evento = null;
  export let calendarios = [];
  export let tiposEvento = []; // Asumiendo que los tipos de evento vienen de la base de datos
  export let userRol = '';

  const dispatch = createEventDispatcher();

  let titulo = evento?.titulo || '';
  let descripcion = evento?.descripcion || '';
  let fechaInicio = evento?.start ? format(new Date(evento.start), "yyyy-MM-dd'T'HH:mm") : '';
  let fechaFin = evento?.end ? format(new Date(evento.end), "yyyy-MM-dd'T'HH:mm") : '';
  let calendarioId = evento?.calendario?.id || '';
  let tipo = evento?.tipo || ''; // El tipo debería inicializarse desde el evento o ser vacío
  let color = evento?.color || '#3498db';

  function handleSubmit() {
    const eventoData = {
        id: evento?.id,
        titulo,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        calendario: calendarioId, // Asegúrate de que este campo esté presente y sea válido
        tipo,
        color
    };
    
    if (!eventoData.calendario) {
        toast.push('Por favor, selecciona un calendario', { theme: { '--toastBackground': '#F6E05E', '--toastBarBackground': '#D69E2E' } });
        return;
    }
    
    dispatch('guardar', eventoData);
}

  function handleEliminar() {
      if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
          dispatch('eliminar', evento.id);
      }
  }

  function handleAsignarPermiso() {
      dispatch('asignarPermiso', evento.id);
  }

  function handleTransferirPropiedad() {
      const nuevoUsuarioId = prompt('Ingrese el ID del nuevo propietario:');
      if (nuevoUsuarioId) {
          dispatch('transferirPropiedad', { id: evento.id, nuevoUsuarioId });
      }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <h2>{evento ? 'Editar Evento' : 'Crear Evento'}</h2>
  
  <label>
      Título:
      <input type="text" bind:value={titulo} required>
  </label>
  
  <label>
      Descripción:
      <textarea bind:value={descripcion}></textarea>
  </label>
  
  <label>
      Fecha de inicio:
      <input type="datetime-local" bind:value={fechaInicio} required>
  </label>
  
  <label>
      Fecha de fin:
      <input type="datetime-local" bind:value={fechaFin} required>
  </label>
  
  <label>
      Calendario:
      <select bind:value={calendarioId} required>
          {#each calendarios as calendario}
              <option value={calendario.id}>{calendario.nombre}</option>
          {/each}
      </select>
  </label>
  
  <label>
    Tipo:
    <select bind:value={tipo} required>
        {#each tiposEvento as opcion}
            <option value={opcion} selected={opcion === tipo}>{opcion}</option>
        {/each}
    </select>
</label>
  
  <label>
      Color:
      <input type="color" bind:value={color}>
  </label>
  
  <div class="form-actions">
      <button type="submit">Guardar</button>
      {#if evento?.id}
          <button type="button" on:click={handleEliminar}>Eliminar</button>
          {#if userRol === 'admin' || userRol === 'advanced_user'}
              <button type="button" on:click={handleAsignarPermiso}>Asignar Permiso</button>
              <button type="button" on:click={handleTransferirPropiedad}>Transferir Propiedad</button>
          {/if}
      {/if}
  </div>
</form>

<style>
  form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
  }

  label {
      display: flex;
      flex-direction: column;
  }

  input, select, textarea {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.25rem;
  }

  .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
  }

  button {
      padding: 0.5rem 1rem;
      background-color: #4299e1;
      color: white;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
  }

  button:hover {
      background-color: #3182ce;
  }
</style>