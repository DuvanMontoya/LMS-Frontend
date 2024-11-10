<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { format, startOfWeek, addDays, isWithinInterval } from 'date-fns';
   
    export let eventos = [];
    export let semanaInicio = new Date();
   
    const dispatch = createEventDispatcher();
   
    $: diasSemana = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(semanaInicio), i));
    $: horas = Array.from({ length: 24 }, (_, i) => i);
   
    $: eventosOrdenados = eventos.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
   
    function getEventosHora(dia, hora) {
        return eventosOrdenados.filter(evento => {
            const eventoInicio = new Date(evento.fecha_inicio);
            const eventoFin = new Date(evento.fecha_fin);
            return isWithinInterval(new Date(dia.setHours(hora)), {
                start: eventoInicio,
                end: eventoFin
            });
        });
    }
   
    function handleEventoClick(evento) {
        dispatch('eventoClick', evento);
    }
   
    function semanaAnterior() {
        semanaInicio = addDays(semanaInicio, -7);
    }
   
    function semanaSiguiente() {
        semanaInicio = addDays(semanaInicio, 7);
    }
   
    onMount(() => {
        // Cualquier inicialización necesaria
    });
</script>
   
<div class="horario-semanal">
  <div class="controles-semana">
    <button on:click={semanaAnterior}>&lt; Semana anterior</button>
    <h2>{format(semanaInicio, 'MMMM yyyy')}</h2>
    <button on:click={semanaSiguiente}>Semana siguiente &gt;</button>
  </div>
 
  <div class="tabla-horario">
    <div class="encabezado-dias">
      <div class="celda-hora"></div>
      {#each diasSemana as dia}
        <div class="celda-dia">{format(dia, 'EEEE d')}</div>
      {/each}
    </div>
   
    {#each horas as hora}
      <div class="fila-hora">
        <div class="celda-hora">{hora}:00</div>
        {#each diasSemana as dia}
          <div class="celda-evento">
            {#each getEventosHora(dia, hora) as evento}
              <div
                class="evento"
                style="background-color: {evento.color}"
                on:click={() => handleEventoClick(evento)}
              >
                {evento.titulo}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .horario-semanal {
    font-family: Arial, sans-serif;
  }
  .controles-semana {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .tabla-horario {
    display: grid;
    grid-template-columns: auto repeat(7, 1fr);
    gap: 1px;
    background-color: #ddd;
    border: 1px solid #ddd;
  }
  .encabezado-dias {
    display: contents;
  }
  .celda-hora, .celda-dia {
    background-color: #f5f5f5;
    padding: 0.5rem;
    text-align: center;
    font-weight: bold;
  }
  .fila-hora {
    display: contents;
  }
  .celda-evento {
    background-color: white;
    min-height: 3rem;
    padding: 0.25rem;
  }
  .evento {
    padding: 0.25rem;
    margin: 0.1rem 0;
    border-radius: 3px;
    font-size: 0.8rem;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>